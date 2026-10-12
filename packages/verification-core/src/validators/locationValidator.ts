import { MasterWarning, VerificationFinding, WarningLanguage } from '../types';
import { findLocationMatch } from '../verification/compareFacts';

/**
 * Validates that all affected areas from the master warning are present in candidate text.
 */
export function validateLocations(
  masterWarning: MasterWarning,
  candidateText: string,
  language: WarningLanguage = 'en'
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];

  for (const [idx, area] of masterWarning.affectedAreas.entries()) {
    const match = findLocationMatch(area, candidateText, language);

    if (!match.found) {
      findings.push({
        id: `loc-missing-${idx}`,
        category: 'location',
        severity: 'critical',
        explanation: `Critical location omitted: "${area}" is declared in the source warning but was not found in the candidate message.`,
        sourceEvidence: `Affected Area: ${area}`,
        candidateEvidence: null,
        status: 'missing',
        requiresHumanReview: true,
      });
    }
  }

  return findings;
}
