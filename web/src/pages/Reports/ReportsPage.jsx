import { useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';

const REPORTS = [
  'Patient Report', 'Appointment Report', 'Admission Report', 'Discharge Report', 'Revenue Report',
  'Payment Report', 'Laboratory Report', 'Pharmacy Report', 'Doctor Activity',
];

export default function ReportsPage() {
  const { toast, showToast } = useToast();
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-06');
  const [department, setDepartment] = useState('All Departments');
  const [doctor, setDoctor] = useState('All Doctors');

  const coverage = `${formatDate(from)} – ${formatDate(to)}`;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="sub">Operational reporting across the hospital</div>
        </div>
        <button className="btn btn-secondary" onClick={() => showToast('Exporting current view…')}>
          <Icon name="print" /> Export
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          type="date"
          aria-label="Report Start Date"
          style={{ maxWidth: 160 }}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span className="hint">to</span>
        <input
          className="input"
          type="date"
          aria-label="Report End Date"
          style={{ maxWidth: 160 }}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Filter by department"
        >
          <option>All Departments</option>
          <option>Cardiology</option>
          <option>Orthopedics</option>
          <option>Pediatrics</option>
          <option>Gynecology</option>
        </select>
        <select
          className="input"
          style={{ maxWidth: 200 }}
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          aria-label="Filter by doctor"
        >
          <option>All Doctors</option>
          {DOCTORS.map((d) => (
            <option key={d.id}>{d.name}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('Filters applied.')}>Apply</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatCard label="Total Revenue" value="Rs 2,840,000" sub={coverage} color="var(--c-success)" iconName="billing" />
        <StatCard label="Total Visits" value="412" sub={coverage} iconName="patients" />
        <StatCard label="Avg. Wait Time" value="14 min" sub="Reception to consultation" color="var(--c-info)" iconName="calendar" />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Report</th>
                <th scope="col">Coverage</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r) => (
                <tr key={r}>
                  <td style={{ fontWeight: 600 }}>{r}</td>
                  <td className="hint">{coverage}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => showToast(`${r} generated.`)}>View</button>
                      <button
                        className="btn-icon"
                        title={`Print ${r}`}
                        aria-label={`Print ${r}`}
                        onClick={() => showToast(`Printing ${r}…`)}
                      >
                        <Icon name="print" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast text={toast} />
    </AppShell>
  );
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
