import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon, { WhatsAppIcon } from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS, PATIENTS } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { getSpecialtyConfig } from '../../utils/specialtyConfig.js';

const INITIAL_PRESCRIPTIONS = [
  {
    id: 'RX-901', pid: 'PT-00125', patient: 'Muhammad Ahmed', doctor: 'Dr. Sarah Khan', date: 'Sep 03, 2026', status: 'Active',
    items: [
      { medicine: 'Losartan 50mg', dose: '1 tab', frequency: 'Once daily', duration: '30 days' },
      { medicine: 'Metformin 500mg', dose: '1 tab', frequency: 'Twice daily', duration: '30 days' },
    ],
  },
  {
    id: 'RX-902', pid: 'PT-00130', patient: 'Sana Malik', doctor: 'Dr. Sarah Khan', date: 'Sep 02, 2026', status: 'Dispensed',
    items: [{ medicine: 'Losartan 50mg', dose: '1 tab', frequency: 'Once daily', duration: '30 days' }],
  },
  {
    id: 'RX-903', pid: 'PT-00127', patient: 'Fahad Iqbal', doctor: 'Dr. Ayesha Raza', date: 'Sep 05, 2026', status: 'Active',
    items: [{ medicine: 'Paracetamol 500mg', dose: '1 tab', frequency: 'Every 8 hours', duration: '5 days' }],
  },
];

export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const clinic = useClinicProfile();
  const specialty = useMemo(() => getSpecialtyConfig(clinic), [clinic]);

  const specialtyDoctors = useMemo(() => {
    if (specialty?.doctors && specialty.doctors.length > 0) return specialty.doctors;
    return DOCTORS;
  }, [specialty]);

  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_prescriptions_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return specialty?.archetypePrescriptions || INITIAL_PRESCRIPTIONS;
  });

  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPrescriptions(e.detail);
      }
    };
    window.addEventListener('medora-prescriptions-reset', handleReset);
    return () => window.removeEventListener('medora-prescriptions-reset', handleReset);
  }, []);

  // When active specialty changes, synchronize default prescriptions
  useEffect(() => {
    if (specialty?.archetypePrescriptions) {
      setPrescriptions(specialty.archetypePrescriptions);
    }
  }, [specialty?.id]);

  const [patientQuery, setPatientQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newRx, setNewRx] = useState({
    patientId: '',
    doctor: specialtyDoctors[0]?.name || 'Dr. Sarah Khan',
    medicine: specialty?.prescriptionPresets?.[0]?.name || 'Panadol 500mg',
    dose: specialty?.prescriptionPresets?.[0]?.dose || '1 tablet',
    frequency: 'Every 8 hours',
    duration: specialty?.prescriptionPresets?.[0]?.dur || '5 days',
  });

  // Keep default doctor in sync when specialty shifts
  useEffect(() => {
    if (specialtyDoctors[0]?.name) {
      setNewRx((prev) => ({ ...prev, doctor: specialtyDoctors[0].name }));
    }
  }, [specialtyDoctors]);

  const filtered = useMemo(
    () =>
      prescriptions.filter((rx) => {
        if (patientQuery.trim() && !rx.patient.toLowerCase().includes(patientQuery.trim().toLowerCase())) return false;
        if (doctorFilter !== 'All' && rx.doctor !== doctorFilter) return false;
        if (statusFilter !== 'All' && rx.status !== statusFilter) return false;
        return true;
      }),
    [prescriptions, patientQuery, doctorFilter, statusFilter]
  );

  function sendToPharmacy(id) {
    setPrescriptions((rxs) => rxs.map((r) => (r.id === id ? { ...r, status: 'Dispensed' } : r)));
    const rx = prescriptions.find((r) => r.id === id);
    showToast(`${rx?.patient}'s prescription sent to Pharmacy queue.`);
  }

  function sendViaWhatsApp(rx) {
    const patient = PATIENTS.find((p) => p.id === rx.pid);
    const phone = patient?.phone || '0300-1122334';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;

    const medLines = rx.items
      .map((it) => `• *${it.medicine}* (${it.dose}) — ${it.frequency} for ${it.duration}`)
      .join('\n');

    const clinicHeader = clinic.name || 'Medora Healthcare';
    const providerTitle = specialty.terminology?.providerTitle || 'Consultant Specialist';

    const message = encodeURIComponent(
      `🏥 *${clinicHeader} — Official Electronic Prescription*\n` +
      `${clinic.address ? `📍 ${clinic.address}\n` : ''}` +
      `📞 Helpline: ${clinic.phone || '051-111-222-333'}\n\n` +
      `📄 Prescription No: *${rx.id}*\n` +
      `👤 Patient: *${rx.patient}* (${rx.pid})\n` +
      `🩺 ${providerTitle}: *${rx.doctor}*\n` +
      `📅 Date: ${rx.date}\n\n` +
      `📋 *Prescribed Medications:*\n${medLines}\n\n` +
      `⚠️ *Instructions:* Follow dosages strictly. Take with water.\n\n` +
      `_Medora Cloud Health · Verified Electronic Health Record_`
    );

    const waUrl = `https://wa.me/${intlPhone}?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(`Dispatched prescription ${rx.id} to WhatsApp (${phone})`);
  }

  function handleCreatePrescription(e) {
    e.preventDefault();
    const patient = PATIENTS.find((p) => p.id === newRx.patientId) || PATIENTS[0];
    const rxPrefix = specialty.id === 'dental' ? 'RX-D' : specialty.id === 'pediatric' ? 'RX-P' : specialty.id === 'ophthalmology' ? 'RX-O' : 'RX-';
    const rxId = `${rxPrefix}${910 + prescriptions.length}`;

    const newRecord = {
      id: rxId,
      pid: patient.id,
      patient: patient.name,
      doctor: newRx.doctor,
      date: 'Today',
      status: 'Active',
      items: [
        {
          medicine: newRx.medicine,
          dose: newRx.dose,
          frequency: newRx.frequency,
          duration: newRx.duration,
        },
      ],
    };

    const updatedList = [newRecord, ...prescriptions];
    setPrescriptions(updatedList);
    try {
      localStorage.setItem('medora_prescriptions_list', JSON.stringify(updatedList));
    } catch {
      // safe fallback
    }
    showToast(`Prescription ${rxId} issued for ${patient.name}.`);
    setNewRx({
      patientId: '',
      doctor: specialtyDoctors[0]?.name || 'Dr. Sarah Khan',
      medicine: specialty?.prescriptionPresets?.[0]?.name || 'Panadol 500mg',
      dose: specialty?.prescriptionPresets?.[0]?.dose || '1 tablet',
      frequency: 'Every 8 hours',
      duration: specialty?.prescriptionPresets?.[0]?.dur || '5 days',
    });
    setModalOpen(false);
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <div className="sub">{prescriptions.length} electronic prescription records on file · {clinic.name}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" /> New Prescription
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search by patient name…"
          aria-label="Search prescriptions by patient name"
          value={patientQuery}
          onChange={(e) => setPatientQuery(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 220 }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          aria-label="Filter prescriptions by doctor"
        >
          <option value="All">All {specialty.terminology?.providerShort ? `${specialty.terminology.providerShort}s` : 'Doctors'}</option>
          {specialtyDoctors.map((d) => (
            <option key={d.id || d.name} value={d.name}>{d.name} ({d.specialty || d.dept})</option>
          ))}
        </select>
        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter prescriptions by status"
        >
          <option value="All">All Statuses</option>
          <option>Active</option>
          <option>Dispensed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>No prescriptions match these filters</div>
          <p className="hint">Try clearing patient search or doctor filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((rx) => (
            <div key={rx.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={rx.patient} />
                  <div>
                    <div style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15 }} onClick={() => navigate(`/patients/${rx.pid}`)}>
                      {rx.patient} <span className="hint" style={{ fontFamily: 'var(--font-mono)' }}>· {rx.pid}</span>
                    </div>
                    <div className="hint" style={{ marginTop: 2 }}>
                      Prescribed by {rx.doctor} · Issued {rx.date}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="hint" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rx.id}</span>
                  <StatusBadge status={rx.status} />
                </div>
              </div>

              <div className="table-wrap" style={{ marginBottom: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Pharmaceutical</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
                  </thead>
                  <tbody>
                    {rx.items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{it.medicine}</td>
                        <td>{it.dose}</td>
                        <td>{it.frequency}</td>
                        <td>{it.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'rgba(37,211,102,0.4)', color: '#25D366', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => sendViaWhatsApp(rx)}
                  title="Send verified digital prescription directly to patient's WhatsApp"
                  aria-label="Send WhatsApp Rx"
                >
                  <WhatsAppIcon size={16} />
                </button>
                {rx.status === 'Active' && (
                  <button className="btn btn-primary btn-sm" onClick={() => sendToPharmacy(rx.id)}>
                    Transmit to Pharmacy
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Printing prescription ${rx.id}…`)}>
                  <Icon name="print" /> Print Rx
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Prescription Modal */}
      {modalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Issue Electronic Prescription</div>
              <button className="btn-icon" onClick={() => setModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleCreatePrescription}>
              <div className="modal-body">
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Patient *</label>
                  <select
                    className="input"
                    value={newRx.patientId}
                    onChange={(e) => setNewRx({ ...newRx, patientId: e.target.value })}
                    required
                  >
                    <option value="">Select patient…</option>
                    {PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>{specialty.terminology?.providerTitle || 'Prescribing Physician'}</label>
                  <select
                    className="input"
                    value={newRx.doctor}
                    onChange={(e) => setNewRx({ ...newRx, doctor: e.target.value })}
                  >
                    {specialtyDoctors.map((d) => (
                      <option key={d.id || d.name} value={d.name}>
                        {d.name} ({d.specialty || d.dept})
                      </option>
                    ))}
                  </select>
                </div>

                {specialty?.prescriptionPresets && specialty.prescriptionPresets.length > 0 && (
                  <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--c-surface-2)', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text-muted)', marginBottom: 6 }}>
                      ⚡ Quick {specialty.terminology?.providerShort || 'Clinical'} Presets:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {specialty.prescriptionPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px', height: 'auto', textAlign: 'left' }}
                          onClick={() => {
                            setNewRx((prev) => ({
                              ...prev,
                              medicine: preset.name,
                              dose: preset.dose,
                              frequency: preset.freq.toLowerCase().includes('once') ? 'Once daily' : preset.freq.toLowerCase().includes('twice') ? 'Twice daily' : 'Every 8 hours',
                              duration: preset.dur,
                            }));
                          }}
                          title={preset.note}
                        >
                          + {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Medication *</label>
                  <input
                    className="input"
                    placeholder="e.g. Amoxicillin 500mg"
                    value={newRx.medicine}
                    onChange={(e) => setNewRx({ ...newRx, medicine: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-2" style={{ marginBottom: 12 }}>
                  <div className="field">
                    <label>Dosage</label>
                    <input
                      className="input"
                      placeholder="e.g. 1 tab"
                      value={newRx.dose}
                      onChange={(e) => setNewRx({ ...newRx, dose: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Frequency</label>
                    <select
                      className="input"
                      value={newRx.frequency}
                      onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Every 8 hours</option>
                      <option>As needed (PRN)</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Duration</label>
                  <input
                    className="input"
                    placeholder="e.g. 7 days / 30 days"
                    value={newRx.duration}
                    onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Sign & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast text={toast} />
    </AppShell>
  );
}
