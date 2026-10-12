import React, { useState, useEffect } from 'react';
import {
  MasterWarning,
  WarningFormat,
  WarningLanguage,
  renderWarningVariant,
  FORMAT_LIMITS,
} from '@alertcheck/verification-core';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Languages,
  MessageSquare,
  Share2,
  FileText,
  FlaskConical,
} from 'lucide-react';

interface VariantGeneratorProps {
  warning: MasterWarning;
  onVerify: (candidateText: string, format: WarningFormat, language: WarningLanguage) => void;
  isVerifying: boolean;
}

export const VariantGenerator: React.FC<VariantGeneratorProps> = ({
  warning,
  onVerify,
  isVerifying,
}) => {
  const [format, setFormat] = useState<WarningFormat>('full');
  const [language, setLanguage] = useState<WarningLanguage>('en');
  const [candidateText, setCandidateText] = useState('');

  // Initial render when warning or format/language changes
  useEffect(() => {
    const rendered = renderWarningVariant(warning, format, language);
    setCandidateText(rendered.renderedText);
  }, [warning, format, language]);

  const handleReset = () => {
    const rendered = renderWarningVariant(warning, format, language);
    setCandidateText(rendered.renderedText);
  };

  const limit = FORMAT_LIMITS[format];
  const charCount = candidateText.length;
  const isOverLimit = limit && charCount > limit;

  // Simulation helpers for testing discrepancies
  const simulateOmitLocation = () => {
    if (warning.affectedAreas.length > 0) {
      const targetArea = warning.affectedAreas[0];
      setCandidateText((prev) => prev.replaceAll(targetArea, '').replace(/\s+,/g, ','));
    }
  };

  const simulateAlterDeadline = () => {
    if (warning.evacuationDeadline) {
      setCandidateText((prev) =>
        prev
          .replaceAll(warning.evacuationDeadline!, '21:00')
          .replaceAll('18:00', '21:00')
          .replaceAll('6:00 PM', '9:00 PM')
      );
    } else {
      setCandidateText((prev) => prev + ' Evacuate by: 23:00.');
    }
  };

  const simulateReverseProhibition = () => {
    setCandidateText((prev) =>
      prev
        .replaceAll('Do not drive through floodwater', 'Drive through floodwater quickly')
        .replaceAll('Do not return home', 'Return home immediately')
        .replaceAll('Do not: Do not', 'Do not:')
        .replaceAll('Do not:', 'Action:')
    );
  };

  const simulateAlterHelpline = () => {
    setCandidateText((prev) => prev.replaceAll('1800-555-0199', '1800-555-9999'));
  };

  return (
    <div className="space-y-6">
      <Card
        title="Warning Variant Generator & Candidate Message Editor"
        subtitle="Generate channel-adapted text from the master warning, or paste and edit candidate drafts for verification"
      >
        <div className="space-y-5">
          {/* Controls: Format and Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
            {/* Format Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Target Channel & Format:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('full')}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    format === 'full'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Full Advisory
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('short_sms')}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    format === 'short_sms'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Short SMS (160c)
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('social_media')}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    format === 'social_media'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Social Media (280c)
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Target Language:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English (Reviewed Template)
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    language === 'hi'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  Hindi (Demo Sample)
                </button>
              </div>
              {language === 'hi' && (
                <p className="text-[11px] text-amber-400/90 mt-1.5">
                  ⚠️ Note: Demonstration Hindi translation. Requires human review by a qualified language reviewer.
                </p>
              )}
            </div>
          </div>

          {/* Simulation / Corruption Injection Sandbox Toolbar */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-orange-400" />
                Discrepancy Simulation Sandbox (Inject deliberate test corruptions):
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3 h-3" />}>
                Reset to Clean Render
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={simulateOmitLocation}
                className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                ✂️ Omit Affected Area
              </button>
              <button
                type="button"
                onClick={simulateAlterDeadline}
                className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                ⏰ Alter Evacuation Deadline
              </button>
              <button
                type="button"
                onClick={simulateReverseProhibition}
                className="text-xs px-2.5 py-1 rounded bg-red-950/40 border border-red-600/40 hover:border-red-500 text-red-300 transition-colors cursor-pointer font-medium"
              >
                ⛔ Reverse Prohibition (Strip "Do Not")
              </button>
              <button
                type="button"
                onClick={simulateAlterHelpline}
                className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
              >
                📞 Alter Helpline Digits
              </button>
            </div>
          </div>

          {/* Candidate Textarea with Live Character Count */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Candidate Message Text (Ready for verification):
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-medium ${
                    isOverLimit ? 'text-red-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {charCount} / {limit} characters
                </span>
                {isOverLimit && <Badge variant="critical">Exceeds Limit</Badge>}
              </div>
            </div>
            <textarea
              rows={8}
              value={candidateText}
              onChange={(e) => setCandidateText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Candidate warning message text..."
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Deterministic verification executes in milliseconds without AI latency.
            </span>
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isVerifying || !candidateText.trim()}
              onClick={() => onVerify(candidateText, format, language)}
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              {isVerifying ? 'Verifying Integrity...' : 'Verify Message Integrity →'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
