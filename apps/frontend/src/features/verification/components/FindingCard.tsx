import React from 'react';
import { VerificationFinding } from '@alertcheck/verification-core';
import { Badge, BadgeVariant } from '../../../components/ui/Badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, UserCheck } from 'lucide-react';

interface FindingCardProps {
  finding: VerificationFinding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const severityBadgeMap: Record<string, BadgeVariant> = {
    critical: 'critical',
    warning: 'warning',
    info: 'info',
  };

  const getSeverityIcon = () => {
    switch (finding.severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = () => {
    switch (finding.severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-950/20';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20';
      default:
        return 'border-blue-500/30 bg-blue-950/20';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getBorderColor()} transition-all`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          {getSeverityIcon()}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
                {finding.category.replace('_', ' ')}
              </span>
              <Badge variant={severityBadgeMap[finding.severity]}>
                {finding.severity.toUpperCase()}
              </Badge>
              {finding.requiresHumanReview && (
                <Badge variant="neutral">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  Human Review Required
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">{finding.explanation}</p>
          </div>
        </div>
      </div>

      {/* Evidence comparison block */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Source Ground-Truth Fact:
          </span>
          <code className="text-emerald-300 block font-mono text-[11px] break-words">
            {finding.sourceEvidence}
          </code>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Observed Candidate Text:
          </span>
          {finding.candidateEvidence ? (
            <code className="text-red-300 block font-mono text-[11px] break-words">
              {finding.candidateEvidence}
            </code>
          ) : (
            <span className="text-slate-500 italic">None found in candidate text (omitted)</span>
          )}
        </div>
      </div>
    </div>
  );
};
