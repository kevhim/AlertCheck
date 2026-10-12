import { normalizeText } from '../extractors/criticalFacts';
import { ENGLISH_NEGATIONS, HINDI_NEGATIONS } from '../constants';

/**
 * Known Hindi transliteration aliases for fictional demonstration scenarios.
 */
const DEMO_LOCATION_ALIASES: Record<string, string[]> = {
  'river district': ['रिवर डिस्ट्रिक्ट', 'नदी क्षेत्र', 'रिवर जिला'],
  'north valley': ['नॉर्थ वैली', 'उत्तरी घाटी', 'उत्तर घाटी'],
  'sector 4': ['सेक्टर 4', 'सेक्टर चार', 'sector 4'],
  'ridge point': ['रिज पॉइंट', 'पहाड़ी बिंदु', 'रिज पॉइन्ट'],
  'coastal zone b': ['तटीय क्षेत्र बी', 'तटीय क्षेत्र b', 'कोस्टल ज़ोन बी'],
};

/**
 * Evaluates whether an affected location name is found in candidate text.
 */
export function findLocationMatch(
  location: string,
  candidateText: string,
  language: string = 'en'
): { found: boolean; matchedEvidence: string | null; matchType: 'exact' | 'normalized' | 'alias' | 'none' } {
  const normLocation = normalizeText(location);
  const normCandidate = normalizeText(candidateText);

  // Exact substring check
  if (candidateText.includes(location)) {
    return { found: true, matchedEvidence: location, matchType: 'exact' };
  }

  // Normalized substring check
  if (normCandidate.includes(normLocation)) {
    return { found: true, matchedEvidence: location, matchType: 'normalized' };
  }

  // Language / alias check for demonstration
  if (language === 'hi' || normCandidate.match(/[\u0900-\u097F]/)) {
    const aliases = DEMO_LOCATION_ALIASES[normLocation];
    if (aliases) {
      for (const alias of aliases) {
        if (candidateText.includes(alias) || normCandidate.includes(normalizeText(alias))) {
          return { found: true, matchedEvidence: alias, matchType: 'alias' };
        }
      }
    }
  }

  // Word token overlap (if multiple words, require all significant words)
  const locWords = normLocation.split(/\s+/).filter((w) => w.length > 2);
  if (locWords.length > 1) {
    const allWordsPresent = locWords.every((word) => normCandidate.includes(word));
    if (allWordsPresent) {
      return { found: true, matchedEvidence: locWords.join(' '), matchType: 'normalized' };
    }
  }

  return { found: false, matchedEvidence: null, matchType: 'none' };
}

/**
 * Checks for negation markers in or immediately surrounding a statement in candidate text.
 */
export function checkNegationPresence(
  statement: string,
  candidateText: string,
  language: string = 'en'
): { hasNegation: boolean; negationEvidence: string | null } {
  const negations = language === 'hi' ? [...HINDI_NEGATIONS, ...ENGLISH_NEGATIONS] : ENGLISH_NEGATIONS;
  const lowerCandidate = candidateText.toLowerCase();

  for (const neg of negations) {
    if (lowerCandidate.includes(neg.toLowerCase())) {
      return { hasNegation: true, negationEvidence: neg };
    }
  }

  return { hasNegation: false, negationEvidence: null };
}

/**
 * Token overlap ratio between source statement and candidate text.
 */
export function computeTokenOverlap(source: string, candidate: string): number {
  const normSource = normalizeText(source);
  const normCand = normalizeText(candidate);

  const sourceTokens = new Set(normSource.split(/\s+/).filter((t) => t.length > 2));
  if (sourceTokens.size === 0) return 0;

  const candTokens = new Set(normCand.split(/\s+/));
  let matched = 0;

  for (const token of sourceTokens) {
    if (candTokens.has(token) || normCand.includes(token)) {
      matched++;
    }
  }

  return matched / sourceTokens.size;
}
