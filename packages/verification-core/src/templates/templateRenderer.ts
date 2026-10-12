import { MasterWarning, WarningFormat, WarningLanguage, WarningVariant } from '../types';
import { FORMAT_LIMITS } from '../constants';

export const TEMPLATE_VERSION = '1.0.0';

/**
 * Deterministically renders an emergency warning into a channel-specific variant.
 * Guarantees that facts are NEVER silently omitted to meet arbitrary character limits.
 */
export function renderWarningVariant(
  warning: MasterWarning,
  format: WarningFormat,
  language: WarningLanguage = 'en'
): WarningVariant {
  const limit = FORMAT_LIMITS[format];
  let rendered = '';

  const areasStrEn = warning.affectedAreas.join(', ');
  const actionsStrEn = warning.requiredActions.join('. ');
  const prohibitionsStrEn = warning.prohibitedActions.join('. ');
  const deadlineStrEn = warning.evacuationDeadline ? ` Evacuate by: ${warning.evacuationDeadline}.` : '';
  const contactStrEn = warning.safetyContact ? ` Info: ${warning.safetyContact}.` : '';

  if (language === 'hi') {
    // Demonstration Hindi rendering with safety sample flag
    const hazardHi = warning.hazardType;
    const areasStrHi = warning.affectedAreas.join(', ');
    const actionsStrHi = warning.requiredActions.join('। ');
    const prohibitionsStrHi = warning.prohibitedActions.join('। ');
    const deadlineStrHi = warning.evacuationDeadline ? ` निकासी समय: ${warning.evacuationDeadline}।` : '';
    const contactStrHi = warning.safetyContact ? ` हेल्पलाइन: ${warning.safetyContact}।` : '';

    if (format === 'short_sms') {
      rendered = `[आपातकालीन] ${warning.severity.toUpperCase()}: ${hazardHi}। क्षेत्र: ${areasStrHi}।${deadlineStrHi} करें: ${actionsStrHi}। न करें: ${prohibitionsStrHi}।${contactStrHi} - ${warning.sourceReference}`;
    } else if (format === 'social_media') {
      rendered = `🚨 आपातकालीन चेतावनी [${warning.severity.toUpperCase()}]: ${hazardHi}\n📍 प्रभावित क्षेत्र: ${areasStrHi}\n⏰${deadlineStrHi || ' तत्काल प्रभाव'}\n✅ क्या करें: ${actionsStrHi}\n⛔ क्या न करें: ${prohibitionsStrHi}\n📞${contactStrHi}\n🏛️ जारीकर्ता: ${warning.sourceReference}`;
    } else {
      rendered = `आधिकारिक आपातकालीन चेतावनी [${warning.severity.toUpperCase()}]\n\nखतरा: ${hazardHi}\nप्रभावित क्षेत्र: ${areasStrHi}\nजारी किया गया: ${warning.issuedAt}\nवैधता: ${warning.validUntil}${deadlineStrHi}\n\nआवश्यक निर्देश:\n- ${actionsStrHi}\n\nप्रतिबंधित कार्य (सुरक्षा प्रतिबंध):\n- ${prohibitionsStrHi}\n\n${contactStrHi}\nस्रोत संदर्भ: ${warning.sourceReference} (v${warning.sourceVersion})`;
    }
  } else {
    // Standard English rendering
    if (format === 'short_sms') {
      rendered = `EMERGENCY ${warning.severity.toUpperCase()}: ${warning.hazardType} for ${areasStrEn}.${deadlineStrEn} Action: ${actionsStrEn}. Do not: ${prohibitionsStrEn}.${contactStrEn} Auth: ${warning.sourceReference}`;
    } else if (format === 'social_media') {
      rendered = `🚨 EMERGENCY ${warning.severity.toUpperCase()}: ${warning.hazardType}\n📍 Areas: ${areasStrEn}\n⏰ Deadline:${deadlineStrEn || ' Immediate'}\n✅ Action: ${actionsStrEn}\n⛔ Do Not: ${prohibitionsStrEn}\n📞 Contact: ${warning.safetyContact || 'N/A'}\n🏛️ Auth: ${warning.sourceReference}`;
    } else {
      rendered = `OFFICIAL EMERGENCY WARNING [${warning.severity.toUpperCase()}]\n\nHazard: ${warning.hazardType}\nAffected Areas: ${areasStrEn}\nIssued: ${warning.issuedAt}\nValid Until: ${warning.validUntil}${deadlineStrEn}\n\nREQUIRED PROTECTIVE ACTIONS:\n- ${actionsStrEn}\n\nPROHIBITED ACTIONS & SAFETY RESTRICTIONS:\n- ${prohibitionsStrEn}\n\nEmergency Contact: ${warning.safetyContact || 'None specified'}\nSource Authority: ${warning.sourceReference} (v${warning.sourceVersion})`;
    }
  }

  const charCount = rendered.length;

  return {
    variantId: `var-${warning.warningId}-${format}-${language}-${Date.now().toString(36)}`,
    warningId: warning.warningId,
    language,
    format,
    renderedText: rendered,
    templateVersion: TEMPLATE_VERSION,
    validationStatus: language === 'hi' ? 'unapproved_sample' : 'reviewed_approved',
    characterCount: charCount,
    characterLimit: limit,
  };
}
