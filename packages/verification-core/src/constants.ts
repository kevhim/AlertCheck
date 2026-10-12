import { WarningFormat, SeverityLevel, HazardType } from './types';

export const FORMAT_LIMITS: Record<WarningFormat, number> = {
  full: 4000,
  short_sms: 160,
  social_media: 280,
};

export const DISCLAIMER_TEXT =
  'AlertCheck is an automated verification aid and NOT an official emergency-warning authority, emergency dispatch service, or replacement for qualified human reviewers. No automated check can guarantee message safety or completeness. Human verification is required prior to public dissemination.';

export const DEMO_TRANSLATION_NOTE =
  'Demonstration translation (unapproved sample). Must be checked and certified by a qualified language reviewer before operational publication.';

export const ENGLISH_NEGATIONS = [
  'do not',
  "don't",
  'dont',
  'never',
  'must not',
  'prohibited',
  'avoid',
  'refrain from',
  'stay clear of',
  'stay away from',
  'no entry',
  'stop',
];

export const HINDI_NEGATIONS = [
  'न करें',
  'मत करें',
  'मना है',
  'ना करें',
  'प्रतिबंधित',
  'बचें',
  'मत',
  'ना',
  'नहीं',
];

export const HAZARD_LABELS: Record<HazardType, string> = {
  flood: 'Flash Flood / Riverine Flood',
  wildfire: 'Wildfire / Bushfire',
  cyclone: 'Tropical Cyclone / Hurricane',
  earthquake: 'Earthquake',
  severe_storm: 'Severe Thunderstorm / Tornado',
  tsunami: 'Tsunami Warning',
  extreme_heat: 'Extreme Heatwave',
  hazardous_material: 'Hazardous Material Release',
  other: 'General Emergency',
};

export const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  emergency: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/40' },
  warning: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/40' },
  watch: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/40' },
  advisory: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/40' },
};
