import { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Icon from '../../components/ui/Icon.jsx';
import QrCode from '../../components/ui/QrCode.jsx';
import { SUBSCRIPTION_PLANS, useSubscription } from '../../utils/subscriptionConfig.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';

export default function SubscriptionPage() {
  const { subscription, plan, isTrial, daysLeftInTrial, isExpired, upgradePlan } = useSubscription();
  const clinic = useClinicProfile();

  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle || 'monthly');
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('jazzcash'); // 'jazzcash' | 'easypaisa' | 'raast' | 'card'
  const [jazzCashTid, setJazzCashTid] = useState('JC-981240');
  const [easyPaisaTid, setEasyPaisaTid] = useState('EP-449182');
  const [raastRef, setRaastRef] = useState('RST-773192');
  const [successToast, setSuccessToast] = useState(null);

  const isAnnual = billingCycle === 'annual';
  const selectedPlanObj = selectedPlanForUpgrade ? SUBSCRIPTION_PLANS[selectedPlanForUpgrade] : null;

  const handleOpenUpgradeModal = (planKey) => {
    setSelectedPlanForUpgrade(planKey);
  };

  const handleConfirmUpgrade = (e) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    let methodLabel = 'JazzCash Business (Till: 00291482)';
    if (paymentMethod === 'jazzcash') methodLabel = `JazzCash Business (TID: ${jazzCashTid || 'JC-981240'})`;
    else if (paymentMethod === 'easypaisa') methodLabel = `EasyPaisa Merchant (TID: ${easyPaisaTid || 'EP-449182'})`;
    else if (paymentMethod === 'raast') methodLabel = `Raast Instant Pay · Meezan Bank (Ref: ${raastRef || 'RST-773192'})`;
    else if (paymentMethod === 'card') methodLabel = 'Debit / Credit Card (PayPak / Visa)';

    setIsProcessingPayment(true);
    setTimeout(() => {
      upgradePlan(selectedPlanForUpgrade, billingCycle, methodLabel);
      setIsProcessingPayment(false);
      const targetPlan = SUBSCRIPTION_PLANS[selectedPlanForUpgrade];
      setSelectedPlanForUpgrade(null);
      setSuccessToast(`🎉 Successfully upgraded to ${targetPlan.name}! Paid via ${methodLabel}.`);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1200);
  };

  return (
    <AppShell>
      {/* Toast Alert */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(16, 185, 129, 0.4)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>Clinic Subscription & Multi-Tenant Billing</h1>
            <span
              className={`badge ${isExpired ? 'badge-error' : isTrial ? 'badge-warning' : 'badge-success'}`}
              style={{ fontWeight: 800 }}
            >
              {isExpired ? 'Trial Expired' : isTrial ? `Trial (${daysLeftInTrial} Days Remaining)` : 'Active Plan'}
            </span>
          </div>
          <div className="sub">
            {clinic.name} · Multi-tenant billing, plan tiers, doctor seat allocations, and invoices
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="/super-admin"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>👑</span>
            <span>Super-Admin SaaS Portal</span>
          </a>
        </div>
      </div>

      {/* Active Subscription Overview Card */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 26,
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--c-text-primary)' }}>
                {plan.name}
              </h2>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>
                {plan.badge}
              </span>
            </div>
            <p className="hint" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
              {plan.tagline}
            </p>
          </div>
        </div>

        {/* Status Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Billing
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>
              Rs. {plan.priceMonthlyPKR.toLocaleString()} / mo
            </div>
          </div>

          <div>
            <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Renewal Date
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {new Date(subscription.renewalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div>
            <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Payment Method
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text-muted)' }}>
              {subscription.paymentMethod || 'Direct Billing'}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Telemetry & Seats Allocation */}
      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        <div className="card card-pad" style={{ borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Doctor Specialist Seats</span>
            <span className="badge badge-info" style={{ fontSize: 11 }}>
              {plan.limits.doctors === Infinity ? 'Unlimited' : `Max ${plan.limits.doctors}`}
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            2 <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-muted)' }}>/ {plan.limits.doctors === Infinity ? '∞' : plan.limits.doctors} seats</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${plan.limits.doctors === Infinity ? 20 : (2 / plan.limits.doctors) * 100}%`, height: '100%', background: '#38bdf8' }} />
          </div>
          <div className="hint" style={{ fontSize: 11.5, marginTop: 8 }}>
            {plan.limits.doctors === Infinity ? 'Unlimited consulting specialists enabled.' : `${plan.limits.doctors - 2} specialist slots available.`}
          </div>
        </div>

        <div className="card card-pad" style={{ borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Monthly Appointment Tokens</span>
            <span className="badge badge-success" style={{ fontSize: 11 }}>Active</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            142 <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-muted)' }}>/ {plan.limits.appointmentsPerMonth === Infinity ? 'Unlimited' : plan.limits.appointmentsPerMonth}</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '18%', height: '100%', background: '#10b981' }} />
          </div>
          <div className="hint" style={{ fontSize: 11.5, marginTop: 8 }}>
            142 tokens generated this cycle via walk-in & phone bookings.
          </div>
        </div>

        <div className="card card-pad" style={{ borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Cloud SMS & WhatsApp Dispatches</span>
            <span className="badge badge-warning" style={{ fontSize: 11 }}>
              {plan.limits.smsCreditsPerMonth === 0 ? 'Manual WA' : `${plan.limits.smsCreditsPerMonth} Credits`}
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            88 <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-muted)' }}>/ {plan.limits.smsCreditsPerMonth || 'Manual Only'}</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${plan.limits.smsCreditsPerMonth ? (88 / plan.limits.smsCreditsPerMonth) * 100 : 0}%`, height: '100%', background: '#f59e0b' }} />
          </div>
          <div className="hint" style={{ fontSize: 11.5, marginTop: 8 }}>
            Auto 2-hour reminders sent to confirmed patients.
          </div>
        </div>
      </div>

      {/* Plan Tiers Selection & Toggle */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          Upgrade or Switch Your Clinic Subscription
        </h3>
        <p className="hint" style={{ fontSize: 14, maxWidth: 600, margin: '0 auto 20px auto' }}>
          Choose a tier that fits your practice scale. Upgrade anytime with instant automated activation.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 999,
            padding: 4,
            gap: 4,
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setBillingCycle('monthly')}
            style={{
              background: !isAnnual ? 'var(--c-primary)' : 'transparent',
              color: !isAnnual ? '#ffffff' : 'var(--c-text-muted)',
              border: 'none',
              borderRadius: 999,
              padding: '6px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setBillingCycle('annual')}
            style={{
              background: isAnnual ? 'var(--c-primary)' : 'transparent',
              color: isAnnual ? '#ffffff' : 'var(--c-text-muted)',
              border: 'none',
              borderRadius: 999,
              padding: '6px 16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Annual Billing</span>
            <span
              style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 999,
              }}
            >
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* 4 Pakistani Market Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 36 }}>
        {Object.keys(SUBSCRIPTION_PLANS).map((planKey) => {
          const item = SUBSCRIPTION_PLANS[planKey];
          const isCurrent = subscription.planId === planKey;
          const price = isAnnual ? item.priceAnnualPKR : item.priceMonthlyPKR;
          const monthlyEquivalent = isAnnual ? Math.round(item.priceAnnualPKR / 12) : item.priceMonthlyPKR;

          return (
            <div
              key={planKey}
              className="card"
              style={{
                borderRadius: 20,
                border: isCurrent
                  ? '2px solid #0284c7'
                  : item.recommended
                  ? '2px solid rgba(16, 185, 129, 0.5)'
                  : '1px solid var(--c-border)',
                background: isCurrent
                  ? 'linear-gradient(180deg, rgba(2, 132, 199, 0.06) 0%, var(--c-surface) 100%)'
                  : 'var(--c-surface)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: item.recommended ? '0 12px 36px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {item.recommended && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  Most Popular
                </div>
              )}

              <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)', paddingBottom: 22 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.badge}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, color: 'var(--c-text-primary)' }}>
                  {item.name}
                </div>
                <p className="hint" style={{ fontSize: 12.5, marginTop: 6, minHeight: 36 }}>
                  {item.tagline}
                </p>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--c-text-primary)' }}>
                      Rs. {monthlyEquivalent.toLocaleString()}
                    </span>
                    <span className="hint" style={{ fontSize: 13 }}>/ month</span>
                  </div>
                  {isAnnual && (
                    <div style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                      Billed annually (Rs. {price.toLocaleString()} / year)
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 20 }}>
                  {isCurrent ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled
                      style={{ width: '100%', opacity: 0.85, fontWeight: 700 }}
                    >
                      ✓ Current Active Plan
                    </button>
                  ) : (
                    <button
                      className={`btn ${item.recommended ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ width: '100%', fontWeight: 700 }}
                      onClick={() => handleOpenUpgradeModal(planKey)}
                    >
                      Select {item.name} →
                    </button>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="card-pad" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--c-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                  Included Capabilities:
                </div>
                {item.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: f.included ? '#10b981' : '#64748b', fontSize: 15, fontWeight: 900 }}>
                      {f.included ? '✓' : '—'}
                    </span>
                    <span style={{ color: f.included ? 'var(--c-text-primary)' : 'var(--c-text-muted)', opacity: f.included ? 1 : 0.6 }}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices & Billing History */}
      <div className="card" style={{ borderRadius: 18, marginBottom: 40 }}>
        <div
          className="card-pad"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Billing & Subscription Receipts</h3>
            <p className="hint" style={{ margin: '2px 0 0 0', fontSize: 12.5 }}>
              Official payment records, tax invoices, and automated renewal receipts
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
            <Icon name="reports" /> Print Statement
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {(subscription.invoices || []).map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5 }}>{inv.id}</td>
                  <td>{inv.date}</td>
                  <td style={{ fontWeight: 600 }}>{inv.plan}</td>
                  <td className="hint">{inv.method || 'Online Payment'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--c-text-primary)' }}>{inv.amount}</td>
                  <td>
                    <span className="badge badge-success" style={{ fontWeight: 700 }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => alert(`Official Receipt ${inv.id} for ${inv.amount} generated for ${clinic.name}.`)}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade / Checkout Modal */}
      {selectedPlanForUpgrade && (
        <div className="overlay" style={{ zIndex: 110 }}>
          <div className="modal" style={{ maxWidth: 500, borderRadius: 20 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                Upgrade to {SUBSCRIPTION_PLANS[selectedPlanForUpgrade]?.name}
              </h3>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setSelectedPlanForUpgrade(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUpgrade}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                    padding: 14,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>{selectedPlanObj?.name || 'Selected Plan'} ({billingCycle})</span>
                    <span style={{ color: '#0284c7' }}>
                      Rs.{' '}
                      {(isAnnual
                        ? selectedPlanObj?.priceAnnualPKR || 0
                        : selectedPlanObj?.priceMonthlyPKR || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="hint" style={{ fontSize: 12, marginTop: 4 }}>
                    Includes instant unlock of doctor seats, Lobby TV, SMS alerts, and EMR features.
                  </div>
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 800, marginBottom: 8 }}>Select Pakistani Payment Gateway</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentMethod === 'jazzcash' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPaymentMethod('jazzcash')}
                      style={{
                        justifyContent: 'center',
                        fontSize: 11,
                        padding: '6px 4px',
                        background: paymentMethod === 'jazzcash' ? '#b91c1c' : undefined,
                        borderColor: paymentMethod === 'jazzcash' ? '#ef4444' : undefined,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      🔴 JazzCash
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentMethod === 'easypaisa' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPaymentMethod('easypaisa')}
                      style={{
                        justifyContent: 'center',
                        fontSize: 11,
                        padding: '6px 4px',
                        background: paymentMethod === 'easypaisa' ? '#059669' : undefined,
                        borderColor: paymentMethod === 'easypaisa' ? '#10b981' : undefined,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      🟢 EasyPaisa
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentMethod === 'raast' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPaymentMethod('raast')}
                      style={{
                        justifyContent: 'center',
                        fontSize: 11,
                        padding: '6px 4px',
                        background: paymentMethod === 'raast' ? '#0d9488' : undefined,
                        borderColor: paymentMethod === 'raast' ? '#14b8a6' : undefined,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      ⚡ Raast / Bank
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        justifyContent: 'center',
                        fontSize: 11,
                        padding: '6px 4px',
                        fontWeight: 700,
                      }}
                    >
                      💳 Card / PayPak
                    </button>
                  </div>
                </div>

                {/* 1. JAZZCASH */}
                {paymentMethod === 'jazzcash' && (
                  <div style={{ background: 'rgba(185, 28, 28, 0.06)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-flex' }}>
                        <QrCode text={`jazzcash://pay?till=00291482&amount=${isAnnual ? selectedPlanObj?.priceAnnualPKR : selectedPlanObj?.priceMonthlyPKR}&ref=MEDORA`} size={90} />
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 800, color: '#f87171', fontSize: 13.5 }}>JazzCash Business Merchant</div>
                        <div>Till / Merchant ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>00291482</strong></div>
                        <div>Mobile Account: <strong>0300-1234567</strong></div>
                        <div>Account Title: <strong>Medora Health Tech</strong></div>
                        <div className="hint" style={{ fontSize: 11, marginTop: 2 }}>Scan with JazzCash app or dial *786#</div>
                      </div>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700, fontSize: 12 }}>Enter JazzCash Transaction ID (TID) *</label>
                      <input
                        className="input"
                        placeholder="e.g. 0928341920"
                        value={jazzCashTid}
                        onChange={(e) => setJazzCashTid(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 2. EASYPAISA */}
                {paymentMethod === 'easypaisa' && (
                  <div style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-flex' }}>
                        <QrCode text={`easypaisa://pay?acc=03459876543&amount=${isAnnual ? selectedPlanObj?.priceAnnualPKR : selectedPlanObj?.priceMonthlyPKR}&ref=MEDORA`} size={90} />
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 800, color: '#34d399', fontSize: 13.5 }}>EasyPaisa Merchant QR</div>
                        <div>Merchant Account: <strong style={{ fontFamily: 'var(--font-mono)' }}>0345-9876543</strong></div>
                        <div>Account Title: <strong>Medora Health Tech Pvt Ltd</strong></div>
                        <div>City / Routing: <strong>Islamabad Branch</strong></div>
                        <div className="hint" style={{ fontSize: 11, marginTop: 2 }}>Scan QR with EasyPaisa App or dial *786#</div>
                      </div>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700, fontSize: 12 }}>Enter EasyPaisa TID (Transaction ID) *</label>
                      <input
                        className="input"
                        placeholder="e.g. 4819203910"
                        value={easyPaisaTid}
                        onChange={(e) => setEasyPaisaTid(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 3. RAAST INSTANT PAY / IBFT */}
                {paymentMethod === 'raast' && (
                  <div style={{ background: 'rgba(13, 148, 136, 0.06)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-flex' }}>
                        <QrCode text={`PK.RAAST://03001234567/MEDORA?amount=${isAnnual ? selectedPlanObj?.priceAnnualPKR : selectedPlanObj?.priceMonthlyPKR}`} size={90} />
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.45 }}>
                        <div style={{ fontWeight: 800, color: '#2dd4bf', fontSize: 13.5 }}>Raast Instant P2M / Corporate IBFT</div>
                        <div>Raast ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>03001234567</strong> (Zero Fee)</div>
                        <div>Bank Name: <strong>Meezan Bank Limited</strong></div>
                        <div>Account Title: <strong>Medora Health Technologies Pvt Ltd</strong></div>
                        <div>IBAN: <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>PK82MEZN0001040105892188</strong></div>
                      </div>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700, fontSize: 12 }}>Bank Transfer / Raast Reference Number *</label>
                      <input
                        className="input"
                        placeholder="e.g. IBFT-991204 / RST-19283"
                        value={raastRef}
                        onChange={(e) => setRaastRef(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 4. CREDIT / DEBIT / PAYPAK */}
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label className="label">Card Number (Visa / Mastercard / PayPak)</label>
                      <input className="input" placeholder="•••• •••• •••• 4082" defaultValue="4242 •••• •••• 4082" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Expiry</label>
                        <input className="input" placeholder="MM/YY" defaultValue="12/28" required />
                      </div>
                      <div>
                        <label className="label">CVC</label>
                        <input className="input" placeholder="CVC" defaultValue="912" required />
                      </div>
                    </div>
                    <div className="hint" style={{ fontSize: 11 }}>
                      🔒 Powered by PayFast & 1Link 3D-Secure 2.0. Domestic Pakistani cards supported.
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedPlanForUpgrade(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing Payment...' : 'Confirm & Activate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
