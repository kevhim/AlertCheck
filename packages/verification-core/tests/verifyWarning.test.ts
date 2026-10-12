import { describe, it, expect } from 'vitest';
import { verifyWarning } from '../src/verification/verifyWarning';
import { renderWarningVariant } from '../src/templates/templateRenderer';
import { mockMasterWarning } from './fixtures';

describe('verifyWarning orchestrator', () => {
  it('returns no_mismatch_detected for a perfectly rendered full English variant', () => {
    const variant = renderWarningVariant(mockMasterWarning, 'full', 'en');
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: variant.renderedText,
      format: 'full',
      language: 'en',
    });

    expect(report.status).toBe('no_mismatch_detected');
    expect(report.summary.criticalCount).toBe(0);
    expect(report.findings).toHaveLength(0);
    expect(report.disclaimer).toBeDefined();
  });

  it('handles empty/invalid warning structure gracefully', () => {
    const report = verifyWarning({
      // @ts-expect-error testing invalid input
      masterWarning: {},
      candidateText: 'Some warning text',
    });

    expect(report.status).toBe('issues_found');
    expect(report.summary.criticalCount).toBeGreaterThan(0);
    expect(report.findings[0].category).toBe('validity');
  });

  it('detects omitted affected area as critical issue', () => {
    // Missing "North Valley"
    const textWithoutNorthValley =
      'EMERGENCY: Flash Flood affecting River District and Sector 4. Evacuate by 18:00 to designated shelter and move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-0199.';
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: textWithoutNorthValley,
      format: 'full',
      language: 'en',
    });

    expect(report.status).toBe('issues_found');
    const locFinding = report.findings.find((f) => f.category === 'location');
    expect(locFinding).toBeDefined();
    expect(locFinding?.severity).toBe('critical');
    expect(locFinding?.sourceEvidence).toContain('North Valley');
  });

  it('detects missing evacuation deadline as critical issue', () => {
    const textWithoutDeadline =
      'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate immediately to designated shelter and move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-0199.';
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: textWithoutDeadline,
      format: 'full',
      language: 'en',
    });

    expect(report.status).toBe('issues_found');
    const deadlineFinding = report.findings.find((f) => f.category === 'deadline');
    expect(deadlineFinding?.severity).toBe('critical');
    expect(deadlineFinding?.status).toBe('missing');
  });

  it('detects altered evacuation deadline as critical mismatch', () => {
    const textWithChangedDeadline =
      'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate by 20:00 (8:00 PM) to designated shelter and move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-0199.';
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: textWithChangedDeadline,
      format: 'full',
      language: 'en',
    });

    expect(report.status).toBe('issues_found');
    const mismatch = report.findings.find((f) => f.id === 'deadline-evac-mismatch');
    expect(mismatch).toBeDefined();
    expect(mismatch?.status).toBe('mismatch');
  });

  it('detects reversed prohibition as critical hazard', () => {
    const textWithReversedProhibition =
      'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate by 18:00 to designated shelter and move to higher ground. Drive through floodwater quickly to escape! Do not return home until cleared. Call 1800-555-0199.';
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: textWithReversedProhibition,
      format: 'full',
      language: 'en',
    });

    expect(report.status).toBe('issues_found');
    const rev = report.findings.find((f) => f.category === 'prohibition' && f.status === 'mismatch');
    expect(rev).toBeDefined();
    expect(rev?.explanation).toContain('REVERSED PROHIBITION');
  });

  it('flags character limit violation for short_sms format without silently dropping facts', () => {
    // Generate text that is deliberately 200 characters long for short_sms (limit 160)
    const longSms =
      'EMERGENCY: Flash Flood for River District, Sector 4, North Valley. Evacuate by: 18:00. Action: Evacuate immediately to designated shelter. Move to higher ground. Do not: Do not drive through floodwater.';
    expect(longSms.length).toBeGreaterThan(160);

    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: longSms,
      format: 'short_sms',
      language: 'en',
    });

    const lenFinding = report.findings.find((f) => f.category === 'message_length');
    expect(lenFinding).toBeDefined();
    expect(lenFinding?.severity).toBe('warning');
    expect(report.metadata.characterLimit).toBe(160);
  });

  it('flags Hindi demonstration variant as needing human review', () => {
    const variant = renderWarningVariant(mockMasterWarning, 'full', 'hi');
    const report = verifyWarning({
      masterWarning: mockMasterWarning,
      candidateText: variant.renderedText,
      format: 'full',
      language: 'hi',
    });

    expect(report.status).toBe('needs_review');
    const langFinding = report.findings.find((f) => f.category === 'unsupported_language');
    expect(langFinding).toBeDefined();
    expect(langFinding?.requiresHumanReview).toBe(true);
  });
});
