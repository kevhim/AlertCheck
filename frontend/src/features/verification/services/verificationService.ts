import {
  VerifyRequest,
  VerificationReport,
  verifyWarning,
} from '@alertcheck/verification-core';

export interface VerificationServiceResult {
  report: VerificationReport;
  mode: 'cloudflare_worker' | 'browser_local';
  fallbackReason?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

/**
 * Executes verification via Cloudflare Worker API with automatic seamless local browser fallback.
 */
export async function executeVerification(
  request: VerifyRequest
): Promise<VerificationServiceResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast offline switch

    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as VerificationReport;
      return {
        report: data,
        mode: 'cloudflare_worker',
      };
    } else {
      console.warn(`[AlertCheck] Worker API returned ${response.status}. Using in-browser engine.`);
      const localReport = verifyWarning(request, { engineMode: 'browser_local' });
      return {
        report: localReport,
        mode: 'browser_local',
        fallbackReason: `Worker API returned status ${response.status}. Verified via local browser engine.`,
      };
    }
  } catch (error) {
    // Network failure, worker not running, or offline
    console.info('[AlertCheck] Backend unavailable or offline. Falling back to local browser engine.', error);
    const localReport = verifyWarning(request, { engineMode: 'browser_local' });
    return {
      report: localReport,
      mode: 'browser_local',
      fallbackReason: 'Backend worker unavailable or offline. Verified via in-browser deterministic engine.',
    };
  }
}
