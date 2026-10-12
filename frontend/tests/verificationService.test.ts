import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeVerification } from '../src/features/verification/services/verificationService';
import { MasterWarning, VerifyRequest } from '@alertcheck/verification-core';

const fictionalWarning: MasterWarning = {
  warningId: 'warn-svc-test-01',
  hazardType: 'Flash Flood',
  severity: 'emergency',
  affectedAreas: ['River District', 'Sector 4'],
  issuedAt: '2026-10-12T10:00:00Z',
  validUntil: '2026-10-12T20:00:00Z',
  evacuationDeadline: '16:00',
  requiredActions: ['Evacuate immediately to designated shelter'],
  prohibitedActions: ['Do not drive through floodwater'],
  safetyContact: '1800-555-0199',
  sourceReference: 'Civil Defense',
  sourceVersion: 1,
};

describe('verificationService frontend resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back seamlessly to local browser engine when backend network fails', async () => {
    // Mock fetch failure (simulating offline or backend worker offline)
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error: Failed to fetch'));

    const request: VerifyRequest = {
      masterWarning: fictionalWarning,
      candidateText: 'EMERGENCY: Flash Flood in River District. Evacuate by 16:00.',
      format: 'full',
      language: 'en',
    };

    const result = await executeVerification(request);

    // Fallback must be triggered
    expect(result.mode).toBe('browser_local');
    expect(result.fallbackReason).toBeDefined();
    expect(result.report).toBeDefined();
    // Verification results must still be accurate!
    expect(result.report.status).toBe('issues_found'); // Sector 4 is missing
    const locFinding = result.report.findings.find((f) => f.category === 'location');
    expect(locFinding?.sourceEvidence).toContain('Sector 4');
  });

  it('uses Cloudflare Worker API when backend is reachable with 200 OK', async () => {
    const mockReport = {
      reportId: 'rep-mock-01',
      warningId: fictionalWarning.warningId,
      status: 'no_mismatch_detected' as const,
      verifiedAt: new Date().toISOString(),
      engineMode: 'cloudflare_worker' as const,
      summary: {
        totalFindings: 0,
        criticalCount: 0,
        warningCount: 0,
        infoCount: 0,
        requiresHumanReviewCount: 0,
      },
      findings: [],
      disclaimer: 'Verification aid only',
      metadata: {
        sourceHazard: 'Flash Flood',
        candidateFormat: 'full',
        candidateLanguage: 'en',
        characterCount: 100,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockReport,
    } as Response);

    const request: VerifyRequest = {
      masterWarning: fictionalWarning,
      candidateText: 'Clean text',
      format: 'full',
      language: 'en',
    };

    const result = await executeVerification(request);
    expect(result.mode).toBe('cloudflare_worker');
    expect(result.report.status).toBe('no_mismatch_detected');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/verify'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('getApiBaseUrl API configuration resolution', () => {
  const originalEnv = import.meta.env.VITE_API_BASE_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to production Cloudflare Worker URL when VITE_API_BASE_URL is absent or empty', async () => {
    import.meta.env.VITE_API_BASE_URL = '';
    const { getApiBaseUrl, DEFAULT_PRODUCTION_API_URL } = await import(
      '../src/features/verification/services/verificationService'
    );
    expect(getApiBaseUrl()).toBe('https://alertcheck.kevinhatoshi.workers.dev');
    expect(DEFAULT_PRODUCTION_API_URL).toBe('https://alertcheck.kevinhatoshi.workers.dev');

    // Restore
    import.meta.env.VITE_API_BASE_URL = originalEnv;
  });

  it('respects an explicit VITE_API_BASE_URL override for development or custom environments', async () => {
    import.meta.env.VITE_API_BASE_URL = 'http://localhost:8787';
    const { getApiBaseUrl } = await import(
      '../src/features/verification/services/verificationService'
    );
    expect(getApiBaseUrl()).toBe('http://localhost:8787');

    // Restore
    import.meta.env.VITE_API_BASE_URL = originalEnv;
  });
});
