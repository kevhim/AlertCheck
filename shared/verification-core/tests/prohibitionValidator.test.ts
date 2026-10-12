import { describe, it, expect } from 'vitest';
import { validateProhibitions } from '../src/validators/prohibitionValidator';
import { mockMasterWarning } from './fixtures';

describe('prohibitionValidator', () => {
  it('passes when prohibitions are properly negated and intact', () => {
    const candidateText =
      'Safety restrictions: Do not drive through floodwater. Do not return home until cleared.';
    const findings = validateProhibitions(mockMasterWarning, candidateText);
    expect(findings.filter((f) => f.severity === 'critical')).toHaveLength(0);
  });

  it('detects omitted prohibition as critical finding', () => {
    const candidateText = 'Safety restrictions: Do not drive through floodwater.';
    const findings = validateProhibitions(mockMasterWarning, candidateText);
    const missing = findings.find((f) => f.id === 'prohibition-missing-1');
    expect(missing).toBeDefined();
    expect(missing?.severity).toBe('critical');
    expect(missing?.sourceEvidence).toContain('Do not return home until cleared');
  });

  it('detects reversed prohibition when negation is stripped (critical hazard)', () => {
    // Dangerous corruption where "Do not" was deleted or corrupted
    const candidateText =
      'Instructions: Drive through floodwater quickly to reach safety. Do not return home until cleared.';
    const findings = validateProhibitions(mockMasterWarning, candidateText);
    const reversed = findings.find((f) => f.id === 'prohibition-reversed-0');
    expect(reversed).toBeDefined();
    expect(reversed?.severity).toBe('critical');
    expect(reversed?.status).toBe('mismatch');
    expect(reversed?.explanation).toContain('REVERSED PROHIBITION');
  });
});
