import { useState, useCallback } from 'react';
import { VerifyRequest, VerificationReport } from '@alertcheck/verification-core';
import { executeVerification } from '../services/verificationService';

export function useVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [engineMode, setEngineMode] = useState<'cloudflare_worker' | 'browser_local'>('cloudflare_worker');
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const verify = useCallback(async (request: VerifyRequest): Promise<VerificationReport> => {
    setIsVerifying(true);
    setFallbackNotice(null);
    try {
      const result = await executeVerification(request);
      setReport(result.report);
      setEngineMode(result.mode);
      if (result.fallbackReason) {
        setFallbackNotice(result.fallbackReason);
      }
      return result.report;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    isVerifying,
    report,
    engineMode,
    fallbackNotice,
    verify,
    setReport,
  };
}
