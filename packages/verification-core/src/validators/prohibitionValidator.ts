import { MasterWarning, VerificationFinding, WarningLanguage } from '../types';
import { ENGLISH_NEGATIONS, HINDI_NEGATIONS } from '../constants';
import { normalizeText } from '../extractors/criticalFacts';

/**
 * Strips known negation prefixes to isolate the core prohibited hazard action.
 */
function extractCoreProhibitedAction(prohibition: string): string {
  let clean = prohibition.trim();
  const allNegations = [...ENGLISH_NEGATIONS, ...HINDI_NEGATIONS];

  for (const neg of allNegations) {
    const reg = new RegExp(`^${neg}\\s+`, 'i');
    if (reg.test(clean)) {
      clean = clean.replace(reg, '');
      break;
    }
  }

  return clean.trim();
}

/**
 * Validates prohibited actions, explicitly guarding against dangerous reversed prohibitions (omitted negations).
 */
export function validateProhibitions(
  masterWarning: MasterWarning,
  candidateText: string,
  language: WarningLanguage = 'en'
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];
  const normCandidate = normalizeText(candidateText);
  const negations = language === 'hi' ? [...HINDI_NEGATIONS, ...ENGLISH_NEGATIONS] : ENGLISH_NEGATIONS;

  for (const [idx, prohibition] of masterWarning.prohibitedActions.entries()) {
    const normProhibition = normalizeText(prohibition);
    const coreAction = extractCoreProhibitedAction(prohibition);
    const normCoreAction = normalizeText(coreAction);

    // 1. Check for exact match of full prohibition (including negation)
    if (normCandidate.includes(normProhibition) || candidateText.toLowerCase().includes(prohibition.toLowerCase())) {
      // Full prohibition preserved intact
      continue;
    }

    // 2. Critical Safety Check: Reversed Prohibition
    // Is the dangerous core action present in the candidate text without a negation particle?
    if (normCoreAction.length > 4 && normCandidate.includes(normCoreAction)) {
      // Find where in candidate text the core action appears
      const pos = normCandidate.indexOf(normCoreAction);
      const precedingRaw = normCandidate.slice(Math.max(0, pos - 60), pos);
      
      // Stop at clause/sentence boundary (. ; ! ? \n)
      const lastPunctuation = Math.max(
        precedingRaw.lastIndexOf('.'),
        precedingRaw.lastIndexOf(';'),
        precedingRaw.lastIndexOf('!'),
        precedingRaw.lastIndexOf('?')
      );
      const precedingClause = lastPunctuation !== -1 ? precedingRaw.slice(lastPunctuation + 1) : precedingRaw;

      // In English & general grammar, prohibition negations precede the action
      const hasPrecedingNegation = negations.some((neg) => precedingClause.includes(neg.toLowerCase()));

      // In Hindi, negation may also immediately follow within the same verb phrase
      const followingRaw = normCandidate.slice(pos + normCoreAction.length, Math.min(normCandidate.length, pos + normCoreAction.length + 30));
      const firstPunctuation = Math.min(
        followingRaw.indexOf('.') !== -1 ? followingRaw.indexOf('.') : Infinity,
        followingRaw.indexOf(';') !== -1 ? followingRaw.indexOf(';') : Infinity,
        followingRaw.indexOf('!') !== -1 ? followingRaw.indexOf('!') : Infinity
      );
      const followingClause = firstPunctuation !== Infinity ? followingRaw.slice(0, firstPunctuation) : followingRaw;
      const hasFollowingNegation = language === 'hi' && HINDI_NEGATIONS.some((neg) => followingClause.includes(neg.toLowerCase()));

      const hasNegation = hasPrecedingNegation || hasFollowingNegation;

      if (!hasNegation) {
        // Severe life-safety defect: core action present, but negative word absent!
        const contextSnippet = normCandidate.slice(Math.max(0, pos - 20), Math.min(normCandidate.length, pos + normCoreAction.length + 30));
        findings.push({
          id: `prohibition-reversed-${idx}`,
          category: 'prohibition',
          severity: 'critical',
          explanation: `CRITICAL SAFETY HAZARD - REVERSED PROHIBITION: Candidate text contains the hazardous action phrase "${coreAction}" without the required negative command ("do not" / "never"). The message may inadvertently instruct the public to engage in a dangerous activity.`,
          sourceEvidence: `Source Prohibited Action: "${prohibition}"`,
          candidateEvidence: `Found affirmative hazardous phrasing: "...${contextSnippet.trim()}..."`,
          status: 'mismatch',
          requiresHumanReview: true,
        });
        continue;
      } else {
        // Negation is present in proximity
        continue;
      }
    }

    // 3. If neither the full prohibition nor the core action was found: Prohibition is missing
    findings.push({
      id: `prohibition-missing-${idx}`,
      category: 'prohibition',
      severity: 'critical',
      explanation: `Prohibited action omitted: Safety restriction "${prohibition}" is declared in the source warning but is completely missing from the candidate message.`,
      sourceEvidence: `Source Prohibited Action: "${prohibition}"`,
      candidateEvidence: null,
      status: 'missing',
      requiresHumanReview: true,
    });
  }

  return findings;
}
