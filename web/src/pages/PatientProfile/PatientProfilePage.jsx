import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import PatientHeader from '../../components/patients/PatientHeader.jsx';
import {
  OverviewTab, MedicalHistoryTab, VisitsTab, PrescriptionsTab,
  LaboratoryTab, AdmissionsTab, BillingTab, TimelineTab,
} from '../../components/patients/PatientProfileTabs.jsx';
import { getPatientById } from '../../legacy/legacyEngine.js';
import { getPatientExtras } from '../../legacy/patientExtras.js';

const TABS = ['Overview', 'Medical History', 'Visits', 'Prescriptions', 'Laboratory', 'Admissions', 'Billing', 'Timeline'];

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');

  const patient = getPatientById(id);

  if (!patient) {
    return (
      <AppShell>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Patient not found</div>
          <p className="hint" style={{ marginBottom: 14 }}>
            No patient record matches ID <strong>{id}</strong>. It may have been removed, or the link is incorrect.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/patients')}>
            Back to Patients
          </button>
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
