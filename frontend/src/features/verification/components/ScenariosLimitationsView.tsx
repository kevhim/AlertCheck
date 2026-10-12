import React from 'react';
import { MasterWarning, WarningFormat, WarningLanguage } from '@alertcheck/verification-core';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FICTIONAL_PRESETS } from '../../warnings/data/fictionalPresets';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Flame,
  Clock,
  Layers,
  Phone,
  Languages,
} from 'lucide-react';

interface ScenarioItem {
  id: string;
  title: string;
  expectedStatus: 'issues_found' | 'needs_review' | 'no_mismatch_detected';
  category: string;
  description: string;
  candidateText: string;
  format: WarningFormat;
  language: WarningLanguage;
}

interface ScenariosLimitationsViewProps {
  onLoadScenario: (candidateText: string, format: WarningFormat, language: WarningLanguage) => void;
}

export const ScenariosLimitationsView: React.FC<ScenariosLimitationsViewProps> = ({
  onLoadScenario,
}) => {
  const scenarios: ScenarioItem[] = [
    {
      id: 'scen-clean',
      title: 'Scenario 1: Verified Clean Broadcast (All Facts Preserved)',
      expectedStatus: 'no_mismatch_detected',
      category: 'Baseline',
      description: 'Rendered full warning preserving all locations, 18:00 deadline, actions, prohibitions, and phone.',
      candidateText:
        'OFFICIAL EMERGENCY WARNING [EMERGENCY]\n\nHazard: Flash Flood\nAffected Areas: River District, Sector 4, North Valley\nIssued: 2026-10-12T12:00:00Z\nValid Until: 2026-10-12T22:00:00Z Evacuate by: 18:00.\n\nREQUIRED PROTECTIVE ACTIONS:\n- Evacuate immediately to designated shelter. Move to higher ground\n\nPROHIBITED ACTIONS & SAFETY RESTRICTIONS:\n- Do not drive through floodwater. Do not return home until cleared\n\nEmergency Contact: Helpline: 1800-555-0199\nSource Authority: Fictional Civil Defense Agency (v1)',
      format: 'full',
      language: 'en',
    },
    {
      id: 'scen-omitted-location',
      title: 'Scenario 2: Omitted Affected Location (North Valley Missing)',
      expectedStatus: 'issues_found',
      category: 'Location Integrity',
      description: 'Editor accidentally omitted North Valley from the candidate broadcast text.',
      candidateText:
        'EMERGENCY: Flash Flood affecting River District and Sector 4. Evacuate by 18:00 to designated shelter. Move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-0199.',
      format: 'full',
      language: 'en',
    },
    {
      id: 'scen-altered-deadline',
      title: 'Scenario 3: Dangerous Deadline Tampering (18:00 -> 20:00)',
      expectedStatus: 'issues_found',
      category: 'Deadline Integrity',
      description: 'Candidate message changed the critical evacuation deadline from 18:00 to 20:00 (8:00 PM).',
      candidateText:
        'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate by 20:00 (8:00 PM) to designated shelter. Move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-0199.',
      format: 'full',
      language: 'en',
    },
    {
      id: 'scen-reversed-prohibition',
      title: 'Scenario 4: Reversed Prohibition Hazard (Negation Omitted)',
      expectedStatus: 'issues_found',
      category: 'Life Safety Hazard',
      description: 'Corrupted text omitted "Do not", inadvertently instructing the public to drive into floodwater!',
      candidateText:
        'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate by 18:00 to designated shelter. Drive through floodwater quickly to escape! Do not return home until cleared. Helpline: 1800-555-0199.',
      format: 'full',
      language: 'en',
    },
    {
      id: 'scen-altered-phone',
      title: 'Scenario 5: Corrupted Emergency Contact Number',
      expectedStatus: 'issues_found',
      category: 'Quantity & Digits',
      description: 'Emergency helpline digits corrupted (1800-555-9999 instead of 1800-555-0199).',
      candidateText:
        'EMERGENCY: Flash Flood affecting River District, Sector 4, North Valley. Evacuate by 18:00 to designated shelter. Move to higher ground. Do not drive through floodwater. Do not return home until cleared. Call 1800-555-9999.',
      format: 'full',
      language: 'en',
    },
    {
      id: 'scen-sms-length',
      title: 'Scenario 6: SMS Channel Length Violation (>160 characters)',
      expectedStatus: 'needs_review',
      category: 'Channel Delivery',
      description: 'Candidate SMS text is 205 characters long and would be truncated by telecom SMS gateways.',
      candidateText:
        'EMERGENCY EMERGENCY: Flash Flood for River District, Sector 4, North Valley. Evacuate by: 18:00. Action: Evacuate immediately to designated shelter. Move to higher ground. Do not: Do not drive through floodwater.',
      format: 'short_sms',
      language: 'en',
    },
    {
      id: 'scen-hindi-demo',
      title: 'Scenario 7: Hindi Demonstration Variant (Language Review Gate)',
      expectedStatus: 'needs_review',
      category: 'Translation Gate',
      description: 'Hindi demonstration template. Flags mandatory requirement for native language review before public dissemination.',
      candidateText:
        'आधिकारिक आपातकालीन चेतावनी [EMERGENCY]\n\nखतरा: Flash Flood\nप्रभावित क्षेत्र: River District, Sector 4, North Valley\nजारी किया गया: 2026-10-12T12:00:00Z\nवैधता: 2026-10-12T22:00:00Z निकासी समय: 18:00।\n\nआवश्यक निर्देश:\n- Evacuate immediately to designated shelter। Move to higher ground\n\nप्रतिबंधित कार्य (सुरक्षा प्रतिबंध):\n- Do not drive through floodwater। Do not return home until cleared\n\nHelpline: 1800-555-0199।\nस्रोत संदर्भ: Fictional Civil Defense Agency (v1)',
      format: 'full',
      language: 'hi',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Test Scenarios Card */}
      <Card
        title="Interactive Demonstration Scenarios"
        subtitle="Load pre-built test cases to inspect deterministic error detection and safety safeguards"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {scen.category}
                  </span>
                  <Badge
                    variant={
                      scen.expectedStatus === 'issues_found'
                        ? 'critical'
                        : scen.expectedStatus === 'needs_review'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    Expected: {scen.expectedStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mb-1">{scen.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{scen.description}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadScenario(scen.candidateText, scen.format, scen.language)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full justify-between mt-2"
              >
                <span>Load & Verify in Engine</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Limitations and System Philosophy Documentation */}
      <Card
        title="System Limitations & Safety Philosophy"
        subtitle="Why deterministic integrity checks are essential and where automated checking ends"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <h4 className="font-semibold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              1. The "No Mismatch Detected" Safety Principle
            </h4>
            <p>
              AlertCheck strictly avoids ever describing a message as "guaranteed safe", "correct", or "certified". In emergency communications, the absence of an identifiable textual conflict does not prove that a message is free of cultural ambiguity, nuanced grammatical shifts, or tone issues. Automated tools are verification aids for human communicators, not replacements.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <h4 className="font-semibold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-400" />
              2. Linguistic Nuance & Machine Translation Limitations
            </h4>
            <p>
              Arbitrary human natural language cannot be certified as semantically identical through string matching. When warnings are translated into languages like Hindi, linguistic markers and word orders change fundamentally. AlertCheck marks non-English translation samples with an explicit <code>needs_review</code> status, requiring human sign-off from a qualified native speaker before publication.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <h4 className="font-semibold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              3. Channel Constraints vs Information Preservation
            </h4>
            <p>
              A common operational failure occurs when message authors silently drop life-safety facts (like road closures, telephone numbers, or evacuation zones) to meet tight character limits (e.g. 160 characters for SMS). AlertCheck enforces a strict rule: <em>never silently omit a critical fact to satisfy a character budget</em>. If facts cannot fit, the system flags a length violation so a human editor can use approved short aliases.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <h4 className="font-semibold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              4. Determinism vs Probabilistic AI
            </h4>
            <p>
              Commercial generative AI models are probabilistic, prone to hallucinations, require external API keys, depend on continuous cloud access, and can arbitrarily change outputs between runs. AlertCheck uses deterministic, unit-tested rule engines that run identically on a Cloudflare Worker edge or inside an offline browser during a grid disruption.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
