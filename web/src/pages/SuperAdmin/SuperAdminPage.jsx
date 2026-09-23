import { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Icon, { WhatsAppIcon } from '../../components/ui/Icon.jsx';
import { getTenantClinics, saveTenantClinics, SUBSCRIPTION_PLANS, saveSubscriptionState } from '../../utils/subscriptionConfig.js';
import { switchActiveClinic } from '../../utils/clinicConfig.js';

const PAKISTANI_CITIES = ['All Cities', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Faisalabad'];

const SAMPLE_SAAS_INVOICES = [
  { id: 'INV-SAAS-2026-091', clinicName: 'Al-Shifa Family Healthcare', city: 'Islamabad', plan: 'enterprise', amountPKR: 25000, date: 'Sep 01, 2026', method: 'Direct Bank Wire (HBL)', status: 'Paid' },
  { id: 'INV-SAAS-2026-092', clinicName: 'Capital Dental & Aesthetic Center', city: 'Islamabad', plan: 'growth', amountPKR: 12000, date: 'Sep 03, 2026', method: 'JazzCash Business', status: 'Paid' },
  { id: 'INV-SAAS-2026-093', clinicName: 'Lahore Poly-Care & Pediatric Clinic', city: 'Lahore', plan: 'growth', amountPKR: 12000, date: 'Sep 05, 2026', method: 'Meezan Corporate', status: 'Paid' },
  { id: 'INV-SAAS-2026-094', clinicName: 'Karachi Heart & Chest Center', city: 'Karachi', plan: 'enterprise', amountPKR: 25000, date: 'Sep 08, 2026', method: 'Alfalah Merchant', status: 'Paid' },
  { id: 'INV-SAAS-2026-095', clinicName: 'Rawalpindi Diagnostic & Ultrasound', city: 'Rawalpindi', plan: 'starter', amountPKR: 5000, date: 'Sep 10, 2026', method: 'EasyPaisa Merchant', status: 'Paid' },
  { id: 'INV-SAAS-2026-096', clinicName: 'Peshawar Surgical Complex', city: 'Peshawar', plan: 'enterprise', amountPKR: 25000, date: 'Sep 12, 2026', method: 'Bank Transfer (UBL)', status: 'Pending Verification' },
];

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState(() => getTenantClinics());
  const [activeTab, setActiveTab] = useState('clinics'); // 'clinics' | 'subscriptions' | 'invoices'
  const [search, setSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All Cities');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectClinic, setInspectClinic] = useState(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [newClinicForm, setNewClinicForm] = useState({
    name: '',
    city: 'Islamabad',
    doctorInCharge: '',
    phone: '',
    plan: 'starter',
    billingCycle: 'monthly',
    practiceType: 'Dental Clinic',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Aggregated Telemetry
  const totalClinics = tenants.length;
  const activeCount = tenants.filter((t) => t.status === 'active').length;
  const trialingCount = tenants.filter((t) => t.status === 'trialing').length;
  const suspendedCount = tenants.filter((t) => t.status === 'suspended').length;
  const totalMrrPKR = tenants
    .filter((t) => t.status === 'active' || t.status === 'trialing')
    .reduce((sum, t) => sum + (t.mrrPKR || 0), 0);
  const totalArrPKR = totalMrrPKR * 12;
  const arpuPKR = totalClinics > 0 ? Math.round(totalMrrPKR / (activeCount || 1)) : 0;

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.doctorInCharge.toLowerCase().includes(search.toLowerCase());
    const matchCity = selectedCityFilter === 'All Cities' || t.city === selectedCityFilter;
    const matchPlan = selectedPlanFilter === 'all' || t.plan === selectedPlanFilter;
    const matchStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;
    return matchSearch && matchCity && matchPlan && matchStatus;
  });

  // Action: Change Plan Tier
  const handleChangePlan = (tenantId, newPlan) => {
    const planDetails = SUBSCRIPTION_PLANS[newPlan];
    saveSubscriptionState({ planId: newPlan }, tenantId);
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
    showToast(`Updated ${planDetails.name} subscription (Rs. ${planDetails.priceMonthlyPKR.toLocaleString()}/mo)`);
  };

  // Action: Extend Trial (+14 Days)
  const handleExtendTrial = (tenantId) => {
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        const currentExp = new Date(t.expiresAt);
        const newExp = new Date(currentExp.getTime() + 14 * 24 * 60 * 60 * 1000);
        saveSubscriptionState({ trialEndsAt: newExp.toISOString(), status: 'trialing' }, tenantId);
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
      billingCycle: 'monthly',
      practiceType: 'Dental Clinic',
    });
    showToast(`✨ Registered ${newEntry.name} with automated 14-day cloud trial.`);
  };

  // Direct WhatsApp Outreach to Clinic Owner
  const openWhatsAppOutreach = (tenant) => {
    const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
    const intl = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum Dr. ${tenant.doctorInCharge},\n\n` +
      `This is Medora Cloud SaaS Platform Operations regarding *${tenant.name}*.\n` +
      `Your current subscription plan is *${tenant.plan.toUpperCase()} Tier* (Valid until: ${tenant.expiresAt}).\n\n` +
      `Please let us know if you require doctor seat additions or technical support.\n\n` +
      `_Medora Healthcare Systems Cloud Operations_`
    );
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  // Quick Invoice Generation for Clinic
  const handleGenerateInvoice = (tenant) => {
    const planDetails = SUBSCRIPTION_PLANS[tenant.plan];
    setInvoiceModalData({
      id: `INV-SAAS-${Date.now().toString().slice(-6)}`,
      clinicName: tenant.name,
      city: tenant.city,
      doctorInCharge: tenant.doctorInCharge,
      phone: tenant.phone,
      planName: planDetails.name,
      amountPKR: planDetails.priceMonthlyPKR,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentMethod: 'Direct Bank Wire (Meezan / HBL Corporate)',
      status: tenant.status === 'active' ? 'Paid' : 'Due for Payment',
    });
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
            <h1>SaaS Command Center</h1>
            <span className="badge badge-purple" style={{ fontWeight: 800 }}>
              Platform Owner Console
            </span>
          </div>
          <div className="sub">
            Medora Cloud HMS multi-tenant clinic registry, subscription lifecycle, recurring MRR telemetry & billing
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Icon name="plus" /> Onboard New Clinic
          </button>
        </div>
      </div>

      {/* Three SaaS Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 4,
          flexWrap: 'wrap',
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

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '3px solid var(--c-primary)' : '3px solid transparent',
            padding: '10px 18px',
            fontWeight: activeTab === 'invoices' ? 800 : 600,
            fontSize: 14.5,
            color: activeTab === 'invoices' ? 'var(--c-primary)' : 'var(--c-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          <span>🧾</span>
          <span>SaaS Invoices & Receipts</span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 10,
              background: 'var(--c-surface-hover)',
              fontWeight: 700,
            }}
          >
            {SAMPLE_SAAS_INVOICES.length}
          </span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: REGISTERED CLINICS DIRECTORY
          ========================================================= */}
      {activeTab === 'clinics' && (
        <>
          {/* High-Level Clinic Directory Metrics */}
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            <StatCard
              label="Total Onboarded Clinics"
              value={totalClinics}
              iconName="patients"
              trend="Nationwide network"
            />
            <StatCard
              label="Active Paid Tenants"
              value={activeCount}
              color="var(--c-success)"
              iconName="check"
              trend="Good standing"
            />
            <StatCard
              label="14-Day Free Trials"
              value={trialingCount}
              color="var(--c-warning)"
              iconName="alert"
              trend="Onboarding pipeline"
            />
            <StatCard
              label="Suspended Accounts"
              value={suspendedCount}
              color="var(--c-error)"
              iconName="alert"
              trend="Awaiting renewal"
            />
          </div>

          {/* Quick City Filters Bar */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
            {PAKISTANI_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                className="btn btn-xs"
                style={{
                  borderRadius: 16,
                  background: selectedCityFilter === city ? 'var(--c-primary)' : 'var(--c-surface)',
                  color: selectedCityFilter === city ? '#ffffff' : 'var(--c-text-muted)',
                  border: selectedCityFilter === city ? 'none' : '1px solid var(--c-border)',
                  fontWeight: selectedCityFilter === city ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setSelectedCityFilter(city)}
              >
                {city}
              </button>
            ))}
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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Registered Clinics Directory</h3>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  {filteredTenants.length} Showing
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
                  <option value="all">All Plans</option>
                  <option value="starter">Solo Doctor & Dental (Rs. 4,500)</option>
                  <option value="growth">Polyclinic & Aesthetics (Rs. 9,500)</option>
                  <option value="hospital">Daycare & Maternity (Rs. 18,500)</option>
                  <option value="enterprise">Hospital Network (Rs. 35,000)</option>
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
                    <th>Doctor In Charge</th>
                    <th>Plan Tier</th>
                    <th>Status</th>
                    <th>Valid Until</th>
                    <th style={{ textAlign: 'right' }}>Owner Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)' }}>
                        No registered clinics found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <tr key={tenant.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--c-text-primary)' }}>{tenant.name}</div>
                          <div className="hint" style={{ fontSize: 11.5 }}>
                            {tenant.city} · {tenant.phone} · {tenant.practiceType || 'Clinic'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{tenant.doctorInCharge}</div>
                          <div className="hint" style={{ fontSize: 11.5 }}>
                            {tenant.activeDoctors} Doctor Room(s)
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              tenant.plan === 'enterprise'
                                ? 'badge-purple'
                                : tenant.plan === 'hospital'
                                ? 'badge-warning'
                                : tenant.plan === 'growth'
                                ? 'badge-info'
                                : 'badge-secondary'
                            }`}
                            style={{ fontWeight: 700, textTransform: 'capitalize' }}
                          >
                            {SUBSCRIPTION_PLANS[tenant.plan]?.name || tenant.plan}
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
                        <td style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
                          {tenant.expiresAt}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            {/* Direct WhatsApp Contact Button */}
                            <button
                              className="btn btn-ghost btn-icon btn-xs"
                              onClick={() => handleWhatsAppClinic(tenant)}
                              title={`Direct WhatsApp to ${tenant.name} (${tenant.phone})`}
                              aria-label="Message clinic doctor directly on WhatsApp"
                            >
                              <WhatsAppIcon size={14} color="#25D366" />
                            </button>

                            {/* Plan Switcher */}
                            <select
                              className="select select-xs"
                              value={tenant.plan}
                              onChange={(e) => handleChangePlan(tenant.id, e.target.value)}
                              title="Change subscription plan"
                            >
                              <option value="starter">Solo (Rs. 4,500)</option>
                              <option value="growth">Polyclinic (Rs. 9,500)</option>
                              <option value="hospital">Hospital (Rs. 18,500)</option>
                              <option value="enterprise">Enterprise (Rs. 35,000)</option>
                            </select>

                            {/* Extend Trial */}
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleExtendTrial(tenant.id)}
                              title="Add 14 Days Free Extension"
                            >
                              +14d
                            </button>

                            {/* Suspend / Activate Toggle */}
                            <button
                              className="btn btn-ghost btn-xs"
                              style={{ color: tenant.status === 'suspended' ? 'var(--c-success)' : 'var(--c-error)' }}
                              onClick={() => handleToggleStatus(tenant.id)}
                              title={tenant.status === 'suspended' ? 'Activate Clinic' : 'Freeze / Suspend Clinic'}
                            >
                              {tenant.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>

                            {/* Generate SaaS Tax Invoice */}
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleGenerateInvoice(tenant)}
                              title="Generate official SaaS subscription invoice"
                            >
                              🧾 Invoice
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
          TAB 2: SUBSCRIPTIONS & MRR TELEMETRY
          ========================================================= */}
      {activeTab === 'subscriptions' && (
        <>
          {/* SaaS Financial Health KPIs */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <StatCard
              label="Monthly Recurring Revenue (MRR)"
              value={`Rs. ${totalMrrPKR.toLocaleString()}`}
              color="var(--c-success)"
              iconName="billing"
              trend={`~ $${Math.round(totalMrrPKR / 280)} USD / month`}
            />
            <StatCard
              label="Annualized Run Rate (ARR)"
              value={`Rs. ${totalArrPKR.toLocaleString()}`}
              color="var(--c-primary)"
              iconName="reports"
              trend="12-month recurring run rate"
            />
            <StatCard
              label="Average Revenue Per User (ARPU)"
              value={`Rs. ${arpuPKR.toLocaleString()}`}
              iconName="patients"
              trend="Per active clinic / month"
            />
            <StatCard
              label="Net Revenue Retention (NRR)"
              value="118%"
              color="var(--c-purple)"
              iconName="check"
              trend="Negative churn tier expansion"
            />
          </div>

          {/* Pricing Tiers Contribution Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const countInTier = tenants.filter((t) => t.plan === key).length;
              const mrrInTier = countInTier * plan.priceMonthlyPKR;

              return (
                <div
                  key={key}
                  className="card card-pad"
                  style={{
                    borderRadius: 16,
                    border:
                      key === 'enterprise'
                        ? '1px solid rgba(147, 51, 234, 0.4)'
                        : key === 'hospital'
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : key === 'growth'
                        ? '1px solid rgba(2, 132, 199, 0.4)'
                        : '1px solid var(--c-border)',
                    background:
                      key === 'enterprise'
                        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, var(--c-surface) 100%)'
                        : key === 'hospital'
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--c-surface) 100%)'
                        : key === 'growth'
                        ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, var(--c-surface) 100%)'
                        : 'var(--c-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{plan.name}</h4>
                    <span className="badge badge-secondary" style={{ fontWeight: 700 }}>
                      {countInTier} Clinics ({Math.round((countInTier / (totalClinics || 1)) * 100)}%)
                    </span>
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-primary)', marginBottom: 4 }}>
                    Rs. {plan.priceMonthlyPKR.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text-muted)' }}>/ month</span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 12 }}>
                    Monthly MRR: <strong style={{ color: 'var(--c-text)' }}>Rs. {mrrInTier.toLocaleString()}</strong>
                  </div>

                  <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                    <div>👨‍⚕️ Doctor Limit: <strong>{plan.maxDoctors === Infinity ? 'Unlimited' : plan.maxDoctors}</strong></div>
                    <div>🎫 Monthly Tokens: <strong>{plan.monthlyTokens === Infinity ? 'Unlimited' : plan.monthlyTokens.toLocaleString()}</strong></div>
                    <div>💬 SMS Reminders: <strong>{plan.limits?.smsCreditsPerMonth ? `${plan.limits.smsCreditsPerMonth} Credits` : 'Direct WhatsApp'}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Subscriptions Table */}
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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Clinic Subscriptions Ledger</h3>
                <div className="hint" style={{ fontSize: 12, marginTop: 2 }}>
                  Real-time subscription status, token quota allocations, and seat capacity per clinic
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select
                  className="select select-sm"
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                >
                  <option value="all">All Plan Tiers</option>
                  <option value="starter">Solo Doctor & Dental (Rs. 4,500)</option>
                  <option value="growth">Polyclinic & Aesthetics (Rs. 9,500)</option>
                  <option value="hospital">Daycare & Maternity (Rs. 18,500)</option>
                  <option value="enterprise">Hospital Network (Rs. 35,000)</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Clinic Name</th>
                    <th>Subscribed Plan</th>
                    <th>Monthly MRR</th>
                    <th>Doctor Capacity</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                    <th style={{ textAlign: 'right' }}>Plan Tier Switch</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{tenant.name}</div>
                        <div className="hint" style={{ fontSize: 11.5 }}>
                          Dr. {tenant.doctorInCharge} · {tenant.city}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tenant.plan === 'enterprise'
                              ? 'badge-purple'
                              : tenant.plan === 'hospital'
                              ? 'badge-warning'
                              : tenant.plan === 'growth'
                              ? 'badge-info'
                              : 'badge-secondary'
                          }`}
                          style={{ fontWeight: 700, textTransform: 'capitalize' }}
                        >
                          {SUBSCRIPTION_PLANS[tenant.plan]?.name || tenant.plan}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#10b981' }}>
                        Rs. {tenant.mrrPKR.toLocaleString()}
                      </td>
                      <td style={{ fontSize: 12.5 }}>
                        {tenant.activeDoctors} Active Specialist(s)
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
                        <select
                          className="select select-xs"
                          value={tenant.plan}
                          onChange={(e) => handleChangePlan(tenant.id, e.target.value)}
                          title="Change subscription plan"
                        >
                          <option value="starter">Solo (Rs. 4,500)</option>
                          <option value="growth">Polyclinic (Rs. 9,500)</option>
                          <option value="hospital">Hospital (Rs. 18,500)</option>
                          <option value="enterprise">Enterprise (Rs. 35,000)</option>
                        </select>
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
          TAB 3: SAAS INVOICES & TAX RECEIPTS
          ========================================================= */}
      {activeTab === 'invoices' && (
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
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Corporate SaaS Invoices & Tax Receipts</h3>
              <div className="hint" style={{ fontSize: 12, marginTop: 2 }}>
                Monthly software subscription billing receipts issued to medical centers
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Dispatched monthly billing receipts to clinic emails.')}
            >
              📧 Batch Email Invoices
            </button>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Clinic Name & City</th>
                  <th>Plan Tier</th>
                  <th>Amount (PKR)</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_SAAS_INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{inv.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{inv.clinicName}</div>
                      <div className="hint" style={{ fontSize: 11.5 }}>{inv.city}</div>
                    </td>
                    <td><span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{inv.plan}</span></td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>Rs. {inv.amountPKR.toLocaleString()}</td>
                    <td style={{ fontSize: 12.5 }}>{inv.method}</td>
                    <td style={{ fontSize: 12 }}>{inv.date}</td>
                    <td>
                      <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => {
                          setInvoiceModalData({
                            ...inv,
                            doctorInCharge: 'Medical Director',
                            phone: '0300-1122334',
                            planName: SUBSCRIPTION_PLANS[inv.plan]?.name || inv.plan,
                            dueDate: '10th of Month',
                          });
                        }}
                      >
                        👁️ View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: REGISTER NEW CLINIC
          ========================================================= */}
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
                  <label className="label" style={{ fontWeight: 700 }}>Clinic / Practice Name *</label>
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
                    <label className="label" style={{ fontWeight: 700 }}>Medical Director / In Charge *</label>
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
                    <select
                      className="select"
                      value={newClinicForm.city}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, city: e.target.value })}
                    >
                      {PAKISTANI_CITIES.filter((c) => c !== 'All Cities').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>WhatsApp / Mobile *</label>
                    <input
                      className="input"
                      placeholder="0300-1234567"
                      value={newClinicForm.phone}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Initial Plan Tier</label>
                    <select
                      className="select"
                      value={newClinicForm.plan}
                      onChange={(e) => setNewClinicForm({ ...newClinicForm, plan: e.target.value })}
                    >
                      <option value="starter">Solo Doctor & Dental (Rs. 4,500/mo)</option>
                      <option value="growth">Polyclinic & Aesthetics (Rs. 9,500/mo)</option>
                      <option value="hospital">Daycare & Maternity (Rs. 18,500/mo)</option>
                      <option value="enterprise">Hospital Network (Rs. 35,000/mo)</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: 12, borderRadius: 12, border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', marginBottom: 2 }}>
                    🎁 Automatic 14-Day Free Cloud Trial Provisioned
                  </div>
                  <div className="hint" style={{ fontSize: 12 }}>
                    The clinic will receive instant isolated database space and multi-tenant access. No upfront credit card required.
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision & Launch Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: INSPECT CLINIC & SUBSCRIPTION
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
                  PostgreSQL Row-Level Security Isolation Key
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
                  <div className="hint" style={{ fontSize: 11 }}>Location</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{inspectClinic.city}, Pakistan</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 11 }}>WhatsApp Contact</div>
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
                  <div>Specialist Doctors: <strong>{inspectClinic.activeDoctors} Active</strong></div>
                  <div>Monthly Tokens: <strong>{inspectClinic.monthlyTokens} Used</strong></div>
                </div>
              </div>
            </div>

            <div className="modal-foot" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => openWhatsAppOutreach(inspectClinic)}
                title="Message clinic doctor directly on WhatsApp"
                aria-label="Message clinic doctor directly on WhatsApp"
              >
                <WhatsAppIcon size={16} color="#25D366" />
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
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
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                  onClick={() => {
                    switchActiveClinic(inspectClinic.id);
                    setInspectClinic(null);
                    window.location.href = '/dashboard';
                  }}
                  title="Switch to this clinic's workspace"
                >
                  🚀 Launch Workspace
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInspectClinic(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: OFFICIAL SAAS TAX INVOICE
          ========================================================= */}
      {invoiceModalData && (
        <div className="overlay" style={{ zIndex: 120 }}>
          <div className="modal" style={{ maxWidth: 600, borderRadius: 20 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 22 }}>🧾</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Corporate Software Invoice</h3>
                  <div className="hint" style={{ fontSize: 11.5 }}>{invoiceModalData.id} · Official Receipt</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setInvoiceModalData(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px 28px' }}>
              {/* Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--c-border)', paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--c-primary)' }}>MEDORA HEALTH SYSTEMS</div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Cloud Multi-Tenant Hospital OS</div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>NTN: 8934120-4 · Islamabad, Pakistan</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${invoiceModalData.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 800, fontSize: 12 }}>
                    {invoiceModalData.status}
                  </span>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: 4 }}>Date: {invoiceModalData.date}</div>
                </div>
              </div>

              {/* Billed To */}
              <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 12, marginBottom: 20, border: '1px solid var(--c-border)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Billed To Tenant Client:
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{invoiceModalData.clinicName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                  In-Charge: {invoiceModalData.doctorInCharge} · {invoiceModalData.city}, Pakistan
                </div>
              </div>

              {/* Invoice Table */}
              <div className="table-wrap" style={{ marginBottom: 20 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Software Item / License</th>
                      <th>Billing Period</th>
                      <th style={{ textAlign: 'right' }}>Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700 }}>Medora HMS — {invoiceModalData.planName}</div>
                        <div className="hint" style={{ fontSize: 11 }}>Multi-tenant cloud clinic license & hosting</div>
                      </td>
                      <td style={{ fontSize: 12 }}>30 Days / Recurring</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 14 }}>
                        Rs. {invoiceModalData.amountPKR.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed var(--c-border)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  Payment Method: <strong>{invoiceModalData.paymentMethod}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Total Amount Due:</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>
                    Rs. {invoiceModalData.amountPKR.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print Invoice
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setInvoiceModalData(null)}
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
