import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { LAB_ORDERS, PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { labService } from '../../services/labService.js';
import { useToast } from '../../hooks/useToast.js';

const TABS = ['Test Orders', 'Sample Collection', 'Processing', 'Results', 'Verification', 'Test Master'];

const STEPS = ['Order Created', 'Sample Collected', 'Processing', 'Result Ready', 'Verification'];
const STEP_INDEX = { Urgent: 0, 'Sample Collected': 1, Processing: 2, 'Result Ready': 3, Verified: 4 };

const TEST_MASTER = [
  { name: 'Complete Blood Count', code: 'CBC', turnaround: '2 hrs' },
  { name: 'Lipid Profile', code: 'LIPID', turnaround: '4 hrs' },
  { name: 'HbA1c', code: 'HBA1C', turnaround: '3 hrs' },
  { name: 'Urine Routine', code: 'URE', turnaround: '1 hr' },
  { name: 'X-Ray (Chest/Limb)', code: 'XRAY', turnaround: '30 min' },
  { name: 'Liver Function Test (LFT)', code: 'LFT', turnaround: '3 hrs' },
  { name: 'Renal Function Test (RFT)', code: 'RFT', turnaround: '2 hrs' },
];

const EMPTY_ORDER = {
  patientId: '',
  test: 'Complete Blood Count',
  doctor: 'Dr. Sarah Khan',
  priority: 'Normal',
};

export default function LaboratoryPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [orders, setOrders] = useState(() => LAB_ORDERS.map((o) => ({ ...o })));

  useEffect(() => {
    let active = true;
    labService.getLabOrders().then((data) => {
      if (active && data && data.length > 0) {
        setOrders(data);
      }
    });

    const unsubscribe = labService.subscribe(() => {
      labService.getLabOrders().then((data) => {
        if (active && data && data.length > 0) {
          setOrders(data);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [tab, setTab] = useState('Test Orders');
  const [resultDraft, setResultDraft] = useState(null); // { orderId, value, range, comments }
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState(EMPTY_ORDER);

  const counts = {
    orders: orders.length,
    samples: orders.filter((o) => o.status === 'Urgent').length,
    processing: orders.filter((o) => o.status === 'Sample Collected' || o.status === 'Processing').length,
    resultsReady: orders.filter((o) => o.status === 'Result Ready').length,
  };

  function collectSample(id) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: 'Sample Collected' } : o)));
    labService.updateOrderStatus(id, 'Sample Collected');
    showToast(`Sample collected for ${orders.find((o) => o.id === id)?.patient}.`);
  }

  function startProcessing(id) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: 'Processing' } : o)));
    labService.updateOrderStatus(id, 'Processing');
    showToast('Analyzer processing started.');
  }

  function openResultEntry(id) {
    setResultDraft({ orderId: id, value: '', range: '', comments: '' });
  }

  function saveResult() {
    if (!resultDraft?.value.trim()) {
      showToast('Enter a result value before saving.');
      return;
    }
    setOrders((os) =>
      os.map((o) =>
        o.id === resultDraft.orderId
          ? { ...o, status: 'Result Ready', resultValue: resultDraft.value, referenceRange: resultDraft.range, comments: resultDraft.comments }
          : o
      )
    );
    labService.updateOrderStatus(resultDraft.orderId, 'Result Ready');
    showToast('Diagnostic findings saved. Forwarded for verification.');
    setResultDraft(null);
  }

  function verifyResult(id) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: 'Verified' } : o)));
    labService.updateOrderStatus(id, 'Verified', 'Dr. Usman Tariq');
    showToast('Lab result verified and released to electronic patient profile.');
  }

  function handleCreateOrder(e) {
    e.preventDefault();
    const patient = PATIENTS.find((p) => p.id === newOrder.patientId) || PATIENTS[0];
    const orderId = `LAB-000${897 + orders.length}`;

    const newRecord = {
      id: orderId,
      patient: patient.name,
      pid: patient.id,
      test: newOrder.test,
      doctor: newOrder.doctor,
      status: newOrder.priority === 'Urgent' ? 'Urgent' : 'Sample Collected',
      priority: newOrder.priority,
      ordered: 'Just now',
    };

    setOrders((prev) => [newRecord, ...prev]);
    labService.createLabOrder(newRecord);
    showToast(`Order ${orderId} (${newOrder.test}) created for ${patient.name}.`);
    setNewOrder(EMPTY_ORDER);
    setCreateModalOpen(false);
  }

  const filtered = orders.filter((o) => {
    if (tab === 'Test Orders') return true;
    if (tab === 'Sample Collection') return o.status === 'Urgent';
    if (tab === 'Processing') return o.status === 'Sample Collected' || o.status === 'Processing';
    if (tab === 'Results') return o.status === 'Result Ready';
    if (tab === 'Verification') return o.status === 'Result Ready';
    return true;
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Laboratory</h1>
          <div className="sub">Diagnostic Orders & Sample Workflow · Central Pathology Lab</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Icon name="plus" /> New Test Order
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Orders" value={counts.orders} iconName="lab" trend="Active" />
        <StatCard label="Awaiting Collection" value={counts.samples} color="var(--c-error)" iconName="alert" trend="STAT Priority" />
        <StatCard label="In Processing" value={counts.processing} color="var(--c-info)" iconName="lab" trend="Analyzers active" />
        <StatCard label="Results Ready" value={counts.resultsReady} color="var(--c-success)" iconName="check" trend="Need verify" />
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      {tab === 'Test Master' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Test Name</th><th>Test Code</th><th>Turnaround Window</th><th>Status</th></tr></thead>
              <tbody>
                {TEST_MASTER.map((m) => (
                  <tr key={m.code}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{m.code}</td>
                    <td>{m.turnaround}</td>
                    <td><span className="badge badge-success">Available</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>No orders in this stage</div>
          <p className="hint">No laboratory tests currently pending for this workflow filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((o) => (
            <LabOrderCard
              key={o.id}
              order={o}
              onNavigate={() => navigate(`/patients/${o.pid}`)}
              onCollectSample={() => collectSample(o.id)}
              onStartProcessing={() => startProcessing(o.id)}
              onEnterResult={() => openResultEntry(o.id)}
              onVerify={() => verifyResult(o.id)}
            />
          ))}
        </div>
      )}

      {/* Enter Result Modal */}
      {resultDraft && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setResultDraft(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Record Diagnostic Findings</div>
              <button className="btn-icon" onClick={() => setResultDraft(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Observed Result / Quantitative Value *</label>
                <input
                  className="input"
                  placeholder="e.g. 13.5 g/dL (Hb) or 180 mg/dL"
                  value={resultDraft.value}
                  onChange={(e) => setResultDraft({ ...resultDraft, value: e.target.value })}
                />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Biological Reference Range</label>
                <input
                  className="input"
                  placeholder="e.g. 12.0 - 15.5 g/dL"
                  value={resultDraft.range}
                  onChange={(e) => setResultDraft({ ...resultDraft, range: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Pathologist / Technician Remarks</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Clinical interpretations or critical value flags…"
                  value={resultDraft.comments}
                  onChange={(e) => setResultDraft({ ...resultDraft, comments: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setResultDraft(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveResult}>Save & Post Findings</button>
            </div>
          </div>
        </div>
      )}

      {/* New Test Order Modal */}
      {createModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setCreateModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Requisition Laboratory Test</div>
              <button className="btn-icon" onClick={() => setCreateModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Patient *</label>
                  <select
                    className="input"
                    aria-label="Select Patient"
                    value={newOrder.patientId}
                    onChange={(e) => setNewOrder({ ...newOrder, patientId: e.target.value })}
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
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Diagnostic Test Profile</label>
                  <select
                    className="input"
                    aria-label="Select Diagnostic Test Profile"
                    value={newOrder.test}
                    onChange={(e) => setNewOrder({ ...newOrder, test: e.target.value })}
                  >
                    {TEST_MASTER.map((m) => (
                      <option key={m.code} value={m.name}>
                        {m.name} ({m.code}) — {m.turnaround}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Ordering Physician</label>
                  <select
                    className="input"
                    aria-label="Select Ordering Physician"
                    value={newOrder.doctor}
                    onChange={(e) => setNewOrder({ ...newOrder, doctor: e.target.value })}
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.dept})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Clinical Priority</label>
                  <select
                    className="input"
                    aria-label="Clinical Priority"
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                  >
                    <option>Normal (Routine)</option>
                    <option>Urgent (STAT)</option>
                  </select>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Order Test
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

function LabOrderCard({ order, onNavigate, onCollectSample, onStartProcessing, onEnterResult, onVerify }) {
  const stepIndex = STEP_INDEX[order.status] ?? 0;
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar name={order.patient} />
          <div>
            <div style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15 }} onClick={onNavigate}>
              {order.patient} <span className="hint" style={{ fontFamily: 'var(--font-mono)' }}>· {order.pid}</span>
            </div>
            <div className="hint" style={{ marginTop: 2 }}>
              {order.test} · Ordered by {order.doctor} · {order.ordered}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {order.priority === 'Urgent' && <span className="badge badge-error">STAT URGENT</span>}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, color: i <= stepIndex ? 'var(--c-success)' : 'var(--c-text-faint)' }}>
            <span style={{ fontWeight: 700 }}>{i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'}</span> {step}
          </div>
        ))}
      </div>

      {order.status === 'Result Ready' && order.resultValue && (
        <div className="hint" style={{ marginBottom: 12, background: 'var(--c-surface-hover)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
          Observed Value: <strong style={{ color: 'var(--c-text)' }}>{order.resultValue}</strong>
          {order.referenceRange && ` · Biological Reference: ${order.referenceRange}`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {order.status === 'Urgent' && (
          <button className="btn btn-primary btn-sm" onClick={onCollectSample}>Collect Specimen</button>
        )}
        {order.status === 'Sample Collected' && (
          <button className="btn btn-primary btn-sm" onClick={onStartProcessing}>Initiate Processing</button>
        )}
        {order.status === 'Processing' && (
          <button className="btn btn-primary btn-sm" onClick={onEnterResult}>Enter Diagnostic Result</button>
        )}
        {order.status === 'Result Ready' && (
          <button className="btn btn-primary btn-sm" onClick={onVerify}>Verify & Release Report</button>
        )}
        {order.status === 'Verified' && <span className="badge badge-success">Report Verified & Released</span>}
      </div>
    </div>
  );
}
