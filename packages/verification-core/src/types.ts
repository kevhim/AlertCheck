/**
 * AlertCheck Domain Types
 * Strongly-typed models for emergency warning integrity verification.
 */

export type SeverityLevel = 'advisory' | 'watch' | 'warning' | 'emergency';

export type HazardType =
  | 'flood'
  | 'wildfire'
  | 'cyclone'
  | 'earthquake'
  | 'severe_storm'
  | 'tsunami'
  | 'extreme_heat'
  | 'hazardous_material'
  | 'other';

/**
 * Structured master source of truth for an emergency warning.
 */
export interface MasterWarning {
  warningId: string;
  hazardType: string;
  severity: SeverityLevel;
  affectedAreas: string[];
  issuedAt: string; // ISO 8601 UTC
  validUntil: string; // ISO 8601 UTC
  evacuationDeadline: string | null; // ISO 8601 or explicit deadline string
  requiredActions: string[];
  prohibitedActions: string[];
  safetyContact: string | null;
  sourceReference: string;
  sourceVersion: number | string;
}

export type WarningFormat = 'full' | 'short_sms' | 'social_media';

export type WarningLanguage = 'en' | 'hi';

export type VariantApprovalStatus = 'unapproved_sample' | 'draft' | 'reviewed_approved';

/**
 * Derived warning message rendered for a specific channel and language.
 */
export interface WarningVariant {
  variantId: string;
  warningId: string;
  language: WarningLanguage;
  format: WarningFormat;
  renderedText: string;
  templateVersion: string;
  validationStatus: VariantApprovalStatus;
  characterCount?: number;
  characterLimit?: number;
}

export type VerificationFindingCategory =
  | 'location'
  | 'deadline'
  | 'quantity'
  | 'action'
  | 'prohibition'
  | 'validity'
  | 'message_length'
  | 'semantic_ambiguity'
  | 'unsupported_language';

export type FindingSeverity = 'critical' | 'warning' | 'info';

export type FindingStatus = 'mismatch' | 'missing' | 'needs_human_review' | 'warning';

/**
 * An individual discrepancy, omission, or ambiguity identified by the verification engine.
 */
export interface VerificationFinding {
  id: string;
  category: VerificationFindingCategory;
  severity: FindingSeverity;
  explanation: string;
  sourceEvidence: string;
  candidateEvidence: string | null;
  status: FindingStatus;
  requiresHumanReview: boolean;
}

/**
 * Verification status enumeration.
 * Note: 'no_mismatch_detected' does NOT certify safety or completeness.
 */
export type OverallVerificationStatus = 'issues_found' | 'needs_review' | 'no_mismatch_detected';

export interface VerificationSummary {
  totalFindings: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  requiresHumanReviewCount: number;
}

export interface VerificationReport {
  reportId: string;
  warningId: string;
  variantId?: string;
  status: OverallVerificationStatus;
  verifiedAt: string;
  engineMode: 'cloudflare_worker' | 'browser_local';
  summary: VerificationSummary;
  findings: VerificationFinding[];
  disclaimer: string;
  metadata: {
    sourceHazard: string;
    candidateFormat: string;
    candidateLanguage: string;
    characterCount: number;
    characterLimit?: number;
  };
}

export interface VerifyRequest {
  masterWarning: MasterWarning;
  candidateText: string;
  format?: WarningFormat;
  language?: WarningLanguage;
  variantId?: string;
}

export interface CriticalFacts {
  locations: string[];
  deadlines: {
    evacuationDeadline: string | null;
    validUntil: string;
    issuedAt: string;
  };
  quantities: Array<{
    raw: string;
    numericValue: number;
    context: string;
  }>;
  requiredActions: string[];
  prohibitedActions: string[];
  safetyContact: string | null;
}
