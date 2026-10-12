import { describe, it, expect } from 'vitest';
import { validateQuantities } from '../src/validators/quantityValidator';
import { mockMasterWarning } from './fixtures';

describe('quantityValidator', () => {
  it('passes when phone number and sector quantity match', () => {
    const candidateText =
      'Evacuate Sector 4. Call Helpline: 1800-555-0199 for transportation.';
    const findings = validateQuantities(mockMasterWarning, candidateText);
    expect(findings.filter((f) => f.severity === 'critical')).toHaveLength(0);
  });

  it('detects altered phone number as critical mismatch', () => {
    const candidateText =
      'Evacuate Sector 4. Call Helpline: 1800-555-9999 for transportation.';
    const findings = validateQuantities(mockMasterWarning, candidateText);
    const phoneMismatch = findings.find((f) => f.id.startsWith('qty-phone-mismatch'));
    expect(phoneMismatch).toBeDefined();
    expect(phoneMismatch?.severity).toBe('critical');
    expect(phoneMismatch?.status).toBe('mismatch');
  });

  it('flags omitted emergency helpline as a warning', () => {
    const candidateText = 'Evacuate Sector 4 immediately. No phone listed.';
    const findings = validateQuantities(mockMasterWarning, candidateText);
    const phoneOmitted = findings.find((f) => f.id.startsWith('qty-phone-omitted'));
    expect(phoneOmitted).toBeDefined();
    expect(phoneOmitted?.severity).toBe('warning');
    expect(phoneOmitted?.status).toBe('missing');
  });

  it('detects altered sector number', () => {
    const candidateText = 'Evacuate Sector 7 immediately.';
    const findings = validateQuantities(mockMasterWarning, candidateText);
    const qtyMismatch = findings.find((f) => f.id.startsWith('qty-changed'));
    expect(qtyMismatch).toBeDefined();
    expect(qtyMismatch?.severity).toBe('critical');
    expect(qtyMismatch?.status).toBe('mismatch');
  });
});
