import { useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../hooks/useToast.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { appointmentService } from '../../services/appointmentService.js';
import { sendWhatsApp, sendNativeSms } from '../../utils/messagingGateway.js';
import ThermalReceiptModal from '../../components/common/ThermalReceiptModal.jsx';
import {
  PATIENTS,
  DOCTORS,
  getPatientById,
} from '../../legacy/legacyEngine.js';

const TABS = [
  'Live OPD Token & Visits',
  'My Prescriptions (Rx)',
  'Diagnostic Lab Results',
  'Billing & Receipts',
  'Book Doctor Appointment',
];

const STANDARD_BOOKING_SLOTS = [
  '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
];

export default function PatientPortalPage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const { dispatchBookingNotification, dispatchTwoHourReminder } = useNotification();
  const [activeTab, setActiveTab] = useState('Live OPD Token & Visits');

  // Patient Identity — default to logged in patient or first record (Muhammad Ahmed)
  const patientId = user?.patientId || 'PT-00125';
  const patient = useMemo(() => getPatientById(patientId) || PATIENTS[0], [patientId]);
  const hasAllergy = patient.allergy && patient.allergy !== 'None recorded';

  // Modal states for official printable patient documents
  const [tokenSlipModal, setTokenSlipModal] = useState(null);
  const [rxSlipModal, setRxSlipModal] = useState(null);
  const [labReportModal, setLabReportModal] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [thermalSlipData, setThermalSlipData] = useState(null);

  // Self-Service Online Appointment Booking State
  const [bookingDoctorId, setBookingDoctorId] = useState('DOC-01');
  const [bookingDate, setBookingDate] = useState('2026-09-15');
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingReason, setBookingReason] = useState('');

  // Patient's real appointments
  const [myAppointments, setMyAppointments] = useState(() => [
    {
      id: 'AP-3301',
      token: 'TK-01',
      doctor: 'Dr. Sarah Khan',
      dept: 'Cardiology',
      room: 'Room 204 · East Wing',
      date: 'Today · Sep 14, 2026',
      time: '09:30 AM',
      type: 'Specialist Consultation',
      status: 'In Consultation',
      fee: 2500,
      notes: 'Routine hypertension follow-up and ECG review',
    },
    {
      id: 'AP-3289',
      token: 'TK-08',
      doctor: 'Dr. Bilal Ahmed',
      dept: 'Orthopedics',
      room: 'Room 112 · Ground Floor',
      date: 'Aug 24, 2026',
      time: '11:00 AM',
      type: 'Follow-up',
      status: 'Completed',
      fee: 2500,
      notes: 'Knee joint pain assessment and mobility testing',
    },
  ]);

  // Patient's active prescriptions
  const myPrescriptions = useMemo(() => [
    {
      id: 'RX-901',
      doctor: 'Dr. Sarah Khan',
      dept: 'Cardiology',
      date: 'Sep 14, 2026',
      status: 'Active',
      diagnosis: 'Essential Hypertension (I10)',
      instructions: 'Take blood pressure readings every morning before taking Losartan.',
      items: [
        { name: 'Losartan 50mg', dose: '1 Tablet', frequency: 'Once Daily (Morning)', duration: '30 Days', instruction: 'After breakfast with water' },
        { name: 'Panadol 500mg', dose: '1 Tablet', frequency: 'SOS (As needed)', duration: '5 Days', instruction: 'Max 3 tablets daily for headache' },
        { name: 'Multivitamin Complex', dose: '1 Capsule', frequency: 'Once Daily (Night)', duration: '30 Days', instruction: 'After dinner' },
      ],
    },
    {
      id: 'RX-884',
      doctor: 'Dr. Bilal Ahmed',
      dept: 'Orthopedics',
      date: 'Aug 24, 2026',
      status: 'Completed',
      diagnosis: 'Left Knee Mild Osteoarthritis',
      instructions: 'Avoid heavy weight lifting. Continue quadriceps strengthening physiotherapy.',
      items: [
        { name: 'Glucosamine Sulfate 500mg', dose: '1 Capsule', frequency: 'Twice Daily', duration: '60 Days', instruction: 'With meals' },
      ],
    },
  ], []);

  // Patient's lab investigations
  const myLabReports = useMemo(() => [
    {
      id: 'LAB-000892',
      test: 'Complete Lipid Profile (Fast)',
      doctor: 'Dr. Sarah Khan',
      ordered: 'Sep 14, 2026',
      status: 'Result Ready',
      verifiedBy: 'Dr. Usman Tariq (Pathologist)',
      values: [
        { param: 'Total Cholesterol', result: '185 mg/dL', ref: '< 200 mg/dL', normal: true },
        { param: 'Triglycerides', result: '142 mg/dL', ref: '< 150 mg/dL', normal: true },
        { param: 'HDL Cholesterol (Good)', result: '48 mg/dL', ref: '> 40 mg/dL', normal: true },
        { param: 'LDL Cholesterol (Bad)', result: '108 mg/dL', ref: '< 100 mg/dL', normal: false },
      ],
    },
    {
      id: 'LAB-000890',
      test: 'HbA1c (Glycated Hemoglobin)',
      doctor: 'Dr. Sarah Khan',
      ordered: 'Sep 02, 2026',
      status: 'Verified',
      verifiedBy: 'Dr. Usman Tariq (Pathologist)',
      values: [
        { param: 'HbA1c Concentration', result: '5.6 %', ref: '< 5.7 % (Normal)', normal: true },
        { param: 'Estimated Avg Glucose (eAG)', result: '114 mg/dL', ref: '90 – 120 mg/dL', normal: true },
      ],
    },
  ], []);

  // Patient's hospital invoices
  const myInvoices = useMemo(() => [
    {
      id: 'INV-5513',
      date: 'Sep 14, 2026',
      doctor: 'Dr. Sarah Khan',
      service: 'OPD Specialist Consultation + Lipid Profile Requisition',
      amount: 4500,
      paid: 4500,
      status: 'Paid',
      paymentMethod: 'Credit Card (Al-Falah)',
    },
    {
      id: 'INV-5482',
      date: 'Aug 24, 2026',
      doctor: 'Dr. Bilal Ahmed',
      service: 'Orthopedic Consultation + X-Ray Knee Scan',
      amount: 4000,
      paid: 4000,
      status: 'Paid',
      paymentMethod: 'Cash Receipt',
    },
  ], []);

  // Selected Booking Doctor
  const selectedBookingDoctor = useMemo(() => {
    return DOCTORS.find((d) => d.id === bookingDoctorId) || DOCTORS[0];
  }, [bookingDoctorId]);

  function handleSelfBookAppointment(e) {
    e.preventDefault();
    if (!bookingSlot) {
      showToast('Please select a convenient time slot.');
      return;
    }

    const tokenNumber = `TK-0${myAppointments.length + 1}`;
    const newAppointment = {
      id: `AP-${Math.floor(3350 + Math.random() * 50)}`,
      token: tokenNumber,
      pid: patient.id,
      patient: patient.name,
      doctorId: selectedBookingDoctor.id,
      doctor: selectedBookingDoctor.name,
      dept: selectedBookingDoctor.dept,
      room: 'Room 204 · East Wing',
      date: bookingDate,
      time: bookingSlot,
      type: 'Online Self-Booking',
      status: 'Confirmed',
      fee: 2500,
      notes: bookingReason.trim() || 'General consultation request from patient portal',
    };

    setMyAppointments((prev) => [newAppointment, ...prev]);
    appointmentService.createAppointment(newAppointment);
    dispatchBookingNotification(newAppointment);
    showToast(`Appointment booked! Token ${tokenNumber} sent to Dr. ${selectedBookingDoctor.name}. Both you and doctor have been notified.`);
    setTokenSlipModal(newAppointment);
    setBookingSlot(null);
    setBookingReason('');
  }

  // Active Today's Visit
  const todaysAppointment = myAppointments.find((a) => a.date.includes('Today') || a.status === 'In Consultation' || a.status === 'Waiting');

  return (
    <AppShell>
      {/* Patient Welcome Header */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>Patient Health Portal</h1>
            <span className="badge badge-success" style={{ fontWeight: 700 }}>
              ● Verified Patient Account
            </span>
          </div>
          <div className="sub">
            Welcome back, <strong>{patient.name}</strong> · Hospital MRN: <code style={{ fontFamily: 'var(--font-mono)' }}>{patient.id}</code>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('Book Doctor Appointment')}>
            <Icon name="calendar" /> Book New Appointment
          </button>
        </div>
      </div>

      {/* Patient Identity & Medical Alert Bar */}
      <div
        className="card card-pad"
        style={{
          marginBottom: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          borderLeft: hasAllergy ? '4px solid var(--c-error)' : '4px solid var(--c-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={patient.name} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{patient.name}</div>
            <div className="hint" style={{ fontSize: 12.5, marginTop: 2 }}>
              {patient.age} Yrs · {patient.gender} · Blood Group: <strong style={{ color: 'var(--c-text)' }}>{patient.blood}</strong> · Contact: {patient.phone}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {hasAllergy && (
            <span className="badge badge-error" style={{ padding: '6px 12px' }}>
              <span className="badge-dot" /> Allergy: {patient.allergy}
            </span>
          )}
          <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
            CNIC: {patient.cnic}
          </span>
          <span className="badge badge-info">
            Emergency Helpline: 1122
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <div
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* TAB 1: LIVE OPD TOKEN & APPOINTMENTS */}
      {activeTab === 'Live OPD Token & Visits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Active Today's Visit Callout */}
          {todaysAppointment && (
            <div
              className="card card-pad"
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)',
                border: '1.5px solid var(--c-primary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-primary">⚡ Active Today's Clinic Token</span>
                    <StatusBadge status={todaysAppointment.status} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-primary)', letterSpacing: '-0.02em', marginTop: 4 }}>
                    Your Token: {todaysAppointment.token}
                  </div>
                  <div className="hint" style={{ fontSize: 13, marginTop: 4 }}>
                    Attending Physician: <strong>{todaysAppointment.doctor}</strong> ({todaysAppointment.dept})
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginTop: 4 }}>
                    📍 Clinic Chamber: {todaysAppointment.room}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="hint" style={{ fontSize: 12 }}>Scheduled Appointment</div>
                  <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-mono)' }}>
                    {todaysAppointment.time}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => setTokenSlipModal(todaysAppointment)}
                  >
                    <Icon name="print" /> Print OPD Token Slip
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04))',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    ⏰
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-text)' }}>
                      2-Hour Pre-Appointment Reminder Active
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>
                      Automated SMS & in-app alerts are dispatched 2 hours before consultation to you and Dr. {todaysAppointment.doctor}.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#25D366', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 11.5 }}
                    onClick={() => {
                      const text = `Medora Hospital Visit Details:\n• Patient: ${patient.name} (${patient.id})\n• Doctor: ${todaysAppointment.doctor} (${todaysAppointment.dept})\n• Token: ${todaysAppointment.token}\n• Time: ${todaysAppointment.time}\n• Room: ${todaysAppointment.room}\nPlease proceed to the waiting lounge.`;
                      sendWhatsApp(patient.phone || '0300-1234567', text);
                      showToast('WhatsApp opened with your visit details!');
                    }}
                    title="Send appointment and token directly to my WhatsApp"
                  >
                    💬 WhatsApp to My Phone
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 11.5 }}
                    onClick={() => {
                      const text = `Medora Hospital Visit Details:\n• Patient: ${patient.name} (${patient.id})\n• Doctor: ${todaysAppointment.doctor} (${todaysAppointment.dept})\n• Token: ${todaysAppointment.token}\n• Time: ${todaysAppointment.time}\n• Room: ${todaysAppointment.room}\nPlease proceed to the waiting lounge.`;
                      sendNativeSms(patient.phone || '0300-1234567', text);
                      showToast('SMS app opened with your visit details!');
                    }}
                    title="Send visit details directly to my phone via SMS"
                  >
                    📱 SMS to Phone
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      dispatchTwoHourReminder(todaysAppointment);
                      showToast(`2-Hour Reminder simulated! Dispatched to you and ${todaysAppointment.doctor}.`);
                    }}
                    title="Simulate immediate 2-hour pre-appointment alert"
                    style={{ fontSize: 11.5 }}
                  >
                    ⚡ Test 2h Alert
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10, background: 'var(--c-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12 }}>
                ℹ️ <strong>Patient Notice:</strong> Please remain seated in the East Wing Waiting Lounge. When your token is called, proceed directly into Chamber 204.
              </div>
            </div>
          )}

          {/* Visits & Appointments Table */}
          <div className="card">
            <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>My Scheduled & Past Clinical Visits</div>
              <div className="hint">Record of your outpatient consultations and specialist follow-ups</div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Date & Time</th>
                    <th>Physician & Specialty</th>
                    <th>Chamber Location</th>
                    <th>Visit Purpose</th>
                    <th>Status</th>
                    <th>2h Reminder</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                          {a.token}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.date}</div>
                        <div className="hint" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.time}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{a.doctor}</div>
                        <div className="hint" style={{ fontSize: 12 }}>{a.dept}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.room}</td>
                      <td style={{ fontSize: 12.5 }}>{a.notes}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: 10, padding: '2px 6px', whiteSpace: 'nowrap' }}
                            title="Auto-reminder triggers 2 hours prior to scheduled consultation"
                          >
                            ⏰ 2h Active
                          </span>
                          <button
                            type="button"
                            className="btn btn-xs btn-secondary"
                            onClick={() => {
                              dispatchTwoHourReminder(a);
                              showToast(`2-Hour Reminder simulated for Token ${a.token}!`);
                            }}
                            title="Simulate 2-Hour Pre-Appointment Reminder"
                            style={{ padding: '2px 6px', fontSize: 10 }}
                          >
                            ⚡ Test
                          </button>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setTokenSlipModal(a)}
                          >
                            <Icon name="print" /> Token Slip
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: '#25D366', color: '#ffffff', border: 'none', fontWeight: 700, padding: '4px 8px' }}
                            title="Share token on WhatsApp"
                            onClick={() => {
                              const msg = `Medora Hospital Visit Token: Token ${a.token} with ${a.doctor} (${a.dept}) on ${a.date} at ${a.time}. Room: ${a.room}.`;
                              sendWhatsApp(patient.phone || '0300-1234567', msg);
                              showToast('WhatsApp opened with Token details!');
                            }}
                          >
                            💬 WA
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRESCRIPTIONS (DIGITAL Rx) */}
      {activeTab === 'My Prescriptions (Rx)' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card card-pad" style={{ background: 'var(--c-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Digital Medical Prescriptions (Rx)</div>
              <div className="hint">View your active medicine schedule, dosages, and download official physician prescription slips</div>
            </div>
            <button className="btn btn-primary" onClick={() => setRxSlipModal(myPrescriptions[0])}>
              <Icon name="print" /> Download Official Rx Slip (A4)
            </button>
          </div>

          <div className="grid grid-2" style={{ gap: 18 }}>
            {myPrescriptions.map((rx) => (
              <div key={rx.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'serif', color: 'var(--c-primary)' }}>℞</span>
                      <strong style={{ fontSize: 15 }}>Prescription #{rx.id}</strong>
                    </div>
                    <div className="hint" style={{ fontSize: 12 }}>
                      Prescribed by {rx.doctor} ({rx.dept}) · {rx.date}
                    </div>
                  </div>
                  <span className={`badge ${rx.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                    {rx.status}
                  </span>
                </div>

                <div style={{ background: 'var(--c-surface-hover)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12.5 }}>
                  <strong>Diagnosis:</strong> {rx.diagnosis}
                  <div className="hint" style={{ marginTop: 2 }}>{rx.instructions}</div>
                </div>

                {/* Medication schedule table */}
                <div className="table-wrap">
                  <table className="data-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dose</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.items.map((m, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>
                            {m.name}
                            <div className="hint" style={{ fontSize: 11 }}>{m.instruction}</div>
                          </td>
                          <td>{m.dose}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{m.frequency}</td>
                          <td>{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                  onClick={() => setRxSlipModal(rx)}
                >
                  <Icon name="print" /> Print Full Prescription Slip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC LAB RESULTS */}
      {activeTab === 'Diagnostic Lab Results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card card-pad" style={{ background: 'var(--c-surface-hover)' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Central Pathology Laboratory Reports</div>
            <div className="hint">View verified clinical investigations, blood chemistry, and biological reference ranges</div>
          </div>

          <div className="grid grid-2" style={{ gap: 18 }}>
            {myLabReports.map((report) => (
              <div key={report.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{report.test}</div>
                    <div className="hint" style={{ fontSize: 12 }}>
                      Report #{report.id} · Ordered by {report.doctor} · {report.ordered}
                    </div>
                  </div>
                  <span className="badge badge-success">✓ {report.status}</span>
                </div>

                <div className="table-wrap">
                  <table className="data-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Observed Value</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.values.map((v, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{v.param}</td>
                          <td style={{ fontWeight: 800, color: v.normal ? 'var(--c-text)' : 'var(--c-error)' }}>
                            {v.result}
                          </td>
                          <td className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{v.ref}</td>
                          <td>
                            <span className={`badge ${v.normal ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 10 }}>
                              {v.normal ? 'Normal' : 'Flagged'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                  <span className="hint" style={{ fontSize: 11.5 }}>
                    Verified by: <strong>{report.verifiedBy}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setLabReportModal(report)}
                  >
                    <Icon name="print" /> View Official Report (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & RECEIPTS */}
      {activeTab === 'Billing & Receipts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card card-pad" style={{ background: 'var(--c-surface-hover)' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Billing History & Tax Invoices</div>
            <div className="hint">Clear itemized receipts for outpatient consultations and medical procedures</div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date Issued</th>
                    <th>Attending Physician</th>
                    <th>Services Rendered</th>
                    <th>Billed Amount</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inv.id}</td>
                      <td>{inv.date}</td>
                      <td style={{ fontWeight: 600 }}>{inv.doctor}</td>
                      <td style={{ fontSize: 12.5 }}>{inv.service}</td>
                      <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>Rs {inv.amount.toLocaleString()}</td>
                      <td style={{ fontSize: 12 }}>{inv.paymentMethod}</td>
                      <td><span className="badge badge-success">✓ {inv.status}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInvoiceModal(inv)}
                        >
                          <Icon name="billing" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BOOK DOCTOR APPOINTMENT (SELF-SERVICE) */}
      {activeTab === 'Book Doctor Appointment' && (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {/* Doctor Selection Card */}
          <div className="card card-pad">
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>1. Select Doctor</div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>Choose Medical Specialist *</label>
              <select
                className="input"
                value={bookingDoctorId}
                onChange={(e) => {
                  setBookingDoctorId(e.target.value);
                  setBookingSlot(null);
                }}
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.dept}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 8, border: '1px solid var(--c-border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={selectedBookingDoctor.name} />
                <div>
                  <div style={{ fontWeight: 800 }}>{selectedBookingDoctor.name}</div>
                  <div className="hint">{selectedBookingDoctor.dept} Specialist</div>
                </div>
              </div>

              <div className="kv" style={{ fontSize: 12, marginBottom: 4 }}>
                <span className="k">OPD Timings:</span>
                <span>{selectedBookingDoctor.schedule || '09:00 AM – 03:00 PM'}</span>
              </div>
              <div className="kv" style={{ fontSize: 12, borderTop: '1px solid var(--c-border)', paddingTop: 4 }}>
                <span className="k">Consultation Fee:</span>
                <strong style={{ color: 'var(--c-primary)', fontFamily: 'var(--font-mono)' }}>Rs 2,500</strong>
              </div>
            </div>

            <div className="field">
              <label>Preferred Visit Date</label>
              <input
                type="date"
                className="input"
                aria-label="Preferred Visit Date"
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  setBookingSlot(null);
                }}
              />
            </div>
          </div>

          {/* Slots & Booking Form */}
          <div className="card card-pad" style={{ gridColumn: 'span 2' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>2. Choose Available Time Slot ({bookingDate})</div>
            <div className="hint" style={{ marginBottom: 16 }}>Select an open consultation slot for {selectedBookingDoctor.name}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 20 }}>
              {STANDARD_BOOKING_SLOTS.map((slot) => {
                const isSelected = bookingSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                    onClick={() => setBookingSlot(slot)}
                  >
                    {isSelected ? `✓ ${slot}` : slot}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSelfBookAppointment}>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Reason for Visit / Symptoms (Optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Follow-up consultation for blood pressure review or routine check"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface-hover)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                <div>
                  <div className="hint" style={{ fontSize: 12 }}>Selected Time:</div>
                  <strong style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                    {bookingSlot ? `${bookingDate} @ ${bookingSlot}` : '⚠️ No slot selected yet'}
                  </strong>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!bookingSlot}
                  style={{ opacity: bookingSlot ? 1 : 0.6 }}
                >
                  Confirm & Receive OPD Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 1: THERMAL OPD TOKEN SLIP
          ========================================================= */}
      {tokenSlipModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setTokenSlipModal(null)}>
          <div className="modal" style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>OPD Appointment Token Slip</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => {
                    const text = `Medora Hospital OPD Token Slip:\n• Patient: ${patient.name} (${patient.id})\n• Token: ${tokenSlipModal.token}\n• Doctor: ${tokenSlipModal.doctor}\n• Room: ${tokenSlipModal.room}\n• Date & Time: ${tokenSlipModal.date} · ${tokenSlipModal.time}\nPlease report 10 minutes before consultation.`;
                    sendWhatsApp(patient.phone || '0300-1234567', text);
                    showToast('WhatsApp opened with Token Slip!');
                  }}
                  title="Share token on WhatsApp"
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => {
                    const text = `Medora Hospital OPD Token Slip:\n• Patient: ${patient.name} (${patient.id})\n• Token: ${tokenSlipModal.token}\n• Doctor: ${tokenSlipModal.doctor}\n• Room: ${tokenSlipModal.room}\n• Date & Time: ${tokenSlipModal.date} · ${tokenSlipModal.time}\nPlease report 10 minutes before consultation.`;
                    sendNativeSms(patient.phone || '0300-1234567', text);
                    showToast('SMS app opened with Token Slip!');
                  }}
                  title="Share token via SMS"
                >
                  📱 SMS
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => {
                    setThermalSlipData({
                      token: tokenSlipModal.token,
                      patient: patient.name,
                      pid: patient.id,
                      doctor: tokenSlipModal.doctor,
                      dept: tokenSlipModal.dept || 'General OPD',
                      room: tokenSlipModal.room,
                      time: tokenSlipModal.time,
                    });
                  }}
                  title="Preview & print on 80mm ESC/POS thermal counter roll"
                >
                  🖨️ Thermal (80mm)
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print A4
                </button>
                <button className="btn-icon" onClick={() => setTokenSlipModal(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
              <div className="opd-token-slip" style={{ width: '100%' }}>
                <div style={{ borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>AL-SHIFA INTERNATIONAL HOSPITAL</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Patient Self-Service Token</div>
                </div>

                <div className="token-badge-large" style={{ margin: '8px 0' }}>{tokenSlipModal.token}</div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, margin: '10px 0', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: 12 }}>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Patient:</span> <strong>{patient.name}</strong>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">MRN:</span> <span style={{ fontFamily: 'monospace' }}>{patient.id}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Physician:</span> <strong>{tokenSlipModal.doctor}</strong>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Chamber:</span> <strong>{tokenSlipModal.room}</strong>
                  </div>
                  <div className="kv" style={{ borderTop: '1px solid #cbd5e1', paddingTop: 4 }}>
                    <span className="k">Date & Time:</span> <strong>{tokenSlipModal.date} · {tokenSlipModal.time}</strong>
                  </div>
                </div>

                <div className="barcode-box" style={{ marginTop: 10 }}>
                  <div className="barcode-stripes" />
                  <span style={{ fontSize: 9, fontFamily: 'monospace', marginTop: 2 }}>{tokenSlipModal.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 2: OFFICIAL MEDICAL PRESCRIPTION (Rx)
          ========================================================= */}
      {rxSlipModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setRxSlipModal(null)}>
          <div className="modal" style={{ maxWidth: 680, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Official Medical Prescription (Rx Slip #{rxSlipModal.id})</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Prescription (A4)
                </button>
                <button className="btn-icon" onClick={() => setRxSlipModal(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div className="rx-sheet" style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA INTERNATIONAL HOSPITAL</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Outpatient Department Clinical Services · Islamabad</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{rxSlipModal.doctor}</div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>{rxSlipModal.dept} Specialist</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>PMDC Reg #48291-P</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: '#64748b' }}>Patient Name:</span> <div style={{ fontWeight: 700 }}>{patient.name}</div></div>
                  <div><span style={{ color: '#64748b' }}>Age / Gender:</span> <div style={{ fontWeight: 600 }}>{patient.age} Yrs / {patient.gender}</div></div>
                  <div><span style={{ color: '#64748b' }}>MRN:</span> <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{patient.id}</div></div>
                  <div><span style={{ color: '#64748b' }}>Date:</span> <div style={{ fontWeight: 600 }}>{rxSlipModal.date}</div></div>
                  <div style={{ gridColumn: 'span 4' }}>
                    <span style={{ color: '#64748b' }}>Diagnosis:</span> <strong>{rxSlipModal.diagnosis}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 4' }}>
                    <span style={{ color: '#64748b' }}>Allergies:</span> <strong style={{ color: hasAllergy ? '#dc2626' : '#059669' }}>{patient.allergy}</strong>
                  </div>
                </div>

                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'serif', color: '#0f172a', marginBottom: 8 }}>℞</div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '6px 4px' }}>#</th>
                      <th style={{ padding: '6px 4px' }}>Medicine Name</th>
                      <th style={{ padding: '6px 4px' }}>Dosage</th>
                      <th style={{ padding: '6px 4px' }}>Frequency</th>
                      <th style={{ padding: '6px 4px' }}>Duration</th>
                      <th style={{ padding: '6px 4px' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rxSlipModal.items.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                        <td style={{ padding: '8px 4px' }}>{idx + 1}.</td>
                        <td style={{ padding: '8px 4px', fontWeight: 800 }}>{m.name}</td>
                        <td style={{ padding: '8px 4px' }}>{m.dose}</td>
                        <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{m.frequency}</td>
                        <td style={{ padding: '8px 4px' }}>{m.duration}</td>
                        <td style={{ padding: '8px 4px', color: '#475569' }}>{m.instruction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rxSlipModal.instructions && (
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, fontSize: 11.5, color: '#334155', marginBottom: 16 }}>
                    <strong>Clinical Advice:</strong> {rxSlipModal.instructions}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    * Present this official prescription at the hospital pharmacy for dispensing.
                  </div>
                  <div style={{ textAlign: 'center', width: 160 }}>
                    <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: 4 }} />
                    <div style={{ fontWeight: 800, fontSize: 12 }}>{rxSlipModal.doctor}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Authorized Clinician</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 3: DIAGNOSTIC LAB REPORT (A4)
          ========================================================= */}
      {labReportModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setLabReportModal(null)}>
          <div className="modal" style={{ maxWidth: 680, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Diagnostic Pathology Investigation Report</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Report (A4)
                </button>
                <button className="btn-icon" onClick={() => setLabReportModal(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA PATHOLOGY & DIAGNOSTIC LAB</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Automated Clinical Chemistry & Hematology Services</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{labReportModal.id}</div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Status: Verified</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: '#64748b' }}>Patient Name:</span> <div style={{ fontWeight: 700 }}>{patient.name}</div></div>
                  <div><span style={{ color: '#64748b' }}>MRN:</span> <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{patient.id}</div></div>
                  <div><span style={{ color: '#64748b' }}>Ordering Doctor:</span> <div style={{ fontWeight: 600 }}>{labReportModal.doctor}</div></div>
                  <div><span style={{ color: '#64748b' }}>Sample Date:</span> <div style={{ fontWeight: 600 }}>{labReportModal.ordered}</div></div>
                </div>

                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: '#0f172a' }}>
                  Test Profile: {labReportModal.test}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #0f172a', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '6px 4px' }}>Investigation Parameter</th>
                      <th style={{ padding: '6px 4px' }}>Observed Result</th>
                      <th style={{ padding: '6px 4px' }}>Biological Reference</th>
                      <th style={{ padding: '6px 4px' }}>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labReportModal.values.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{v.param}</td>
                        <td style={{ padding: '8px 4px', fontWeight: 800, color: v.normal ? '#0f172a' : '#dc2626' }}>
                          {v.result}
                        </td>
                        <td style={{ padding: '8px 4px', fontFamily: 'monospace', color: '#475569' }}>{v.ref}</td>
                        <td style={{ padding: '8px 4px' }}>
                          <span style={{ fontWeight: 700, color: v.normal ? '#059669' : '#dc2626' }}>
                            {v.normal ? 'NORMAL' : '⚠️ HIGH'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Electronically verified and authorized for clinical release.
                  </div>
                  <div style={{ textAlign: 'center', width: 180 }}>
                    <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: 4 }} />
                    <div style={{ fontWeight: 800, fontSize: 12 }}>{labReportModal.verifiedBy}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Consultant Pathologist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 4: A4 TAX INVOICE & RECEIPT
          ========================================================= */}
      {invoiceModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setInvoiceModal(null)}>
          <div className="modal" style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Hospital Financial Receipt</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Receipt (A4)
                </button>
                <button className="btn-icon" onClick={() => setInvoiceModal(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA INTERNATIONAL HOSPITAL</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Official Patient Payment Receipt & Tax Invoice</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>NTN: 2849102-4 · Islamabad</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>{invoiceModal.id}</div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Status: PAID</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: '#64748b' }}>Billed To:</span> <div style={{ fontWeight: 700 }}>{patient.name}</div></div>
                  <div><span style={{ color: '#64748b' }}>MRN:</span> <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{patient.id}</div></div>
                  <div><span style={{ color: '#64748b' }}>Payment Date:</span> <div style={{ fontWeight: 600 }}>{invoiceModal.date}</div></div>
                </div>

                <div className="kv" style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1', fontSize: 13 }}>
                  <span>{invoiceModal.service}</span>
                  <strong style={{ fontFamily: 'monospace' }}>Rs {invoiceModal.amount.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '2px solid #0f172a', paddingTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Paid via {invoiceModal.paymentMethod}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Thank you for choosing Al-Shifa Healthcare.</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: '#059669' }}>
                    Total Paid: Rs {invoiceModal.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ThermalReceiptModal
        isOpen={Boolean(thermalSlipData)}
        onClose={() => setThermalSlipData(null)}
        data={thermalSlipData}
        type="token"
      />

      <Toast text={toast} />
    </AppShell>
  );
}
