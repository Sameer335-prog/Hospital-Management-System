import { useSubscription, SUBSCRIPTION_PLANS } from '../utils/subscriptionConfig.js';

/**
 * usePlanGate.js
 * Feature gating & entitlement hook.
 * Checks whether the current clinic subscription permits access to specific capabilities
 * (e.g. Lobby TV, AI Voice Assistant, Inpatient Wards, Lab Diagnostics, Cloud SMS).
 */

const FEATURE_ENTITLEMENTS = {
  lobby_tv: ['growth', 'enterprise'],
  cloud_sms: ['growth', 'enterprise'],
  lab_module: ['growth', 'enterprise'],
  pharmacy: ['growth', 'enterprise'],
  ai_copilot: ['enterprise'],
  wards_admissions: ['enterprise'],
  acute_triage: ['enterprise'],
  multi_doctor: ['growth', 'enterprise'],
};

export function usePlanGate() {
  const { subscription, plan, isTrial, daysLeftInTrial, isExpired } = useSubscription();

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
    getRequiredPlanName: (featureKey) => {
      const tierId = getRequiredTier(featureKey);
      return SUBSCRIPTION_PLANS[tierId]?.name || 'Growth Tier';
    },
  };
}
