import React from 'react';
import { Link } from 'react-router-dom';
import { usePlanGate } from '../../hooks/usePlanGate.js';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';

/**
 * PlanGateLock
 * Wraps features or views that require a specific commercial SaaS subscription tier.
 * If the current clinic's plan does not include the feature, renders an elegant upgrade gatekeeper.
 */
export default function PlanGateLock({
  featureKey,
  featureName = 'Enterprise Feature',
  description = 'This clinical module is part of higher SaaS subscription tiers.',
  benefits = [],
  children,
}) {
  const { canAccess, getRequiredTier, plan, upgradePlan } = usePlanGate();
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState(null);

  if (canAccess(featureKey)) {
    return <>{children}</>;
  }

  const requiredTierId = getRequiredTier(featureKey);
  const requiredPlan = SUBSCRIPTION_PLANS[requiredTierId] || SUBSCRIPTION_PLANS.enterprise;

  const handleInstantLiveUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      upgradePlan(requiredTierId, 'monthly', 'JazzCash Business (Instant 1-Click)');
      setIsUpgrading(false);
      setToastMsg(`🎉 Successfully upgraded to ${requiredPlan.name}! Feature unlocked live.`);
      setTimeout(() => setToastMsg(null), 4000);
    }, 700);
  };

  return (
    <div
      style={{
        padding: '36px 20px',
        maxWidth: 720,
        margin: '30px auto',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
        borderRadius: 24,
        border: '1px solid rgba(147, 51, 234, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#10b981',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          {toastMsg}
        </div>
      )}

      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid rgba(147, 51, 234, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 28,
        }}
      >
        🔒
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(147, 51, 234, 0.15)', border: '1px solid rgba(147, 51, 234, 0.4)', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Requires {requiredPlan.name}
        </span>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px', color: '#ffffff', letterSpacing: '-0.02em' }}>
        Unlock {featureName}
      </h2>

      <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 auto 24px', maxWidth: 520, lineHeight: 1.5 }}>
        {description} Your clinic is currently enrolled in <strong>{plan.name}</strong>.
      </p>

      {benefits && benefits.length > 0 && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            padding: '16px 20px',
            maxWidth: 480,
            margin: '0 auto 28px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            What you will unlock:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0' }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleInstantLiveUpgrade}
          disabled={isUpgrading}
          className="btn btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: 14.5,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚡</span>
          <span>{isUpgrading ? 'Activating Live...' : `Instant 1-Click Unlock (${requiredPlan.name})`}</span>
        </button>

        <Link
          to="/subscription"
          className="btn btn-secondary"
          style={{
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>💳</span>
          <span>View All Plans & Pakistani Gateways</span>
        </Link>
      </div>
    </div>
  );
}
