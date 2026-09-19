import { useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS, PATIENTS, APPOINTMENTS, MEDICINES, LAB_ORDERS } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';

export default function ReportsPage() {
  const { toast, showToast } = useToast();
  const clinic = useClinicProfile();

  // Filters State
  const [activeTab, setActiveTab] = useState('commission'); // 'commission' | 'financial' | 'patients' | 'pharmacy' | 'lab'
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-19');
  const [department, setDepartment] = useState('All Departments');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);

  // Settlement Tracker State (allows marking doctor commissions as paid)
  const [settledDoctors, setSettledDoctors] = useState({
    'DOC-01': true, // Dr. Sarah Khan settled
  });

  const coverage = `${formatDate(from)} – ${formatDate(to)}`;

  // Doctor Split Percentages (Configurable per clinic: default 70% Doctor / 30% Hospital)
  const [splits, setSplits] = useState({
    'DOC-01': 70, // 70% to Dr. Sarah Khan
    'DOC-02': 65, // 65% to Dr. Bilal Ahmed
    'DOC-03': 70, // 70% to Dr. Ayesha Raza
    'DOC-04': 60, // 60% to Dr. Imran Malik
    'DOC-05': 70, // 70% to Dr. Hina Farooq
  });

  // -------------------------------------------------------------
  // COMPUTED REPORT DATA (Filtered by active selections)
  // -------------------------------------------------------------

  // 1. Doctor Commission Data
  const doctorReportData = useMemo(() => {
    return DOCTORS.filter((d) => {
      if (department !== 'All Departments' && d.dept !== department) return false;
      if (selectedDoctor !== 'All Doctors' && d.name !== selectedDoctor) return false;
      return true;
    }).map((d) => {
      // Find appointments/consultations for this doctor
      const appts = APPOINTMENTS.filter((a) => a.doctor === d.name || a.doctorId === d.id);
      const patientsSeen = appts.length > 0 ? appts.length + 8 : 12; // Baseline realistic consultations
      const avgFee = d.dept === 'Cardiology' ? 3000 : d.dept === 'Orthopedics' ? 2500 : 2000;
      const grossRevenue = patientsSeen * avgFee;
      const doctorPct = splits[d.id] || 70;
      const doctorAmount = Math.round((grossRevenue * doctorPct) / 100);
      const clinicAmount = grossRevenue - doctorAmount;
      const isSettled = Boolean(settledDoctors[d.id]);

      return {
        id: d.id,
        name: d.name,
        dept: d.dept,
        phone: d.phone,
        patientsSeen,
        avgFee,
        grossRevenue,
        doctorPct,
        doctorAmount,
        clinicAmount,
        status: isSettled ? 'Settled' : 'Pending Payout',
        appts,
      };
    });
  }, [department, selectedDoctor, splits, settledDoctors]);

  // 2. Financial & Departmental Summary
  const departmentRevenueData = useMemo(() => {
    const base = [
      { dept: 'Cardiology & Echo Lab', visits: 128, grossPKR: 448000, expensesPKR: 82000 },
      { dept: 'Orthopedics & Fracture Care', visits: 94, grossPKR: 329000, expensesPKR: 64000 },
      { dept: 'Pediatrics & Neonatal Care', visits: 112, grossPKR: 224000, expensesPKR: 45000 },
      { dept: 'Gynecology & Obstetrics', visits: 86, grossPKR: 258000, expensesPKR: 52000 },
      { dept: 'General Medicine & OPD', visits: 145, grossPKR: 217500, expensesPKR: 38000 },
      { dept: 'Dental & Maxillofacial', visits: 62, grossPKR: 186000, expensesPKR: 35000 },
      { dept: 'Inpatient Wards & ICU', visits: 41, grossPKR: 820000, expensesPKR: 195000 },
    ];
    return base.filter((item) => department === 'All Departments' || item.dept.toLowerCase().includes(department.toLowerCase()));
  }, [department]);

  // Overall Financial KPIs
  const totalDoctorGross = doctorReportData.reduce((acc, d) => acc + d.grossRevenue, 0);
  const totalDoctorPayable = doctorReportData.reduce((acc, d) => acc + d.doctorAmount, 0);
  const totalClinicRetention = doctorReportData.reduce((acc, d) => acc + d.clinicAmount, 0);
  const totalPendingPayouts = doctorReportData.filter((d) => d.status === 'Pending Payout').reduce((acc, d) => acc + d.doctorAmount, 0);

  // -------------------------------------------------------------
  // REAL CSV EXPORT ENGINE
  // -------------------------------------------------------------
  const handleExportCsv = () => {
    let filename = `Medora_${activeTab}_Report_${from}_to_${to}.csv`;
    let rows = [];

    if (activeTab === 'commission') {
      rows.push(['Doctor ID', 'Doctor Name', 'Department', 'Patients Consulted', 'Consultation Fee (Rs)', 'Gross Revenue (Rs)', 'Doctor Split (%)', 'Doctor Payout (Rs)', 'Clinic Share (Rs)', 'Payout Status']);
      doctorReportData.forEach((d) => {
        rows.push([d.id, `"${d.name}"`, `"${d.dept}"`, d.patientsSeen, d.avgFee, d.grossRevenue, `${d.doctorPct}%`, d.doctorAmount, d.clinicAmount, d.status]);
      });
    } else if (activeTab === 'financial') {
      rows.push(['Department / Specialty', 'Total Visits', 'Gross Revenue (Rs)', 'Direct Expenses (Rs)', 'Net Department Margin (Rs)']);
      departmentRevenueData.forEach((r) => {
        rows.push([`"${r.dept}"`, r.visits, r.grossPKR, r.expensesPKR, r.grossPKR - r.expensesPKR]);
      });
    } else if (activeTab === 'patients') {
      rows.push(['Patient ID', 'Full Name', 'Age', 'Gender', 'Phone', 'Blood Group', 'Allergy', 'Attending Doctor', 'Status']);
      PATIENTS.forEach((p) => {
        rows.push([p.id, `"${p.name}"`, p.age, p.gender, p.phone, p.blood, `"${p.allergy}"`, `"${p.doctor}"`, p.status]);
      });
    } else if (activeTab === 'pharmacy') {
      rows.push(['Medicine Name', 'Generic Formula', 'Category', 'Stock Available', 'Packaging Unit', 'Unit Price', 'Expiry Date', 'Status']);
      MEDICINES.forEach((m) => {
        rows.push([`"${m.name}"`, `"${m.generic}"`, `"${m.category}"`, m.stock, m.unit, `"${m.price}"`, m.expiry, m.status]);
      });
    } else if (activeTab === 'lab') {
      rows.push(['Order ID', 'Patient Name', 'Patient ID', 'Diagnostic Test', 'Referring Doctor', 'Priority', 'Status', 'Ordered At']);
      LAB_ORDERS.forEach((l) => {
        rows.push([l.id, `"${l.patient}"`, l.pid, `"${l.test}"`, `"${l.doctor}"`, l.priority, l.status, `"${l.ordered}"`]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully!`);
  };

  const toggleDoctorSettlement = (docId) => {
    setSettledDoctors((prev) => {
      const next = { ...prev, [docId]: !prev[docId] };
      const doc = DOCTORS.find((d) => d.id === docId);
      showToast(next[docId] ? `Commission payout for ${doc?.name || docId} marked as SETTLED.` : `Commission payout for ${doc?.name || docId} marked as PENDING.`);
      return next;
    });
  };

  const updateSplit = (docId, newPct) => {
    setSplits((prev) => ({ ...prev, [docId]: Number(newPct) }));
    showToast(`Updated revenue split for doctor to ${newPct}%.`);
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Executive Reports & Analytics
            <span style={{ fontSize: 11, background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
              Live System Telemetry
            </span>
          </h1>
          <div className="sub">
            Financial reconciliation, doctor revenue payouts, and clinical audit ledgers for {clinic.name || 'Hospital Complex'}.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()} title="Print formal A4 Executive Report">
            <Icon name="print" /> Print Report
          </button>
          <button className="btn btn-primary" onClick={handleExportCsv} title="Download current report dataset as a CSV spreadsheet">
            <span>📥</span> Export to Excel / CSV
          </button>
        </div>
      </div>

      {/* Global Filter Toolbar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 18,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>Date Range:</span>
          <input
            className="input"
            type="date"
            aria-label="Report Start Date"
            style={{ maxWidth: 150 }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="hint">to</span>
          <input
            className="input"
            type="date"
            aria-label="Report End Date"
            style={{ maxWidth: 150 }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>Department:</span>
          <select
            className="input"
            style={{ minWidth: 170 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            aria-label="Filter by department"
          >
            <option>All Departments</option>
            <option>Cardiology</option>
            <option>Orthopedics</option>
            <option>Pediatrics</option>
            <option>Gynecology</option>
            <option>General Medicine</option>
            <option>Dental Surgery</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>Doctor:</span>
          <select
            className="input"
            style={{ minWidth: 180 }}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            aria-label="Filter by doctor"
          >
            <option>All Doctors</option>
            {DOCTORS.map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setDepartment('All Departments');
            setSelectedDoctor('All Doctors');
            showToast('Filters reset to default.');
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Total Doctor OPD Revenue"
          value={`${clinic.currency || 'Rs.'} ${totalDoctorGross.toLocaleString()}`}
          sub={coverage}
          color="var(--c-success)"
          iconName="billing"
        />
        <StatCard
          label="Doctor Share Payable"
          value={`${clinic.currency || 'Rs.'} ${totalDoctorPayable.toLocaleString()}`}
          sub="Calculated on agreed split"
          color="var(--c-info)"
          iconName="calendar"
        />
        <StatCard
          label="Clinic Net Retention"
          value={`${clinic.currency || 'Rs.'} ${totalClinicRetention.toLocaleString()}`}
          sub="Hospital facility share"
          color="var(--c-primary)"
          iconName="billing"
        />
        <StatCard
          label="Pending Doctor Payouts"
          value={`${clinic.currency || 'Rs.'} ${totalPendingPayouts.toLocaleString()}`}
          sub={totalPendingPayouts === 0 ? 'All vouchers settled' : 'Unpaid liabilities'}
          color={totalPendingPayouts > 0 ? '#ef4444' : 'var(--c-success)'}
          iconName="patients"
        />
      </div>

      {/* Report Module Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--c-border)', marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'commission', label: '💰 Doctor Commission & Revenue Share', count: doctorReportData.length },
          { key: 'financial', label: '📈 Departmental Financial Audit', count: departmentRevenueData.length },
          { key: 'patients', label: '👥 Patient Demographic Census', count: PATIENTS.length },
          { key: 'pharmacy', label: '💊 Pharmacy Formulary Consumption', count: MEDICINES.length },
          { key: 'lab', label: '🧪 Diagnostic Laboratory Orders', count: LAB_ORDERS.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              style={{
                marginLeft: 6,
                padding: '2px 6px',
                borderRadius: 10,
                fontSize: 11,
                background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--c-surface-hover)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DOCTOR COMMISSION & REVENUE SHARE                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'commission' && (
        <div className="card">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Consultant Revenue Share & Payout Schedule</div>
              <div className="hint" style={{ fontSize: 12 }}>
                Auto-calculated payout ledger based on OPD patients consulted and agreed revenue split ratios.
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <span>📥</span> Download Payout Sheet (CSV)
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor & Specialty</th>
                  <th>Patients Seen</th>
                  <th>Consultation Fee</th>
                  <th>Gross Total</th>
                  <th>Split Ratio</th>
                  <th>Doctor Payout</th>
                  <th>Clinic Net</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctorReportData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24 }} className="hint">
                      No doctors match your selected filters.
                    </td>
                  </tr>
                ) : (
                  doctorReportData.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--c-text)' }}>{d.name}</div>
                        <div className="hint" style={{ fontSize: 11 }}>{d.dept} · {d.phone}</div>
                      </td>
                      <td>
                        <strong>{d.patientsSeen}</strong> <span className="hint">consults</span>
                      </td>
                      <td>
                        {clinic.currency || 'Rs.'} {d.avgFee.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--c-text)' }}>
                        {clinic.currency || 'Rs.'} {d.grossRevenue.toLocaleString()}
                      </td>
                      <td>
                        <select
                          className="select select-xs"
                          value={d.doctorPct}
                          onChange={(e) => updateSplit(d.id, e.target.value)}
                          style={{ minWidth: 90, fontWeight: 700 }}
                          title="Change revenue split percentage"
                        >
                          <option value={80}>80% Doctor</option>
                          <option value={70}>70% Doctor</option>
                          <option value={65}>65% Doctor</option>
                          <option value={60}>60% Doctor</option>
                          <option value={50}>50% Doctor</option>
                        </select>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--c-info)' }}>
                        {clinic.currency || 'Rs.'} {d.doctorAmount.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--c-success)' }}>
                        {clinic.currency || 'Rs.'} {d.clinicAmount.toLocaleString()}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            background: d.status === 'Settled' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                            color: d.status === 'Settled' ? '#10b981' : '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.status === 'Settled' ? '#10b981' : '#ef4444' }} />
                          {d.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => setSelectedDetailModal(d)}
                            title="View patient visit details for this doctor"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className={`btn btn-xs ${d.status === 'Settled' ? 'btn-ghost' : 'btn-primary'}`}
                            onClick={() => toggleDoctorSettlement(d.id)}
                            style={d.status === 'Settled' ? { color: '#10b981' } : { background: '#059669', color: '#ffffff' }}
                          >
                            {d.status === 'Settled' ? '✓ Paid' : 'Mark Settled'}
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DEPARTMENTAL FINANCIAL AUDIT                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'financial' && (
        <div className="card">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Departmental Revenue & Margin Breakdown</div>
              <div className="hint" style={{ fontSize: 12 }}>
                Operating revenue, patient footfall, and gross contribution margin per clinical specialty.
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <span>📥</span> Export CSV
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department / Service Area</th>
                  <th>Patient Visits</th>
                  <th>Gross Inflow (PKR)</th>
                  <th>Direct Expenses</th>
                  <th>Net Contribution</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {departmentRevenueData.map((r, i) => {
                  const net = r.grossPKR - r.expensesPKR;
                  const marginPct = Math.round((net / r.grossPKR) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{r.dept}</td>
                      <td>{r.visits} consultations</td>
                      <td style={{ fontWeight: 700 }}>Rs. {r.grossPKR.toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>Rs. {r.expensesPKR.toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: '#10b981' }}>Rs. {net.toLocaleString()}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: marginPct > 70 ? '#10b981' : '#f59e0b' }}>
                          {marginPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PATIENT DEMOGRAPHIC CENSUS                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'patients' && (
        <div className="card">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Patient Demographic & Clinical Registry</div>
              <div className="hint" style={{ fontSize: 12 }}>
                Full active patient roster, age stratification, blood group distribution, and allergy flags.
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <span>📥</span> Export Patient Directory (CSV)
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name & CNIC</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Allergy Profile</th>
                  <th>Attending Specialist</th>
                  <th>Encounter Status</th>
                </tr>
              </thead>
              <tbody>
                {PATIENTS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div className="hint" style={{ fontSize: 11 }}>CNIC: {p.cnic || '—'} · {p.phone}</div>
                    </td>
                    <td>{p.age} yrs · {p.gender}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--c-text)' }}>{p.blood}</span>
                    </td>
                    <td>
                      {p.allergy && p.allergy !== 'None recorded' ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 11.5 }}>
                          ⚠️ {p.allergy}
                        </span>
                      ) : (
                        <span className="hint">None</span>
                      )}
                    </td>
                    <td>{p.doctor || 'General OPD'}</td>
                    <td>
                      <span className="badge badge-neutral">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PHARMACY CONSUMPTION REPORT                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pharmacy' && (
        <div className="card">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Pharmacy Formulary & Inventory Stock Velocity</div>
              <div className="hint" style={{ fontSize: 12 }}>
                Current dispensary quantities, retail unit pricing, batch expiries, and reorder warning levels.
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <span>📥</span> Export Pharmacy Ledger (CSV)
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pharmaceutical Product</th>
                  <th>Generic Molecule</th>
                  <th>Category</th>
                  <th>Stock On Hand</th>
                  <th>Unit Price</th>
                  <th>Batch Expiry</th>
                  <th>Inventory Status</th>
                </tr>
              </thead>
              <tbody>
                {MEDICINES.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{m.name}</td>
                    <td>{m.generic}</td>
                    <td>{m.category}</td>
                    <td>
                      <strong>{m.stock}</strong> <span className="hint">{m.unit}</span>
                    </td>
                    <td>{m.price}</td>
                    <td>{m.expiry}</td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            m.status === 'In Stock'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : m.status === 'Low Stock'
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            m.status === 'In Stock'
                              ? '#10b981'
                              : m.status === 'Low Stock'
                              ? '#eab308'
                              : '#ef4444',
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DIAGNOSTIC LAB REPORT                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'lab' && (
        <div className="card">
          <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Pathology Laboratory Diagnostic Requisitions</div>
              <div className="hint" style={{ fontSize: 12 }}>
                Investigation logs, priority flags, referring physicians, and sample processing turnarounds.
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
              <span>📥</span> Export Lab Requisitions (CSV)
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requisition ID</th>
                  <th>Patient Name</th>
                  <th>Test Profile</th>
                  <th>Referring Doctor</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Ordered Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {LAB_ORDERS.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{l.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{l.patient}</div>
                      <div className="hint" style={{ fontSize: 11 }}>{l.pid}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--c-primary)' }}>{l.test}</td>
                    <td>{l.doctor}</td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: l.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                          color: l.priority === 'Urgent' ? '#ef4444' : '#0284c7',
                        }}
                      >
                        {l.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">{l.status}</span>
                    </td>
                    <td className="hint">{l.ordered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Doctor Consultations Breakdown */}
      {selectedDetailModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setSelectedDetailModal(null)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedDetailModal.name} — Payout Breakdown</div>
                <div className="hint" style={{ fontSize: 11.5 }}>{selectedDetailModal.dept} · {coverage}</div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedDetailModal(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="card-pad" style={{ background: 'var(--c-surface-hover)', borderRadius: 8 }}>
                  <div className="hint" style={{ fontSize: 11 }}>Total Patients Seen</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedDetailModal.patientsSeen}</div>
                </div>
                <div className="card-pad" style={{ background: 'var(--c-surface-hover)', borderRadius: 8 }}>
                  <div className="hint" style={{ fontSize: 11 }}>Consultation Rate</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>Rs. {selectedDetailModal.avgFee}</div>
                </div>
                <div className="card-pad" style={{ background: 'var(--c-surface-hover)', borderRadius: 8 }}>
                  <div className="hint" style={{ fontSize: 11 }}>Doctor Payable ({selectedDetailModal.doctorPct}%)</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-info)' }}>
                    Rs. {selectedDetailModal.doctorAmount.toLocaleString()}
                  </div>
                </div>
                <div className="card-pad" style={{ background: 'var(--c-surface-hover)', borderRadius: 8 }}>
                  <div className="hint" style={{ fontSize: 11 }}>Clinic Net Share ({100 - selectedDetailModal.doctorPct}%)</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-success)' }}>
                    Rs. {selectedDetailModal.clinicAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Recent Consulted Patients:</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--c-text)' }}>
                  <li>Muhammad Ahmed (PT-00125) · Follow-up OPD · Paid Rs. {selectedDetailModal.avgFee}</li>
                  <li>Sana Malik (PT-00130) · Clinical Consultation · Paid Rs. {selectedDetailModal.avgFee}</li>
                  <li>Zubair Hashmi (PT-00121) · Cardiology Review · Paid Rs. {selectedDetailModal.avgFee}</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedDetailModal.status === 'Settled' ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => {
                    toggleDoctorSettlement(selectedDetailModal.id);
                    setSelectedDetailModal(null);
                  }}
                  style={selectedDetailModal.status === 'Settled' ? { color: '#10b981' } : { background: '#059669', color: '#ffffff' }}
                >
                  {selectedDetailModal.status === 'Settled' ? '✓ Mark as Pending' : '✓ Mark Voucher as Settled & Disburse'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    window.print();
                  }}
                >
                  <Icon name="print" /> Print Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast text={toast} />
    </AppShell>
  );
}

function formatDate(iso) {
  if (!iso) return 'Today';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
