import { MasterWarning } from '@alertcheck/verification-core';

export interface FictionalPreset {
  id: string;
  name: string;
  description: string;
  warning: MasterWarning;
}

export const FICTIONAL_PRESETS: FictionalPreset[] = [
  {
    id: 'fictional-flood-river-district',
    name: 'Flash Flood — River District & Sector 4 (Fictional)',
    description: 'Rapid river rise scenario with evacuation deadline and road safety restrictions.',
    warning: {
      warningId: 'warn-fic-flood-01',
      hazardType: 'Flash Flood',
      severity: 'emergency',
      affectedAreas: ['River District', 'Sector 4', 'North Valley'],
      issuedAt: '2026-10-12T12:00:00Z',
      validUntil: '2026-10-12T22:00:00Z',
      evacuationDeadline: '18:00',
      requiredActions: [
        'Evacuate immediately to designated shelter',
        'Move to higher ground',
      ],
      prohibitedActions: [
        'Do not drive through floodwater',
        'Do not return home until cleared',
      ],
      safetyContact: 'Helpline: 1800-555-0199',
      sourceReference: 'Fictional Civil Defense Bureau',
      sourceVersion: 1,
    },
  },
  {
    id: 'fictional-wildfire-ridge-point',
    name: 'Wildfire — Ridge Point & North Valley (Fictional)',
    description: 'Rapidly spreading brush fire with urgent evacuation and air quality warnings.',
    warning: {
      warningId: 'warn-fic-fire-02',
      hazardType: 'Wildfire',
      severity: 'warning',
      affectedAreas: ['Ridge Point', 'North Valley'],
      issuedAt: '2026-10-12T14:30:00Z',
      validUntil: '2026-10-13T06:00:00Z',
      evacuationDeadline: '17:30',
      requiredActions: [
        'Evacuate north via Highway 9',
        'Close all windows and exterior vents',
      ],
      prohibitedActions: [
        'Do not use canyon access roads',
        'Do not delay departure for personal belongings',
      ],
      safetyContact: 'Wildfire Taskforce: 1800-555-0144',
      sourceReference: 'Fictional Forestry and Fire Service',
      sourceVersion: 1,
    },
  },
  {
    id: 'fictional-cyclone-coastal-zone',
    name: 'Tropical Cyclone — Coastal Zone B (Fictional)',
    description: 'High wind and storm surge advisory requiring structural lockdown.',
    warning: {
      warningId: 'warn-fic-cyclone-03',
      hazardType: 'Tropical Cyclone',
      severity: 'emergency',
      affectedAreas: ['Coastal Zone B', 'Sector 4'],
      issuedAt: '2026-10-12T08:00:00Z',
      validUntil: '2026-10-13T12:00:00Z',
      evacuationDeadline: '15:00',
      requiredActions: [
        'Seek sturdy masonry shelter immediately',
        'Secure exterior doors and storm shutters',
      ],
      prohibitedActions: [
        'Do not go outside during the calm eye of the storm',
        'Do not venture near seawalls or beaches',
      ],
      safetyContact: 'Emergency Operations Center: 1800-555-0188',
      sourceReference: 'Fictional Coastal Weather Bureau',
      sourceVersion: 2,
    },
  },
];
