import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { APPOINTMENTS, WAITING_ROOM, NURSING_TASKS, LAB_ORDERS, MEDICINES, PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { getBedCounts, getWardSummaries } from '../../data/wardsData.js';

const GREETING_NAME = {
  Administrator: 'Admin', Receptionist: 'Farah', Doctor: 'Dr. Khan',
  Nurse: 'Nadia', 'Lab Technician': 'Usman', Pharmacist: 'Zainab',
};

const INITIAL_TRIAGE_STREAM = [
  {
    id: 'TR-101',
    mrn: 'PT-00109',
    name: 'Tariq Mehmood',
    age: 58,
    gender: 'Male',
    acuity: 'Level 1 · Resuscitation',
    acuityBadge: 'badge-error',
    complaint: 'Crushing substernal chest pain, diaphoresis & syncope',
    location: 'Resuscitation Bay 1',
    doctor: 'Dr. Sarah Khan',
    timeAgo: '4 min ago',
    vitals: { hr: '134 bpm', bp: '85/50', spo2: '87%', rr: '28/min' },
    status: 'Active CPR / Defib Ready',
  },
  {
    id: 'TR-102',
    mrn: 'PT-00130',
    name: 'Parveen Akhtar',
    age: 45,
    gender: 'Female',
    acuity: 'Level 2 · Emergent',
    acuityBadge: 'badge-warning',
    complaint: 'Acute severe bronchospasm, inspiratory stridor & cyanosis',
    location: 'ER Acute Bay 3',
    doctor: 'Dr. Imran Malik',
    timeAgo: '14 min ago',
    vitals: { hr: '112 bpm', bp: '145/95', spo2: '91%', rr: '24/min' },
    status: 'Nebulization & IV Access',
  },
  {
    id: 'TR-103',
    mrn: 'PT-00132',
    name: 'Bilal Qureshi',
    age: 28,
    gender: 'Male',
    acuity: 'Level 3 · Urgent',
    acuityBadge: 'badge-purple',
    complaint: 'Closed forearm fracture deformity post motorcycle trauma',
    location: 'Trauma Minor Bay 2',
    doctor: 'Dr. Bilal Ahmed',
    timeAgo: '26 min ago',
    vitals: { hr: '88 bpm', bp: '128/82', spo2: '98%', rr: '18/min' },
    status: 'Splinted · X-Ray Pending',
  },
  {
    id: 'TR-104',
    mrn: 'PT-00135',
    name: 'Sara Ali',
    age: 6,
    gender: 'Female',
    acuity: 'Level 4 · Semi-Urgent',
    acuityBadge: 'badge-success',
    complaint: 'High grade pyrexia 103.2°F, febrile lethargy & dehydration',
    location: 'Pediatric Fast Track',
    doctor: 'Dr. Ayesha Raza',
    timeAgo: '38 min ago',
    vitals: { hr: '118 bpm', bp: '98/64', spo2: '99%', rr: '22/min' },
    status: 'Oral Antipyretic Given',
  },
];

const PHYSICIAN_ROSTER = [
  { id: 'DOC-01', name: 'Dr. Sarah Khan', dept: 'Cardiology', location: 'OPD Chamber 4 / Cath Lab', status: 'Consulting', activePatients: 4, badge: 'badge-success', phone: '0300-1234567' },
  { id: 'DOC-02', name: 'Dr. Bilal Ahmed', dept: 'Orthopedics', location: 'Operating Theater 1 (OT-1)', status: 'In Surgery', activePatients: 2, badge: 'badge-purple', phone: '0301-2345678' },
  { id: 'DOC-03', name: 'Dr. Ayesha Raza', dept: 'Pediatrics', location: 'OPD Chamber 7', status: 'Consulting', activePatients: 3, badge: 'badge-success', phone: '0302-3456789' },
  { id: 'DOC-04', name: 'Dr. Imran Malik', dept: 'General & Emergency', location: 'ER Resuscitation Bay', status: 'Trauma On-Duty', activePatients: 5, badge: 'badge-error', phone: '0303-4567890' },
  { id: 'DOC-05', name: 'Dr. Hina Farooq', dept: 'Gynecology & Obs', location: 'Ward Floor 3 / Labour Rm', status: 'Clinical Rounds', activePatients: 2, badge: 'badge-info', phone: '0304-5678901' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Hospital-wide emergency broadcast state
  const [activeCodeAlert, setActiveCodeAlert] = useState(null);

  return (
    <AppShell>
      {/* Broadcast Alert Banner if activated */}
      {activeCodeAlert && (
        <div
          style={{
            background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 100%)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
            border: '1px solid #ef4444',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 14 }}>
                {activeCodeAlert.code} · ACTIVATED ({activeCodeAlert.location})
              </div>
              <div style={{ fontSize: 13, opacity: 0.95 }}>
                {activeCodeAlert.details} — Initiated at {activeCodeAlert.time}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
              onClick={() => setActiveCodeAlert(null)}
            >
              Acknowledge & Clear Code
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>Good morning, {GREETING_NAME[role] || user?.name}</h1>
            <span className="badge badge-info" style={{ fontWeight: 700 }}>
              {role}
            </span>
          </div>
          <div className="sub">{today} · Al-Shifa Hospital Medical Operations Command Center</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()} title="Refresh Data">
            <Icon name="reports" /> Refresh Feed
          </button>
        </div>
      </div>

      {role === 'Administrator' && (
        <AdminDashboard
          navigate={navigate}
          setActiveCodeAlert={setActiveCodeAlert}
        />
      )}
      {role === 'Receptionist' && <ReceptionistDashboard navigate={navigate} />}
      {role === 'Doctor' && <DoctorDashboard navigate={navigate} />}
      {role === 'Nurse' && <NurseDashboard navigate={navigate} />}
      {role === 'Lab Technician' && <LabDashboard navigate={navigate} />}
      {role === 'Pharmacist' && <PharmacistDashboard navigate={navigate} />}
    </AppShell>
  );
}

/* ========================= ADMINISTRATOR / COMMAND CENTER ========================= */
function AdminDashboard({ navigate, setActiveCodeAlert }) {
  const beds = getBedCounts();
  const wardSummaries = getWardSummaries();
  const waitingNow = WAITING_ROOM.length;
  const pendingLabs = LAB_ORDERS.filter((o) => o.status !== 'Verified').length;
  const outOfStock = MEDICINES.filter((m) => m.status === 'Out of Stock');
  const urgentLab = LAB_ORDERS.find((o) => o.status === 'Urgent');

  const [triageStream, setTriageStream] = useState(INITIAL_TRIAGE_STREAM);
  const [showErModal, setShowErModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // ER Intake Form state
  const [erForm, setErForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    acuity: 'Level 1 · Resuscitation',
    complaint: '',
    location: 'Resuscitation Bay 2',
    doctor: 'Dr. Imran Malik',
    bp: '120/80',
    hr: '82 bpm',
    spo2: '98%',
  });

  const handleErIntakeSubmit = (e) => {
    e.preventDefault();
    if (!erForm.name.trim() || !erForm.complaint.trim()) return;

    const newMrn = 'PT-ER-' + Date.now().toString().slice(-4);
    const newTriageItem = {
      id: 'TR-' + Date.now(),
      mrn: newMrn,
      name: erForm.name.trim(),
      age: Number(erForm.age) || 30,
      gender: erForm.gender,
      acuity: erForm.acuity,
      acuityBadge: erForm.acuity.includes('Level 1')
        ? 'badge-error'
        : erForm.acuity.includes('Level 2')
        ? 'badge-warning'
        : erForm.acuity.includes('Level 3')
        ? 'badge-purple'
        : 'badge-success',
      complaint: erForm.complaint.trim(),
      location: erForm.location,
      doctor: erForm.doctor,
      timeAgo: 'Just now',
      vitals: { hr: erForm.hr, bp: erForm.bp, spo2: erForm.spo2, rr: '20/min' },
      status: 'Admitted to ER Bay',
    };

    // Also register into global PATIENTS memory list
    PATIENTS.unshift({
      id: newMrn,
      name: erForm.name.trim(),
      age: Number(erForm.age) || 30,
      gender: erForm.gender,
      phone: 'ER Intake',
      doctor: erForm.doctor,
      lastVisit: 'Today (ER)',
      status: 'Emergency',
      blood: 'Pending',
      allergy: 'NKDA (ER)',
      cnic: 'Pending',
      ward: 'Emergency Dept',
      bed: erForm.location,
      dob: 'Unknown',
    });

    setTriageStream([newTriageItem, ...triageStream]);
    setShowErModal(false);
    setErForm({
      name: '',
      age: '',
      gender: 'Male',
      acuity: 'Level 1 · Resuscitation',
      complaint: '',
      location: 'Resuscitation Bay 2',
      doctor: 'Dr. Imran Malik',
      bp: '120/80',
      hr: '82 bpm',
      spo2: '98%',
    });
  };

  const triggerCode = (code, location, details) => {
    setActiveCodeAlert({
      code,
      location,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setShowBroadcastModal(false);
  };

  const occupancyRate = beds.total > 0 ? Math.round((beds.occupied / beds.total) * 100) : 0;

  return (
    <>
      {/* Top Clinical & Operational Telemetry Cards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Registered Patients"
          value={PATIENTS.length.toLocaleString()}
          iconName="patients"
          trend="+12 this week"
        />
        <StatCard
          label="Hospital Bed Occupancy"
          value={occupancyRate + '%'}
          color={occupancyRate >= 85 ? 'var(--c-error)' : 'var(--c-primary)'}
          iconName="bed"
          trend={beds.available + ' of ' + beds.total + ' available'}
        />
        <StatCard
          label="Acute Triage Stream"
          value={triageStream.length}
          color="var(--c-error)"
          iconName="alert"
          trend={triageStream.filter((t) => t.acuity.includes('Level 1') || t.acuity.includes('Level 2')).length + ' Critical / STAT'}
        />
        <StatCard
          label="Outpatient Queue"
          value={waitingNow}
          color="var(--c-warning)"
          iconName="calendar"
          trend={APPOINTMENTS.length + ' total scheduled'}
        />
      </div>

      {/* Rapid Clinical Emergency Actions Bar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(2,132,199,0.08) 100%)',
          border: '1px solid rgba(37,99,235,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--c-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="stetho" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Clinical Operations Command</div>
            <div className="hint" style={{ fontSize: 12 }}>
              Instant triage intake, acute alert broadcasting, and multi-ward hospital telemetry
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowErModal(true)}>
            <Icon name="plus" /> Rapid ER Intake
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admissions')}>
            <Icon name="bed" /> Bed Allocations
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/laboratory')}>
            <Icon name="lab" /> STAT Lab Orders ({pendingLabs})
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2' }}
            onClick={() => setShowBroadcastModal(true)}
          >
            🚨 Trigger Code Alert
          </button>
        </div>
      </div>

      {/* Clinical Attention Required Banners */}
      {(outOfStock.length > 0 || urgentLab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {urgentLab && (
            <div className="alert-banner warning">
              <Icon name="alert" />
              <div style={{ flex: 1 }}>
                <strong>CRITICAL LAB ALERT:</strong> {urgentLab.patient} — urgent STAT {urgentLab.test} is awaiting immediate pathologist review.{' '}
                <a
                  style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => navigate('/laboratory')}
                >
                  Verify Laboratory Sample →
                </a>
              </div>
            </div>
          )}
          {outOfStock.length > 0 && (
            <div className="alert-banner error">
              <Icon name="alert" />
              <div style={{ flex: 1 }}>
                <strong>PHARMACY SHORTAGE:</strong> {outOfStock[0].name} ({outOfStock[0].category}) is currently depleted to 0 units.{' '}
                <a
                  style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => navigate('/pharmacy')}
                >
                  Reorder Stock Immediately →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Command Split: Emergency Triage Stream + Ward Bed Telemetry */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Left: Emergency Triage Stream */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="card-pad"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--c-border)',
              paddingBottom: 12,
            }}
          >
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                Acute Emergency & Triage Stream
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Real-time Emergency Severity Index (ESI) prioritized intake
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowErModal(true)}>
              + Fast Intake
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', flex: 1 }}>
            {triageStream.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  background: t.acuity.includes('Level 1') ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={'badge ' + t.acuityBadge} style={{ fontWeight: 800, fontSize: 11.5 }}>
                      {t.acuity}
                    </span>
                    <strong style={{ fontSize: 14 }}>{t.name}</strong>
                    <span className="hint" style={{ fontSize: 12 }}>
                      {t.age}y · {t.gender}
                    </span>
                  </div>
                  <span className="hint" style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
                    {t.timeAgo}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
                  <strong style={{ color: 'var(--c-text)' }}>Chief Complaint:</strong> {t.complaint}
                </div>

                {/* Vitals Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    <strong>HR:</strong> {t.vitals.hr}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    <strong>BP:</strong> {t.vitals.bp}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    <strong>SpO2:</strong> {t.vitals.spo2}
                  </span>
                  <span className="hint" style={{ marginLeft: 'auto' }}>
                    📍 {t.location} · 🩺 {t.doctor}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                    {t.status}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11.5, padding: '3px 9px' }}
                      onClick={() => navigate('/patients/' + t.mrn)}
                    >
                      Open EHR Chart
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11.5, padding: '3px 9px' }}
                      onClick={() => navigate('/consultation/' + t.mrn)}
                    >
                      Consult Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ward Bed Capacity & Telemetry */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="card-pad"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--c-border)',
              paddingBottom: 12,
            }}
          >
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Icon name="bed" /> Live Ward Bed Telemetry
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Dynamic capacity, mechanical ventilator usage & sanitization cycle
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admissions')}>
              Full Grid →
            </button>
          </div>

          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {wardSummaries.map((ward) => {
              const barColor = ward.pct >= 90 ? 'var(--c-error)' : ward.pct >= 75 ? 'var(--c-warning)' : 'var(--c-primary)';

              return (
                <div
                  key={ward.name}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-surface-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13.5 }}>{ward.name}</strong>
                      <span className="hint" style={{ fontSize: 12, marginLeft: 8 }}>
                        {ward.floor} · Lead: {ward.nurse}
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: barColor,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ward.pct}% ({ward.occupied}/{ward.total} beds)
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div
                    style={{
                      height: 8,
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.07)',
                      overflow: 'hidden',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: ward.pct + '%',
                        background: barColor,
                        borderRadius: 6,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Detailed Counts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5 }}>
                    <span style={{ color: 'var(--c-success)', fontWeight: 600 }}>● {ward.available} Available</span>
                    <span style={{ color: 'var(--c-error)', fontWeight: 600 }}>● {ward.occupied} Occupied</span>
                    {ward.cleaning > 0 && <span style={{ color: '#0284c7', fontWeight: 600 }}>● {ward.cleaning} Sanitizing</span>}
                    {ward.maintenance > 0 && <span style={{ color: 'var(--c-text-muted)', fontWeight: 600 }}>● {ward.maintenance} Service</span>}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 6px' }}
                      onClick={() => navigate('/admissions')}
                    >
                      Manage Ward →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row Split: On-Duty Physician Roster + Operational Metrics */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* On-Duty Physician & Consultant Roster */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Icon name="staff" /> On-Duty Attending Specialists
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Live active physician stations, surgery theaters & rounds
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
              Schedules →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PHYSICIAN_ROSTER.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={doc.name} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{doc.name}</div>
                    <div className="hint" style={{ fontSize: 12 }}>
                      {doc.dept} · 📍 {doc.location}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={'badge ' + doc.badge} style={{ fontWeight: 700, fontSize: 11 }}>
                    {doc.status}
                  </span>
                  <div className="hint" style={{ fontSize: 11.5, marginTop: 4 }}>
                    {doc.activePatients} active cases
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Metrics & Today's Outpatient Census */}
        <div className="card card-pad">
          <div className="section-title" style={{ marginBottom: 14 }}>
            Hospital Operational Pulse & Core KPIs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MiniStatRow label="Average Inpatient Length of Stay (ALOS)" value="3.4 Days" />
            <MiniStatRow label="ER Door-to-Doctor Decision Time" value="11 Minutes" />
            <MiniStatRow label="Today's Outpatient Clinic Consults" value={APPOINTMENTS.length + ' Booked (8 Seen)'} />
            <MiniStatRow label="24-Hour Admission vs Discharge" value="6 Admitted / 4 Discharged" />
            <MiniStatRow label="Operating Theaters (OT) Active" value="2 / 3 Suites Occupied" />
            <MiniStatRow label="Laboratory TAT (STAT Samples)" value="24 Min Average" />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--c-bg-subtle, #f8fafc)',
              border: '1px solid var(--c-border)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Hospital Accreditation & Safety Note</div>
            <p className="hint" style={{ fontSize: 12, margin: 0 }}>
              All high-acuity wards (ICU, HDU, Coronary) maintain 1:1 or 1:2 nurse-to-patient staffing compliance.
              Code Blue teams undergo automated bi-weekly resuscitation drills.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Consultations Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16 }}>Today's Scheduled Consultations</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
          View all ({APPOINTMENTS.length}) →
        </button>
      </div>
      <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Time</th>
                <th>Patient</th>
                <th>Consulting Doctor</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {APPOINTMENTS.slice(0, 5).map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.patient} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient}</div>
                        <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{a.pid}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{a.doctor}</td>
                  <td>
                    <span className="badge badge-neutral">{a.dept}</span>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patients/' + a.pid)}>
                      Open Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: RAPID ER INTAKE ================= */}
      {showErModal && (
        <div className="overlay" onClick={() => setShowErModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🚨</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Rapid ER Triage & Acute Intake</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowErModal(false)} aria-label="Close ER Intake Modal">
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleErIntakeSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="label">Patient Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={erForm.name}
                      onChange={(e) => setErForm({ ...erForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Age *</label>
                    <input
                      type="number"
                      className="input"
                      required
                      placeholder="e.g. 45"
                      value={erForm.age}
                      onChange={(e) => setErForm({ ...erForm, age: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="label">Gender</label>
                    <select
                      className="select"
                      value={erForm.gender}
                      onChange={(e) => setErForm({ ...erForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Triage Acuity (ESI Level) *</label>
                    <select
                      className="select"
                      value={erForm.acuity}
                      onChange={(e) => setErForm({ ...erForm, acuity: e.target.value })}
                    >
                      <option value="Level 1 · Resuscitation">Level 1 · Resuscitation (STAT Immediate)</option>
                      <option value="Level 2 · Emergent">Level 2 · Emergent (&lt; 15 min)</option>
                      <option value="Level 3 · Urgent">Level 3 · Urgent (&lt; 30 min)</option>
                      <option value="Level 4 · Semi-Urgent">Level 4 · Semi-Urgent (&lt; 60 min)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Chief Medical Complaint / Trauma Presentation *</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    required
                    placeholder="e.g. Severe retrosternal chest pain radiating to left arm, diaphoresis, dyspnea..."
                    value={erForm.complaint}
                    onChange={(e) => setErForm({ ...erForm, complaint: e.target.value })}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="label">Assigned ER Location / Bay</label>
                    <select
                      className="select"
                      value={erForm.location}
                      onChange={(e) => setErForm({ ...erForm, location: e.target.value })}
                    >
                      <option value="Resuscitation Bay 1">Resuscitation Bay 1 (STAT)</option>
                      <option value="Resuscitation Bay 2">Resuscitation Bay 2</option>
                      <option value="ER Acute Bay 3">ER Acute Bay 3</option>
                      <option value="Trauma Minor Bay 2">Trauma Minor Bay 2</option>
                      <option value="Pediatric Fast Track">Pediatric Fast Track</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Attending Doctor</label>
                    <select
                      className="select"
                      value={erForm.doctor}
                      onChange={(e) => setErForm({ ...erForm, doctor: e.target.value })}
                    >
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.dept})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="label">Blood Pressure</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="120/80"
                      value={erForm.bp}
                      onChange={(e) => setErForm({ ...erForm, bp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Heart Rate</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="80 bpm"
                      value={erForm.hr}
                      onChange={(e) => setErForm({ ...erForm, hr: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">SpO2 Oxygen</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="98%"
                      value={erForm.spo2}
                      onChange={(e) => setErForm({ ...erForm, spo2: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowErModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Admit to ER Triage Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EMERGENCY BROADCAST ================= */}
      {showBroadcastModal && (
        <div className="overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🚨</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Broadcast Hospital Emergency Code</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBroadcastModal(false)} aria-label="Close Broadcast Modal">
                <Icon name="x" />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="hint" style={{ fontSize: 13, margin: 0 }}>
                Select an emergency code protocol to alert all medical departments, paging teams, and clinical stations:
              </p>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() =>
                  triggerCode(
                    'CODE BLUE · CARDIAC ARREST',
                    'ICU Bay 2',
                    'Adult resuscitation in progress — CPR & Advanced Life Support team stat'
                  )
                }
              >
                <div>
                  <strong style={{ color: '#b91c1c' }}>Code Blue (Cardiac / Respiratory Arrest)</strong>
                  <div className="hint" style={{ fontSize: 12 }}>
                    Dispatches Resuscitation & Crash Cart team to ICU / Ward
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: '#dc2626', color: '#fff' }}>
                  Trigger
                </button>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fde047',
                  background: '#fefce8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() =>
                  triggerCode(
                    'CODE YELLOW · MASS CASUALTY / DISASTER',
                    'Emergency Department',
                    'Trauma influx alert — Emergency surgery suites placed on standby'
                  )
                }
              >
                <div>
                  <strong style={{ color: '#854d0e' }}>Code Yellow (Mass Casualty / Influx)</strong>
                  <div className="hint" style={{ fontSize: 12 }}>
                    Mobilizes on-call surgeons, OR suites, and blood bank
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: '#ca8a04', color: '#fff' }}>
                  Trigger
                </button>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fbcfe8',
                  background: '#fdf2f8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() =>
                  triggerCode(
                    'CODE PINK · INFANT / PEDIATRIC SECURITY',
                    'Pediatrics Floor 2',
                    'Perimeter security lock and nursery staff station review'
                  )
                }
              >
                <div>
                  <strong style={{ color: '#9d174d' }}>Code Pink (Infant / Pediatric Alert)</strong>
                  <div className="hint" style={{ fontSize: 12 }}>
                    Initiates nursery perimeter containment and identification check
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: '#db2777', color: '#fff' }}>
                  Trigger
                </button>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fed7aa',
                  background: '#fff7ed',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() =>
                  triggerCode(
                    'CODE RED · FIRE & SAFETY PROTOCOL',
                    'Basement Facility / Storage',
                    'Automated smoke dampening initiated — Facility team responding'
                  )
                }
              >
                <div>
                  <strong style={{ color: '#c2410c' }}>Code Red (Fire / Evacuation Hazard)</strong>
                  <div className="hint" style={{ fontSize: 12 }}>
                    Hospital fire warden response and evacuation prep
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: '#ea580c', color: '#fff' }}>
                  Trigger
                </button>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowBroadcastModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================= RECEPTIONIST ========================= */
function ReceptionistDashboard({ navigate }) {
  const rows = [...WAITING_ROOM].sort((a, b) => b.waitMin - a.waitMin);
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="Today's Appointments" value={APPOINTMENTS.length} iconName="calendar" trend="Active" />
        <StatCard label="Waiting in Lobby" value={WAITING_ROOM.length} color="var(--c-warning)" iconName="alert" trend="Priority Queue" />
        <StatCard label="Checked-in" value={24} iconName="check" trend="Normal flow" />
        <StatCard label="New Registrations" value={PATIENTS.length} iconName="patients" trend="Master Directory" />
      </div>
      <QueueCard
        title="Live Waiting Lounge"
        sub="Sorted by wait time — call the top patient next"
        rows={rows.map((w) => ({
          key: w.pid, urgent: w.priority === 'Urgent', title: w.patient, sub: w.doctor + ' · ' + w.dept,
          meta: 'Waiting ' + w.waitMin + ' min · arrived ' + w.arrived, metaTone: w.waitMin > 30 ? 'var(--c-error)' : undefined,
          actionLabel: 'Open Patient', onAction: () => navigate('/patients/' + w.pid),
        }))}
        emptyText="No patients are currently waiting."
      />
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="section-title">Front-Desk Quick Actions</div>
        <div className="quick-actions">
          <button className="qa-btn" onClick={() => navigate('/patients')}><Icon name="plus" /> Register New Patient</button>
          <button className="qa-btn" onClick={() => navigate('/appointments')}><Icon name="calendar" /> Book Appointment</button>
          <button className="qa-btn" onClick={() => navigate('/billing')}><Icon name="billing" /> Generate Invoice</button>
        </div>
      </div>
    </>
  );
}

/* ========================= DOCTOR ========================= */
function DoctorDashboard({ navigate }) {
  const queue = APPOINTMENTS.filter((a) => ['Waiting', 'Checked-in', 'Confirmed'].includes(a.status));
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="Today's Scheduled" value={14} iconName="patients" trend="My Queue" />
        <StatCard label="Waiting to Consult" value={queue.length} color="var(--c-warning)" iconName="alert" trend="Next up" />
        <StatCard label="Completed Today" value={10} color="var(--c-success)" iconName="check" trend="71% Done" />
        <StatCard label="Pending Lab Results" value={LAB_ORDERS.filter((o) => o.status !== 'Verified').length} iconName="lab" trend="Need Review" />
      </div>
      <QueueCard
        title="Patient Consultation Queue"
        sub="Assigned consultations for today in scheduled priority order"
        rows={queue.map((a) => ({
          key: a.id, urgent: ['Urgent', 'High'].includes(a.priority), title: a.patient, sub: a.type + ' · ' + a.time,
          meta: a.status, actionLabel: 'Start Consultation', onAction: () => navigate('/consultation/' + a.pid),
        }))}
        emptyText="No patients waiting — your queue is clear."
      />
    </>
  );
}

/* ========================= NURSE ========================= */
function NurseDashboard({ navigate }) {
  const overdue = NURSING_TASKS.filter((t) => t.state === 'overdue');
  const dueSoon = NURSING_TASKS.filter((t) => t.state === 'due-soon');
  const upcoming = NURSING_TASKS.filter((t) => t.state === 'upcoming');
  const rows = [...overdue, ...dueSoon];
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="Assigned Patients" value={9} iconName="patients" trend="Station A" />
        <StatCard label="Overdue Vitals/Meds" value={overdue.length} color="var(--c-error)" iconName="alert" trend="Immediate" />
        <StatCard label="Tasks Due Soon" value={dueSoon.length} color="var(--c-warning)" iconName="bell" trend="< 30 min" />
        <StatCard label="Upcoming Shift Tasks" value={upcoming.length} iconName="calendar" trend="Next" />
      </div>
      <QueueCard
        title="Nursing Task & Administration Queue"
        sub="Critical and overdue medication/vitals tasks prioritize first"
        rows={rows.map((t) => ({
          key: t.id, urgent: t.state === 'overdue', title: t.patient, sub: t.type + ' — ' + t.detail,
          meta: 'Due ' + t.due, metaTone: t.state === 'overdue' ? 'var(--c-error)' : undefined,
          actionLabel: 'Complete Task', onAction: () => navigate('/patients/' + t.pid),
        }))}
        emptyText="All urgent nursing tasks completed."
      />
      <div style={{ marginTop: 14 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/nursing')}>Go to Nursing Ward Station →</button>
      </div>
    </>
  );
}

/* ========================= LAB TECHNICIAN ========================= */
function LabDashboard({ navigate }) {
  const rows = [...LAB_ORDERS].sort((a) => (a.status === 'Urgent' ? -1 : 1));
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="New Orders" value={5} iconName="lab" trend="Today" />
        <StatCard label="STAT / Urgent" value={LAB_ORDERS.filter((o) => o.status === 'Urgent').length} color="var(--c-error)" iconName="alert" trend="Critical" />
        <StatCard label="Currently Processing" value={LAB_ORDERS.filter((o) => o.status === 'Processing').length} iconName="lab" trend="In Analyzer" />
        <StatCard label="Pending Verification" value={LAB_ORDERS.filter((o) => o.status === 'Result Ready').length} color="var(--c-warning)" iconName="check" trend="Ready for Pathologist" />
      </div>
      <QueueCard
        title="Laboratory Test Orders"
        sub="STAT and urgent bloodwork prioritized at the top"
        rows={rows.map((r) => ({
          key: r.id, urgent: r.status === 'Urgent', title: r.patient, sub: r.test + ' · ordered ' + r.ordered,
          meta: r.status, actionLabel: 'Process Sample', onAction: () => navigate('/laboratory'),
        }))}
        emptyText="No pending laboratory tests."
      />
    </>
  );
}

/* ========================= PHARMACIST ========================= */
function PharmacistDashboard({ navigate }) {
  const alerts = MEDICINES.filter((m) => m.status !== 'In Stock');
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="To Dispense" value={7} iconName="rx" trend="Prescriptions waiting" />
        <StatCard label="Dispensed Today" value={21} color="var(--c-success)" iconName="check" trend="On Track" />
        <StatCard label="Low Stock Items" value={MEDICINES.filter((m) => m.status === 'Low Stock').length} color="var(--c-warning)" iconName="alert" trend="Reorder" />
        <StatCard label="Out of Stock" value={MEDICINES.filter((m) => m.status === 'Out of Stock').length} color="var(--c-error)" iconName="alert" trend="Critical" />
      </div>
      <QueueCard
        title="Prescriptions Pending Dispensation"
        sub="Doctor verified electronic prescriptions ready for dispensing"
        rows={[{
          key: PATIENTS[0].id, title: PATIENTS[0].name, sub: '2 medicines · Losartan 50mg, Metformin 500mg',
          meta: 'Prescribed 09:50 AM', actionLabel: 'Dispense Medicine', onAction: () => navigate('/pharmacy'),
        }]}
        emptyText="No prescriptions waiting in queue."
      />
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="section-title">Critical Inventory Alerts</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Pharmaceutical Item</th><th>Current Stock</th><th>Status</th></tr></thead>
            <tbody>
              {alerts.map((m) => (
                <tr key={m.name} style={{ cursor: 'pointer' }} onClick={() => navigate('/pharmacy')}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{m.stock} {m.unit}</td>
                  <td><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ========================= shared bits ========================= */
function MiniStatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="hint" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>{value}</span>
    </div>
  );
}

function QueueCard({ title, sub, rows, emptyText }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-pad" style={{ paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>
        <div className="section-title" style={{ marginBottom: 2 }}>{title}</div>
        <p className="hint">{sub}</p>
      </div>
      {rows.length === 0 ? (
        <div className="card-pad">
          <p className="hint">{emptyText}</p>
        </div>
      ) : (
        rows.map((r) => (
          <div key={r.key} className={'queue-row ' + (r.urgent ? 'urgent' : '')}>
            <div className="queue-row-main" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={r.title} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                <div className="hint" style={{ marginTop: 2 }}>{r.sub}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="queue-row-meta" style={{ color: r.metaTone || 'var(--c-text-muted)' }}>{r.meta}</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 6 }} onClick={r.onAction}>{r.actionLabel}</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
