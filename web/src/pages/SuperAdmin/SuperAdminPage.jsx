import { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { getTenantClinics, saveTenantClinics, SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';
import { saveClinicProfile } from '../../utils/clinicConfig.js';

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState(() => getTenantClinics());
  const [search, setSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [newClinicForm, setNewClinicForm] = useState({
    name: '',
    city: 'Islamabad',
    doctorInCharge: '',
    phone: '',
    plan: 'starter',
    practiceType: 'Dental Clinic',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Telemetry aggregates
  const totalClinics = tenants.length;
  const activeCount = tenants.filter((t) => t.status === 'active').length;
  const trialingCount = tenants.filter((t) => t.status === 'trialing').length;
  const totalMrrPKR = tenants
    .filter((t) => t.status === 'active' || t.status === 'trialing')
    .reduce((sum, t) => sum + (t.mrrPKR || 0), 0);

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.doctorInCharge.toLowerCase().includes(search.toLowerCase());
    const matchPlan = selectedPlanFilter === 'all' || t.plan === selectedPlanFilter;
    return matchSearch && matchPlan;
  });

  // Action: Change Plan
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
    showToast(`Updated clinic plan to ${planDetails.name}`);
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
    showToast('Extended clinic trial by +14 days.');
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

  // Action: Impersonate / Switch Active Clinic
  const handleImpersonate = (tenant) => {
    saveClinicProfile({
      name: tenant.name,
      doctorInCharge: tenant.doctorInCharge,
      phone: tenant.phone,
      address: `${tenant.city}, Pakistan`,
    });
    showToast(`Switched active tenant workspace to: ${tenant.name}`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
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
      practiceType: 'Dental Clinic',
    });
    showToast(`✨ Onboarded ${newEntry.name} with 14-day free trial.`);
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
            <h1>Super-Admin SaaS Master Portal</h1>
            <span className="badge badge-purple" style={{ fontWeight: 800 }}>
              Platform Owner Mode
            </span>
          </div>
          <div className="sub">
            Medora Cloud HMS multi-tenant management, recurring MRR telemetry, subscriptions & tenant isolation
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Icon name="plus" /> Onboard New Clinic
          </button>
        </div>
      </div>

      {/* High-Level SaaS Metrics Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Onboarded Clinics"
          value={totalClinics}
          iconName="patients"
          trend="Nationwide network"
        />
        <StatCard
          label="Monthly Recurring Revenue"
          value={`Rs. ${totalMrrPKR.toLocaleString()}`}
          color="var(--c-success)"
          iconName="billing"
          trend={`~ $${Math.round(totalMrrPKR / 280)} USD / month`}
        />
        <StatCard
          label="Active Paid Subscriptions"
          value={activeCount}
          color="var(--c-primary)"
          iconName="check"
          trend={`${Math.round((activeCount / totalClinics) * 100)}% conversion rate`}
        />
        <StatCard
          label="Clinics in 14-Day Trial"
          value={trialingCount}
          color="var(--c-warning)"
          iconName="alert"
          trend="Pending subscription payment"
        />
      </div>

      {/* Tenant Clinics Directory */}
      <div className="card" style={{ borderRadius: 18, marginBottom: 30 }}>
        {/* Table Filters Header */}
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
              <option value="starter">Starter (Solo)</option>
              <option value="growth">Growth (Polyclinic)</option>
              <option value="enterprise">Enterprise (Hospital)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Clinic Name & City</th>
                <th>Doctor in Charge</th>
                <th>Plan Tier</th>
                <th>Status</th>
                <th>Monthly MRR</th>
                <th>Valid Until</th>
                <th style={{ textAlign: 'right' }}>Owner Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)' }}>
                    No tenant clinics found matching your criteria.
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
                        {tenant.activeDoctors} Active Specialists
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
                    <td style={{ fontWeight: 800, color: '#10b981' }}>
                      Rs. {tenant.mrrPKR.toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
                      {tenant.expiresAt}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {/* Switch Plan Dropdown */}
                        <select
                          className="select select-xs"
                          value={tenant.plan}
                          onChange={(e) => handleChangePlan(tenant.id, e.target.value)}
                          title="Change Plan"
                        >
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="enterprise">Enterprise</option>
                        </select>

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

                        {/* Impersonate */}
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleImpersonate(tenant)}
                          title="Open clinic workspace in live view"
                        >
                          👁️ View
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

      {/* Onboard New Clinic Modal */}
      {showAddModal && (
        <div className="overlay" style={{ zIndex: 110 }}>
          <div className="modal" style={{ maxWidth: 520, borderRadius: 20 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Onboard New Tenant Clinic</h3>
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
                    The clinic will receive instant access with isolated data storage. No credit card required upfront.
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision & Launch Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
