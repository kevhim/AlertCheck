import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { MasterWarning, VerifyRequest, verifyWarning } from '@alertcheck/verification-core';

const fictionalWarning: MasterWarning = {
  warningId: 'warn-backend-test-01',
  hazardType: 'Flash Flood',
  severity: 'emergency',
  affectedAreas: ['River District', 'Sector 4'],
  issuedAt: '2026-10-12T10:00:00Z',
  validUntil: '2026-10-12T20:00:00Z',
  evacuationDeadline: '16:00',
  requiredActions: ['Evacuate immediately to designated shelter'],
  prohibitedActions: ['Do not drive through floodwater'],
  safetyContact: 'Helpline: 1800-555-0199',
  sourceReference: 'Fictional Civil Protection',
  sourceVersion: 1,
};

describe('Backend Worker: POST /api/verify', () => {
  it('returns 200 with verification report for valid request', async () => {
    const payload: VerifyRequest = {
      masterWarning: fictionalWarning,
      candidateText:
        'EMERGENCY: Flash Flood affecting River District, Sector 4. Evacuate by 16:00 to designated shelter. Do not drive through floodwater. Helpline: 1800-555-0199.',
      format: 'full',
      language: 'en',
    };

    const request = new Request('http://localhost:8787/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(200);

    const report = await response.json() as Record<string, unknown>;
    expect(report.status).toBe('no_mismatch_detected');
    expect(report.engineMode).toBe('cloudflare_worker');
    expect(report.disclaimer).toBeDefined();
  });

  it('rejects empty request body with 400 status', async () => {
    const request = new Request('http://localhost:8787/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(400);

    const data = await response.json() as { error: { message: string } };
    expect(data.error.message).toContain('empty');
  });

  it('rejects non-JSON content-type with 415 status', async () => {
    const request = new Request('http://localhost:8787/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Some plain text',
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(415);
  });

  it('yields identical verification findings between server and browser engine', async () => {
    // Missing location test
    const payload: VerifyRequest = {
      masterWarning: fictionalWarning,
      candidateText: 'EMERGENCY: Flash Flood in River District. Evacuate by 16:00.',
      format: 'full',
      language: 'en',
    };

    // 1. Direct browser/local engine run
    const localReport = verifyWarning(payload, { engineMode: 'browser_local' });

    // 2. Server run
    const request = new Request('http://localhost:8787/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // @ts-expect-error minimal ctx for test
    const response = await worker.fetch(request, {}, {});
    const serverReport = await response.json() as typeof localReport;

    // Both must match in status, number of findings, and critical counts
    expect(serverReport.status).toBe(localReport.status);
    expect(serverReport.summary.criticalCount).toBe(localReport.summary.criticalCount);
    expect(serverReport.findings.length).toBe(localReport.findings.length);
  });
});
