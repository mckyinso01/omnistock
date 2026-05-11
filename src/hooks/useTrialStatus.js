import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useTrialStatus() {
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);

      // Apply pending referral code if any (from URL ?ref= before login)
      const pendingRef = sessionStorage.getItem('pending_referral');
      if (pendingRef) {
        await base44.functions.invoke('trialManager', { action: 'save_referred_by', referral_code: pendingRef });
        sessionStorage.removeItem('pending_referral');
      }

      // Initialize trial (7-day basic for new users, no-op for existing)
      await base44.functions.invoke('trialManager', { action: 'initialize_trial' });

      // Check status and resume paused plan if needed
      const statusRes = await base44.functions.invoke('trialManager', { action: 'check_and_resume' });
      setTrialData(statusRes.data);
    } catch (e) {
      console.error('Trial status error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getDaysRemaining = () => {
    if (!trialData?.trial_end_date) return 0;
    const now = new Date();
    const end = new Date(trialData.trial_end_date);
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  const isPro = () => trialData?.plan === 'pro_trial' || trialData?.plan === 'pro';
  const isBasic = () => trialData?.plan === 'basic_trial' || trialData?.plan === 'basic';
  const isFree = () => !trialData?.plan || trialData?.plan === 'free';

  const getReferralLink = () => {
    if (!trialData?.referral_code) return null;
    return `${window.location.origin}?ref=${trialData.referral_code}`;
  };

  return {
    trialData,
    loading,
    user,
    refresh,
    getDaysRemaining,
    isPro,
    isBasic,
    isFree,
    getReferralLink,
  };
}