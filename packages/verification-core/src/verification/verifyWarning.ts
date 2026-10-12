import {
  VerifyRequest,
  VerificationReport,
  VerificationFinding,
  OverallVerificationStatus,
} from '../types';
import { FORMAT_LIMITS, DISCLAIMER_TEXT, DEMO_TRANSLATION_NOTE } from '../constants';
import { validateVerifyRequest } from '../schemas';
import { validateLocations } from '../validators/locationValidator';
import { validateDeadlines } from '../validators/deadlineValidator';
import { validateQuantities } from '../validators/quantityValidator';
import { validateActions } from '../validators/actionValidator';
import { validateProhibitions } from '../validators/prohibitionValidator';

export interface VerifyWarningOptions {
  engineMode?: 'cloudflare_worker' | 'browser_local';
}

/**
 * Deterministic verification pipeline for emergency warning variants.
 * Checks for missing or altered locations, deadlines, numbers, actions, reversed prohibitions, and length limits.
 */
export function verifyWarning(
  request: VerifyRequest,
  options: VerifyWarningOptions = {}
): VerificationReport {
  const engineMode = options.engineMode || 'browser_local';
  const format = request.format || 'full';
  const language = request.language || 'en';
  const limit = FORMAT_LIMITS[format];
  const charCount = request.candidateText ? request.candidateText.length : 0;

  // 1. Validate request schema
  const validation = validateVerifyRequest(request);
  if (!validation.valid) {
    const errorFindings: VerificationFinding[] = validation.errors.map((err, idx) => ({
      id: `schema-err-${idx}`,
      category: 'validity',
      severity: 'critical',
      explanation: err,
      sourceEvidence: 'Request structure schema validation',
      candidateEvidence: null,
      status: 'mismatch',
      requiresHumanReview: true,
    }));

    return {
      reportId: `rep-err-${Date.now().toString(36)}`,
      warningId: request.masterWarning?.warningId || 'unknown',
      variantId: request.variantId,
      status: 'issues_found',
      verifiedAt: new Date().toISOString(),
      engineMode,
      summary: {
        totalFindings: errorFindings.length,
        criticalCount: errorFindings.length,
        warningCount: 0,
        infoCount: 0,
        requiresHumanReviewCount: errorFindings.length,
      },
      findings: errorFindings,
      disclaimer: DISCLAIMER_TEXT,
      metadata: {
        sourceHazard: request.masterWarning?.hazardType || 'unknown',
        candidateFormat: format,
        candidateLanguage: language,
        characterCount: charCount,
        characterLimit: limit,
      },
    };
  }

  const { masterWarning, candidateText } = request;
  const findings: VerificationFinding[] = [];

  // 2. Format length limit verification
  if (limit && charCount > limit) {
    findings.push({
      id: 'len-limit-exceeded',
      category: 'message_length',
      severity: 'warning',
      explanation: `Message length (${charCount} characters) exceeds the maximum delivery limit (${limit} characters) for "${format}" format. The message may be truncated or rejected by transmission networks.`,
      sourceEvidence: `Allowed limit: ${limit} characters`,
      candidateEvidence: `Observed length: ${charCount} characters`,
      status: 'warning',
      requiresHumanReview: true,
    });
  }

  // 3. Language & demonstration translation review gate
  if (language === 'hi') {
    findings.push({
      id: 'lang-hi-demo-review',
      category: 'unsupported_language',
      severity: 'info',
      explanation: `${DEMO_TRANSLATION_NOTE} Rule-based matching cannot verify semantic translation accuracy in arbitrary Hindi text.`,
      sourceEvidence: 'Language: Hindi (hi demonstration)',
      candidateEvidence: null,
      status: 'needs_human_review',
      requiresHumanReview: true,
    });
  }

  // 4. Run deterministic validators
  const locationFindings = validateLocations(masterWarning, candidateText, language);
  findings.push(...locationFindings);

  const deadlineFindings = validateDeadlines(masterWarning, candidateText);
  findings.push(...deadlineFindings);

  const quantityFindings = validateQuantities(masterWarning, candidateText);
  findings.push(...quantityFindings);

  const actionFindings = validateActions(masterWarning, candidateText, language);
  findings.push(...actionFindings);

  const prohibitionFindings = validateProhibitions(masterWarning, candidateText, language);
  findings.push(...prohibitionFindings);

  // 5. Tally finding severities
  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const infoCount = findings.filter((f) => f.severity === 'info').length;
  const requiresHumanReviewCount = findings.filter((f) => f.requiresHumanReview).length;

  // 6. Overall status determination
  let status: OverallVerificationStatus = 'no_mismatch_detected';
  if (criticalCount > 0 || findings.some((f) => f.status === 'mismatch')) {
    status = 'issues_found';
  } else if (warningCount > 0 || requiresHumanReviewCount > 0) {
    status = 'needs_review';
  }

  return {
    reportId: `rep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    warningId: masterWarning.warningId,
    variantId: request.variantId,
    status,
    verifiedAt: new Date().toISOString(),
    engineMode,
    summary: {
      totalFindings: findings.length,
      criticalCount,
      warningCount,
      infoCount,
      requiresHumanReviewCount,
    },
    findings,
    disclaimer: DISCLAIMER_TEXT,
    metadata: {
      sourceHazard: masterWarning.hazardType,
      candidateFormat: format,
      candidateLanguage: language,
      characterCount: charCount,
      characterLimit: limit,
    },
  };
}
