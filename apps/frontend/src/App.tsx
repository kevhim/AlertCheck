import React, { useState, useEffect } from 'react';
import {
  MasterWarning,
  WarningFormat,
  WarningLanguage,
} from '@alertcheck/verification-core';
import { Header, ActiveTab } from './components/layout/Header';
import { Banner } from './components/layout/Banner';
import { Footer } from './components/layout/Footer';
import { ProjectOverview } from './features/warnings/components/ProjectOverview';
import { MasterWarningForm } from './features/warnings/components/MasterWarningForm';
import { VariantGenerator } from './features/verification/components/VariantGenerator';
import { VerificationReportView } from './features/verification/components/VerificationReportView';
import { ScenariosLimitationsView } from './features/verification/components/ScenariosLimitationsView';
import { FICTIONAL_PRESETS } from './features/warnings/data/fictionalPresets';
import { useVerification } from './features/verification/hooks/useVerification';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [masterWarning, setMasterWarning] = useState<MasterWarning>(FICTIONAL_PRESETS[0].warning);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const {
    isVerifying,
    report,
    engineMode,
    fallbackNotice,
    verify,
  } = useVerification();

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleVerifyCandidate = async (
    candidateText: string,
    format: WarningFormat,
    language: WarningLanguage
  ) => {
    await verify({
      masterWarning,
      candidateText,
      format,
      language,
    });
    setActiveTab('results');
  };

  const handleLoadScenario = async (
    candidateText: string,
    format: WarningFormat,
    language: WarningLanguage
  ) => {
    // When scenario loads, verify against current master warning (or flood default)
    await verify({
      masterWarning,
      candidateText,
      format,
      language,
    });
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Banner />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOnline={isOnline}
        engineMode={engineMode}
        findingsCount={report ? report.summary.totalFindings : 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ProjectOverview
            onStartWorkflow={() => setActiveTab('editor')}
            onExploreScenarios={() => setActiveTab('scenarios')}
          />
        )}

        {activeTab === 'editor' && (
          <MasterWarningForm
            warning={masterWarning}
            onChange={setMasterWarning}
            onProceed={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'generator' && (
          <VariantGenerator
            warning={masterWarning}
            onVerify={handleVerifyCandidate}
            isVerifying={isVerifying}
          />
        )}

        {activeTab === 'results' && (
          <VerificationReportView
            report={report}
            fallbackNotice={fallbackNotice}
            onEditCandidate={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenariosLimitationsView onLoadScenario={handleLoadScenario} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
