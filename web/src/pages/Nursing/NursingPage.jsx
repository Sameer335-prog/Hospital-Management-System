import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { NURSING_TASKS, getPatientById } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';

const TASK_ICON = { Medication: 'rx', Vitals: 'nurse', 'Nursing Note': 'nurse', 'Doctor Instruction': 'stetho', 'Discharge Prep': 'bed' };
const STATE_ORDER = { overdue: 0, 'due-soon': 1, upcoming: 2 };
const STATE_LABEL = { overdue: 'Overdue', 'due-soon': 'Due soon', upcoming: 'Upcoming' };
const STATE_TONE = { overdue: 'var(--c-error)', 'due-soon': 'var(--c-warning)', upcoming: 'var(--c-text-muted)' };

const VITAL_FIELDS = [
  { key: 'bp', label: 'Blood Pressure', placeholder: '120/80' },
  { key: 'temp', label: 'Temperature', placeholder: '37.1°C' },
  { key: 'pulse', label: 'Pulse', placeholder: '78 bpm' },
  { key: 'spo2', label: 'SpO2', placeholder: '98%' },
  { key: 'respRate', label: 'Respiratory Rate', placeholder: '16' },
  { key: 'weight', label: 'Weight', placeholder: '65 kg' },
];

export default function NursingPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [tasks, setTasks] = useState(() => NURSING_TASKS.map((t) => ({ ...t })));
  const [vitalsPatientId, setVitalsPatientId] = useState('');
  const [vitals, setVitals] = useState({});

  const assignedPids = useMemo(() => [...new Set(NURSING_TASKS.map((t) => t.pid))], []);
  const assignedPatients = assignedPids.map((pid) => getPatientById(pid)).filter(Boolean);

  const pendingTasks = tasks.filter((t) => t.state !== 'done');
  const overdueCount = pendingTasks.filter((t) => t.state === 'overdue').length;
  const dueSoonCount = pendingTasks.filter((t) => t.state === 'due-soon').length;
  const upcomingCount = pendingTasks.filter((t) => t.state === 'upcoming').length;

  function completeTask(id) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, state: 'done' } : t)));
    const t = tasks.find((x) => x.id === id);
    if (t) showToast(`${t.type} completed for ${t.patient}`);
  }

  function saveVitals() {
    if (!vitalsPatientId) {
      showToast('Select a patient before saving vitals.');
      return;
    }
    const p = getPatientById(vitalsPatientId);
    showToast(`Vitals recorded for ${p?.name || vitalsPatientId}.`);
    setVitals({});
  }

  const sortedTasks = [...pendingTasks].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Nursing Station</h1>
          <div className="sub">My Patients · {assignedPatients.length}</div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Assigned Patients" value={assignedPatients.length} iconName="patients" />
        <StatCard label="Overdue" value={overdueCount} color="var(--c-error)" iconName="alert" />
        <StatCard label="Due Soon" value={dueSoonCount} color="var(--c-warning)" iconName="bell" />
        <StatCard label="Upcoming Today" value={upcomingCount} iconName="calendar" />
      </div>

      {/* Patient cards — task-oriented, not a generic table */}
      <div style={{ marginBottom: 10 }}>
        <h3>My Patients</h3>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {assignedPatients.map((p) => {
          const patientTasks = pendingTasks.filter((t) => t.pid === p.id);
          const vitalsPending = patientTasks.some((t) => t.type === 'Vitals');
          const nextMed = patientTasks.find((t) => t.type === 'Medication');
          return (
            <div key={p.id} className="card card-pad">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar name={p.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="hint" style={{ marginBottom: 8 }}>
                    {p.ward} · Bed {p.bed}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                    {vitalsPending ? (
                      <div style={{ fontSize: 12.5, color: 'var(--c-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon name="alert" /> Vitals Pending
                      </div>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--c-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon name="check" /> Vitals Completed
                      </div>
                    )}
                    {nextMed && (
                      <div style={{ fontSize: 12.5, color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon name="rx" /> Medication due {nextMed.due}
                      </div>
                    )}
                  </div>
                  <div className="hint" style={{ marginBottom: 10 }}>Doctor: {p.doctor}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                    Open Patient
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Task queue — overdue first */}
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <div className="section-title">Nursing Tasks</div>
            <p className="hint" style={{ marginBottom: 10 }}>Sorted by urgency — overdue tasks first.</p>
          </div>
          {sortedTasks.length === 0 ? (
            <div className="card-pad">
              <p className="hint">No pending nursing tasks.</p>
            </div>
          ) : (
            sortedTasks.map((t) => (
              <div key={t.id} className={`queue-row ${t.state === 'overdue' ? 'urgent' : ''}`} onClick={() => navigate(`/patients/${t.pid}`)}>
                <div className="queue-row-main">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="avatar" style={{ background: 'var(--c-primary-light)', color: 'var(--c-primary-dark)' }}>
                      <Icon name={TASK_ICON[t.type] || 'nurse'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {t.patient} <span className="hint">· {t.ward}</span>
                      </div>
                      <div className="hint">{t.type} — {t.detail}</div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="queue-row-meta" style={{ color: STATE_TONE[t.state] }}>
                    Due {t.due} · {STATE_LABEL[t.state]}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(t.id);
                    }}
                  >
                    <Icon name="check" /> Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vitals entry */}
        <div className="card card-pad">
          <div className="section-title">Vitals Entry</div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Patient</label>
            <select className="input" value={vitalsPatientId} onChange={(e) => setVitalsPatientId(e.target.value)}>
              <option value="">Select a patient…</option>
              {assignedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.id}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
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
          <button className="btn btn-primary" onClick={saveVitals}>
            <Icon name="check" /> Save Vitals
          </button>
        </div>
      </div>

      <Toast text={toast} />
    </AppShell>
  );
}
