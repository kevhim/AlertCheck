import { MasterWarning, VerificationFinding } from '../types';
import { extractTimeExpressions } from '../extractors/criticalFacts';

/**
 * Parses time string into minutes from midnight (0-1439).
 * Returns null if not parseable as a daily time.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  const clean = timeStr.trim().toLowerCase();

  // Try ISO timestamp first (e.g. "2026-10-12T18:00:00Z")
  if (clean.includes('t') || clean.includes('-')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    }
  }

  // 12-hour format with am/pm (e.g. "6:00 pm", "6 pm", "6:30am")
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3].toLowerCase() === 'pm';

    if (hours === 12) {
      hours = isPm ? 12 : 0;
    } else if (isPm) {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  // 24-hour format (e.g. "18:00", "06:30", "1800")
  const militaryMatch = clean.match(/^(\d{2}):?(\d{2})(?:\s*hrs?)?$/i);
  if (militaryMatch) {
    const hours = parseInt(militaryMatch[1], 10);
    const minutes = parseInt(militaryMatch[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  // Single hour (e.g. "18:00" or just "18")
  const simpleMatch = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = parseInt(simpleMatch[1], 10);
    const minutes = parseInt(simpleMatch[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  return null;
}

/**
 * Validates deadlines (evacuation deadline, validity expiration) between master warning and candidate text.
 */
export function validateDeadlines(
  masterWarning: MasterWarning,
  candidateText: string
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];

  // Check Master Warning internal validity consistency
  const issuedDate = new Date(masterWarning.issuedAt);
  const validUntilDate = new Date(masterWarning.validUntil);

  if (!isNaN(issuedDate.getTime()) && !isNaN(validUntilDate.getTime())) {
    if (validUntilDate.getTime() <= issuedDate.getTime()) {
      findings.push({
        id: 'deadline-inconsistent-window',
        category: 'validity',
        severity: 'critical',
        explanation: 'Inconsistent time range: Master warning validUntil expiration precedes or equals issuedAt time.',
        sourceEvidence: `issuedAt: ${masterWarning.issuedAt}, validUntil: ${masterWarning.validUntil}`,
        candidateEvidence: null,
        status: 'mismatch',
        requiresHumanReview: true,
      });
    }
  }

  // Evacuation deadline verification
  if (masterWarning.evacuationDeadline) {
    const sourceDeadlineStr = masterWarning.evacuationDeadline;
    const sourceMinutes = parseTimeToMinutes(sourceDeadlineStr);

    // Extract all candidate time expressions
    const candidateTimes = extractTimeExpressions(candidateText);

    if (candidateTimes.length === 0) {
      // Missing deadline completely
      findings.push({
        id: 'deadline-evac-missing',
        category: 'deadline',
        severity: 'critical',
        explanation: `Evacuation deadline omitted: Master warning mandates an evacuation deadline of "${sourceDeadlineStr}", but no deadline was found in the candidate message.`,
        sourceEvidence: `Evacuation Deadline: ${sourceDeadlineStr}`,
        candidateEvidence: null,
        status: 'missing',
        requiresHumanReview: true,
      });
    } else {
      // Check if any candidate time matches the source deadline
      let exactMatchFound = false;
      const confirmedMismatches: string[] = [];
      let hasEquivalentMinutes = false;

      for (const candTime of candidateTimes) {
        if (candidateText.toLowerCase().includes(sourceDeadlineStr.toLowerCase())) {
          exactMatchFound = true;
          break;
        }

        const candMinutes = parseTimeToMinutes(candTime);
        if (sourceMinutes !== null && candMinutes !== null) {
          if (candMinutes === sourceMinutes) {
            hasEquivalentMinutes = true;
          } else {
            if (!confirmedMismatches.includes(candTime)) {
              confirmedMismatches.push(candTime);
            }
          }
        }
      }

      if (!exactMatchFound && !hasEquivalentMinutes) {
        if (confirmedMismatches.length > 0) {
          findings.push({
            id: 'deadline-evac-mismatch',
            category: 'deadline',
            severity: 'critical',
            explanation: `Changed evacuation deadline: Source specifies "${sourceDeadlineStr}", but candidate message specifies conflicting time "${confirmedMismatches.join(', ')}".`,
            sourceEvidence: `Source Deadline: ${sourceDeadlineStr}`,
            candidateEvidence: `Found in candidate: "${confirmedMismatches.join(', ')}"`,
            status: 'mismatch',
            requiresHumanReview: true,
          });
        } else {
          // Time found but not deterministically matched
          findings.push({
            id: 'deadline-evac-unverified',
            category: 'deadline',
            severity: 'warning',
            explanation: `Ambiguous evacuation deadline: Source specifies "${sourceDeadlineStr}". Candidate contains time "${candidateTimes.join(', ')}", but equivalence cannot be deterministically verified.`,
            sourceEvidence: `Source Deadline: ${sourceDeadlineStr}`,
            candidateEvidence: `Candidate times: ${candidateTimes.join(', ')}`,
            status: 'needs_human_review',
            requiresHumanReview: true,
          });
        }
      }
    }
  }

  return findings;
}
