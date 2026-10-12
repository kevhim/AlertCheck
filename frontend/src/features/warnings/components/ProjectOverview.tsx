import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ShieldAlert,
  Cpu,
  Layers,
  FileCheck,
  ArrowRight,
  WifiOff,
  Flame,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ProjectOverviewProps {
  onStartWorkflow: () => void;
  onExploreScenarios: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  onStartWorkflow,
  onExploreScenarios,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl">
          <Badge variant="warning" className="mb-3">
            Hackathon Edition — Offline & Free-Tier Capable
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Critical Information Integrity Verifier for Emergency Warnings
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            During disasters, emergency warnings are hurriedly adapted for SMS, radio broadcasts, social media, and multiple languages. Critical facts — like evacuation deadlines, sector numbers, and road restrictions — can be accidentally dropped, mistranslated, or fatally reversed.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            <strong>AlertCheck</strong> provides deterministic, rule-based verification against a structured master source of truth without relying on external AI services, databases, or paid servers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onStartWorkflow}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Start Master Warning Verification
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onExploreScenarios}
              icon={<Layers className="w-4 h-4" />}
            >
              Explore Test Scenarios
            </Button>
          </div>
        </div>
      </div>

      {/* Core Architectural Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Deterministic Engine</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                No probabilistic hallucinations or AI API keys. Verification is 100% reproducible, fast, and testable against unit-tested ground truth.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Edge & Offline Resilient</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Shared validation core runs seamlessly on Cloudflare Workers or in the browser local fallback during grid infrastructure failures.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Life-Safety Guardrails</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Specialized detectors for reversed prohibitions (omitted "Do Not"), altered deadlines, changed emergency helplines, and SMS length overflow.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4-Step Verification Workflow */}
      <Card
        title="Emergency Communications Verification Workflow"
        subtitle="Designed for public information officers, emergency services, and translation bureaus"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">STEP 1</span>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">Author Master Warning</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Define the structured ground truth: hazard type, affected areas, timestamps, evacuation deadlines, actions, and restrictions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">STEP 2</span>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">Generate Variants</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Render channel-specific texts (Full advisory, 160-char SMS, Social Media) in English or reviewed Hindi demonstration format.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">STEP 3</span>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">Run Integrity Check</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automated deterministic audit verifies that critical facts are present, numbers match, deadlines are unaltered, and prohibitions are intact.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">STEP 4</span>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">Human Review & Broadcast</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Qualified communicators inspect findings, resolve flagged items, download the audit report, and authorize dissemination.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
