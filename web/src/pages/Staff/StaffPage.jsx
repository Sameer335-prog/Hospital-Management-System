import { useMemo, useState } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS, STAFF } from '../../legacy/legacyEngine.js';
import { useToast } from '../../hooks/useToast.js';

const TABS = ['All', 'Doctors', 'Nurses', 'Receptionists', 'Lab Technicians', 'Pharmacists'];
const TAB_ROLE = { Doctors: 'Doctor', Nurses: 'Nurse', Receptionists: 'Receptionist', 'Lab Technicians': 'Lab Technician', Pharmacists: 'Pharmacist' };

const EMPTY_STAFF = {
  name: '',
  role: 'Doctor',
  dept: 'Cardiology',
  contact: '0300-0000000',
  schedule: 'Mon–Fri, 9:00–4:00',
};

export default function StaffPage() {
  const { toast, showToast } = useToast();
  const [people, setPeople] = useState(() => [
    ...DOCTORS.map((d) => ({ id: d.id, name: d.name, role: 'Doctor', dept: d.dept, contact: d.phone, schedule: d.schedule, status: d.status })),
    ...STAFF.map((s) => ({ id: s.id, name: s.name, role: s.role, dept: s.dept, contact: '0301-1231231', schedule: 'Rotating shift', status: s.status })),
  ]);
  const [tab, setTab] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF);

  const filtered = useMemo(() => {
    if (tab === 'All') return people;
    return people.filter((p) => p.role === TAB_ROLE[tab]);
  }, [people, tab]);

  function toggleStatus(id) {
    setPeople((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const status = p.status === 'Active' ? 'Inactive' : 'Active';
        showToast(`${p.name} status updated to ${status}.`);
        return { ...p, status };
      })
    );
  }

  function handleAddStaff(e) {
    e.preventDefault();
    if (!newStaff.name.trim()) {
      showToast('Staff name is required.');
      return;
    }
    const id = newStaff.role === 'Doctor' ? `DOC-0${people.length + 1}` : `ST-${people.length + 10}`;
    const newRecord = {
      id,
      name: newStaff.name.trim(),
      role: newStaff.role,
      dept: newStaff.dept,
      contact: newStaff.contact,
      schedule: newStaff.schedule,
      status: 'Active',
    };
    setPeople((prev) => [newRecord, ...prev]);
    showToast(`Added ${newRecord.name} (${newRecord.role}) to hospital personnel.`);
    setNewStaff(EMPTY_STAFF);
    setModalOpen(false);
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Doctors & Staff</h1>
          <div className="sub">{people.length} medical and clinical personnel across the hospital</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" /> Add Staff Member
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--c-text)' }}>No staff registered in this category</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Personnel</th>
                  <th scope="col">Role</th>
                  <th scope="col">Department</th>
                  <th scope="col">Contact Phone</th>
                  <th scope="col">Assigned Schedule</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={p.name} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{p.role}</span></td>
                    <td>{p.dept}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.contact}</td>
                    <td style={{ fontSize: 12.5 }}>{p.schedule}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(p.id)}
                        >
                          {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Register Staff Member</div>
              <button className="btn-icon" onClick={() => setModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="modal-body">
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Full Name *</label>
                  <input
                    className="input"
                    aria-label="Staff Full Name"
                    placeholder="e.g. Dr. Salman Qureshi"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-2" style={{ marginBottom: 12 }}>
                  <div className="field">
                    <label>Role</label>
                    <select
                      className="input"
                      aria-label="Staff Role"
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    >
                      <option>Doctor</option>
                      <option>Nurse</option>
                      <option>Receptionist</option>
                      <option>Lab Technician</option>
                      <option>Pharmacist</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Department</label>
                    <input
                      className="input"
                      aria-label="Department"
                      placeholder="e.g. Cardiology"
                      value={newStaff.dept}
                      onChange={(e) => setNewStaff({ ...newStaff, dept: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Contact Phone</label>
                  <input
                    className="input"
                    aria-label="Contact Phone"
                    placeholder="0300-1234567"
                    value={newStaff.contact}
                    onChange={(e) => setNewStaff({ ...newStaff, contact: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Working Schedule</label>
                  <input
                    className="input"
                    aria-label="Working Schedule"
                    placeholder="e.g. Mon–Fri, 9:00–5:00"
                    value={newStaff.schedule}
                    onChange={(e) => setNewStaff({ ...newStaff, schedule: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Personnel
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
