import { describe, it, expect } from 'vitest';
import { validateDeadlines } from '../src/validators/deadlineValidator';
import { mockMasterWarning } from './fixtures';

describe('deadlineValidator', () => {
  it('passes when evacuation deadline matches exactly (18:00)', () => {
    const candidateText =
      'EMERGENCY: Evacuate River District, Sector 4, North Valley by 18:00. Shelter available.';
    const findings = validateDeadlines(mockMasterWarning, candidateText);
    expect(findings.filter((f) => f.severity === 'critical')).toHaveLength(0);
  });

  it('passes when evacuation deadline matches in 12-hour format (6:00 PM)', () => {
    const candidateText =
      'EMERGENCY: Evacuate River District by 6:00 PM. Fictional Civil Defense Agency.';
    const findings = validateDeadlines(mockMasterWarning, candidateText);
    expect(findings.filter((f) => f.severity === 'critical')).toHaveLength(0);
  });

  it('detects missing evacuation deadline as a critical finding', () => {
    const candidateText =
      'EMERGENCY: Evacuate River District immediately. Fictional Civil Defense Agency.';
    const findings = validateDeadlines(mockMasterWarning, candidateText);
    const critical = findings.find((f) => f.id === 'deadline-evac-missing');
    expect(critical).toBeDefined();
    expect(critical?.severity).toBe('critical');
    expect(critical?.status).toBe('missing');
  });

  it('detects altered/conflicting deadline as a critical mismatch', () => {
    const candidateText =
      'EMERGENCY: Evacuate River District by 20:00 (8:00 PM). Fictional Civil Defense Agency.';
    const findings = validateDeadlines(mockMasterWarning, candidateText);
    const mismatch = findings.find((f) => f.id === 'deadline-evac-mismatch');
    expect(mismatch).toBeDefined();
    expect(mismatch?.severity).toBe('critical');
    expect(mismatch?.status).toBe('mismatch');
    expect(mismatch?.candidateEvidence).toContain('20:00');
  });

  it('detects invalid master warning time range where validUntil precedes issuedAt', () => {
    const invalidWarning = {
      ...mockMasterWarning,
      issuedAt: '2026-10-12T14:00:00Z',
      validUntil: '2026-10-12T10:00:00Z', // Before issuedAt!
    };
    const candidateText = 'EMERGENCY: Evacuate by 18:00.';
    const findings = validateDeadlines(invalidWarning, candidateText);
    const invalidWindow = findings.find((f) => f.id === 'deadline-inconsistent-window');
    expect(invalidWindow).toBeDefined();
    expect(invalidWindow?.severity).toBe('critical');
  });
});
