import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS, PATIENTS } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';

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

const EMPTY_RX = {
  patientId: '',
  doctor: 'Dr. Sarah Khan',
  medicine: 'Panadol 500mg',
  dose: '1 tablet',
  frequency: 'Every 8 hours',
  duration: '5 days',
};

export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [patientQuery, setPatientQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newRx, setNewRx] = useState(EMPTY_RX);

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

  function handleCreatePrescription(e) {
    e.preventDefault();
    const patient = PATIENTS.find((p) => p.id === newRx.patientId) || PATIENTS[0];
    const rxId = `RX-${904 + prescriptions.length}`;

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

    setPrescriptions((prev) => [newRecord, ...prev]);
    showToast(`Prescription ${rxId} issued for ${patient.name}.`);
    setNewRx(EMPTY_RX);
    setModalOpen(false);
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <div className="sub">{prescriptions.length} electronic prescription records on file</div>
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
          style={{ maxWidth: 200 }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          aria-label="Filter prescriptions by doctor"
        >
          <option value="All">All Doctors</option>
          {DOCTORS.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
                  <label>Prescribing Physician</label>
                  <select
                    className="input"
                    value={newRx.doctor}
                    onChange={(e) => setNewRx({ ...newRx, doctor: e.target.value })}
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.dept})
                      </option>
                    ))}
                  </select>
                </div>
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
