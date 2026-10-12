import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-600/30 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">VERIFICATION AID DISCLAIMER:</span> AlertCheck is an automated integrity checking tool and{' '}
          <strong className="text-white">NOT</strong> an official emergency dispatch system or public alerting authority. Automated checks cannot guarantee message safety. All alerts must undergo qualified human review prior to publication. Fictional sample data is used for all demonstrations.
        </div>
      </div>
    </div>
  );
};
