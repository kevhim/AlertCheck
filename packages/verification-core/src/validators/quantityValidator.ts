import { MasterWarning, VerificationFinding } from '../types';
import { extractQuantities, extractPhoneNumbers } from '../extractors/criticalFacts';

/**
 * Validates numerical values, measurements, phone numbers, and sector numbers between source facts and candidate text.
 */
export function validateQuantities(
  masterWarning: MasterWarning,
  candidateText: string
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];

  // 1. Safety contact phone number verification
  if (masterWarning.safetyContact) {
    const sourcePhoneNumbers = extractPhoneNumbers(masterWarning.safetyContact);
    const candidatePhoneNumbers = extractPhoneNumbers(candidateText);

    if (sourcePhoneNumbers.length > 0) {
      for (const [idx, srcPhone] of sourcePhoneNumbers.entries()) {
        const found = candidatePhoneNumbers.some(
          (cPhone) => cPhone === srcPhone || cPhone.endsWith(srcPhone) || srcPhone.endsWith(cPhone)
        );

        if (!found) {
          if (candidatePhoneNumbers.length > 0) {
            findings.push({
              id: `qty-phone-mismatch-${idx}`,
              category: 'quantity',
              severity: 'critical',
              explanation: `Emergency phone number altered: Source lists "${srcPhone}", but candidate text specifies conflicting contact number "${candidatePhoneNumbers.join(', ')}".`,
              sourceEvidence: `Contact: ${masterWarning.safetyContact}`,
              candidateEvidence: `Found contact number: ${candidatePhoneNumbers.join(', ')}`,
              status: 'mismatch',
              requiresHumanReview: true,
            });
          } else {
            findings.push({
              id: `qty-phone-omitted-${idx}`,
              category: 'quantity',
              severity: 'warning',
              explanation: `Emergency contact number omitted: Source provides safety helpline "${srcPhone}", which is missing from candidate text.`,
              sourceEvidence: `Contact: ${masterWarning.safetyContact}`,
              candidateEvidence: null,
              status: 'missing',
              requiresHumanReview: true,
            });
          }
        }
      }
    }
  }

  // 2. Numerical quantities embedded in master warning (e.g. "Sector 4", "Zone 2", "500m")
  const sourceContext = [
    ...masterWarning.affectedAreas,
    ...masterWarning.requiredActions,
    ...masterWarning.prohibitedActions,
  ].join(' ');

  const sourceQuantities = extractQuantities(sourceContext);
  const candidateQuantities = extractQuantities(candidateText);

  for (const [idx, srcQty] of sourceQuantities.entries()) {
    // Check if the source number exists in candidate
    const candidateHasNumber = candidateQuantities.some((c) => c.numericValue === srcQty.numericValue);

    if (!candidateHasNumber) {
      // Check if a similar context has a different number in candidate
      const contextWords = srcQty.context.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !w.match(/^\d+$/));
      const conflicting = candidateQuantities.find((c) => {
        const cLower = c.context.toLowerCase();
        return contextWords.some((cw) => cLower.includes(cw));
      });

      if (conflicting) {
        findings.push({
          id: `qty-changed-${idx}`,
          category: 'quantity',
          severity: 'critical',
          explanation: `Quantity or numeric value altered: Source specified "${srcQty.raw}" in context "${srcQty.context}", but candidate text appears to use "${conflicting.raw}" in context "${conflicting.context}".`,
          sourceEvidence: `Source: "${srcQty.raw}" (${srcQty.context})`,
          candidateEvidence: `Candidate: "${conflicting.raw}" (${conflicting.context})`,
          status: 'mismatch',
          requiresHumanReview: true,
        });
      }
    }
  }

  return findings;
}
