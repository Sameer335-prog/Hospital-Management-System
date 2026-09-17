import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { getPatientById, PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';

const VITAL_FIELDS = [
  { key: 'bp', label: 'Blood Pressure', placeholder: '120/80' },
  { key: 'temp', label: 'Temperature', placeholder: '37.1°C' },
  { key: 'pulse', label: 'Pulse', placeholder: '78 bpm' },
  { key: 'spo2', label: 'SpO2', placeholder: '98%' },
  { key: 'respRate', label: 'Respiratory Rate', placeholder: '16' },
  { key: 'weight', label: 'Weight', placeholder: '65 kg' },
];

export default function ConsultationPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // Active Patient in Consultation Chair (defaults to URL param or first waiting patient)
  const [activePatientId, setActivePatientId] = useState(patientId || PATIENTS[0]?.id || 'PT-00125');
  const [rxModalOpen, setRxModalOpen] = useState(false);

  // Sync if URL param changes
  useEffect(() => {
    if (patientId) {
      setActivePatientId(patientId);
    }
  }, [patientId]);

  const patient = getPatientById(activePatientId) || PATIENTS[0];

  const doctorObj = DOCTORS.find((d) => d.name === patient?.doctor) || DOCTORS[0];

  // Clinical Consultation State (pre-populated with realistic findings)
  const [chiefComplaint, setChiefComplaint] = useState(
    'Intermittent palpitations and mild shortness of breath during exertion'
  );
  const [examination, setExamination] = useState(
    'S1 S2 present, no murmurs. Lungs clear to percussion and auscultation bilaterally. No pedal edema.'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient advised to maintain salt-restricted diet, daily BP log, and avoid strenuous unmonitored exercise.'
  );
  const [vitals, setVitals] = useState({
    bp: '130/85',
    temp: '98.4°F',
    pulse: '76 bpm',
    spo2: '99%',
    respRate: '16',
    weight: '68 kg',
  });
  const [diagnoses, setDiagnoses] = useState(['Essential Hypertension (I10)', 'Sinus Tachycardia']);
  const [diagnosisDraft, setDiagnosisDraft] = useState('');
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      medicine: 'Losartan 50mg',
      dose: '1 Tablet',
      frequency: 'Once Daily (Morning)',
      duration: '30 Days',
      instructions: 'After breakfast with water',
    },
    {
      id: 2,
      medicine: 'Panadol 500mg',
      dose: '1 Tablet',
      frequency: 'SOS (As needed)',
      duration: '5 Days',
      instructions: 'Max 3 tablets daily for headache',
    },
  ]);
  const [labOrders, setLabOrders] = useState([
    { id: 1, test: 'Complete Blood Count (CBC)', priority: 'Normal' },
    { id: 2, test: 'Serum Lipid Profile', priority: 'Normal' },
  ]);
  const [followUpDate, setFollowUpDate] = useState('2026-09-28');
  const [followUpNotes, setFollowUpNotes] = useState('Review with home blood pressure monitoring record.');

  const hasAllergy = Boolean(patient?.allergy && patient.allergy !== 'None recorded');

  // Synchronize clinical record per active patient
  useEffect(() => {
    const p = getPatientById(activePatientId);
    if (!p) return;
    if (p.id === 'PT-00125') {
      setChiefComplaint('Intermittent palpitations and mild shortness of breath during exertion');
      setExamination('S1 S2 present, no murmurs. Lungs clear to percussion and auscultation bilaterally. No pedal edema.');
      setClinicalNotes('Patient advised to maintain salt-restricted diet, daily BP log, and avoid strenuous unmonitored exercise.');
      setVitals({ bp: '130/85', temp: '98.4°F', pulse: '76 bpm', spo2: '99%', respRate: '16', weight: '68 kg' });
      setDiagnoses(['Essential Hypertension (I10)', 'Sinus Tachycardia']);
      setMedicines([
        { id: 1, medicine: 'Losartan 50mg', dose: '1 Tablet', frequency: 'Once Daily (Morning)', duration: '30 Days', instructions: 'After breakfast with water' },
        { id: 2, medicine: 'Panadol 500mg', dose: '1 Tablet', frequency: 'SOS (As needed)', duration: '5 Days', instructions: 'Max 3 tablets daily for headache' },
      ]);
    } else if (p.id === 'PT-00126') {
      setChiefComplaint('Routine 2nd trimester ultrasound review and prenatal check');
      setExamination('Fetal heart rate 144 bpm, normal fundal height for gestational age. Normotensive.');
      setClinicalNotes('Prescribed pregnancy multivitamin and iron supplementation. Schedule anomaly scan in 4 weeks.');
      setVitals({ bp: '110/72', temp: '98.6°F', pulse: '82 bpm', spo2: '99%', respRate: '18', weight: '62 kg' });
      setDiagnoses(['Normal Pregnancy 20 Weeks (Z34.8)', 'Mild Iron Deficiency']);
      setMedicines([
        { id: 1, medicine: 'Fefol Vit (Iron + Folic Acid)', dose: '1 Capsule', frequency: 'Once Daily', duration: '30 Days', instructions: 'After lunch with orange juice' },
        { id: 2, medicine: 'Calcium + Vit D3 500mg', dose: '1 Tablet', frequency: 'Once Daily', duration: '30 Days', instructions: 'After dinner' },
      ]);
    } else if (p.id === 'PT-00127') {
      setChiefComplaint('High-grade fever (103°F) for 2 days, poor oral intake and irritable');
      setExamination('Pharyngeal erythema with tonsillar enlargement. No neck stiffness. Chest clear.');
      setClinicalNotes('Acute tonsillopharyngitis. Encourage oral rehydration salts and lukewarm sponging.');
      setVitals({ bp: '95/60', temp: '102.8°F', pulse: '110 bpm', spo2: '98%', respRate: '24', weight: '24 kg' });
      setDiagnoses(['Acute Pharyngitis (J02.9)', 'Pyrexia of Unknown Origin']);
      setMedicines([
        { id: 1, medicine: 'Amoxicillin Oral Suspension 250mg/5ml', dose: '5 ml', frequency: 'TDS (Three Times Daily)', duration: '7 Days', instructions: 'Complete full 7 days course' },
        { id: 2, medicine: 'Panadol Syrup 120mg/5ml', dose: '5 ml', frequency: 'Every 6 hours if temp > 100°F', duration: '3 Days', instructions: 'Shake well before use' },
      ]);
    } else {
      setChiefComplaint(`Routine consultation and clinical evaluation for ${p.name}`);
      setExamination('General physical examination within normal physiological limits.');
      setClinicalNotes('Advised routine lifestyle adjustments and follow-up as necessary.');
      setVitals({ bp: '120/80', temp: '98.6°F', pulse: '74 bpm', spo2: '99%', respRate: '16', weight: '70 kg' });
      setDiagnoses(['General Medical Evaluation (Z00.0)']);
      setMedicines([
        { id: 1, medicine: 'Multivitamin Formula', dose: '1 Tablet', frequency: 'Once Daily', duration: '30 Days', instructions: 'After meal' },
      ]);
    }
  }, [activePatientId]);

  function handleSelectPatient(pId) {
    setActivePatientId(pId);
    navigate(`/consultation/${pId}`, { replace: true });
    const selected = getPatientById(pId);
    if (selected) {
      showToast(`Switched consultation to ${selected.name} (${selected.id}).`);
    }
  }

  function handleNextPatient() {
    const currentIndex = PATIENTS.findIndex((p) => p.id === activePatientId);
    const nextIndex = (currentIndex + 1) % PATIENTS.length;
    const nextPatient = PATIENTS[nextIndex];
    if (nextPatient) {
      handleSelectPatient(nextPatient.id);
    }
  }

  function addDiagnosis() {
    const text = diagnosisDraft.trim();
    if (!text) return;
    setDiagnoses((d) => [...d, text]);
    setDiagnosisDraft('');
  }

  function removeDiagnosis(i) {
    setDiagnoses((d) => d.filter((_, idx) => idx !== i));
  }

  function addMedicine() {
    setMedicines((m) => [
      ...m,
      { id: Date.now(), medicine: '', dose: '', frequency: '', duration: '', instructions: '' },
    ]);
  }

  function updateMedicine(id, field, value) {
    setMedicines((m) => m.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeMedicine(id) {
    setMedicines((m) => m.filter((row) => row.id !== id));
  }

  function addLabOrder() {
    setLabOrders((o) => [...o, { id: Date.now(), test: '', priority: 'Normal' }]);
  }

  function updateLabOrder(id, field, value) {
    setLabOrders((o) => o.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeLabOrder(id) {
    setLabOrders((o) => o.filter((row) => row.id !== id));
  }

  function saveDraft() {
    showToast('Consultation draft saved. You can resume anytime.');
  }

  function completeConsultation() {
    if (!chiefComplaint.trim()) {
      showToast('Add a chief complaint before completing the consultation.');
      return;
    }
    if (diagnoses.length === 0) {
      showToast('Add at least one diagnosis before completing the consultation.');
      return;
    }
    showToast(`Encounter completed for ${patient.name}. Digital prescription generated and routed to Pharmacy.`);
    setRxModalOpen(true);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Doctor Consultation Desk</h1>
          <div className="sub">{patient.doctor || 'OPD Attending Physician'} · Chamber 204 · Outpatient Clinic</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setRxModalOpen(true)}>
            <Icon name="print" /> Preview & Print Rx
          </button>
          <button className="btn btn-secondary" onClick={saveDraft}>
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={completeConsultation}>
            <Icon name="check" /> Complete Encounter
          </button>
        </div>
      </div>

      {/* OPD Waiting Queue & Patient Switcher */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: 'var(--c-surface-hover)',
          border: '1px solid var(--c-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🪑</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>OPD Examination Chair</div>
            <div className="hint" style={{ fontSize: 11.5 }}>
              Active patient under clinical examination · Pick any patient from today's waiting room
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="input"
            style={{ minWidth: 260 }}
            value={activePatientId}
            onChange={(e) => handleSelectPatient(e.target.value)}
          >
            {PATIENTS.map((p, idx) => (
              <option key={p.id} value={p.id}>
                Token #{idx + 1} — {p.name} ({p.id}) · {p.status}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNextPatient}
            title="Call next waiting patient"
          >
            Call Next Patient →
          </button>
        </div>
      </div>

      {/* Patient identity strip */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={patient.name} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {patient.name} <span className="hint">· {patient.id} · {patient.age} yrs · {patient.gender}</span>
            </div>
            <div className="hint" style={{ fontSize: 12 }}>
              Blood Group: <strong style={{ color: 'var(--c-text)' }}>{patient.blood}</strong> · Contact: {patient.phone} · CNIC: {patient.cnic}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasAllergy ? (
            <span className="badge badge-error">
              <span className="badge-dot" /> Allergy: {patient.allergy}
            </span>
          ) : (
            <span className="badge badge-neutral">No Known Drug Allergies</span>
          )}
          <span className="badge badge-info">{patient.status}</span>
        </div>
      </div>

      {/* 2-Step Clinical Examination Layout */}
      <div className="grid grid-2">
        {/* Column 1: Step 1 Assess */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionLabel>Step 1 · Clinical Assessment</SectionLabel>

          <div className="card card-pad">
            <div className="section-title">Chief Complaint & Presenting Illness</div>
            <textarea
              className="input"
              rows={2}
              placeholder="What brought the patient in today?"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </div>

          <div className="card card-pad">
            <div className="section-title">Encounter Vitals</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {VITAL_FIELDS.map((f) => (
                <div className="field" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    className="input"
                    placeholder={f.placeholder}
                    value={vitals[f.key] || ''}
                    onChange={(e) => setVitals((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-title">Physical Examination Findings</div>
            <textarea
              className="input"
              rows={3}
              placeholder="Systemic and localized examination findings"
              value={examination}
              onChange={(e) => setExamination(e.target.value)}
            />
          </div>

          <div className="card card-pad">
            <div className="section-title">Clinical Diagnosis (ICD-10)</div>
            {diagnoses.length > 0 && (
              <div className="pill-list" style={{ marginBottom: 10 }}>
                {diagnoses.map((d, i) => (
                  <span className="chip" key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {d}
                    <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeDiagnosis(i)}>
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="e.g. Essential Hypertension (I10) or Type 2 Diabetes"
                value={diagnosisDraft}
                onChange={(e) => setDiagnosisDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
              />
              <button className="btn btn-secondary btn-sm" onClick={addDiagnosis}>
                <Icon name="plus" /> Add Diagnosis
              </button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-title">Physician Clinical Notes</div>
            <textarea
              className="input"
              rows={3}
              placeholder="Treatment rationale, dietary guidance, or notes for duty nurses"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Column 2: Step 2 Decide & Order */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionLabel>Step 2 · Prescription & Requisitions</SectionLabel>

          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="section-title" style={{ margin: 0 }}>
                Medication Prescription (Rx)
              </div>
              <span className="hint" style={{ fontSize: 11.5 }}>
                Syncs with Pharmacy Dispensary
              </span>
            </div>

            {medicines.length === 0 ? (
              <p className="hint" style={{ marginBottom: 10 }}>No medicines added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    className="card-pad"
                    style={{
                      border: '1px solid var(--c-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
                      gap: 8,
                      background: 'var(--c-surface-hover)',
                    }}
                  >
                    <input
                      className="input"
                      placeholder="Medicine & Brand"
                      value={m.medicine}
                      onChange={(e) => updateMedicine(m.id, 'medicine', e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Dose (e.g. 1 Tab)"
                      value={m.dose}
                      onChange={(e) => updateMedicine(m.id, 'dose', e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Frequency (1-0-1)"
                      value={m.frequency}
                      onChange={(e) => updateMedicine(m.id, 'frequency', e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Duration (7 Days)"
                      value={m.duration}
                      onChange={(e) => updateMedicine(m.id, 'duration', e.target.value)}
                    />
                    <button
                      className="btn-icon"
                      onClick={() => removeMedicine(m.id)}
                      aria-label="Remove medicine"
                    >
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-secondary btn-sm" onClick={addMedicine}>
              <Icon name="plus" /> Add Pharmaceutical
            </button>
          </div>

          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="section-title" style={{ margin: 0 }}>
                Diagnostic Laboratory Orders
              </div>
              <span className="hint" style={{ fontSize: 11.5 }}>
                Routes to Lab Technicians
              </span>
            </div>

            {labOrders.length === 0 ? (
              <p className="hint" style={{ marginBottom: 10 }}>No laboratory investigations ordered.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                {labOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 130px auto',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      className="input"
                      placeholder="Test name (e.g. Lipid Profile, HbA1c)"
                      value={o.test}
                      onChange={(e) => updateLabOrder(o.id, 'test', e.target.value)}
                    />
                    <select
                      className="input"
                      value={o.priority}
                      onChange={(e) => updateLabOrder(o.id, 'priority', e.target.value)}
                    >
                      <option>Normal</option>
                      <option>Urgent</option>
                    </select>
                    <button
                      className="btn-icon"
                      onClick={() => removeLabOrder(o.id)}
                      aria-label="Remove test"
                    >
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-secondary btn-sm" onClick={addLabOrder}>
              <Icon name="plus" /> Order Diagnostic Test
            </button>
          </div>

          <div className="card card-pad">
            <div className="section-title">Follow-up & Patient Instructions</div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Next Follow-up Date</label>
              <input
                className="input"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <textarea
              className="input"
              rows={2}
              placeholder="Instructions to be printed on patient's prescription slip"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div
        className="card card-pad"
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          position: 'sticky',
          bottom: 0,
        }}
      >
        <div className="hint">
          Completing encounter will record the clinical note, print digital Rx slip, and update patient timeline.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setRxModalOpen(true)}>
            <Icon name="print" /> Preview & Print Rx
          </button>
          <button className="btn btn-primary" onClick={completeConsultation}>
            <Icon name="check" /> Complete Encounter
          </button>
        </div>
      </div>

      {/* MODAL: PRINTABLE OFFICIAL DOCTOR PRESCRIPTION (Rx) */}
      {rxModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setRxModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 680, padding: 0, overflow: 'hidden' }}>
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                background: 'var(--c-surface-hover)',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>Official Medical Prescription (Rx Slip)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Prescription (A4)
                </button>
                <button className="btn-icon" onClick={() => setRxModalOpen(false)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div
                className="rx-sheet"
                style={{
                  border: '2px solid #0f172a',
                  borderRadius: 8,
                  padding: 24,
                  background: '#ffffff',
                }}
              >
                {/* Hospital & Doctor Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #0f172a',
                    paddingBottom: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      AL-SHIFA INTERNATIONAL HOSPITAL
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      Outpatient Department (OPD) Clinical Services · Sector H-8/4, Islamabad
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      UAN: +92 (51) 111-222-333 · Web: www.alshifa-hospital.org
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                      {doctorObj.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>{doctorObj.dept} Specialist</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>PMDC Reg #48291-P · MBBS, FCPS</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{doctorObj.room || 'Room 204 · East Wing'}</div>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 16,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>Patient Name:</span>
                    <div style={{ fontWeight: 700 }}>{patient.name}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Age / Gender:</span>
                    <div style={{ fontWeight: 600 }}>{patient.age} Yrs / {patient.gender}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>MRN / Patient ID:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{patient.id}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Consultation Date:</span>
                    <div style={{ fontWeight: 600 }}>Sep 14, 2026</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Blood Group:</span>
                    <div style={{ fontWeight: 700 }}>{patient.blood}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Vitals:</span>
                    <div style={{ fontWeight: 600 }}>BP: {vitals.bp || '120/80'} · Pulse: {vitals.pulse || '78'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Known Allergies:</span>
                    <div style={{ fontWeight: 700, color: hasAllergy ? '#dc2626' : '#059669' }}>
                      {patient.allergy || 'None recorded'}
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Findings */}
                <div style={{ marginBottom: 16, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0f172a' }}>Clinical Diagnosis:</strong>
                    {diagnoses.length > 0 ? (
                      diagnoses.map((d, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#64748b' }}>Routine Consultation</span>
                    )}
                  </div>
                  {chiefComplaint && (
                    <div style={{ color: '#334155', fontSize: 12 }}>
                      <strong>Chief Complaint:</strong> {chiefComplaint}
                    </div>
                  )}
                </div>

                {/* Rx Section */}
                <div style={{ borderTop: '2px solid #0f172a', paddingTop: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: 'serif',
                      color: '#0f172a',
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    ℞
                  </div>

                  {medicines.length === 0 ? (
                    <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: 12 }}>
                      No pharmaceuticals prescribed. Advised symptomatic care.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '6px 4px' }}>#</th>
                          <th style={{ padding: '6px 4px' }}>Medicine Name</th>
                          <th style={{ padding: '6px 4px' }}>Dosage</th>
                          <th style={{ padding: '6px 4px' }}>Frequency</th>
                          <th style={{ padding: '6px 4px' }}>Duration</th>
                          <th style={{ padding: '6px 4px' }}>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m, idx) => (
                          <tr key={m.id || idx} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                            <td style={{ padding: '8px 4px', fontWeight: 600 }}>{idx + 1}.</td>
                            <td style={{ padding: '8px 4px', fontWeight: 800, color: '#0f172a' }}>
                              {m.medicine || 'Generic Formula'}
                            </td>
                            <td style={{ padding: '8px 4px' }}>{m.dose || '1 dose'}</td>
                            <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{m.frequency || '1-0-1'}</td>
                            <td style={{ padding: '8px 4px' }}>{m.duration || '7 Days'}</td>
                            <td style={{ padding: '8px 4px', color: '#475569' }}>{m.instructions || 'After meals'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Diagnostic Investigations Ordered */}
                {labOrders.length > 0 && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '10px 14px',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 4 }}>
                      Diagnostic Laboratory Investigations Ordered:
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {labOrders.map((o, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#ede9fe',
                            color: '#6d28d9',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          • {o.test || 'Lab Test'} ({o.priority || 'Normal'})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up & Doctor Signature */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: 16,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12 }}>
                      <strong>Follow-up Visit:</strong> {followUpDate || 'As needed / in 2 weeks'}
                    </div>
                    {followUpNotes && (
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        Instructions: {followUpNotes}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
                      * Official Medical Prescription record generated digitally in Medora HMS.
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', width: 180 }}>
                    <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: 4 }} />
                    <div style={{ fontWeight: 800, fontSize: 12, color: '#0f172a' }}>
                      {doctorObj.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Authorized Medical Practitioner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast text={toast} />
    </AppShell>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      className="hint"
      style={{
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.04em',
        fontSize: 11,
        color: 'var(--c-primary-dark)',
      }}
    >
      {children}
    </div>
  );
}
