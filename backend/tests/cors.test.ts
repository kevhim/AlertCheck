import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { MasterWarning, VerifyRequest } from '@alertcheck/verification-core';

const sampleWarning: MasterWarning = {
  warningId: 'warn-cors-test',
  hazardType: 'Tsunami Warning',
  severity: 'emergency',
  affectedAreas: ['Coastal Sector A'],
  issuedAt: '2026-10-12T12:00:00Z',
  validUntil: '2026-10-12T18:00:00Z',
  evacuationDeadline: '14:00',
  requiredActions: ['Evacuate to high ground immediately'],
  prohibitedActions: ['Do not enter the water'],
  safetyContact: 'Emergency: 911',
  sourceReference: 'Coastal Authority',
  sourceVersion: 1,
};

const verifyPayload: VerifyRequest = {
  masterWarning: sampleWarning,
  candidateText: 'EMERGENCY: Tsunami Warning for Coastal Sector A. Evacuate to high ground immediately by 14:00. Emergency: 911.',
  format: 'full',
  language: 'en',
};

describe('CORS Configuration and Allowlist Middleware', () => {
  const envWithOrigins = {
    ALLOWED_ORIGIN: 'https://alertcheck-web.pages.dev,http://localhost:5173,http://127.0.0.1:5173',
  };

  describe('Production Frontend Origin (https://alertcheck-web.pages.dev)', () => {
    it('returns exact production origin on OPTIONS preflight request', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://alertcheck-web.pages.dev',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://alertcheck-web.pages.dev');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Vary')).toBe('Origin');
    });

    it('returns exact production origin on GET /api/health', async () => {
      const request = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'https://alertcheck-web.pages.dev',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://alertcheck-web.pages.dev');
      expect(response.headers.get('Vary')).toBe('Origin');
    });

    it('returns exact production origin on POST /api/verify', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'POST',
        headers: {
          Origin: 'https://alertcheck-web.pages.dev',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload),
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://alertcheck-web.pages.dev');
    });
  });

  describe('Localhost Development Origins', () => {
    it('allows localhost:5173 on OPTIONS preflight', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
      expect(response.headers.get('Vary')).toBe('Origin');
    });

    it('allows 127.0.0.1:5173 development origin on GET /api/health and preflight', async () => {
      const preflightReq = new Request('http://localhost:8787/api/health', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://127.0.0.1:5173',
        },
      });

      // @ts-expect-error test ctx
      const preflightRes = await worker.fetch(preflightReq, envWithOrigins, {});
      expect(preflightRes.status).toBe(204);
      expect(preflightRes.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:5173');

      const getReq = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'http://127.0.0.1:5173',
        },
      });

      // @ts-expect-error test ctx
      const getRes = await worker.fetch(getReq, envWithOrigins, {});
      expect(getRes.status).toBe(200);
      expect(getRes.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:5173');
    });

    it('allows localhost development even when env.ALLOWED_ORIGIN is undefined (default allowlist)', async () => {
      const request = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'http://localhost:5173',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, {}, {});
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    });
  });

  describe('Disallowed Origins', () => {
    it('does NOT set Access-Control-Allow-Origin for unauthorized external origin on preflight', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://evil.example.com',
          'Access-Control-Request-Method': 'POST',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('does NOT set Access-Control-Allow-Origin for unauthorized origin on GET /api/health', async () => {
      const request = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'https://phishing-site.test',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('does NOT set Access-Control-Allow-Origin for unauthorized origin on POST /api/verify', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'POST',
        headers: {
          Origin: 'https://attacker.org',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload),
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('never uses a wildcard "*" as Access-Control-Allow-Origin', async () => {
      const request = new Request('http://localhost:8787/api/verify', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://some-random-domain.io',
        },
      });

      // @ts-expect-error test ctx
      const response = await worker.fetch(request, envWithOrigins, {});
      expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });

  describe('Explicit Comma-Separated Configuration Parsing', () => {
    it('correctly handles spaces and multiple origins in ALLOWED_ORIGIN env var', async () => {
      const customEnv = {
        ALLOWED_ORIGIN: '  https://custom-domain.org ,  https://alertcheck-web.pages.dev  ',
      };

      const allowedReq = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'https://custom-domain.org',
        },
      });

      // @ts-expect-error test ctx
      const allowedRes = await worker.fetch(allowedReq, customEnv, {});
      expect(allowedRes.headers.get('Access-Control-Allow-Origin')).toBe('https://custom-domain.org');

      const disallowedReq = new Request('http://localhost:8787/api/health', {
        method: 'GET',
        headers: {
          Origin: 'https://another-domain.com',
        },
      });

      // @ts-expect-error test ctx
      const disallowedRes = await worker.fetch(disallowedReq, customEnv, {});
      expect(disallowedRes.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });
});
