import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Backend Worker: GET /api/health', () => {
  it('returns status 200 with structured health details', async () => {
    const request = new Request('http://localhost:8787/api/health', {
      method: 'GET',
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(200);

    const body = await response.json() as Record<string, unknown>;
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('alertcheck-api');
    expect(body.engine).toBe('deterministic-rule-based');
    expect(body.offlineCapable).toBe(true);
    expect(body.requiresAiKey).toBe(false);
  });

  it('handles OPTIONS preflight properly', async () => {
    const request = new Request('http://localhost:8787/api/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });
});
