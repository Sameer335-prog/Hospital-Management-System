import { useSubscription, SUBSCRIPTION_PLANS } from '../utils/subscriptionConfig.js';

/**
 * usePlanGate.js
 * Feature gating & entitlement hook.
 * Checks whether the current clinic subscription permits access to specific capabilities
 * (e.g. Lobby TV, AI Voice Assistant, Inpatient Wards, Lab Diagnostics, Cloud SMS).
 */

const FEATURE_ENTITLEMENTS = {
  lobby_tv: ['growth', 'hospital', 'enterprise'],
  cloud_sms: ['growth', 'hospital', 'enterprise'],
  lab_module: ['growth', 'hospital', 'enterprise'],
  pharmacy: ['growth', 'hospital', 'enterprise'],
  multi_doctor: ['growth', 'hospital', 'enterprise'],
  doctor_splits: ['growth', 'hospital', 'enterprise'],
  wards_admissions: ['hospital', 'enterprise'],
  acute_triage: ['hospital', 'enterprise'],
  discharge_summaries: ['hospital', 'enterprise'],
  ai_copilot: ['enterprise'],
};

export function usePlanGate() {
  const { subscription, plan, isTrial, daysLeftInTrial, isExpired, upgradePlan } = useSubscription();

  /**
   * Checks if current plan allows a given feature key
   */
  const canAccess = (featureKey) => {
    if (isExpired) return false;
    const allowedTiers = FEATURE_ENTITLEMENTS[featureKey];
    if (!allowedTiers) return true; // unrestricted by default
    return allowedTiers.includes(subscription.planId);
  };

  /**
   * Returns minimum tier required for a feature
   */
  const getRequiredTier = (featureKey) => {
    const allowedTiers = FEATURE_ENTITLEMENTS[featureKey];
    if (!allowedTiers) return 'starter';
    if (allowedTiers.includes('growth')) return 'growth';
    if (allowedTiers.includes('hospital')) return 'hospital';
    return 'enterprise';
  };

  return {
    subscription,
    plan,
    isTrial,
    daysLeftInTrial,
    isExpired,
    canAccess,
    getRequiredTier,
    upgradePlan,
    getRequiredPlanName: (featureKey) => {
      const tierId = getRequiredTier(featureKey);
      return SUBSCRIPTION_PLANS[tierId]?.name || 'Growth Tier';
    },
  };
}
