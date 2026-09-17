import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import PatientHeader from '../../components/patients/PatientHeader.jsx';
import {
  OverviewTab, MedicalHistoryTab, VisitsTab, PrescriptionsTab,
  LaboratoryTab, AdmissionsTab, BillingTab, TimelineTab,
} from '../../components/patients/PatientProfileTabs.jsx';
import { getPatientById } from '../../legacy/legacyEngine.js';
import { getPatientExtras } from '../../legacy/patientExtras.js';
import { patientService } from '../../services/patientService.js';
import { useClinicProfile } from '../../utils/clinicConfig.js';

const TABS = ['Overview', 'Medical History', 'Visits', 'Prescriptions', 'Laboratory', 'Admissions', 'Billing', 'Timeline'];

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clinic = useClinicProfile();
  const [tab, setTab] = useState('Overview');
  const [patient, setPatient] = useState(() => getPatientById(id, clinic.id));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    patientService.getPatientById(id, clinic.id).then((data) => {
      if (active) {
        setPatient(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id, clinic.id]);

  if (loading && !patient) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="sub">Validating clinic security access…</div>
        </div>
      </AppShell>
    );
  }

  // Cross-Tenant Access Isolation Guard
  if (!patient || (patient.clinicId && patient.clinicId !== clinic.id)) {
    return (
      <AppShell>
        <div
          className="card card-pad"
          style={{
            textAlign: 'center',
            maxWidth: 620,
            margin: '40px auto',
            borderRadius: 18,
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
            padding: 40,
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--c-error)', marginBottom: 8 }}>
            Patient Chart Isolated
          </div>
          <p className="hint" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Patient chart <strong>{id}</strong> is not registered under <strong>{clinic.name}</strong> ({clinic.id}).
            Under HIPAA and Medora multi-tenant data governance, medical charts are strictly sandboxed per clinic. Cross-clinic patient record inspection is restricted.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/patients')}>
              Return to Clinic Patients
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const extras = getPatientExtras(patient.id);

  return (
    <AppShell>
      <PatientHeader patient={patient} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab patient={patient} extras={extras} />}
      {tab === 'Medical History' && <MedicalHistoryTab patient={patient} />}
      {tab === 'Visits' && <VisitsTab patient={patient} />}
      {tab === 'Prescriptions' && <PrescriptionsTab patient={patient} />}
      {tab === 'Laboratory' && <LaboratoryTab patient={patient} />}
      {tab === 'Admissions' && <AdmissionsTab patient={patient} />}
      {tab === 'Billing' && <BillingTab patient={patient} />}
      {tab === 'Timeline' && <TimelineTab patient={patient} />}
    </AppShell>
  );
}
