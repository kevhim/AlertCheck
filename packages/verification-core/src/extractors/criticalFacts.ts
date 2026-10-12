import { MasterWarning, CriticalFacts } from '../types';

/**
 * Normalizes text for comparison by lowercasing and standardizing whitespace and punctuation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s:-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract time expressions from text (e.g. "18:00", "6:00 PM", "6 PM", "1800 hrs", "2:30pm", "6 बजे").
 */
export function extractTimeExpressions(text: string): string[] {
  const matches: string[] = [];
  // Matches times with colon (18:00, 6:00pm) or explicit time indicators (6 pm, 1800 hrs, 6 बजे)
  const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:am|pm|hrs?|hours?))?|\d{1,2}\s*(?:am|pm|hrs?|hours?|o'clock|बजे)|[0-2]\d[0-5]\d\s*hrs?)\b/gi;
  let match;
  while ((match = timeRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    if (raw && !matches.includes(raw)) {
      matches.push(raw);
    }
  }
  return matches;
}

/**
 * Extracts numbers and quantities with context.
 */
export function extractQuantities(text: string): Array<{ raw: string; numericValue: number; context: string }> {
  const results: Array<{ raw: string; numericValue: number; context: string }> = [];
  // Match numbers, decimals, or sequences like phone numbers or sector numbers
  const numberRegex = /\b\d+(?:[\.,]\d+)?(?:\s*(?:km|m|cm|mm|meters?|miles?|ft|feet|hours?|hrs?|minutes?|mins?|people|persons?|families|sector|zone))?\b/gi;
  let match;
  while ((match = numberRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    const numPart = raw.match(/\d+(?:[\.,]\d+)?/);
    if (numPart) {
      const val = parseFloat(numPart[0].replace(',', '.'));
      if (!isNaN(val)) {
        // Extract +/- 20 chars context
        const start = Math.max(0, match.index - 20);
        const end = Math.min(text.length, match.index + raw.length + 20);
        const context = text.slice(start, end).trim();
        results.push({ raw, numericValue: val, context });
      }
    }
  }
  return results;
}

/**
 * Extracts phone numbers from text.
 */
export function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g;
  const matches = text.match(phoneRegex);
  return matches ? matches.map((m) => m.trim().replace(/[-.\s]/g, '')) : [];
}

/**
 * Extracts structured critical facts from a MasterWarning.
 */
export function extractMasterCriticalFacts(warning: MasterWarning): CriticalFacts {
  const combinedText = [
    warning.hazardType,
    warning.severity,
    ...warning.affectedAreas,
    ...warning.requiredActions,
    ...warning.prohibitedActions,
    warning.safetyContact || '',
  ].join(' ');

  const quantities = extractQuantities(combinedText);

  return {
    locations: warning.affectedAreas.map((loc) => loc.trim()),
    deadlines: {
      evacuationDeadline: warning.evacuationDeadline,
      validUntil: warning.validUntil,
      issuedAt: warning.issuedAt,
    },
    quantities,
    requiredActions: warning.requiredActions.map((act) => act.trim()),
    prohibitedActions: warning.prohibitedActions.map((prob) => prob.trim()),
    safetyContact: warning.safetyContact ? warning.safetyContact.trim() : null,
  };
}
