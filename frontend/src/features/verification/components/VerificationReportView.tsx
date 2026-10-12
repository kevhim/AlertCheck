import React, { useState } from 'react';
import { VerificationReport } from '@alertcheck/verification-core';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FindingCard } from './FindingCard';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Cpu,
  UserCheck,
  Shield,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

interface VerificationReportViewProps {
  report: VerificationReport | null;
  fallbackNotice?: string | null;
  onEditCandidate: () => void;
}

export const VerificationReportView: React.FC<VerificationReportViewProps> = ({
  report,
  fallbackNotice,
  onEditCandidate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <Card>
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No Verification Report Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Configure a master warning and generate a variant to execute deterministic rule-based integrity verification.
          </p>
          <Button variant="primary" onClick={onEditCandidate}>
            Generate & Verify Variant
          </Button>
        </div>
      </Card>
    );
  }

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `alertcheck-report-${report.warningId}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getStatusBanner = () => {
    switch (report.status) {
      case 'issues_found':
        return {
          bg: 'bg-red-950/40 border-red-500/40',
          title: 'Critical Discrepancies Detected',
          icon: <AlertCircle className="w-6 h-6 text-red-400" />,
          desc: 'Safety-critical omissions or contradictions were found. This message must NOT be published in its current state.',
          badgeVariant: 'critical' as const,
        };
      case 'needs_review':
        return {
          bg: 'bg-amber-950/40 border-amber-500/40',
          title: 'Human Review Required',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          desc: 'Potential discrepancies, rephrasings, length warnings, or unverified translations require human approval.',
          badgeVariant: 'warning' as const,
        };
      case 'no_mismatch_detected':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40',
          title: 'No Mismatch Detected',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          desc: 'All structured facts were deterministically located in the candidate text. Qualified human review is still required prior to broadcast.',
          badgeVariant: 'success' as const,
        };
    }
  };

  const banner = getStatusBanner();

  return (
    <div className="space-y-6">
      {/* Offline / Local Fallback Notice banner */}
      {fallbackNotice && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>
              <strong>Local Fallback Active:</strong> {fallbackNotice}
            </span>
          </div>
          <Badge variant="info">In-Browser Fallback</Badge>
        </div>
      )}

      {/* Main Status Banner */}
      <div className={`p-5 rounded-xl border ${banner.bg} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {banner.icon}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-100">{banner.title}</h2>
                <Badge variant={banner.badgeVariant}>{report.status.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{banner.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyClipboard}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Findings</span>
          <span className="text-2xl font-bold font-mono text-slate-100">{report.summary.totalFindings}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-mono text-red-400 block mb-1">Critical</span>
          <span className="text-2xl font-bold font-mono text-red-400">{report.summary.criticalCount}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">Warnings</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{report.summary.warningCount}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-mono text-blue-400 block mb-1">Info / Notes</span>
          <span className="text-2xl font-bold font-mono text-blue-400">{report.summary.infoCount}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-mono text-amber-300 block mb-1">Human Review</span>
          <span className="text-2xl font-bold font-mono text-amber-300">
            {report.summary.requiresHumanReviewCount}
          </span>
        </div>
      </div>

      {/* Metadata card */}
      <Card title="Verification Metadata & Channel Execution Context">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Execution Engine:</span>
            <span className="font-mono font-semibold text-slate-200">
              {report.engineMode === 'cloudflare_worker' ? 'Cloudflare Worker' : 'Browser Local (Offline)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Target Format:</span>
            <span className="font-mono font-semibold text-slate-200">
              {report.metadata.candidateFormat} ({report.metadata.characterCount} / {report.metadata.characterLimit || '∞'} chars)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Target Language:</span>
            <span className="font-mono font-semibold text-slate-200">
              {report.metadata.candidateLanguage === 'hi' ? 'Hindi (Demonstration)' : 'English'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Verified At:</span>
            <span className="font-mono font-semibold text-slate-200">
              {new Date(report.verifiedAt).toLocaleTimeString()} UTC
            </span>
          </div>
        </div>
      </Card>

      {/* Findings Section */}
      <Card
        title={`Verification Findings (${report.findings.length})`}
        subtitle="Detailed factual audit comparing structured source facts to candidate text"
        headerAction={
          <Button variant="ghost" size="sm" onClick={onEditCandidate}>
            Edit Candidate Draft
          </Button>
        }
      >
        {report.findings.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">No Mismatches or Omissions Detected</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              All declared locations, deadlines, protective actions, and prohibitions were deterministically identified in the message text.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {report.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </Card>

      {/* Mandatory Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Shield className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Mandatory Human Review Standard:</span>{' '}
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
