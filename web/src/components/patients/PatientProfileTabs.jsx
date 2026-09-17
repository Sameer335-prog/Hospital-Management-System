import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

/* =========================================================
   OVERVIEW
   Answers: what's happening today, what needs clinical attention,
   who this patient is, what happened recently.
   ========================================================= */
export function OverviewTab({ patient, extras }) {
  return (
    <div className="grid grid-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {extras.todayAppointment ? (
          <div className="card card-pad">
            <div className="section-title">Today's Appointment</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{extras.todayAppointment.time}</div>
                <div className="hint">
                  {extras.todayAppointment.doctor} · {extras.todayAppointment.department}
                </div>
              </div>
              <StatusBadge status={extras.todayAppointment.status} />
            </div>
          </div>
        ) : (
          <div className="card card-pad">
            <div className="section-title">Today's Appointment</div>
            <p className="hint">No appointment scheduled for today.</p>
          </div>
        )}

        <div className="card card-pad">
          <div className="section-title">Recent Clinical Information</div>
          <div className="kv">
            <span className="k">Diagnosis</span>
            <span>{extras.diagnosis}</span>
          </div>
          <div className="kv">
            <span className="k">Current Medication</span>
            <span>{extras.currentMedication}</span>
          </div>
          <div className="kv">
            <span className="k">Recent Laboratory</span>
            <span>
              {extras.recentLab ? (
                <>
                  {extras.recentLab.name} <StatusBadge status={extras.recentLab.status} />
                </>
              ) : (
                'None recorded'
              )}
            </span>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title">Medical Alerts</div>
          {patient.allergy && patient.allergy !== 'None recorded' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-error)', fontWeight: 600, fontSize: 13.5 }}>
              <Icon name="alert" /> {patient.allergy} Allergy
            </div>
          ) : (
            <p className="hint">No active medical alerts.</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card card-pad">
          <div className="section-title">Patient Summary</div>
          <div className="kv"><span className="k">Date of Birth</span><span>{patient.dob}</span></div>
          <div className="kv"><span className="k">Gender</span><span>{patient.gender}</span></div>
          <div className="kv"><span className="k">Blood Group</span><span>{patient.blood}</span></div>
          <div className="kv"><span className="k">Phone</span><span>{patient.phone}</span></div>
          <div className="kv"><span className="k">CNIC/Identifier</span><span>{patient.cnic}</span></div>
          <div className="kv"><span className="k">Assigned Doctor</span><span>{patient.doctor}</span></div>
          {patient.ward !== '-' && (
            <div className="kv"><span className="k">Ward / Bed</span><span>{patient.ward} · {patient.bed}</span></div>
          )}
          <div className="kv">
            <span className="k">Emergency Contact</span>
            <span>{extras.emergencyContact.name} ({extras.emergencyContact.relationship}) · {extras.emergencyContact.phone}</span>
          </div>
          {extras.nextFollowUp && (
            <div className="kv"><span className="k">Next Follow-up</span><span>{extras.nextFollowUp}</span></div>
          )}
          <div className="kv"><span className="k">Registered On</span><span>{extras.registeredOn}</span></div>
        </div>

        <div className="card card-pad">
          <div className="section-title">Recent Activity</div>
          {extras.recentActivity.length === 0 ? (
            <p className="hint">No recent activity recorded for this patient.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {extras.recentActivity.map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13 }}>{item.text}</div>
                  <div className="hint" style={{ fontSize: 11.5 }}>{item.when}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MEDICAL HISTORY
   ========================================================= */
export function MedicalHistoryTab() {
  return (
    <div className="card card-pad">
      <div className="section-title">Existing Conditions</div>
      <div className="pill-list" style={{ marginBottom: 16 }}>
        <span className="chip">Hypertension</span>
        <span className="chip">Type 2 Diabetes</span>
      </div>
      <div className="section-title">Current Medications</div>
      <div className="pill-list" style={{ marginBottom: 16 }}>
        <span className="chip">Losartan 50mg — OD</span>
        <span className="chip">Metformin 500mg — BD</span>
      </div>
      <div className="section-title">Previous Surgeries</div>
      <p className="hint">Appendectomy (2011)</p>
    </div>
  );
}

/* =========================================================
   VISITS
   ========================================================= */
export function VisitsTab({ patient }) {
  const visits = [
    { date: 'Sep 03, 2026', doctor: patient.doctor, type: 'Follow-up', diagnosis: 'Hypertension — controlled', status: 'Completed' },
    { date: 'Aug 12, 2026', doctor: patient.doctor, type: 'Consultation', diagnosis: 'Routine cardiac checkup', status: 'Completed' },
    { date: 'Jun 28, 2026', doctor: 'Dr. Imran Malik', type: 'Consultation', diagnosis: 'Seasonal flu', status: 'Completed' },
  ];
  return (
    <TableCard
      columns={['Date', 'Doctor', 'Type', 'Diagnosis', 'Status']}
      rows={visits.map((v) => [v.date, v.doctor, v.type, v.diagnosis, <StatusBadge key="s" status={v.status} />])}
      emptyTitle="No visits recorded"
      emptyBody="This patient has no past consultations or visits on file."
    />
  );
}

/* =========================================================
   PRESCRIPTIONS
   ========================================================= */
export function PrescriptionsTab({ patient }) {
  const items = [
    { date: 'Sep 03, 2026', medicine: 'Losartan 50mg', dose: '1 tab OD', duration: '30 days', doctor: patient.doctor },
    { date: 'Sep 03, 2026', medicine: 'Metformin 500mg', dose: '1 tab BD', duration: '30 days', doctor: patient.doctor },
  ];
  return (
    <TableCard
      columns={['Date', 'Medicine', 'Dose', 'Duration', 'Prescribed By']}
      rows={items.map((r) => [r.date, r.medicine, r.dose, r.duration, r.doctor])}
      emptyTitle="No prescriptions"
      emptyBody="No medicines have been prescribed for this patient yet."
    />
  );
}

/* =========================================================
   LABORATORY
   ========================================================= */
export function LaboratoryTab() {
  const orders = [
    { code: 'LAB-000892', test: 'Lipid Profile', date: 'Sep 05, 2026', status: 'Processing' },
    { code: 'LAB-000841', test: 'HbA1c', date: 'Aug 12, 2026', status: 'Verified' },
  ];
  return (
    <TableCard
      columns={['Sample ID', 'Test', 'Date', 'Status', '']}
      rows={orders.map((o) => [
        o.code,
        o.test,
        o.date,
        <StatusBadge key="s" status={o.status} />,
        <button key="v" className="btn btn-ghost btn-sm">View</button>,
      ])}
      emptyTitle="No laboratory orders"
      emptyBody="No laboratory tests have been ordered for this patient."
      emptyAction="Create Lab Order"
    />
  );
}

/* =========================================================
   ADMISSIONS
   ========================================================= */
export function AdmissionsTab({ patient }) {
  if (patient.ward === '-') {
    return (
      <EmptyState
        title="No admissions"
        body="This patient has not been admitted to any ward."
        actionLabel="Admit Patient"
      />
    );
  }
  return (
    <TableCard
      columns={['Ward', 'Bed', 'Doctor', 'Admitted', 'Status']}
      rows={[[patient.ward, patient.bed, patient.doctor, 'Sep 05, 2026', <StatusBadge key="s" status="Admitted" />]]}
      emptyTitle="No admissions"
      emptyBody="This patient has not been admitted to any ward."
    />
  );
}

/* =========================================================
   BILLING
   ========================================================= */
export function BillingTab() {
  const invoices = [
    { inv: 'INV-5510', date: 'Sep 05, 2026', total: 'Rs 18,500', due: 'Rs 8,500', status: 'Partially Paid' },
    { inv: 'INV-5402', date: 'Aug 12, 2026', total: 'Rs 4,200', due: 'Rs 0', status: 'Paid' },
  ];
  return (
    <TableCard
      columns={['Invoice', 'Date', 'Total', 'Due', 'Status']}
      rows={invoices.map((i) => [i.inv, i.date, i.total, i.due, <StatusBadge key="s" status={i.status} />])}
      emptyTitle="No invoices"
      emptyBody="No invoices have been created for this patient."
      emptyAction="Create Invoice"
    />
  );
}

/* =========================================================
   TIMELINE
   ========================================================= */
export function TimelineTab({ patient }) {
  const events = [
    ['Registration', 'Patient registered at Front Desk', 'Jan 14, 2024'],
    ['Appointment Booked', `Follow-up with ${patient.doctor}`, 'Sep 03, 2026 · 09:00 AM'],
    ['Checked In', 'Arrived at reception', 'Sep 03, 2026 · 09:22 AM'],
    ['Consultation', 'Vitals recorded, examination completed', 'Sep 03, 2026 · 09:35 AM'],
    ['Diagnosis', 'Hypertension — controlled, continue medication', 'Sep 03, 2026 · 09:48 AM'],
    ['Prescription Issued', 'Losartan 50mg, Metformin 500mg', 'Sep 03, 2026 · 09:50 AM'],
    ['Lab Order Placed', 'Lipid Profile ordered', 'Sep 05, 2026 · 09:10 AM'],
  ];
  if (patient.ward !== '-') {
    events.push(['Admission', `Admitted to ${patient.ward}, Bed ${patient.bed}`, 'Sep 05, 2026 · 02:15 PM']);
  }
  return (
    <div className="card card-pad">
      <div className="timeline">
        {events.map((e, i) => (
          <div className="tl-item" key={i}>
            <div className="tl-dot" />
            <div style={{ fontWeight: 600 }}>{e[0]}</div>
            <div className="hint">{e[1]}</div>
            <div className="tl-time">{e[2]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Shared table + empty state helpers
   ========================================================= */
function TableCard({ columns, rows, emptyTitle, emptyBody, emptyAction }) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} actionLabel={emptyAction} />;
  }
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ title, body, actionLabel }) {
  return (
    <div className="card card-pad" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-text-muted)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--c-text-faint)' }}>
        <Icon name="empty" />
      </div>
      <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>{title}</div>
      <p className="hint" style={{ marginBottom: actionLabel ? 14 : 0 }}>{body}</p>
      {actionLabel && <button className="btn btn-primary btn-sm">{actionLabel}</button>}
    </div>
  );
}
