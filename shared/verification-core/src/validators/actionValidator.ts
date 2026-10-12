import { MasterWarning, VerificationFinding, WarningLanguage } from '../types';
import { normalizeText } from '../extractors/criticalFacts';
import { computeTokenOverlap } from '../verification/compareFacts';

/**
 * Validates that all required protective actions are represented in candidate text.
 */
export function validateActions(
  masterWarning: MasterWarning,
  candidateText: string,
  language: WarningLanguage = 'en'
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];
  const normCandidate = normalizeText(candidateText);

  for (const [idx, action] of masterWarning.requiredActions.entries()) {
    const normAction = normalizeText(action);

    // Exact or normalized match
    if (candidateText.includes(action) || normCandidate.includes(normAction)) {
      continue;
    }

    const overlap = computeTokenOverlap(action, candidateText);

    if (overlap >= 0.7) {
      // Strongly matched via synonym/stem tokens
      continue;
    } else if (overlap >= 0.3) {
      // Partial overlap / rephrasing: requires human verification
      findings.push({
        id: `action-rephrased-${idx}`,
        category: 'action',
        severity: 'warning',
        explanation: `Potential action rephrasing: Source mandates "${action}". Candidate text has partial lexical correspondence, but semantic preservation cannot be certified deterministically.`,
        sourceEvidence: `Required Action: "${action}"`,
        candidateEvidence: `Found partial overlap in candidate text`,
        status: 'needs_human_review',
        requiresHumanReview: true,
      });
    } else {
      // Missing required action entirely
      findings.push({
        id: `action-missing-${idx}`,
        category: 'action',
        severity: 'critical',
        explanation: `Mandatory protective action omitted: "${action}" is required by the source warning but was omitted from the candidate message.`,
        sourceEvidence: `Required Action: "${action}"`,
        candidateEvidence: null,
        status: 'missing',
        requiresHumanReview: true,
      });
    }
  }

  return findings;
}
