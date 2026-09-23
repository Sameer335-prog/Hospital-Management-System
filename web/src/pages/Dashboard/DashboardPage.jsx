import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { APPOINTMENTS, WAITING_ROOM, NURSING_TASKS, LAB_ORDERS, MEDICINES, PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { getSpecialtyConfig, SPECIALTY_ARCHETYPES } from '../../utils/specialtyConfig.js';
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
  const clinic = useClinicProfile();
  const specialty = getSpecialtyConfig(clinic);
  const isDental = specialty?.id === 'dental';
  const isPediatric = specialty?.id === 'pediatric';
  const isEye = specialty?.id === 'ophthalmology';
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
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <strong style={{ fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                HOSPITAL-WIDE CODE ACTIVATED: {activeCodeAlert.code}
              </strong>
              <div style={{ fontSize: 13, opacity: 0.95 }}>
                Location: {activeCodeAlert.location} · Initiated by: {activeCodeAlert.by} ({activeCodeAlert.time})
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: '#ffffff', color: '#b91c1c', fontWeight: 800, border: 'none' }}
            onClick={() => setActiveCodeAlert(null)}
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      {/* Specialty-Aware Header Greeting */}
      <div className="page-header">
        <div>
          <div className="title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              {isDental
                ? '🦷 Dental Clinic Practice OS'
                : isPediatric
                ? '👶 Pediatric & Child Health Center'
                : isEye
                ? '👁️ Eye Hospital & Vision Surgery Center'
                : '🏥 Clinical Operations Command Center'}
            </span>
          </div>
          <div className="sub">
            {today} · {clinic.name || 'Medora Healthcare Complex'} · {specialty.practiceType} Command Center
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()} title="Refresh Data">
            <Icon name="reports" /> Refresh Feed
          </button>
        </div>
      </div>

      {isDental ? (
        <DentalClinicDashboard
          navigate={navigate}
          role={role}
          specialty={specialty}
          clinic={clinic}
        />
      ) : isPediatric ? (
        <PediatricClinicDashboard
          navigate={navigate}
          role={role}
          specialty={specialty}
          clinic={clinic}
        />
      ) : isEye ? (
        <OphthalmologyClinicDashboard
          navigate={navigate}
          role={role}
          specialty={specialty}
          clinic={clinic}
        />
      ) : (
        <>
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
        </>
      )}
    </AppShell>
  );
}

/* ========================= DENTAL CLINIC PRACTICE DASHBOARD ========================= */
const DENTAL_OPERATORY_STREAM = [
  {
    id: 'DENT-101',
    chair: 'Dental Chair 1 · Operatory A',
    patient: 'Tariq Mehmood',
    age: 48,
    gender: 'Male',
    dentist: 'Dr. Ali Raza',
    specialty: 'Endodontics',
    tooth: 'Tooth #14 (Maxillary Right 1st Premolar)',
    procedure: 'Root Canal Therapy (Obturation Phase)',
    fee: 8500,
    timeAgo: 'In-Chair (22 min)',
    status: 'Canal Obturation',
    statusBadge: 'badge-purple',
  },
  {
    id: 'DENT-102',
    chair: 'Dental Chair 2 · Operatory B',
    patient: 'Parveen Akhtar',
    age: 26,
    gender: 'Female',
    dentist: 'Dr. Fatima Noor',
    specialty: 'Orthodontics',
    tooth: 'Upper & Lower Arches',
    procedure: 'Orthodontic Archwire Adjustment & Ligature',
    fee: 5000,
    timeAgo: 'In-Chair (14 min)',
    status: 'Bracket Adjustment',
    statusBadge: 'badge-info',
  },
  {
    id: 'DENT-103',
    chair: 'Dental Chair 3 · Hygiene Bay',
    patient: 'Bilal Qureshi',
    age: 34,
    gender: 'Male',
    dentist: 'Dental Hygienist',
    specialty: 'Prophylaxis',
    tooth: 'Full Mouth Supragingival & Subgingival',
    procedure: 'Ultrasonic Scaling & Airflow Polishing',
    fee: 3500,
    timeAgo: 'Active (8 min)',
    status: 'Polishing Phase',
    statusBadge: 'badge-success',
  },
  {
    id: 'DENT-104',
    chair: 'Dental Chair 4 · Aesthetic Suite',
    patient: 'Sara Ali',
    age: 22,
    gender: 'Female',
    dentist: 'Dr. Ali Raza',
    specialty: 'Restorative',
    tooth: 'Tooth #18 (Maxillary Left 2nd Molar)',
    procedure: 'Light-Cured Composite Aesthetic Restoration',
    fee: 4500,
    timeAgo: 'Next in Queue',
    status: 'Ready in Lounge',
    statusBadge: 'badge-neutral',
  },
];

const DENTAL_OPERATORIES_TELEMETRY = [
  { name: 'Operatory A (Endodontic Chair)', dentist: 'Dr. Ali Raza', procedure: 'Root Canal Therapy (RCT)', utilization: 92, status: 'In Procedure', statusColor: '#10b981' },
  { name: 'Operatory B (Orthodontics)', dentist: 'Dr. Fatima Noor', procedure: 'Braces Adjustment', utilization: 85, status: 'In Procedure', statusColor: '#10b981' },
  { name: 'Hygiene Bay 1 (Prophylaxis)', dentist: 'Dental Hygienist', procedure: 'Ultrasonic Scaling', utilization: 72, status: 'Active', statusColor: '#3b82f6' },
  { name: 'Aesthetic Suite 2', dentist: 'Sanitized & Ready', procedure: 'Ready for Patient', utilization: 40, status: 'Available', statusColor: '#64748b' },
];

const DENTAL_APPOINTMENTS_LIST = [
  { id: 'DAP-01', time: '09:30 AM', token: 'TK-01', patient: 'Tariq Mehmood', pid: 'PT-00109', dentist: 'Dr. Ali Raza', chair: 'Dental Chair 1 · Operatory A', procedure: 'Root Canal Therapy (Tooth #14)', status: 'In Consultation' },
  { id: 'DAP-02', time: '10:00 AM', token: 'TK-02', patient: 'Parveen Akhtar', pid: 'PT-00130', dentist: 'Dr. Fatima Noor', chair: 'Dental Chair 2 · Operatory B', procedure: 'Archwire Adjustment (Braces)', status: 'In Consultation' },
  { id: 'DAP-03', time: '10:30 AM', token: 'TK-03', patient: 'Bilal Qureshi', pid: 'PT-00132', dentist: 'Dental Hygienist', chair: 'Dental Chair 3 · Hygiene Bay', procedure: 'Ultrasonic Scaling & Polishing', status: 'In Consultation' },
  { id: 'DAP-04', time: '11:00 AM', token: 'TK-04', patient: 'Sara Ali', pid: 'PT-00135', dentist: 'Dr. Ali Raza', chair: 'Dental Chair 1 · Operatory A', procedure: 'Composite Filling (Tooth #18)', status: 'Waiting' },
  { id: 'DAP-05', time: '11:30 AM', token: 'TK-05', patient: 'Usman Farooq', pid: 'PT-00140', dentist: 'Dr. Bilal Qureshi', chair: 'Surgical Operatory D', procedure: 'Wisdom Tooth Extraction', status: 'Confirmed' },
];

function DentalClinicDashboard({ navigate, role, specialty, clinic }) {
  const [operatoryStream, setOperatoryStream] = useState(DENTAL_OPERATORY_STREAM);
  const [showToothacheModal, setShowToothacheModal] = useState(false);
  const [toothacheForm, setToothacheForm] = useState({
    name: '',
    phone: '',
    tooth: '14',
    painLevel: '8/10 (Severe Throbbing)',
    complaint: 'Acute pulpitis, cannot chew or sleep',
    chair: 'Dental Chair 1 · Operatory A',
  });

  const handleToothacheSubmit = (e) => {
    e.preventDefault();
    if (!toothacheForm.name.trim()) return;

    const newTriageItem = {
      id: 'DENT-' + Date.now(),
      chair: toothacheForm.chair,
      patient: toothacheForm.name.trim(),
      age: 32,
      gender: 'Walk-in',
      dentist: 'Dr. Ali Raza',
      specialty: 'Endodontics Emergency',
      tooth: `Tooth #${toothacheForm.tooth}`,
      procedure: `Emergency Pulp Exstirpation (${toothacheForm.complaint})`,
      fee: 4000,
      timeAgo: 'Just checked in',
      status: 'Emergency Triage',
      statusBadge: 'badge-error',
    };

    setOperatoryStream([newTriageItem, ...operatoryStream]);
    setShowToothacheModal(false);
    setToothacheForm({
      name: '',
      phone: '',
      tooth: '14',
      painLevel: '8/10 (Severe Throbbing)',
      complaint: 'Acute pulpitis, cannot chew or sleep',
      chair: 'Dental Chair 1 · Operatory A',
    });
  };

  const activeChairsCount = DENTAL_OPERATORIES_TELEMETRY.filter((o) => o.status !== 'Available').length;
  const doctorsList = specialty?.doctors || [];

  return (
    <>
      {/* Dental Top StatCards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Registered Dental Patients"
          value={PATIENTS.length.toLocaleString()}
          iconName="patients"
          trend="+18 dental files this month"
        />
        <StatCard
          label="Dental Chair Utilization"
          value={`${activeChairsCount} / ${DENTAL_OPERATORIES_TELEMETRY.length} Operatories`}
          color="var(--c-primary)"
          iconName="stetho"
          trend="75% active treatment capacity"
        />
        <StatCard
          label="Today's Dental Procedures"
          value="16 Planned"
          color="var(--c-success)"
          iconName="calendar"
          trend="RCT, Scaling, Extractions, Fillings"
        />
        <StatCard
          label="Dental Waiting Lounge"
          value="4 Patients"
          color="var(--c-warning)"
          iconName="staff"
          trend="Real-time chair calls on TV"
        />
      </div>

      {/* Dental Clinical Action Bar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            🦷
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>
              Dental Practice Command Center
            </div>
            <div className="hint" style={{ fontSize: 12 }}>
              Operatory chair management, interactive tooth charting, and emergency walk-in triage
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowToothacheModal(true)}
            style={{ fontWeight: 700 }}
          >
            ⚡ Walk-in Toothache Triage
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/consultation')}
            style={{ fontWeight: 700 }}
          >
            🦷 Open Tooth Chart (Odontogram)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/appointments')}
            style={{ fontWeight: 700 }}
          >
            📅 Chair Schedule
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/display')}
            style={{ fontWeight: 700 }}
          >
            📺 Lobby TV Queue
          </button>
        </div>
      </div>

      {/* Main Dental Split: Live Operatory Stream + Autoclave & Chair Telemetry */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Left: Live Dental Operatory Stream */}
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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Live Dental Operatory & Chair Stream
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Real-time active dental chairs, teeth treated, and procedure phases
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowToothacheModal(true)}>
              + Fast Triage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', flex: 1 }}>
            {operatoryStream.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--c-text-primary)' }}>
                      📍 {t.chair}
                    </span>
                    <span className={'badge ' + t.statusBadge} style={{ fontWeight: 800, fontSize: 11 }}>
                      {t.status}
                    </span>
                  </div>
                  <span className="hint" style={{ fontSize: 11.5 }}>
                    {t.timeAgo}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--c-text-primary)' }}>
                  Patient: <strong>{t.patient}</strong> ({t.age}y) · Dentist: <strong>{t.dentist}</strong> ({t.specialty})
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 600 }}>
                    🦷 {t.tooth} · {t.procedure}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>
                    Rs. {t.fee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operatories & Autoclave Sterilization Telemetry */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span>🏥</span> Operatory Utilization & Hygiene Status
            </div>
            <p className="hint" style={{ fontSize: 12.5, marginBottom: 14 }}>
              Chair workload, turn-around sanitation, and Class-B autoclave cycle log
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DENTAL_OPERATORIES_TELEMETRY.map((op, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--c-surface-hover)', borderRadius: '10px', border: '1px solid var(--c-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{op.name}</strong>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: op.statusColor }}>
                      ● {op.status} ({op.utilization}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 6 }}>
                    Practitioner: {op.dentist} · Case: {op.procedure}
                  </div>
                  <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${op.utilization}%`, background: op.statusColor, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autoclave Instrument Sterilization Log */}
          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 12.5, color: '#047857' }}>
                🧼 Autoclave Sterilization Compliance: PASS
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: 4 }}>
                Class-B 134°C
              </span>
            </div>
            <p className="hint" style={{ fontSize: 11.5, margin: 0, color: '#065f46' }}>
              Cycle #3 completed at 09:15 AM (2.1 Bar vacuum). 100% of dental handpieces, burs, and extraction forceps sterile and pouch-sealed.
            </p>
          </div>
        </div>
      </div>

      {/* Second Row: Dental Practitioners & Today's Schedule */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* On-Duty Dental Specialists */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Icon name="staff" /> On-Duty Dental Specialists
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Active dental surgeons, orthodontists, and operatory assignments
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
              Schedules →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {doctorsList.map((doc) => (
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
                      {doc.specialty || doc.dept} · 📍 {doc.room}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ fontWeight: 700, fontSize: 11 }}>
                    Active
                  </span>
                  <div className="hint" style={{ fontSize: 11.5, marginTop: 4 }}>
                    Fee: Rs. {doc.fee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Dental Procedures Breakdown */}
        <div className="card card-pad">
          <div className="section-title" style={{ marginBottom: 4 }}>
            Today's Dental Procedures Catalog Breakdown
          </div>
          <p className="hint" style={{ fontSize: 12.5, marginBottom: 14 }}>
            Real-time procedure volume across specialties
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MiniStatRow label="Endodontics & Root Canal Therapy" value="5 Cases Planned" />
            <MiniStatRow label="Composite Aesthetic Restorations" value="8 Teeth Scheduled" />
            <MiniStatRow label="Ultrasonic Prophylaxis (Scaling)" value="6 Cleanings" />
            <MiniStatRow label="Orthodontic Wire & Bracket Tuning" value="4 Active Patients" />
            <MiniStatRow label="Oral Surgery & Extractions" value="2 Impacted Wisdom Teeth" />
          </div>

          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--c-bg-subtle, #f8fafc)',
              border: '1px solid var(--c-border)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              Dental Radiology & Infection Control Note
            </div>
            <p className="hint" style={{ fontSize: 12, margin: 0 }}>
              Digital intraoral X-ray sensors calibrated at 0.08s exposure. Disposable barrier sleeves mandatory between patients.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Dental Visits Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16 }}>Today's Scheduled Dental Appointments</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
          View all in Chair Schedule →
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Time</th>
                <th>Token</th>
                <th>Patient</th>
                <th>Dentist</th>
                <th>Operatory / Chair</th>
                <th>Planned Treatment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DENTAL_APPOINTMENTS_LIST.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.time}</td>
                  <td>
                    <span style={{ padding: '2px 6px', background: '#0284c7', color: '#fff', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                      {a.token}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.patient} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient}</div>
                        <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{a.pid}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.dentist}</td>
                  <td style={{ color: 'var(--c-primary)', fontWeight: 600 }}>{a.chair}</td>
                  <td style={{ fontWeight: 500 }}>{a.procedure}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/consultation')}>
                      Open Odontogram
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: EMERGENCY TOOTHACHE INTAKE ================= */}
      {showToothacheModal && (
        <div className="overlay" onClick={() => setShowToothacheModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Walk-in Dental Emergency & Toothache Triage</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowToothacheModal(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleToothacheSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="label">Patient Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={toothacheForm.name}
                      onChange={(e) => setToothacheForm({ ...toothacheForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Contact Number</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="0300-1234567"
                      value={toothacheForm.phone}
                      onChange={(e) => setToothacheForm({ ...toothacheForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="label">Involved Tooth # (1 to 32)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Tooth #14 or Lower Left Molar"
                      value={toothacheForm.tooth}
                      onChange={(e) => setToothacheForm({ ...toothacheForm, tooth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Pain Severity Level</label>
                    <select
                      className="input select"
                      value={toothacheForm.painLevel}
                      onChange={(e) => setToothacheForm({ ...toothacheForm, painLevel: e.target.value })}
                    >
                      <option>9/10 (Acute Unbearable Pulpitis)</option>
                      <option>8/10 (Severe Throbbing Night Pain)</option>
                      <option>6/10 (Moderate Sensitivity to Cold/Sweet)</option>
                      <option>Dental Trauma / Knocked-out Tooth</option>
                      <option>Broken Crown / Sharp Edge</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Assign Immediate Dental Chair</label>
                  <select
                    className="input select"
                    value={toothacheForm.chair}
                    onChange={(e) => setToothacheForm({ ...toothacheForm, chair: e.target.value })}
                  >
                    <option>Dental Chair 1 · Operatory A (Dr. Ali Raza)</option>
                    <option>Dental Chair 2 · Operatory B (Dr. Fatima Noor)</option>
                    <option>Dental Chair 3 · Hygiene Bay</option>
                    <option>Surgical Operatory D (Dr. Bilal Qureshi)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Clinical Symptoms & Patient Complaint</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Severe spontaneous throbbing pain radiating to ear. Cold sensitivity."
                    value={toothacheForm.complaint}
                    onChange={(e) => setToothacheForm({ ...toothacheForm, complaint: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowToothacheModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  ⚡ Register to Chair Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================= PEDIATRIC CLINIC DASHBOARD ========================= */
const PEDIATRIC_BAYS_STREAM = [
  {
    id: 'PED-101',
    bay: 'Yellow Bay · Examination Suite 1',
    patient: 'Baby Zain (8m)',
    age: '8 Months',
    weight: '8.4 kg',
    pediatrician: 'Dr. Hamza Tariq',
    specialty: 'Immunization & EPI',
    procedure: '9-Month Measles-1 + Vitamin A Drops',
    fee: 1500,
    timeAgo: 'In-Bay (12 min)',
    status: 'Vaccine Administered',
    statusBadge: 'badge-success',
  },
  {
    id: 'PED-102',
    bay: 'Blue Bay · Immunization Suite',
    patient: 'Fatima Zahra (4y)',
    age: '4 Years',
    weight: '16.2 kg',
    pediatrician: 'Dr. Ayesha Malik',
    specialty: 'Pediatric Pulmonology',
    procedure: 'Salbutamol Nebulization & Chest Auscultation',
    fee: 2500,
    timeAgo: 'In-Bay (8 min)',
    status: 'Nebulization Active',
    statusBadge: 'badge-purple',
  },
  {
    id: 'PED-103',
    bay: 'Well-Baby Nursery Bay',
    patient: 'Ibrahim Khan (18m)',
    age: '18 Months',
    weight: '11.5 kg',
    pediatrician: 'Dr. Ayesha Malik',
    specialty: 'Growth & Milestones',
    procedure: 'WHO Growth Percentile & Developmental Screen',
    fee: 2500,
    timeAgo: 'Active (4 min)',
    status: 'Milestone Assessment',
    statusBadge: 'badge-info',
  },
  {
    id: 'PED-104',
    bay: 'Fast-Track Triage Bay 4',
    patient: 'Ayaan Ahmed (2y)',
    age: '2 Years',
    weight: '12.8 kg',
    pediatrician: 'Dr. Hamza Tariq',
    specialty: 'Preventive Pediatrics',
    procedure: 'PCV Booster & Oral Polio Vaccine (OPV)',
    fee: 6500,
    timeAgo: 'Next in Queue',
    status: 'Ready in Play Zone',
    statusBadge: 'badge-neutral',
  },
];

const PEDIATRIC_VACCINE_COLDCHAIN = [
  { name: 'WHO Cold-Chain Refrigerator 1', temp: '4.2°C', target: '2°C – 8°C', status: 'Optimal', compliance: 100, color: '#10b981' },
  { name: 'EPI Vaccine Solar Direct Drive (SDD)', temp: '3.8°C', target: '2°C – 8°C', status: 'Optimal', compliance: 99, color: '#10b981' },
  { name: 'Cold Box Transport Carrier', temp: '5.1°C', target: '2°C – 8°C', status: 'In Range', compliance: 95, color: '#3b82f6' },
  { name: 'Secondary Diluent Storage', temp: '6.4°C', target: '2°C – 8°C', status: 'Safe', compliance: 92, color: '#10b981' },
];

const PEDIATRIC_APPOINTMENTS_LIST = [
  { id: 'PAP-01', time: '09:30 AM', token: 'TK-01', patient: 'Baby Zain (8m)', pid: 'PT-00140', doctor: 'Dr. Hamza Tariq', bay: 'Immunization Suite (Blue Bay)', procedure: 'Routine EPI Vaccination (Measles-1)', status: 'In Consultation' },
  { id: 'PAP-02', time: '10:00 AM', token: 'TK-02', patient: 'Fatima Zahra (4y)', pid: 'PT-00141', doctor: 'Dr. Ayesha Malik', bay: 'Consultation Room 1 (Yellow Bay)', procedure: 'Acute Pyrexia & Chest Nebulization', status: 'Waiting' },
  { id: 'PAP-03', time: '10:30 AM', token: 'TK-03', patient: 'Ibrahim Khan (18m)', pid: 'PT-00142', doctor: 'Dr. Ayesha Malik', bay: 'Consultation Room 1 (Yellow Bay)', procedure: 'Well-Child Growth Percentile Check', status: 'Checked-in' },
  { id: 'PAP-04', time: '11:00 AM', token: 'TK-04', patient: 'Ayaan Ahmed (2y)', pid: 'PT-00143', doctor: 'Dr. Hamza Tariq', bay: 'Immunization Suite (Blue Bay)', procedure: 'Pneumococcal (PCV) Booster', status: 'Waiting' },
  { id: 'PAP-05', time: '11:30 AM', token: 'TK-05', patient: 'Maryam Bibi (6m)', pid: 'PT-00144', doctor: 'Dr. Ayesha Malik', bay: 'Well-Baby Nursery', procedure: 'Weaning & Infant Nutrition Advice', status: 'Confirmed' },
];

function PediatricClinicDashboard({ navigate, role, specialty, clinic }) {
  const [baysStream, setBaysStream] = useState(PEDIATRIC_BAYS_STREAM);
  const [showChildTriageModal, setShowChildTriageModal] = useState(false);
  const [childTriageForm, setChildTriageForm] = useState({
    name: '',
    parentName: '',
    phone: '',
    age: '2 Years',
    weight: '12 kg',
    temperature: '102.4°F',
    complaint: 'High fever, croup cough & refusing liquids',
    bay: 'Yellow Bay · Examination Suite 1',
  });

  const handleChildTriageSubmit = (e) => {
    e.preventDefault();
    if (!childTriageForm.name.trim()) return;

    const newTriageItem = {
      id: 'PED-' + Date.now(),
      bay: childTriageForm.bay,
      patient: `${childTriageForm.name.trim()} (${childTriageForm.age})`,
      age: childTriageForm.age,
      weight: childTriageForm.weight,
      pediatrician: 'Dr. Ayesha Malik',
      specialty: 'Pediatric Fast-Track',
      procedure: `Urgent Evaluation (Temp: ${childTriageForm.temperature})`,
      fee: 2500,
      timeAgo: 'Just checked in',
      status: 'STAT Pediatric Triage',
      statusBadge: 'badge-error',
    };

    setBaysStream([newTriageItem, ...baysStream]);
    setShowChildTriageModal(false);
  };

  const doctorsList = specialty?.doctors || [];

  return (
    <>
      {/* Pediatric Top StatCards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Registered Pediatric Patients"
          value={PATIENTS.length.toLocaleString()}
          iconName="patients"
          trend="+14 baby health cards this month"
        />
        <StatCard
          label="Vaccine Cold-Chain (WHO)"
          value="4.2°C Optimal"
          color="var(--c-success)"
          iconName="stetho"
          trend="2°C – 8°C Continuous Log Active"
        />
        <StatCard
          label="Baby Clinic Schedule"
          value="14 Planned"
          color="var(--c-primary)"
          iconName="calendar"
          trend="EPI Vaccines & Growth Tracking"
        />
        <StatCard
          label="Kids Play & Waiting Zone"
          value="4 Patients"
          color="var(--c-warning)"
          iconName="staff"
          trend="Real-time bay calling on LCD"
        />
      </div>

      {/* Pediatric Action Bar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1.5px solid rgba(236, 72, 153, 0.3)',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              backgroundColor: '#ec4899',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            👶
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>
              Pediatric & Child Health Command Center
            </div>
            <div className="hint" style={{ fontSize: 12 }}>
              WHO vaccine cold-chain telemetry, well-child growth charts, and urgent fever fast-track
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowChildTriageModal(true)}
            style={{ fontWeight: 700, background: '#ec4899', borderColor: '#ec4899' }}
          >
            ⚡ Fast-Track Child Triage
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/consultation')}
            style={{ fontWeight: 700 }}
          >
            🍼 Growth & Milestones
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/appointments')}
            style={{ fontWeight: 700 }}
          >
            📅 Baby Clinic Schedule
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/display')}
            style={{ fontWeight: 700 }}
          >
            📺 Play Zone TV Queue
          </button>
        </div>
      </div>

      {/* Main Pediatric Split: Live Bays Stream + WHO Vaccine Cold-Chain */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Left: Live Pediatric Bays Stream */}
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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ec4899', display: 'inline-block' }} />
                Live Pediatric Examination Bays Stream
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Real-time active examination bays, weight, and vaccine schedules
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowChildTriageModal(true)}>
              + Fast Triage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', flex: 1 }}>
            {baysStream.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--c-text-primary)' }}>
                      📍 {t.bay}
                    </span>
                    <span className={'badge ' + t.statusBadge} style={{ fontWeight: 800, fontSize: 11 }}>
                      {t.status}
                    </span>
                  </div>
                  <span className="hint" style={{ fontSize: 11.5 }}>
                    {t.timeAgo}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--c-text-primary)' }}>
                  Patient: <strong>{t.patient}</strong> (Weight: {t.weight}) · Pediatrician: <strong>{t.pediatrician}</strong> ({t.specialty})
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 600 }}>
                    💉 {t.procedure}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>
                    Rs. {t.fee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: WHO Vaccine Cold-Chain Telemetry */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span>❄️</span> WHO Vaccine Cold-Chain Telemetry Log
            </div>
            <p className="hint" style={{ fontSize: 12.5, marginBottom: 14 }}>
              Continuous real-time temperature verification for EPI, Pentavalent, PCV, and Polio stocks
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PEDIATRIC_VACCINE_COLDCHAIN.map((cc, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--c-surface-hover)', borderRadius: '10px', border: '1px solid var(--c-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{cc.name}</strong>
                    <span style={{ fontSize: 12, fontWeight: 800, color: cc.color }}>
                      ● {cc.temp} ({cc.status})
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 6 }}>
                    WHO Target: {cc.target} · Compliance: {cc.compliance}%
                  </div>
                  <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cc.compliance}%`, background: cc.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 12.5, color: '#047857' }}>
                🛡️ Vaccine Potency & Temperature Integrity: VERIFIED
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: 4 }}>
                4.2°C Safe
              </span>
            </div>
            <p className="hint" style={{ fontSize: 11.5, margin: 0, color: '#065f46' }}>
              Zero freeze/heat excursions recorded in past 30 days. Backup solar inverter fully charged (100%).
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Pediatric Appointments Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16 }}>Today's Scheduled Pediatric Visits</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
          View all in Baby Clinic Schedule →
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Time</th>
                <th>Token</th>
                <th>Child Patient</th>
                <th>Pediatrician</th>
                <th>Examination Bay</th>
                <th>Clinical Visit / Immunization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PEDIATRIC_APPOINTMENTS_LIST.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.time}</td>
                  <td>
                    <span style={{ padding: '2px 6px', background: '#ec4899', color: '#fff', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                      {a.token}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.patient} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient}</div>
                        <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{a.pid}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.doctor}</td>
                  <td style={{ color: 'var(--c-primary)', fontWeight: 600 }}>{a.bay}</td>
                  <td style={{ fontWeight: 500 }}>{a.procedure}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/consultation')}>
                      Open Growth Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FAST-TRACK CHILD TRIAGE */}
      {showChildTriageModal && (
        <div className="modal-overlay" onClick={() => setShowChildTriageModal(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Fast-Track Urgent Pediatric Intake</h3>
                  <p className="hint" style={{ margin: 0, fontSize: 12 }}>
                    Immediate triage for high fever, febrile convulsion, or acute respiratory distress
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowChildTriageModal(false)}>✕</button>
            </div>

            <form onSubmit={handleChildTriageSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Child Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Baby Hamza"
                      value={childTriageForm.name}
                      onChange={(e) => setChildTriageForm({ ...childTriageForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Parent / Guardian Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Muhammad Asif"
                      value={childTriageForm.parentName}
                      onChange={(e) => setChildTriageForm({ ...childTriageForm, parentName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Child Age</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 14 Months"
                      value={childTriageForm.age}
                      onChange={(e) => setChildTriageForm({ ...childTriageForm, age: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Current Weight</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 9.8 kg"
                      value={childTriageForm.weight}
                      onChange={(e) => setChildTriageForm({ ...childTriageForm, weight: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Body Temp (°F)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 103.2°F"
                      value={childTriageForm.temperature}
                      onChange={(e) => setChildTriageForm({ ...childTriageForm, temperature: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Assign Examination Bay</label>
                  <select
                    className="input select"
                    value={childTriageForm.bay}
                    onChange={(e) => setChildTriageForm({ ...childTriageForm, bay: e.target.value })}
                  >
                    <option>Yellow Bay · Examination Suite 1 (Dr. Ayesha Malik)</option>
                    <option>Blue Bay · Immunization Suite (Dr. Hamza Tariq)</option>
                    <option>Well-Baby Nursery Bay</option>
                    <option>Fast-Track Triage Bay 4</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Clinical Symptoms & Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Inconsolable crying, vomiting after feeds, mild chest indrawing"
                    value={childTriageForm.complaint}
                    onChange={(e) => setChildTriageForm({ ...childTriageForm, complaint: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowChildTriageModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, background: '#ec4899', borderColor: '#ec4899' }}>
                  ⚡ Register to Bay Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================= OPHTHALMOLOGY / EYE CLINIC DASHBOARD ========================= */
const OPHTHALMOLOGY_LANES_STREAM = [
  {
    id: 'OPH-101',
    lane: 'Refraction Lane 1',
    patient: 'Haji Bashir (67y)',
    acuityOD: '6/36 (20/120)',
    acuityOS: '6/18 (20/60)',
    iop: '16 mmHg OU',
    surgeon: 'Prof. Dr. Tariq Mehmood',
    specialty: 'Cataract & Anterior Segment',
    procedure: 'Pre-Op Biometry & Phacoemulsification Plan',
    fee: 3000,
    timeAgo: 'In-Lane (16 min)',
    status: 'Slit-Lamp Dilated Exam',
    statusBadge: 'badge-purple',
  },
  {
    id: 'OPH-102',
    lane: 'Refraction Bay 2',
    patient: 'Zoya Rehan (24y)',
    acuityOD: '6/60 (Uncorrected)',
    acuityOS: '6/36 (Uncorrected)',
    iop: '14 mmHg OU',
    surgeon: 'Dr. Zainab Hashmi',
    specialty: 'Refractive Surgery / LASIK',
    procedure: 'Corneal Topography & Pachymetry Mapping',
    fee: 2000,
    timeAgo: 'In-Lane (10 min)',
    status: 'Autorefraction & Retinoscopy',
    statusBadge: 'badge-info',
  },
  {
    id: 'OPH-103',
    lane: 'Perimetry & Visual Fields Suite',
    patient: 'Khurram Shehzad (49y)',
    acuityOD: '6/9',
    acuityOS: '6/12',
    iop: '26 mmHg OS (High)',
    surgeon: 'Prof. Dr. Tariq Mehmood',
    specialty: 'Glaucoma Management',
    procedure: 'Goldmann Applanation Tonometry & Humphrey Field',
    fee: 3000,
    timeAgo: 'Active (6 min)',
    status: 'IOP Titration / Drops',
    statusBadge: 'badge-error',
  },
  {
    id: 'OPH-104',
    lane: 'Diagnostic Imaging / OCT Suite',
    patient: 'Sadia Qasim (35y)',
    acuityOD: '6/6',
    acuityOS: '6/6',
    iop: '15 mmHg OU',
    surgeon: 'Dr. Zainab Hashmi',
    specialty: 'Retina & Macular Care',
    procedure: 'Macular OCT & Diabetic Retinopathy Screen',
    fee: 2500,
    timeAgo: 'Next in Queue',
    status: 'Pupil Dilating (15m)',
    statusBadge: 'badge-neutral',
  },
];

const OPHTHALMIC_SURGICAL_TELEMETRY = [
  { name: 'Phacoemulsification Cataract OT Suite', surgeon: 'Prof. Dr. Tariq Mehmood', case: 'Alcon Centurion Active', utilization: 88, status: 'Sterile & In Use', color: '#10b981' },
  { name: 'Femtosecond Laser Vision Suite (LASIK)', surgeon: 'Corneal Specialist', case: 'Custom Wavefront Ready', utilization: 75, status: 'Calibrated', color: '#3b82f6' },
  { name: 'YAG Laser Capsulotomy Chamber', surgeon: 'Dr. Zainab Hashmi', case: 'Post-Cataract Capsulotomy', utilization: 60, status: 'Active', color: '#10b981' },
  { name: 'Spectral Domain OCT Scanner', surgeon: 'Retinal Diagnostics', case: '512x128 Macular Cube', utilization: 82, status: 'Online', color: '#10b981' },
];

const OPHTHALMIC_APPOINTMENTS_LIST = [
  { id: 'OAP-01', time: '09:30 AM', token: 'TK-01', patient: 'Haji Bashir (67y)', pid: 'PT-00150', surgeon: 'Prof. Dr. Tariq Mehmood', lane: 'Exam Lane 1', procedure: 'Pre-Op Cataract Workup', status: 'In Consultation' },
  { id: 'OAP-02', time: '10:00 AM', token: 'TK-02', patient: 'Zoya Rehan (24y)', pid: 'PT-00151', surgeon: 'Dr. Zainab Hashmi', lane: 'Refraction Bay 2', procedure: 'Laser Vision / LASIK Screening', status: 'Waiting' },
  { id: 'OAP-03', time: '10:30 AM', token: 'TK-03', patient: 'Khurram Shehzad (49y)', pid: 'PT-00152', surgeon: 'Prof. Dr. Tariq Mehmood', lane: 'Perimetry Room', procedure: 'Glaucoma Tonometry & Visual Fields', status: 'Checked-in' },
  { id: 'OAP-04', time: '11:00 AM', token: 'TK-04', patient: 'Sadia Qasim (35y)', pid: 'PT-00153', surgeon: 'Dr. Zainab Hashmi', lane: 'Exam Lane 1', procedure: 'Diabetic Retinopathy Fundus Screen', status: 'Waiting' },
  { id: 'OAP-05', time: '11:30 AM', token: 'TK-05', patient: 'Hamza Waseem (11y)', pid: 'PT-00154', surgeon: 'Dr. Zainab Hashmi', lane: 'Refraction Bay 2', procedure: 'Pediatric Cycloplegic Refraction', status: 'Confirmed' },
];

function OphthalmologyClinicDashboard({ navigate, role, specialty, clinic }) {
  const [lanesStream, setLanesStream] = useState(OPHTHALMOLOGY_LANES_STREAM);
  const [showEyeTriageModal, setShowEyeTriageModal] = useState(false);
  const [eyeTriageForm, setEyeTriageForm] = useState({
    name: '',
    phone: '',
    acuity: 'Hand Motion',
    iop: '35 mmHg',
    emergencyType: 'Chemical Burn / Splash (Acid/Alkali)',
    lane: 'Refraction Lane 1',
    notes: 'Direct alkali splash to right eye 20 mins ago, irrigation started',
  });

  const handleEyeTriageSubmit = (e) => {
    e.preventDefault();
    if (!eyeTriageForm.name.trim()) return;

    const newTriageItem = {
      id: 'OPH-' + Date.now(),
      lane: eyeTriageForm.lane,
      patient: eyeTriageForm.name.trim(),
      acuityOD: eyeTriageForm.acuity,
      acuityOS: '6/6',
      iop: eyeTriageForm.iop,
      surgeon: 'Prof. Dr. Tariq Mehmood',
      specialty: 'Ocular Trauma Specialist',
      procedure: `Emergency Flush & Exam (${eyeTriageForm.emergencyType})`,
      fee: 3000,
      timeAgo: 'Just checked in',
      status: 'STAT Ocular Emergency',
      statusBadge: 'badge-error',
    };

    setLanesStream([newTriageItem, ...lanesStream]);
    setShowEyeTriageModal(false);
  };

  return (
    <>
      {/* Eye Clinic Top StatCards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Registered Eye Patients"
          value={PATIENTS.length.toLocaleString()}
          iconName="patients"
          trend="+22 vision charts this month"
        />
        <StatCard
          label="Refraction Lanes Active"
          value="3 / 4 Exam Lanes"
          color="var(--c-primary)"
          iconName="stetho"
          trend="75% examination capacity"
        />
        <StatCard
          label="Today's Ocular Procedures"
          value="12 Planned"
          color="var(--c-success)"
          iconName="calendar"
          trend="Phaco, LASIK, YAG Laser, OCT"
        />
        <StatCard
          label="Vision Lounge Queue"
          value="4 Patients"
          color="var(--c-warning)"
          iconName="staff"
          trend="Real-time lane routing on TV"
        />
      </div>

      {/* Eye Clinic Action Bar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1.5px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              backgroundColor: '#0891b2',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            👁️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>
              Ophthalmology & Laser Vision Command Center
            </div>
            <div className="hint" style={{ fontSize: 12 }}>
              Slit-lamp exam routing, visual acuity monitoring, and cataract/LASIK surgical pipeline
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowEyeTriageModal(true)}
            style={{ fontWeight: 700, background: '#0891b2', borderColor: '#0891b2' }}
          >
            ⚡ Acute Ocular Triage
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/consultation')}
            style={{ fontWeight: 700 }}
          >
            🔬 Slit-Lamp & Refraction Bay
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/appointments')}
            style={{ fontWeight: 700 }}
          >
            📅 Vision Schedule
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/display')}
            style={{ fontWeight: 700 }}
          >
            📺 Vision TV Queue
          </button>
        </div>
      </div>

      {/* Main Eye Split: Live Refraction Lanes Stream + Surgical Pipeline */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Left: Live Refraction Examination Lanes */}
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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891b2', display: 'inline-block' }} />
                Live Examination Lanes & Refraction Stream
              </div>
              <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                Active lanes, visual acuity measurements (OD/OS), and intraocular pressures
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEyeTriageModal(true)}>
              + Fast Triage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', flex: 1 }}>
            {lanesStream.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--c-text-primary)' }}>
                      📍 {t.lane}
                    </span>
                    <span className={'badge ' + t.statusBadge} style={{ fontWeight: 800, fontSize: 11 }}>
                      {t.status}
                    </span>
                  </div>
                  <span className="hint" style={{ fontSize: 11.5 }}>
                    {t.timeAgo}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--c-text-primary)' }}>
                  Patient: <strong>{t.patient}</strong> · Eye Surgeon: <strong>{t.surgeon}</strong> ({t.specialty})
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 600 }}>
                    👁️ Acuity: OD {t.acuityOD} | OS {t.acuityOS} · IOP: {t.iop} · {t.procedure}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>
                    Rs. {t.fee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ophthalmic Surgical Suite & Laser Telemetry */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span>🏥</span> Ophthalmic Surgical Suite & Laser Telemetry
            </div>
            <p className="hint" style={{ fontSize: 12.5, marginBottom: 14 }}>
              Cataract phacoemulsification, femtosecond laser refractive suite, and YAG capsulotomy logs
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {OPHTHALMIC_SURGICAL_TELEMETRY.map((ot, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--c-surface-hover)', borderRadius: '10px', border: '1px solid var(--c-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{ot.name}</strong>
                    <span style={{ fontSize: 12, fontWeight: 800, color: ot.color }}>
                      ● {ot.status} ({ot.utilization}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 6 }}>
                    Surgeon: {ot.surgeon} · Protocol: {ot.case}
                  </div>
                  <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ot.utilization}%`, background: ot.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(8, 145, 178, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 12.5, color: '#0e7490' }}>
                🔬 Laser Calibration & Sterilization: CERTIFIED
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 6px', borderRadius: 4 }}>
                Ready for Surgery
              </span>
            </div>
            <p className="hint" style={{ fontSize: 11.5, margin: 0, color: '#155e75' }}>
              Excimer laser energy fluence check: PASS. Micro-instruments pouch-autoclaved for today's cataract list.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Vision Appointments Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16 }}>Today's Scheduled Eye Clinic Appointments</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>
          View all in Vision Schedule →
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Time</th>
                <th>Token</th>
                <th>Patient</th>
                <th>Eye Surgeon / Optometrist</th>
                <th>Exam Lane</th>
                <th>Ocular Procedure / Check</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {OPHTHALMIC_APPOINTMENTS_LIST.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{a.time}</td>
                  <td>
                    <span style={{ padding: '2px 6px', background: '#0891b2', color: '#fff', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                      {a.token}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.patient} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.patient}</div>
                        <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{a.pid}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.surgeon}</td>
                  <td style={{ color: 'var(--c-primary)', fontWeight: 600 }}>{a.lane}</td>
                  <td style={{ fontWeight: 500 }}>{a.procedure}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/consultation')}>
                      Open Slit-Lamp Exam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ACUTE OCULAR TRIAGE */}
      {showEyeTriageModal && (
        <div className="modal-overlay" onClick={() => setShowEyeTriageModal(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Acute Ocular Trauma & Emergency Intake</h3>
                  <p className="hint" style={{ margin: 0, fontSize: 12 }}>
                    Priority routing for chemical burns, penetrating foreign bodies, or sudden vision loss
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowEyeTriageModal(false)}>✕</button>
            </div>

            <form onSubmit={handleEyeTriageSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Patient Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Asim Raza"
                      value={eyeTriageForm.name}
                      onChange={(e) => setEyeTriageForm({ ...eyeTriageForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Phone / WhatsApp</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="0300-1234567"
                      value={eyeTriageForm.phone}
                      onChange={(e) => setEyeTriageForm({ ...eyeTriageForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Emergency Condition Category</label>
                    <select
                      className="input select"
                      value={eyeTriageForm.emergencyType}
                      onChange={(e) => setEyeTriageForm({ ...eyeTriageForm, emergencyType: e.target.value })}
                    >
                      <option>Chemical Burn / Acid / Alkali Splash</option>
                      <option>Sudden Painless Loss of Vision</option>
                      <option>Acute Angle-Closure Glaucoma (High IOP)</option>
                      <option>Corneal Foreign Body / Metal Shaving</option>
                      <option>Blunt Ocular Contusion / Hyphema</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Assign Immediate Exam Lane</label>
                    <select
                      className="input select"
                      value={eyeTriageForm.lane}
                      onChange={(e) => setEyeTriageForm({ ...eyeTriageForm, lane: e.target.value })}
                    >
                      <option>Refraction Lane 1 (Prof. Dr. Tariq Mehmood)</option>
                      <option>Refraction Bay 2 (Dr. Zainab Hashmi)</option>
                      <option>Perimetry & Visual Fields Suite</option>
                      <option>Diagnostic Imaging / OCT Suite</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Incident Notes & Initial Irrigation</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Copious saline flush initiated for 15 minutes. Severe photophobia."
                    value={eyeTriageForm.notes}
                    onChange={(e) => setEyeTriageForm({ ...eyeTriageForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEyeTriageModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, background: '#0891b2', borderColor: '#0891b2' }}>
                  ⚡ Register to Eye Lane Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
