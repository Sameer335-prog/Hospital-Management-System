import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { patientService } from '../../services/patientService.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { getSpecialtyConfig } from '../../utils/specialtyConfig.js';
import { useToast } from '../../hooks/useToast.js';

const STATUSES = ['Admitted', 'OPD', 'Waiting', 'Discharged', 'Follow-up Due'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TRIAGE_LEVELS = ['Critical (Red)', 'Urgent (Amber)', 'Routine (Green)'];

const EMPTY_FORM = {
  name: '',
  dob: '',
  gender: 'Female',
  phone: '',
  cnic: '',
  bloodGroup: 'O+',
  allergies: '',
  conditions: '',
  doctor: 'Dr. Sarah Khan',
  triage: 'Routine (Green)',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const clinic = useClinicProfile();
  const specialty = getSpecialtyConfig(clinic);
  const activeDoctors = specialty?.doctors || DOCTORS;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    doctor: activeDoctors[0]?.name || 'Dr. Sarah Khan',
  });
  const [generatedId, setGeneratedId] = useState(null);
  const [nextIdCounter, setNextIdCounter] = useState(() => {
    const maxId = PATIENTS.reduce((max, p) => {
      const num = parseInt(p.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 137);
    return maxId + 1;
  });
  const [patientsList, setPatientsList] = useState(() => {
    if (specialty?.archetypePatients) {
      return specialty.archetypePatients.map((p) => ({ ...p, clinicId: clinic?.id }));
    }
    return PATIENTS.filter((p) => !p.clinicId || p.clinicId === (clinic?.id || 'tenant-001'));
  });

  useEffect(() => {
    let active = true;
    const currentClinicId = clinic?.id || 'tenant-001';

    if (specialty?.archetypePatients) {
      setPatientsList(specialty.archetypePatients.map((p) => ({ ...p, clinicId: currentClinicId })));
    } else {
      patientService.getPatients(currentClinicId).then((data) => {
        if (active && data) {
          setPatientsList(data);
        }
      });
    }

    const unsubscribe = patientService.subscribe(() => {
      if (!specialty?.archetypePatients) {
        patientService.getPatients(currentClinicId).then((data) => {
          if (active && data) {
            setPatientsList(data);
          }
        });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [clinic?.id, specialty?.id]);

  // Quick Clinical Summary Drawer State
  const [quickPatient, setQuickPatient] = useState(null);

  // Printable ID Card / Wristband Modal State
  const [idCardPatient, setIdCardPatient] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patientsList.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q) || (p.cnic && p.cnic.includes(q)))) {
        return false;
      }
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
      if (bloodFilter !== 'All' && p.blood !== bloodFilter) return false;
      if (doctorFilter !== 'All' && p.doctor !== doctorFilter) return false;
      return true;
    });
  }, [patientsList, search, statusFilter, genderFilter, bloodFilter, doctorFilter]);

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submitRegistration(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('Name and phone are required.');
      return;
    }
    const id = `PT-${String(nextIdCounter).padStart(5, '0')}`;
    setNextIdCounter((n) => n + 1);

    const calculatedAge = form.dob ? Math.max(1, new Date().getFullYear() - new Date(form.dob).getFullYear()) : 28;

    const newRecord = {
      id,
      clinicId: clinic?.id || 'tenant-001',
      name: form.name.trim(),
      dob: form.dob || '1996-01-01',
      age: calculatedAge,
      gender: form.gender,
      phone: form.phone.trim(),
      doctor: form.doctor || 'Dr. Sarah Khan',
      lastVisit: 'Today',
      status: 'Waiting',
      blood: form.bloodGroup || 'O+',
      allergy: form.allergies.trim() || 'None recorded',
      conditions: form.conditions.trim() || 'None recorded',
      cnic: form.cnic.trim() || 'N/A',
      ward: '-',
      bed: '-',
      triage: form.triage || 'Routine (Green)',
      emergencyName: form.emergencyName,
      emergencyPhone: form.emergencyPhone,
    };

    setPatientsList((prev) => [newRecord, ...prev]);
    patientService.createPatient(newRecord);
    setGeneratedId(id);
    showToast(`Registered patient ${newRecord.name} (${id}) for ${clinic?.name || 'Clinic'}.`);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setForm(EMPTY_FORM);
    setGeneratedId(null);
  }

  // Export Master Patient Index as CSV
  function handleExportCSV() {
    if (filtered.length === 0) {
      showToast('No patient records to export.');
      return;
    }

    const headers = ['MRN', 'Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'CNIC', 'Doctor', 'Status', 'Allergies', 'Ward', 'Bed'];
    const rows = filtered.map((p) => [
      `"${p.id}"`,
      `"${p.name}"`,
      p.age,
      `"${p.gender}"`,
      `"${p.blood}"`,
      `"${p.phone}"`,
      `"${p.cnic || 'N/A'}"`,
      `"${p.doctor}"`,
      `"${p.status}"`,
      `"${p.allergy || 'None'}"`,
      `"${p.ward || '-'}"`,
      `"${p.bed || '-'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alshifa-patients-index-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} patient records to CSV.`);
  }

  return (
    <AppShell>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>{specialty?.terminology?.providerShort ? `${specialty.terminology.providerShort} Patient Directory & Records` : 'Patient Master Directory & EHR'}</h1>
            <span className="badge badge-primary" style={{ fontWeight: 700 }}>
              {patientsList.length} Registered Charts
            </span>
          </div>
          <div className="sub">
            {clinic.name} · {specialty?.terminology?.procedureTitle ? `${specialty.terminology.procedureTitle} History, Dental Charts & EMR` : 'Central Electronic Health Records (EHR), clinical intake, and master index auditing'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV">
            <Icon name="reports" /> Export Index (CSV)
          </button>
          <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}>
            <Icon name="plus" /> Register New Patient
          </button>
        </div>
      </div>

      {/* Multi-Tenant Clinic Sandboxing & Quick Switcher Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--c-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            🏢
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--c-text-primary)' }}>
                {clinic?.name || 'Al-Shifa Healthcare Complex'}
              </span>
              <span className="badge badge-info" style={{ fontWeight: 700, fontSize: 11 }}>
                {clinic?.id || 'tenant-001'}
              </span>
              <span className="badge badge-success" style={{ fontWeight: 700, fontSize: 11 }}>
                🔒 Clinic Sandboxed
              </span>
            </div>
            <div className="hint" style={{ fontSize: 12, marginTop: 2 }}>
              Multi-Tenant Isolation: Viewing {patientsList.length} charts belonging only to this clinic. Other clinics cannot view these patients.
            </div>
          </div>
        </div>

        {/* Private Tenant Data Shield Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="badge badge-success"
            style={{
              fontWeight: 700,
              fontSize: 11.5,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 999,
            }}
          >
            <span>🔒</span>
            <span>Private Tenant EHR Database</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Icon name="search" />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by patient name, MRN, phone, or CNIC…"
            aria-label="Search by patient name, MRN, phone, or CNIC"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter patients by status"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          aria-label="Filter patients by attending doctor"
        >
          <option value="All">All Attending Doctors</option>
          {activeDoctors.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 140 }}
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          aria-label="Filter patients by gender"
        >
          <option value="All">All Genders</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select
          className="input"
          style={{ maxWidth: 140 }}
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
          aria-label="Filter patients by blood group"
        >
          <option value="All">Blood Group</option>
          {BLOOD_GROUPS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Patient Records Table */}
      {filtered.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>No patient charts match your search</div>
          <p className="hint">Try clearing your search query or loosening your filter criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>MRN Code</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Attending Physician</th>
                  <th>Contact Phone</th>
                  <th>Clinical Status</th>
                  <th>Allergies</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const hasAllergy = p.allergy && p.allergy !== 'None recorded';
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setQuickPatient(p)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={p.name} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            {p.ward && p.ward !== '-' && (
                              <div className="hint" style={{ fontSize: 11, color: 'var(--c-primary)' }}>
                                🛏️ {p.ward} · Bed {p.bed}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--c-primary)' }}>
                          {p.id}
                        </span>
                      </td>
                      <td>{p.age} Yrs · {p.gender}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 800 }}>
                          {p.blood}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.doctor}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.phone}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <span
                          className={`badge ${hasAllergy ? 'badge-error' : 'badge-neutral'}`}
                          style={{ fontSize: 11 }}
                        >
                          {hasAllergy ? `⚠️ ${p.allergy}` : 'None'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Quick Clinical Summary"
                            onClick={() => setQuickPatient(p)}
                          >
                            <Icon name="eye" /> Summary
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Print Hospital Barcode Wristband / ID"
                            onClick={() => setIdCardPatient(p)}
                          >
                            <Icon name="print" /> Wristband
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/patients/${p.id}`)}
                          >
                            Full Chart →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          DRAWER 1: REGISTER PATIENT MODAL
          ========================================================= */}
      {drawerOpen && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeDrawer()}>
          <div className="drawer">
            <div className="drawer-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Register New Patient</div>
              <button className="btn-icon" onClick={closeDrawer} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            {generatedId ? (
              <div className="drawer-body" style={{ textAlign: 'center', paddingTop: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--c-success)' }}>
                  <Icon name="check" />
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Patient Successfully Registered</div>
                <p className="hint" style={{ marginBottom: 4 }}>{form.name} has been assigned Medical Record Number (MRN):</p>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-primary)', margin: '14px 0 20px', fontFamily: 'var(--font-mono)' }}>
                  {generatedId}
                </div>
                <p className="hint" style={{ maxWidth: 360, margin: '0 auto 24px' }}>
                  The patient record is now active across OPD scheduling, consultation queues, and clinical laboratories.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={closeDrawer}>
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      closeDrawer();
                      navigate(`/patients/${generatedId}`);
                    }}
                  >
                    Open Patient Profile →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitRegistration} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="drawer-body">
                  <FormSection title="Demographics & Identity">
                    <div className="field" style={{ marginBottom: 10 }}>
                      <label>Full Patient Name *</label>
                      <input
                        className="input"
                        placeholder="e.g. Tariq Mehmood"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-2" style={{ marginBottom: 10, gap: 10 }}>
                      <div className="field">
                        <label>Date of Birth</label>
                        <input className="input" type="date" value={form.dob} onChange={(e) => updateForm('dob', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Gender</label>
                        <select className="input" value={form.gender} onChange={(e) => updateForm('gender', e.target.value)}>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                      <div className="field">
                        <label>Contact Phone *</label>
                        <input className="input" placeholder="0300-1234567" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} required />
                      </div>
                      <div className="field">
                        <label>CNIC / National ID</label>
                        <input className="input" placeholder="36302-0000000-0" value={form.cnic} onChange={(e) => updateForm('cnic', e.target.value)} />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection title="Clinical Profile & Triage">
                    <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                      <div className="field">
                        <label>Blood Group</label>
                        <select className="input" value={form.bloodGroup} onChange={(e) => updateForm('bloodGroup', e.target.value)}>
                          {BLOOD_GROUPS.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>Attending Consultant</label>
                        <select className="input" value={form.doctor} onChange={(e) => updateForm('doctor', e.target.value)}>
                          {activeDoctors.map((d) => (
                            <option key={d.id} value={d.name}>{d.name} ({d.dept})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: 10 }}>
                      <label>Emergency Triage Acuity</label>
                      <select className="input" value={form.triage} onChange={(e) => updateForm('triage', e.target.value)}>
                        {TRIAGE_LEVELS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field" style={{ marginBottom: 10 }}>
                      <label>Known Drug / Food Allergies</label>
                      <input className="input" placeholder="e.g. Penicillin, Sulfa drugs (or None)" value={form.allergies} onChange={(e) => updateForm('allergies', e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Chronic Medical Conditions</label>
                      <input className="input" placeholder="e.g. Hypertension, Type 2 Diabetes" value={form.conditions} onChange={(e) => updateForm('conditions', e.target.value)} />
                    </div>
                  </FormSection>

                  <FormSection title="Emergency Contact Details">
                    <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                      <div className="field">
                        <label>Contact Person</label>
                        <input className="input" placeholder="Name" value={form.emergencyName} onChange={(e) => updateForm('emergencyName', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Relationship</label>
                        <input className="input" placeholder="Spouse / Parent / Sibling" value={form.emergencyRelationship} onChange={(e) => updateForm('emergencyRelationship', e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Emergency Phone</label>
                      <input className="input" placeholder="0300-0000000" value={form.emergencyPhone} onChange={(e) => updateForm('emergencyPhone', e.target.value)} />
                    </div>
                  </FormSection>
                </div>
                <div className="drawer-foot">
                  <button type="button" className="btn btn-secondary" onClick={closeDrawer}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Complete Registration</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          DRAWER 2: QUICK CLINICAL SUMMARY MODAL
          ========================================================= */}
      {quickPatient && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setQuickPatient(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Clinical Chart Snapshot</div>
              <button className="btn-icon" onClick={() => setQuickPatient(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                <Avatar name={quickPatient.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{quickPatient.name}</div>
                  <div className="hint" style={{ fontSize: 12 }}>
                    {quickPatient.age} Yrs · {quickPatient.gender} · Blood: <strong style={{ color: 'var(--c-text)' }}>{quickPatient.blood}</strong>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-primary)', marginTop: 2 }}>
                    MRN: {quickPatient.id}
                  </div>
                </div>
                <StatusBadge status={quickPatient.status} />
              </div>

              <div className="kv"><span className="k">Attending Consultant</span><strong>{quickPatient.doctor}</strong></div>
              <div className="kv"><span className="k">Contact Phone</span><span style={{ fontFamily: 'var(--font-mono)' }}>{quickPatient.phone}</span></div>
              <div className="kv"><span className="k">CNIC / ID</span><span style={{ fontFamily: 'var(--font-mono)' }}>{quickPatient.cnic || 'N/A'}</span></div>
              <div className="kv"><span className="k">Inpatient Bed</span><span>{quickPatient.ward && quickPatient.ward !== '-' ? `${quickPatient.ward} · Bed ${quickPatient.bed}` : 'Outpatient (Not Admitted)'}</span></div>

              {quickPatient.allergy && quickPatient.allergy !== 'None recorded' ? (
                <div className="alert-banner error" style={{ margin: '14px 0' }}>
                  <Icon name="alert" />
                  <div><strong>CRITICAL ALLERGY ALERT:</strong> {quickPatient.allergy}</div>
                </div>
              ) : (
                <div className="kv" style={{ margin: '8px 0' }}><span className="k">Allergies</span><span style={{ color: 'var(--c-success)', fontWeight: 600 }}>No known drug allergies</span></div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const pt = { ...quickPatient };
                    setQuickPatient(null);
                    setIdCardPatient(pt);
                  }}
                >
                  <Icon name="print" /> Thermal Wristband / ID
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigate(`/consultation/${quickPatient.id}`);
                  }}
                >
                  <Icon name="stetho" /> Start Consultation
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    navigate(`/patients/${quickPatient.id}`);
                  }}
                >
                  Open Full Chart →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 3: HOSPITAL ID CARD & THERMAL WRISTBAND
          ========================================================= */}
      {idCardPatient && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setIdCardPatient(null)}>
          <div className="modal" style={{ maxWidth: 560, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Hospital Identity Wristband & Card</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Wristband / Card (A4)
                </button>
                <button className="btn-icon" onClick={() => setIdCardPatient(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              {/* Thermal Patient Wristband Mockup */}
              <div style={{ border: '2px dashed #0f172a', borderRadius: 8, padding: 16, marginBottom: 20, background: '#f8fafc' }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                  Hospital Inpatient / OPD Barcode Wristband Strip
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', padding: '10px 0' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{idCardPatient.name}</div>
                    <div style={{ fontSize: 11, color: '#334155' }}>
                      MRN: <strong style={{ fontFamily: 'monospace' }}>{idCardPatient.id}</strong> · {idCardPatient.age}Y/{idCardPatient.gender} · Blood: <strong>{idCardPatient.blood}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, marginTop: 2 }}>
                      ALLERGY: {idCardPatient.allergy || 'NONE RECORDED'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="barcode-stripes" style={{ width: 130, height: 32 }} />
                    <span style={{ fontSize: 9, fontFamily: 'monospace' }}>*{idCardPatient.id}*</span>
                  </div>
                </div>
              </div>

              {/* Official Hospital Patient Identity Card */}
              <div className="rx-sheet" style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA INTERNATIONAL HOSPITAL</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Patient Master Identification Card · PMDC Accredited</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'monospace', color: '#0284c7' }}>{idCardPatient.id}</div>
                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>ACTIVE EHR RECORD</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12, marginBottom: 14 }}>
                  <div><span style={{ color: '#64748b' }}>Name:</span> <div style={{ fontWeight: 800 }}>{idCardPatient.name}</div></div>
                  <div><span style={{ color: '#64748b' }}>Age / Sex:</span> <div style={{ fontWeight: 600 }}>{idCardPatient.age} Yrs / {idCardPatient.gender}</div></div>
                  <div><span style={{ color: '#64748b' }}>Blood Group:</span> <strong style={{ color: '#dc2626' }}>{idCardPatient.blood}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Primary Physician:</span> <div style={{ fontWeight: 700 }}>{idCardPatient.doctor}</div></div>
                  <div><span style={{ color: '#64748b' }}>Phone:</span> <div>{idCardPatient.phone}</div></div>
                  <div><span style={{ color: '#64748b' }}>CNIC:</span> <div style={{ fontFamily: 'monospace' }}>{idCardPatient.cnic || 'N/A'}</div></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: 10 }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Emergency Ambulance: +92 51 1122 · ICT Islamabad</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Al-Shifa Health Information Management</div>
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

function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="section-title" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--c-primary)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
