import { MasterWarning } from '../src/types';

/**
 * Fictional test fixture for emergency warning integrity testing.
 * NOT an actual real-world alert.
 */
export const mockMasterWarning: MasterWarning = {
  warningId: 'warn-fictional-flood-01',
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
  sourceReference: 'Fictional Civil Defense Agency',
  sourceVersion: 1,
};
