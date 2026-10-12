import { MasterWarning, SeverityLevel, VerifyRequest, WarningFormat, WarningLanguage } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_SEVERITIES: SeverityLevel[] = ['advisory', 'watch', 'warning', 'emergency'];
const VALID_FORMATS: WarningFormat[] = ['full', 'short_sms', 'social_media'];
const VALID_LANGUAGES: WarningLanguage[] = ['en', 'hi'];

/**
 * Validate that an object adheres to the MasterWarning contract and internal consistency.
 */
export function validateMasterWarningStructure(warning: unknown): ValidationResult {
  const errors: string[] = [];

  if (!warning || typeof warning !== 'object') {
    return { valid: false, errors: ['Warning must be a non-null object'] };
  }

  const w = warning as Record<string, unknown>;

  if (typeof w.warningId !== 'string' || !w.warningId.trim()) {
    errors.push('Missing or empty warningId');
  }

  if (typeof w.hazardType !== 'string' || !w.hazardType.trim()) {
    errors.push('Missing or empty hazardType');
  }

  if (!w.severity || !VALID_SEVERITIES.includes(w.severity as SeverityLevel)) {
    errors.push(`Invalid severity level. Must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }

  if (!Array.isArray(w.affectedAreas) || w.affectedAreas.length === 0) {
    errors.push('affectedAreas must be a non-empty list of location strings');
  } else {
    for (const [idx, area] of w.affectedAreas.entries()) {
      if (typeof area !== 'string' || !area.trim()) {
        errors.push(`affectedAreas[${idx}] cannot be blank`);
      }
    }
  }

  // Date parsing and validation
  let issuedDate: Date | null = null;
  let validUntilDate: Date | null = null;

  if (typeof w.issuedAt !== 'string' || !w.issuedAt.trim()) {
    errors.push('Missing issuedAt timestamp');
  } else {
    issuedDate = new Date(w.issuedAt);
    if (isNaN(issuedDate.getTime())) {
      errors.push('issuedAt is not a valid ISO 8601 date string');
    }
  }

  if (typeof w.validUntil !== 'string' || !w.validUntil.trim()) {
    errors.push('Missing validUntil timestamp');
  } else {
    validUntilDate = new Date(w.validUntil);
    if (isNaN(validUntilDate.getTime())) {
      errors.push('validUntil is not a valid ISO 8601 date string');
    }
  }

  if (issuedDate && validUntilDate && !isNaN(issuedDate.getTime()) && !isNaN(validUntilDate.getTime())) {
    if (validUntilDate.getTime() <= issuedDate.getTime()) {
      errors.push('Inconsistent time window: validUntil must be strictly after issuedAt');
    }
  }

  if (w.evacuationDeadline !== null && w.evacuationDeadline !== undefined) {
    if (typeof w.evacuationDeadline !== 'string' || !w.evacuationDeadline.trim()) {
      errors.push('evacuationDeadline must be null or a non-empty string');
    } else {
      const evacDate = new Date(w.evacuationDeadline);
      if (!isNaN(evacDate.getTime())) {
        if (issuedDate && !isNaN(issuedDate.getTime()) && evacDate.getTime() < issuedDate.getTime()) {
          errors.push('Inconsistent deadline: evacuationDeadline cannot precede issuedAt');
        }
        if (validUntilDate && !isNaN(validUntilDate.getTime()) && evacDate.getTime() > validUntilDate.getTime()) {
          errors.push('Inconsistent deadline: evacuationDeadline cannot be after validUntil expiration');
        }
      }
    }
  }

  if (!Array.isArray(w.requiredActions) || w.requiredActions.length === 0) {
    errors.push('requiredActions must contain at least one required action');
  } else {
    for (const [idx, act] of w.requiredActions.entries()) {
      if (typeof act !== 'string' || !act.trim()) {
        errors.push(`requiredActions[${idx}] cannot be blank`);
      }
    }
  }

  if (!Array.isArray(w.prohibitedActions)) {
    errors.push('prohibitedActions must be an array of strings');
  }

  if (typeof w.sourceReference !== 'string' || !w.sourceReference.trim()) {
    errors.push('Missing or empty sourceReference authority');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate incoming verification requests.
 */
export function validateVerifyRequest(request: unknown): ValidationResult {
  const errors: string[] = [];

  if (!request || typeof request !== 'object') {
    return { valid: false, errors: ['Request must be a non-null object'] };
  }

  const req = request as Record<string, unknown>;

  if (!req.masterWarning) {
    errors.push('Missing masterWarning object');
  } else {
    const warningRes = validateMasterWarningStructure(req.masterWarning);
    if (!warningRes.valid) {
      errors.push(...warningRes.errors);
    }
  }

  if (typeof req.candidateText !== 'string') {
    errors.push('candidateText must be a string');
  } else if (!req.candidateText.trim()) {
    errors.push('candidateText cannot be empty');
  }

  if (req.format && !VALID_FORMATS.includes(req.format as WarningFormat)) {
    errors.push(`Invalid format. Allowed: ${VALID_FORMATS.join(', ')}`);
  }

  if (req.language && !VALID_LANGUAGES.includes(req.language as WarningLanguage)) {
    errors.push(`Invalid language. Allowed: ${VALID_LANGUAGES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
