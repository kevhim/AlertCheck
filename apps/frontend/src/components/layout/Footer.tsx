import React from 'react';
import { Shield, HardDrive, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Shield className="w-4 h-4 text-orange-400" />
              AlertCheck Architecture
            </div>
            <p className="text-slate-400 leading-relaxed">
              Deterministic, rule-based emergency warning integrity checker. Engineered for resilience during communications outages and edge deployments.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Zero-Cloud & Zero-AI Guarantee
            </div>
            <p className="text-slate-400 leading-relaxed">
              Functions entirely without third-party LLM API keys, external database dependencies, or continuous internet access after initial asset loading.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Privacy & Safeguards
            </div>
            <p className="text-slate-400 leading-relaxed">
              Ephemeral verification: Submitted warning texts are never logged or stored. Fictional sample scenarios are used throughout all demonstrations.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} AlertCheck — Open Source Emergency Communications Verification Project.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Free-Tier Architecture</span>
            <span>•</span>
            <span>Cloudflare Pages + Workers</span>
            <span>•</span>
            <span>Apache-2.0 License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
