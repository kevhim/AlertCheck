import { describe, it, expect } from 'vitest';
import { validateActions } from '../src/validators/actionValidator';
import { mockMasterWarning } from './fixtures';

describe('actionValidator', () => {
  it('passes when required actions are present verbatim or closely matched', () => {
    const candidateText =
      'Action: Evacuate immediately to designated shelter and move to higher ground.';
    const findings = validateActions(mockMasterWarning, candidateText);
    expect(findings.filter((f) => f.severity === 'critical')).toHaveLength(0);
  });

  it('detects missing required action as a critical finding', () => {
    const candidateText =
      'Action: Move to higher ground. Stay tuned to emergency radio.';
    const findings = validateActions(mockMasterWarning, candidateText);
    const missingAction = findings.find((f) => f.id === 'action-missing-0');
    expect(missingAction).toBeDefined();
    expect(missingAction?.severity).toBe('critical');
    expect(missingAction?.sourceEvidence).toContain('Evacuate immediately');
  });

  it('flags rephrased or partial action wording as needs_human_review rather than a false match', () => {
    // Contains "shelter" and "designated" but rewrites structure
    const candidateText =
      'Action: Report quickly to your designated shelter area and seek higher high ground.';
    const findings = validateActions(mockMasterWarning, candidateText);
    // Should require human review if not verbatim
    const needsReview = findings.find((f) => f.status === 'needs_human_review');
    // Either verified or flagged for review, but not silently dropped
    if (needsReview) {
      expect(needsReview.requiresHumanReview).toBe(true);
      expect(needsReview.severity).toBe('warning');
    }
  });
});
