import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

/**
 * Per the patient-centered design rule: whenever a patient is open, name,
 * ID, age, gender, blood group, allergies, and status must always be
 * visible — never buried behind a tab click.
 */
export default function PatientHeader({ patient }) {
  const navigate = useNavigate();
  const hasAllergy = patient.allergy && patient.allergy !== 'None recorded';

  return (
    <>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={patient.name} large />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22 }}>{patient.name}</h2>
              <StatusBadge status={patient.status} />
              <span
                className="badge badge-neutral"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                {patient.id}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="hint">
                <strong>{patient.age}</strong> yrs · {patient.gender}
              </span>
              <span className="hint">·</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-error)', background: 'var(--c-error-bg)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
                Blood Group {patient.blood}
              </span>
              <span className="hint">·</span>
              <span className="hint" style={{ fontFamily: 'var(--font-mono)' }}>
                📞 {patient.phone}
              </span>
            </div>
          </div>

          <div className="quick-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>
              <Icon name="calendar" /> Book Appointment
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/consultation/${patient.id}`)}>
              <Icon name="stetho" /> Start Consultation
            </button>
            <button
              className="btn-icon"
              title="Billing & Invoices"
              onClick={() => navigate('/billing')}
              aria-label="Billing"
            >
              <Icon name="billing" />
            </button>
          </div>
        </div>
      </div>

      {/* Persistent safety allergy alert */}
      {hasAllergy && (
        <div className="alert-banner error" style={{ marginBottom: 16 }}>
          <Icon name="alert" />
          <div style={{ flex: 1 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Critical Allergy Alert:</strong>{' '}
            <span>{patient.allergy}. Confirm tolerance and verify cross-reactivity before prescribing or administering medications.</span>
          </div>
        </div>
      )}
    </>
  );
}
