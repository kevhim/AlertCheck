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

export const DEFAULT_PRODUCTION_API_URL = 'https://alertcheck.kevinhatoshi.workers.dev';

/**
 * Resolves API Base URL: defaults to production Cloudflare Worker URL,
 * but allows override via VITE_API_BASE_URL when non-empty.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return DEFAULT_PRODUCTION_API_URL;
}

/**
 * Executes verification via Cloudflare Worker API with automatic seamless local browser fallback.
 */
export async function executeVerification(
  request: VerifyRequest
): Promise<VerificationServiceResult> {
  const apiBaseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast offline switch

    const response = await fetch(`${apiBaseUrl}/api/verify`, {
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
