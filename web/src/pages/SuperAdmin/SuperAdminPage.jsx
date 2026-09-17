import { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { getTenantClinics, saveTenantClinics, SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState(() => getTenantClinics());
  const [activeTab, setActiveTab] = useState('clinics'); // 'clinics' | 'subscriptions'
  const [search, setSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectClinic, setInspectClinic] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [newClinicForm, setNewClinicForm] = useState({
    name: '',
    city: 'Islamabad',
    doctorInCharge: '',
    phone: '',
    plan: 'starter',
    practiceType: 'Polyclinic / General OPD',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Telemetry aggregates
  const totalClinics = tenants.length;
  const activeCount = tenants.filter((t) => t.status === 'active').length;
  const trialingCount = tenants.filter((t) => t.status === 'trialing').length;
  const suspendedCount = tenants.filter((t) => t.status === 'suspended').length;
  const totalMrrPKR = tenants
    .filter((t) => t.status === 'active' || t.status === 'trialing')
    .reduce((sum, t) => sum + (t.mrrPKR || 0), 0);
  const totalArrPKR = totalMrrPKR * 12;

  // Plan distribution
  const starterCount = tenants.filter((t) => t.plan === 'starter').length;
  const growthCount = tenants.filter((t) => t.plan === 'growth').length;
  const enterpriseCount = tenants.filter((t) => t.plan === 'enterprise').length;

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.doctorInCharge.toLowerCase().includes(search.toLowerCase());
    const matchPlan = selectedPlanFilter === 'all' || t.plan === selectedPlanFilter;
    const matchStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  // Action: Change Plan Tier
  const handleChangePlan = (tenantId, newPlan) => {
    const planDetails = SUBSCRIPTION_PLANS[newPlan];
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          plan: newPlan,
          mrrPKR: planDetails.priceMonthlyPKR,
        };
      }
      return t;
    });
    setTenants(updated);
    saveTenantClinics(updated);
    showToast(`Updated subscription plan to ${planDetails.name} (Rs. ${planDetails.priceMonthlyPKR.toLocaleString()}/mo)`);
  };

  // Action: Extend Trial (+14 Days)
  const handleExtendTrial = (tenantId) => {
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        const currentExp = new Date(t.expiresAt);
        const newExp = new Date(currentExp.getTime() + 14 * 24 * 60 * 60 * 1000);
        return {
          ...t,
          expiresAt: newExp.toISOString().split('T')[0],
          status: 'trialing',
        };
      }
      return t;
    });
    setTenants(updated);
    saveTenantClinics(updated);
    showToast('Extended clinic subscription trial by +14 days.');
  };

  // Action: Toggle Status (Active <-> Suspended)
  const handleToggleStatus = (tenantId) => {
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'suspended' ? 'active' : 'suspended';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTenants(updated);
    saveTenantClinics(updated);
    showToast('Clinic status updated.');
  };

  // Submit New Clinic Onboarding
  const handleCreateClinic = (e) => {
    e.preventDefault();
    if (!newClinicForm.name.trim() || !newClinicForm.doctorInCharge.trim()) return;

    const planDetails = SUBSCRIPTION_PLANS[newClinicForm.plan];
    const newEntry = {
      id: `tenant-${Date.now().toString().slice(-4)}`,
      name: newClinicForm.name.trim(),
      slug: newClinicForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      city: newClinicForm.city,
      doctorInCharge: newClinicForm.doctorInCharge.trim(),
      phone: newClinicForm.phone.trim() || '0300-1122334',
      practiceType: newClinicForm.practiceType,
      plan: newClinicForm.plan,
      status: 'trialing',
      joinedDate: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeDoctors: 1,
      monthlyTokens: 0,
      mrrPKR: planDetails.priceMonthlyPKR,
    };

    const updated = [newEntry, ...tenants];
    setTenants(updated);
    saveTenantClinics(updated);
    setShowAddModal(false);
    setNewClinicForm({
      name: '',
      city: 'Islamabad',
      doctorInCharge: '',
      phone: '',
      plan: 'starter',
      practiceType: 'Polyclinic / General OPD',
    });
    showToast(`✨ Successfully registered ${newEntry.name} with 14-day trial.`);
  };

  return (
    <AppShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(2, 132, 199, 0.4)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>Registered Clinics & Subscriptions</h1>
            <span className="badge badge-purple" style={{ fontWeight: 800 }}>
              Super Admin Console
            </span>
          </div>
          <div className="sub">
            Strict platform owner view: manage registered tenant clinics, multi-tenant subscriptions, and recurring MRR
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Icon name="plus" /> Register New Clinic
          </button>
        </div>
      </div>

      {/* Main Tabs: Registered Clinics vs Subscriptions */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('clinics')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clinics' ? '3px solid var(--c-primary)' : '3px solid transparent',
            padding: '10px 18px',
            fontWeight: activeTab === 'clinics' ? 800 : 600,
            fontSize: 14.5,
            color: activeTab === 'clinics' ? 'var(--c-primary)' : 'var(--c-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          <span>🏢</span>
          <span>Registered Clinics</span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 10,
              background: activeTab === 'clinics' ? 'rgba(37,99,235,0.15)' : 'var(--c-surface-hover)',
              fontWeight: 700,
            }}
          >
            {totalClinics}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscriptions' ? '3px solid var(--c-primary)' : '3px solid transparent',
            padding: '10px 18px',
            fontWeight: activeTab === 'subscriptions' ? 800 : 600,
            fontSize: 14.5,
            color: activeTab === 'subscriptions' ? 'var(--c-primary)' : 'var(--c-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          <span>💳</span>
          <span>Subscriptions & MRR</span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 10,
              background: activeTab === 'subscriptions' ? 'rgba(16,185,129,0.15)' : 'var(--c-surface-hover)',
              color: activeTab === 'subscriptions' ? '#10b981' : 'inherit',
              fontWeight: 700,
            }}
          >
            Rs. {totalMrrPKR.toLocaleString()}
          </span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: REGISTERED CLINICS DIRECTORY
          ========================================================= */}
      {activeTab === 'clinics' && (
        <>
          {/* High-Level Clinic Directory Metrics */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <StatCard
              label="Total Registered Clinics"
              value={totalClinics}
              iconName="patients"
              trend="All registered multi-tenants"
            />
            <StatCard
              label="Active Paid Tenants"
              value={activeCount}
              color="var(--c-success)"
              iconName="check"
              trend="Subscription in good standing"
            />
            <StatCard
              label="14-Day Free Trials"
              value={trialingCount}
              color="var(--c-warning)"
              iconName="alert"
              trend="Active onboarding trials"
            />
            <StatCard
              label="Suspended Accounts"
              value={suspendedCount}
              color="var(--c-error)"
              iconName="alert"
              trend="Requires renewal"
            />
          </div>

          {/* Clinics Directory Card */}
          <div className="card" style={{ borderRadius: 18, marginBottom: 30 }}>
            {/* Filters Bar */}
            <div
              className="card-pad"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Tenant Clinics Directory</h3>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  {filteredTenants.length} Clinics
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="search"
                  className="input input-sm"
                  placeholder="Search clinic, doctor, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 220 }}
                />

                <select
                  className="select select-sm"
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                >
                  <option value="all">All Plan Tiers</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <select
                  className="select select-sm"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Clinics Table */}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clinic Name & City</th>
                    <th>Doctor in Charge</th>
                    <th>Plan Tier</th>
                    <th>Status</th>
                    <th>Onboarded Date</th>
                    <th>Valid Until</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)' }}>
                        No registered clinics found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <tr key={tenant.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--c-text-primary)' }}>{tenant.name}</div>
                          <div className="hint" style={{ fontSize: 11.5 }}>
                            {tenant.city} · {tenant.phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{tenant.doctorInCharge}</div>
                          <div className="hint" style={{ fontSize: 11.5 }}>
                            {tenant.activeDoctors} Doctor Specialist(s)
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              tenant.plan === 'enterprise'
                                ? 'badge-purple'
                                : tenant.plan === 'growth'
                                ? 'badge-info'
                                : 'badge-secondary'
                            }`}
                            style={{ fontWeight: 700, textTransform: 'capitalize' }}
                          >
                            {tenant.plan}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              tenant.status === 'active'
                                ? 'badge-success'
                                : tenant.status === 'trialing'
                                ? 'badge-warning'
                                : 'badge-error'
                            }`}
                            style={{ fontWeight: 700, textTransform: 'capitalize' }}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                          {tenant.joinedDate || '2026-08-01'}
                        </td>
                        <td style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
                          {tenant.expiresAt}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {/* Extend Trial */}
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleExtendTrial(tenant.id)}
                              title="Add 14 Days Free Extension"
                            >
                              +14d
                            </button>

                            {/* Suspend / Activate */}
                            <button
                              className="btn btn-ghost btn-xs"
                              style={{
                                color: tenant.status === 'suspended' ? 'var(--c-success)' : 'var(--c-error)',
                              }}
                              onClick={() => handleToggleStatus(tenant.id)}
                              title={tenant.status === 'suspended' ? 'Activate Clinic' : 'Freeze / Suspend'}
                            >
                              {tenant.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>

                            {/* Inspect Clinic Details */}
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => setInspectClinic(tenant)}
                              title="Inspect clinic profile and subscription metrics"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          TAB 2: CLINIC SUBSCRIPTIONS & REVENUE BREAKDOWN
          ========================================================= */}
      {activeTab === 'subscriptions' && (
        <>
          {/* High-Level Subscription Financials */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <StatCard
              label="Monthly Recurring Revenue (MRR)"
              value={`Rs. ${totalMrrPKR.toLocaleString()}`}
              color="var(--c-success)"
              iconName="billing"
              trend="Net monthly software billing"
            />
            <StatCard
              label="Annual Run Rate (ARR)"
              value={`Rs. ${totalArrPKR.toLocaleString()}`}
              color="var(--c-primary)"
              iconName="reports"
              trend="Projected 12-month revenue"
            />
            <StatCard
              label="Starter Plan Subscriptions"
              value={`${starterCount} Clinics`}
              iconName="patients"
              trend="Rs. 5,000 / clinic / mo"
            />
            <StatCard
              label="Growth & Enterprise Tiers"
              value={`${growthCount + enterpriseCount} Clinics`}
              color="var(--c-purple)"
              iconName="check"
              trend="High-volume polyclinics"
            />
          </div>

          {/* Plan Tier Matrix Breakdown */}
          <div className="grid grid-3" style={{ marginBottom: 24 }}>
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const countInTier = tenants.filter((t) => t.plan === key).length;
              const mrrInTier = countInTier * plan.priceMonthlyPKR;

              return (
                <div
                  key={key}
                  className="card card-pad"
                  style={{
                    borderRadius: 16,
                    border: key === 'enterprise' ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid var(--c-border)',
                    background: key === 'enterprise' ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.06) 0%, var(--c-surface) 100%)' : 'var(--c-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{plan.name}</h4>
                    <span className="badge badge-secondary" style={{ fontWeight: 700 }}>
                      {countInTier} Clinics
                    </span>
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-primary)', marginBottom: 4 }}>
                    Rs. {plan.priceMonthlyPKR.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text-muted)' }}>/ month</span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 12 }}>
                    Total MRR contribution: <strong style={{ color: 'var(--c-text)' }}>Rs. {mrrInTier.toLocaleString()}</strong>
                  </div>

                  <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                    <div>👨‍⚕️ Max Doctors: <strong>{plan.maxDoctors}</strong></div>
                    <div>🎫 Monthly Tokens: <strong>{plan.monthlyTokens.toLocaleString()}</strong></div>
                    <div>💬 SMS Alerts: <strong>{plan.features.smsAlerts ? 'Included' : 'Standard'}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subscriptions Table */}
          <div className="card" style={{ borderRadius: 18, marginBottom: 30 }}>
            <div
              className="card-pad"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Clinic Subscriptions & Billing Status</h3>
                <div className="hint" style={{ fontSize: 12, marginTop: 2 }}>
                  Directly manage plan tiers, monthly MRR billing, and trial durations per clinic
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select
                  className="select select-sm"
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Registered Clinic</th>
                    <th>Current Plan Tier</th>
                    <th>Monthly Fee (MRR)</th>
                    <th>Seat Capacity</th>
                    <th>Subscription Status</th>
                    <th>Valid Until</th>
                    <th style={{ textAlign: 'right' }}>Plan Modification</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{tenant.name}</div>
                        <div className="hint" style={{ fontSize: 11.5 }}>
                          In Charge: {tenant.doctorInCharge} ({tenant.city})
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tenant.plan === 'enterprise'
                              ? 'badge-purple'
                              : tenant.plan === 'growth'
                              ? 'badge-info'
                              : 'badge-secondary'
                          }`}
                          style={{ fontWeight: 700, textTransform: 'capitalize' }}
                        >
                          {tenant.plan}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#10b981' }}>
                        Rs. {tenant.mrrPKR.toLocaleString()}
                      </td>
                      <td style={{ fontSize: 12.5 }}>
                        {tenant.activeDoctors} / {SUBSCRIPTION_PLANS[tenant.plan]?.maxDoctors || '5'} Seats
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tenant.status === 'active'
                              ? 'badge-success'
                              : tenant.status === 'trialing'
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                          style={{ fontWeight: 700, textTransform: 'capitalize' }}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
                        {tenant.expiresAt}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {/* Plan Switcher */}
                          <select
                            className="select select-xs"
                            value={tenant.plan}
                            onChange={(e) => handleChangePlan(tenant.id, e.target.value)}
                            title="Change subscription plan tier"
                          >
                            <option value="starter">Starter (Rs. 5,000)</option>
                            <option value="growth">Growth (Rs. 12,000)</option>
                            <option value="enterprise">Enterprise (Rs. 25,000)</option>
                          </select>

                          {/* +14d extension */}
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleExtendTrial(tenant.id)}
                            title="Extend trial by +14 days"
                          >
                            +14d
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          MODAL 1: REGISTER NEW CLINIC
          ========================================================= */}
      {showAddModal && (
        <div className="overlay" style={{ zIndex: 110 }}>
          <div className="modal" style={{ maxWidth: 520, borderRadius: 20 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Register New Tenant Clinic</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClinic}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label" style={{ fontWeight: 700 }}>Clinic Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Islamabad Dental & Aesthetic Care"
                    value={newClinicForm.name}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Doctor In Charge *</label>
                    <input
                      className="input"
                      placeholder="e.g. Dr. Bilal Ahmed"
                      value={newClinicForm.doctorInCharge}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, doctorInCharge: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>City *</label>
                    <input
                      className="input"
                      placeholder="e.g. Islamabad"
                      value={newClinicForm.city}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Phone / WhatsApp</label>
                    <input
                      className="input"
                      placeholder="0300-1234567"
                      value={newClinicForm.phone}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Initial Plan Tier</label>
                    <select
                      className="select"
                      value={newClinicForm.plan}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, plan: e.target.value })}
                    >
                      <option value="starter">Starter (Rs. 5,000/mo)</option>
                      <option value="growth">Growth (Rs. 12,000/mo)</option>
                      <option value="enterprise">Enterprise (Rs. 25,000/mo)</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: 12, borderRadius: 12, border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', marginBottom: 2 }}>
                    🎁 Automatic 14-Day Free Trial Provisioned
                  </div>
                  <div className="hint" style={{ fontSize: 12 }}>
                    The clinic will receive instant isolated database space and subscription access.
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register & Provision Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: INSPECT CLINIC & SUBSCRIPTION DETAILS
          ========================================================= */}
      {inspectClinic && (
        <div className="overlay" style={{ zIndex: 110 }}>
          <div className="modal" style={{ maxWidth: 540, borderRadius: 20 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏢</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{inspectClinic.name}</h3>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setInspectClinic(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tenant Isolation Identity */}
              <div style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 12, border: '1px solid var(--c-border)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Multi-Tenant Database Isolation
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Tenant ID: <code style={{ color: 'var(--c-primary)' }}>{inspectClinic.id}</code></span>
                  <span>Slug: <code>{inspectClinic.slug}</code></span>
                </div>
              </div>

              {/* Clinic Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="hint" style={{ fontSize: 11 }}>Doctor In Charge</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inspectClinic.doctorInCharge}</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 11 }}>City & Location</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inspectClinic.city}, Pakistan</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 11 }}>Contact / WhatsApp</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inspectClinic.phone}</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 11 }}>Onboarding Date</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inspectClinic.joinedDate || '2026-08-01'}</div>
                </div>
              </div>

              {/* Subscription Breakdown Box */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(15,23,42,0.3) 100%)',
                  border: '1px solid rgba(37,99,235,0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#38bdf8' }}>
                    ⚡ {SUBSCRIPTION_PLANS[inspectClinic.plan]?.name || inspectClinic.plan} Plan
                  </span>
                  <span
                    className={`badge ${
                      inspectClinic.status === 'active'
                        ? 'badge-success'
                        : inspectClinic.status === 'trialing'
                        ? 'badge-warning'
                        : 'badge-error'
                    }`}
                  >
                    {inspectClinic.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div>Monthly MRR: <strong>Rs. {inspectClinic.mrrPKR?.toLocaleString()}</strong></div>
                  <div>Valid Until: <strong>{inspectClinic.expiresAt}</strong></div>
                  <div>Doctor Specialists: <strong>{inspectClinic.activeDoctors} Seats</strong></div>
                  <div>Monthly Tokens: <strong>{inspectClinic.monthlyTokens} Used</strong></div>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleExtendTrial(inspectClinic.id);
                  setInspectClinic(null);
                }}
              >
                +14 Days Extension
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setInspectClinic(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
