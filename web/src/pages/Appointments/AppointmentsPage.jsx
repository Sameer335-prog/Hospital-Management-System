import { useEffect, useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { PATIENTS, DOCTORS } from '../../legacy/legacyEngine.js';
import { appointmentService } from '../../services/appointmentService.js';
import { useToast } from '../../hooks/useToast.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { sendWhatsApp, sendNativeSms } from '../../utils/messagingGateway.js';
import ThermalReceiptModal from '../../components/common/ThermalReceiptModal.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';

const INITIAL_DOCTORS = [
  {
    id: 'DOC-01',
    name: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    hours: '09:00 AM – 02:00 PM',
    fee: 2500,
    days: 'Mon–Fri',
    maxTokens: 20,
    phone: '0300-1234567',
    status: 'Active',
  },
  {
    id: 'DOC-02',
    name: 'Dr. Bilal Ahmed',
    dept: 'Orthopedics',
    room: 'Room 112 · Ground Floor',
    hours: '10:00 AM – 04:00 PM',
    fee: 2500,
    days: 'Mon–Sat',
    maxTokens: 25,
    phone: '0301-2345678',
    status: 'Active',
  },
  {
    id: 'DOC-03',
    name: 'Dr. Ayesha Raza',
    dept: 'Pediatrics',
    room: 'Room 105 · OPD Wing',
    hours: '08:30 AM – 01:30 PM',
    fee: 2000,
    days: 'Mon–Fri',
    maxTokens: 18,
    phone: '0302-3456789',
    status: 'Active',
  },
  {
    id: 'DOC-04',
    name: 'Dr. Imran Malik',
    dept: 'General Medicine',
    room: 'Room 301 · West Wing',
    hours: '11:00 AM – 05:00 PM',
    fee: 2000,
    days: 'Tue–Sat',
    maxTokens: 30,
    phone: '0303-4567890',
    status: 'Active',
  },
  {
    id: 'DOC-05',
    name: 'Dr. Hina Farooq',
    dept: 'Gynecology',
    room: 'Room 218 · East Wing',
    hours: '09:00 AM – 03:00 PM',
    fee: 2500,
    days: 'Mon–Fri',
    maxTokens: 22,
    phone: '0304-5678901',
    status: 'Active',
  },
];

const STANDARD_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'AP-3301',
    token: 'TK-01',
    patient: 'Muhammad Ahmed',
    pid: 'PT-00125',
    doctorId: 'DOC-01',
    doctor: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    date: '2026-09-14',
    time: '09:30 AM',
    type: 'Routine Follow-up',
    priority: 'Normal',
    status: 'In Consultation',
    complaint: 'Post-CABG recovery and hypertension titration',
  },
  {
    id: 'AP-3302',
    token: 'TK-02',
    patient: 'Ayesha Bibi',
    pid: 'PT-00126',
    doctorId: 'DOC-05',
    doctor: 'Dr. Hina Farooq',
    dept: 'Gynecology',
    room: 'Room 218 · East Wing',
    date: '2026-09-14',
    time: '10:00 AM',
    type: 'Specialist Consultation',
    priority: 'Normal',
    status: 'Waiting',
    complaint: 'Routine 2nd trimester ultrasound review',
  },
  {
    id: 'AP-3303',
    token: 'TK-03',
    patient: 'Fahad Iqbal',
    pid: 'PT-00127',
    doctorId: 'DOC-03',
    doctor: 'Dr. Ayesha Raza',
    dept: 'Pediatrics',
    room: 'Room 105 · OPD Wing',
    date: '2026-09-14',
    time: '10:30 AM',
    type: 'Acute Consultation',
    priority: 'Urgent',
    status: 'Checked-in',
    complaint: 'High-grade fever (103°F) and dehydration',
  },
  {
    id: 'AP-3304',
    token: 'TK-04',
    patient: 'Bilal Chaudhry',
    pid: 'PT-00129',
    doctorId: 'DOC-02',
    doctor: 'Dr. Bilal Ahmed',
    dept: 'Orthopedics',
    room: 'Room 112 · Ground Floor',
    date: '2026-09-14',
    time: '11:00 AM',
    type: 'Pre-Op Evaluation',
    priority: 'Normal',
    status: 'Waiting',
    complaint: 'Post-op knee dressing and suture inspection',
  },
  {
    id: 'AP-3305',
    token: 'TK-05',
    patient: 'Sana Malik',
    pid: 'PT-00130',
    doctorId: 'DOC-01',
    doctor: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    date: '2026-09-14',
    time: '12:00 PM',
    type: 'Cardiac Follow-up',
    priority: 'Normal',
    status: 'Confirmed',
    complaint: 'Persistent palpitations and fatigue',
  },
];

export default function AppointmentsPage() {
  const clinic = useClinicProfile();
  const { toast, showToast } = useToast();
  const { dispatchBookingNotification, dispatchTwoHourReminder } = useNotification();

  // Tab: 'desk' (Reception Slots Finder) | 'queue' (OPD Waiting Lounge) | 'roster' (Doctor Rosters)
  const [activeTab, setActiveTab] = useState('desk');

  // Appointments State
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [thermalSlipData, setThermalSlipData] = useState(null);

  useEffect(() => {
    let active = true;
    appointmentService.getAppointments().then((data) => {
      if (active && data && data.length > 0) {
        setAppointments(data);
      }
    });

    const unsubscribe = appointmentService.subscribe(() => {
      appointmentService.getAppointments().then((data) => {
        if (active && data && data.length > 0) {
          setAppointments(data);
        }
      });
    });

    const handleAppointmentCreated = (e) => {
      const created = e.detail?.appointment;
      if (created && active) {
        setAppointments((prev) => {
          if (prev.some((a) => a.id === created.id)) return prev;
          return [created, ...prev];
        });
        showToast(`✨ Medora AI booked appointment: Token ${created.token} for ${created.patient} with ${created.doctor}`);
      }
    };
    window.addEventListener('medora-appointment-created', handleAppointmentCreated);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('medora-appointment-created', handleAppointmentCreated);
    };
  }, [showToast]);

  // Doctors State & Onboarding (Managed by Receptionist)
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [newDocForm, setNewDocForm] = useState({
    name: '',
    dept: 'Cardiology',
    room: '',
    hours: '09:00 AM – 03:00 PM',
    fee: 2500,
    days: 'Mon–Fri',
    maxTokens: 25,
    phone: '0300-1234567',
    status: 'Active',
  });

  // Booking Desk State
  const [selectedDoctorId, setSelectedDoctorId] = useState('DOC-01');
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(PATIENTS[0]?.id || 'PT-00125');
  const [visitType, setVisitType] = useState('Specialist Consultation');
  const [priority, setPriority] = useState('Normal');
  const [complaint, setComplaint] = useState('');

  // Queue Filters
  const [queueDoctorFilter, setQueueDoctorFilter] = useState('All');
  const [queueStatusFilter, setQueueStatusFilter] = useState('All');
  const [queueSearch, setQueueSearch] = useState('');

  // Printable Token Modal State
  const [activeTokenSlip, setActiveTokenSlip] = useState(null);

  // Express Walk-in Intake State
  const [quickWalkinOpen, setQuickWalkinOpen] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    doctorId: 'DOC-01',
    priority: 'Normal',
    fee: 2000,
  });

  // Active Doctor Object
  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) || doctors[0],
    [doctors, selectedDoctorId]
  );

  // Doctor's Appointments on Selected Date
  const doctorDateAppointments = useMemo(() => {
    return appointments.filter(
      (a) =>
        a.doctorId === selectedDoctorId &&
        (a.date === selectedDate || a.date === 'Today' || a.date === '2026-09-14')
    );
  }, [appointments, selectedDoctorId, selectedDate]);

  // Slots availability map for selected doctor and date
  const slotStatusMap = useMemo(() => {
    const map = {};
    STANDARD_SLOTS.forEach((time) => {
      const bookedAppt = doctorDateAppointments.find((a) => a.time === time);
      if (bookedAppt) {
        map[time] = { isBooked: true, appt: bookedAppt };
      } else {
        map[time] = { isBooked: false };
      }
    });
    return map;
  }, [doctorDateAppointments]);

  // Slot Counts
  const totalSlotsCount = STANDARD_SLOTS.length;
  const bookedSlotsCount = Object.values(slotStatusMap).filter((s) => s.isBooked).length;
  const freeSlotsCount = totalSlotsCount - bookedSlotsCount;

  // Today's Waiting Lounge Queue
  const waitingLoungeAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'Waiting' || a.status === 'Checked-in' || a.status === 'In Consultation' || a.status === 'Confirmed')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

  // Filtered Queue for Tab 2
  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    return appointments.filter((a) => {
      if (q && !a.patient.toLowerCase().includes(q) && !a.pid.toLowerCase().includes(q) && !a.token.toLowerCase().includes(q)) {
        return false;
      }
      if (queueDoctorFilter !== 'All' && a.doctor !== queueDoctorFilter) return false;
      if (queueStatusFilter !== 'All' && a.status !== queueStatusFilter) return false;
      return true;
    });
  }, [appointments, queueSearch, queueDoctorFilter, queueStatusFilter]);

  // Book Slot & Route to Doctor Handler
  function handleBookAppointment(e) {
    e.preventDefault();
    if (!selectedTimeSlot) {
      showToast('Please select a free time slot from the calendar grid.');
      return;
    }

    if (selectedDoctor.status === 'On Leave') {
      showToast(`Cannot book: ${selectedDoctor.name} is currently marked On Leave.`);
      return;
    }

    if (slotStatusMap[selectedTimeSlot]?.isBooked) {
      showToast('This slot is already booked. Please pick an open slot.');
      return;
    }

    const patientObj = PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0];
    const nextTokenNum = doctorDateAppointments.length + 1;
    const tokenStr = `TK-${String(nextTokenNum).padStart(2, '0')}`;
    const newApptId = `AP-${Math.floor(3310 + appointments.length + 1)}`;

    const newAppointment = {
      id: newApptId,
      token: tokenStr,
      patient: patientObj.name,
      pid: patientObj.id,
      doctorId: selectedDoctor.id,
      doctor: selectedDoctor.name,
      dept: selectedDoctor.dept,
      room: selectedDoctor.room,
      date: selectedDate,
      time: selectedTimeSlot,
      type: visitType,
      priority,
      status: 'Waiting', // Sent directly to doctor's waiting queue!
      complaint: complaint.trim() || 'Consultation and clinical evaluation',
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    appointmentService.createAppointment(newAppointment);
    dispatchBookingNotification(newAppointment);
    showToast(`Appointment booked! Token ${tokenStr} sent to ${selectedDoctor.name}'s OPD queue. Patient & Doctor notified, 2h reminder active.`);

    // Open printable token slip
    setActiveTokenSlip(newAppointment);

    // Reset slot selection
    setSelectedTimeSlot(null);
    setComplaint('');
  }

  // Intake Queue Actions
  function handleUpdateStatus(apptId, newStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );
    appointmentService.updateAppointmentStatus(apptId, newStatus);
    const appt = appointments.find((a) => a.id === apptId);
    showToast(`Patient ${appt?.patient} status updated to "${newStatus}".`);
  }

  // Doctor Onboarding & Routine Handlers
  function handleAddDoctor(e) {
    e.preventDefault();
    if (!newDocForm.name.trim()) {
      showToast('Doctor name is required.');
      return;
    }
    const newId = `DOC-${String(doctors.length + 1).padStart(2, '0')}`;
    const formattedName = newDocForm.name.trim().startsWith('Dr.') ? newDocForm.name.trim() : `Dr. ${newDocForm.name.trim()}`;
    const createdDoctor = {
      id: newId,
      name: formattedName,
      dept: newDocForm.dept,
      room: newDocForm.room.trim() || `Room ${200 + doctors.length + 1} · OPD Wing`,
      hours: newDocForm.hours.trim() || '09:00 AM – 03:00 PM',
      fee: Number(newDocForm.fee) || 2000,
      days: newDocForm.days.trim() || 'Mon–Fri',
      maxTokens: Number(newDocForm.maxTokens) || 25,
      phone: newDocForm.phone.trim() || '0300-1234567',
      status: 'Active',
    };
    setDoctors((prev) => [...prev, createdDoctor]);
    setSelectedDoctorId(createdDoctor.id);

    // Sync to shared hospital DOCTORS registry
    if (!DOCTORS.some((d) => d.id === createdDoctor.id)) {
      DOCTORS.push({
        id: createdDoctor.id,
        name: createdDoctor.name,
        dept: createdDoctor.dept,
        status: createdDoctor.status,
        phone: createdDoctor.phone,
        schedule: `${createdDoctor.days}, ${createdDoctor.hours}`,
        room: createdDoctor.room,
        fee: createdDoctor.fee,
      });
    }

    setAddDocModalOpen(false);
    setNewDocForm({
      name: '',
      dept: 'Cardiology',
      room: '',
      hours: '09:00 AM – 03:00 PM',
      fee: 2500,
      days: 'Mon–Fri',
      maxTokens: 25,
      phone: '0300-1234567',
      status: 'Active',
    });
    showToast(`${createdDoctor.name} successfully onboarded & added to OPD booking desk.`);
  }

  function handleUpdateDoctorRoutine(e) {
    e.preventDefault();
    if (!editingDoctor) return;
    setDoctors((prev) =>
      prev.map((d) => (d.id === editingDoctor.id ? { ...editingDoctor } : d))
    );
    const shared = DOCTORS.find((s) => s.id === editingDoctor.id);
    if (shared) {
      shared.schedule = `${editingDoctor.days}, ${editingDoctor.hours}`;
      shared.phone = editingDoctor.phone;
      shared.dept = editingDoctor.dept;
    }
    showToast(`Routine & fees updated for ${editingDoctor.name}.`);
    setEditingDoctor(null);
  }

  function handleQuickWalkinSubmit(e) {
    e.preventDefault();
    if (!walkinForm.name.trim()) {
      showToast('Patient name is required for walk-in intake.');
      return;
    }

    const doc = doctors.find((d) => d.id === walkinForm.doctorId) || doctors[0];
    const newPid = `PT-${String(1000 + Math.floor(Math.random() * 9000))}`;
    const tokenNum = appointments.length + 1;
    const tokenStr = `TK-${String(tokenNum).padStart(2, '0')}`;

    const newAppt = {
      id: `AP-${Date.now().toString().slice(-4)}`,
      token: tokenStr,
      patient: walkinForm.name.trim(),
      pid: newPid,
      doctorId: doc.id,
      doctor: doc.name,
      dept: doc.dept,
      room: doc.room,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Walk-in Consultation',
      priority: walkinForm.priority,
      status: 'Waiting',
      fee: Number(walkinForm.fee) || doc.fee || 2000,
    };

    setAppointments((prev) => [newAppt, ...prev]);
    appointmentService.createAppointment(newAppt);

    // Add to PATIENTS registry if not present
    if (!PATIENTS.some((p) => p.name === newAppt.patient)) {
      PATIENTS.unshift({
        id: newPid,
        name: newAppt.patient,
        phone: walkinForm.phone || '0300-1234567',
        doctor: doc.name,
        status: 'Waiting',
        lastVisit: 'Today (Walk-in)',
        blood: 'B+',
        allergy: 'None recorded',
      });
    }

    dispatchBookingNotification(newAppt);
    showToast(`Walk-in registered! Token ${tokenStr} issued. Please print slip or WhatsApp to patient.`);
    setQuickWalkinOpen(false);
    setWalkinForm({ name: '', phone: '', doctorId: 'DOC-01', priority: 'Normal', fee: 2000 });

    // Instantly open the token slip modal so receptionist can 1-click thermal print or WhatsApp
    setActiveTokenSlip(newAppt);
  }

  function toggleDoctorStatus(docId) {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const nextStatus = d.status === 'Active' ? 'On Leave' : 'Active';
        showToast(`${d.name} marked as ${nextStatus}.`);
        const shared = DOCTORS.find((s) => s.id === docId);
        if (shared) shared.status = nextStatus;
        return { ...d, status: nextStatus };
      })
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Appointments & Reception Desk</h1>
          <div className="sub">
            Al-Shifa OPD Clinic · Doctor consultation availability, live slot booking, and instant patient token routing
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: 'none',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
            onClick={() => setQuickWalkinOpen(true)}
          >
            ⚡ Express Walk-in Patient
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setAddDocModalOpen(true)}
          >
            <Icon name="plus" /> Onboard Doctor
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Today's Appointments"
          value={appointments.length}
          iconName="calendar"
          trend="Scheduled"
          sub="Booked across OPD"
        />
        <StatCard
          label="Waiting in Lounge"
          value={waitingLoungeAppointments.length}
          color="var(--c-warning)"
          iconName="alert"
          trend="Live Queue"
          sub="Ready for doctor intake"
        />
        <StatCard
          label="In Consultation"
          value={appointments.filter((a) => a.status === 'In Consultation').length}
          color="var(--c-info)"
          iconName="stetho"
          trend="Active"
          sub="Currently with physician"
        />
        <StatCard
          label="Today's Counter Cash"
          value={`${clinic.currency || 'Rs.'} ${(appointments.reduce((sum, a) => sum + (Number(a.fee) || 2000), 0)).toLocaleString()}`}
          color="var(--c-success)"
          iconName="billing"
          trend="Reconciled"
          sub={`${appointments.length} Total patient visits`}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button
          className={`tab ${activeTab === 'desk' ? 'active' : ''}`}
          onClick={() => setActiveTab('desk')}
        >
          📅 Reception Booking Desk (Doctor Free Slots Finder)
        </button>
        <button
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Live OPD Waiting Lounge ({waitingLoungeAppointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          👨‍⚕️ Doctor Duty Rosters & Timetable ({doctors.length})
        </button>
      </div>

      {/* TAB 1: RECEPTION BOOKING DESK & FREE SLOTS FINDER */}
      {activeTab === 'desk' && (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {/* Left Column: Doctor Picker & Clinic Profile */}
          <div className="card card-pad" style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                1. Select Doctor & Date
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: '2px 8px' }}
                onClick={() => setAddDocModalOpen(true)}
              >
                + New Doctor
              </button>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>Select Attending Doctor *</label>
              <select
                className="input"
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedTimeSlot(null);
                }}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.dept} {doc.status === 'On Leave' ? '⚠️ [On Leave]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Profile Mini-Card */}
            <div
              style={{
                background: 'var(--c-surface-hover)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--c-border)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={selectedDoctor.name} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedDoctor.name}</div>
                    <div className="hint">{selectedDoctor.dept} Specialist</div>
                  </div>
                </div>
                <span className={`badge ${selectedDoctor.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                  {selectedDoctor.status === 'Active' ? '● On Duty' : '○ On Leave'}
                </span>
              </div>

              <div className="kv" style={{ fontSize: 12, marginBottom: 4 }}>
                <span className="k">Clinic Location:</span>
                <span style={{ fontWeight: 600 }}>{selectedDoctor.room}</span>
              </div>
              <div className="kv" style={{ fontSize: 12, marginBottom: 4 }}>
                <span className="k">Consultation Hours:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedDoctor.hours}</span>
              </div>
              <div className="kv" style={{ fontSize: 12, marginBottom: 4 }}>
                <span className="k">Clinic Duty Days:</span>
                <span>{selectedDoctor.days}</span>
              </div>
              <div className="kv" style={{ fontSize: 12, borderTop: '1px solid var(--c-border)', paddingTop: 4 }}>
                <span className="k">Consultation Fee:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--c-primary)' }}>
                  Rs {selectedDoctor.fee.toLocaleString()}
                </span>
              </div>

              {/* Quick Routine Actions for Receptionist */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, borderTop: '1px solid var(--c-border)', paddingTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: 11.5 }}
                  onClick={() => setEditingDoctor({ ...selectedDoctor })}
                >
                  Edit Routine
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: 11.5,
                    borderColor: selectedDoctor.status === 'Active' ? 'var(--c-error)' : 'var(--c-success)',
                    color: selectedDoctor.status === 'Active' ? 'var(--c-error)' : 'var(--c-success)',
                  }}
                  onClick={() => toggleDoctorStatus(selectedDoctor.id)}
                >
                  {selectedDoctor.status === 'Active' ? 'Mark Leave' : 'Set Active'}
                </button>
              </div>
            </div>

            {/* Calendar Date Selector */}
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="apt-date-input">Appointment Date *</label>
              <input
                id="apt-date-input"
                type="date"
                className="input"
                aria-label="Appointment Date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot(null);
                }}
              />
            </div>

            {/* Quick Date Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: 'Today', date: '2026-09-14' },
                { label: 'Tomorrow', date: '2026-09-15' },
                { label: 'Wed (16)', date: '2026-09-16' },
                { label: 'Thu (17)', date: '2026-09-17' },
              ].map((d) => (
                <button
                  key={d.date}
                  type="button"
                  className={`btn ${selectedDate === d.date ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ fontSize: 11.5, padding: '4px 8px' }}
                  onClick={() => {
                    setSelectedDate(d.date);
                    setSelectedTimeSlot(null);
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Live Slots Matrix & Patient Booking Form */}
          <div className="card card-pad" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  2. Live Available Slots Matrix ({selectedDate})
                </div>
                <div className="hint" style={{ marginTop: 2 }}>
                  {selectedDoctor.name} · {freeSlotsCount} free slots remaining out of {totalSlotsCount}
                </div>
              </div>

              {/* Slot Legend */}
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-success)' }} />
                  Free / Open
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-primary)' }} />
                  Selected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-text-faint)' }} />
                  Booked / Taken
                </span>
              </div>
            </div>

            {/* On Leave Alert Banner */}
            {selectedDoctor.status === 'On Leave' && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: 'var(--c-error)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="alert" />
                  <div>
                    <strong>Doctor Marked On Leave:</strong> {selectedDoctor.name} is not taking patient visits today. Chamber slots are restricted.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleDoctorStatus(selectedDoctor.id)}
                >
                  Set On Duty
                </button>
              </div>
            )}

            {/* Time Slots Grid */}
            <div className="slot-grid" style={{ marginBottom: 20 }}>
              {STANDARD_SLOTS.map((time) => {
                const info = slotStatusMap[time];
                const isSelected = selectedTimeSlot === time;

                if (info.isBooked) {
                  return (
                    <div
                      key={time}
                      className="slot-chip slot-booked"
                      title={`Booked for ${info.appt.patient} (${info.appt.token})`}
                    >
                      <span className="slot-time">{time}</span>
                      <span className="slot-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                        {info.appt.patient} ({info.appt.token})
                      </span>
                    </div>
                  );
                }

                const isOnLeave = selectedDoctor.status === 'On Leave';

                return (
                  <div
                    key={time}
                    className={`slot-chip ${isSelected ? 'slot-selected' : isOnLeave ? 'slot-booked' : 'slot-free'}`}
                    style={isOnLeave ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    onClick={() => {
                      if (isOnLeave) {
                        showToast(`${selectedDoctor.name} is on leave. Slots cannot be selected.`);
                        return;
                      }
                      setSelectedTimeSlot(time);
                    }}
                  >
                    <span className="slot-time">{time}</span>
                    <span className="slot-label" style={{ color: isSelected ? '#ffffff' : isOnLeave ? 'var(--c-text-muted)' : 'var(--c-success)', fontWeight: 600 }}>
                      {isSelected ? '✓ Selected' : isOnLeave ? 'Locked' : '🟢 Available'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3. Patient Appointment Confirmation Form */}
            <form onSubmit={handleBookAppointment} style={{ borderTop: '1px solid var(--c-border)', paddingTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                3. Patient Intake & Doctor Queue Assignment
              </div>

              <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
                <div className="field">
                  <label>Select Registered Patient *</label>
                  <select
                    className="input"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    {PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) · {p.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Visit Category</label>
                  <select
                    className="input"
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                  >
                    <option>Specialist Consultation</option>
                    <option>Routine Follow-up</option>
                    <option>Second Opinion</option>
                    <option>Pre-Op Assessment</option>
                    <option>Urgent / Priority Intake</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 12, marginBottom: 14 }}>
                <div className="field">
                  <label htmlFor="apt-complaint-input">Chief Complaint / Clinical Notes</label>
                  <input
                    id="apt-complaint-input"
                    aria-label="Chief Complaint or Clinical Notes"
                    className="input"
                    placeholder="e.g. Chest tightness, blood pressure re-evaluation"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="apt-priority-select">Triage Priority</label>
                  <select
                    id="apt-priority-select"
                    aria-label="Triage Priority"
                    className="input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal Routine</option>
                    <option value="Urgent">STAT Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface-hover)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                <div>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>Chosen Slot: </span>
                  <strong style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                    {selectedTimeSlot ? `${selectedDate} @ ${selectedTimeSlot}` : '⚠️ No slot selected yet'}
                  </strong>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedTimeSlot}
                  style={{ opacity: selectedTimeSlot ? 1 : 0.6 }}
                >
                  ⚡ Book & Send to Doctor's OPD Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE OPD WAITING LOUNGE */}
      {activeTab === 'queue' && (
        <>
          <div className="toolbar" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="Search by patient name, MRN, or token…"
              aria-label="Search OPD queue by patient name, MRN, or token"
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
            />
            <select
              className="input"
              style={{ width: 180 }}
              value={queueDoctorFilter}
              onChange={(e) => setQueueDoctorFilter(e.target.value)}
              aria-label="Filter queue by attending doctor"
            >
              <option value="All">All Attending Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select
              className="input"
              style={{ width: 150 }}
              value={queueStatusFilter}
              onChange={(e) => setQueueStatusFilter(e.target.value)}
              aria-label="Filter queue by consultation status"
            >
              <option value="All">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Checked-in">Checked-in</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Patient (MRN)</th>
                    <th>Attending Doctor</th>
                    <th>Room</th>
                    <th>Time Slot</th>
                    <th>Clinical Reason</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>2h Reminder</th>
                    <th>Intake Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((appt) => (
                    <tr key={appt.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14 }}>
                        <span className="badge badge-primary">{appt.token}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={appt.patient} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{appt.patient}</div>
                            <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{appt.pid}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.doctor}</div>
                        <div className="hint">{appt.dept}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{appt.room}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{appt.time}</td>
                      <td style={{ fontSize: 12.5, maxWidth: 200 }}>{appt.complaint}</td>
                      <td>
                        {appt.priority === 'Urgent' ? (
                          <span className="badge badge-error">STAT Urgent</span>
                        ) : (
                          <span className="badge badge-neutral">Routine</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: 10, padding: '2px 6px', whiteSpace: 'nowrap' }}
                            title="Pre-appointment reminder automatically triggers 2 hours prior to scheduled slot"
                          >
                            ⏰ 2h Active
                          </span>
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => {
                              dispatchTwoHourReminder(appt);
                              showToast(`2-Hour Reminder simulated for ${appt.patient} & ${appt.doctor}!`);
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
                            className="btn btn-secondary btn-sm"
                            title="Print OPD Appointment Slip"
                            onClick={() => setActiveTokenSlip(appt)}
                          >
                            <Icon name="print" /> Slip
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 700,
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title={`Send Token details to ${appt.patient} on WhatsApp`}
                            onClick={() => {
                              const patientObj = PATIENTS.find((p) => p.name === appt.patient || p.id === appt.pid);
                              const phone = patientObj?.phone || '0300-9876543';
                              const msg = `Medora Hospital: Dear ${appt.patient}, your appointment with ${appt.doctor} (${appt.dept}) is confirmed. Token: ${appt.token}, Time: ${appt.time}, ${appt.room}. Please report to the waiting lounge.`;
                              sendWhatsApp(phone, msg);
                              showToast(`WhatsApp message opened for ${appt.patient}!`);
                            }}
                          >
                            <span>💬</span> WA
                          </button>

                          {appt.status === 'Waiting' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateStatus(appt.id, 'Checked-in')}
                            >
                              Check-in
                            </button>
                          )}
                          {appt.status === 'Checked-in' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: 'var(--c-accent)' }}
                              onClick={() => handleUpdateStatus(appt.id, 'In Consultation')}
                            >
                              Call to Dr
                            </button>
                          )}
                          {appt.status === 'In Consultation' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 3: ALL DOCTORS DUTY ROSTER & TIMETABLE */}
      {activeTab === 'roster' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Hospital Doctor Rosters & OPD Chamber Directory</div>
              <div className="hint">Manage doctor OPD hours, consultation fees, chamber locations, and duty availability</div>
            </div>
            <button className="btn btn-primary" onClick={() => setAddDocModalOpen(true)}>
              <Icon name="plus" /> Onboard New Doctor
            </button>
          </div>

          <div className="grid grid-3" style={{ gap: 16 }}>
            {doctors.map((doc) => {
              const todayCount = appointments.filter((a) => a.doctorId === doc.id).length;

              return (
                <div key={doc.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={doc.name} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{doc.name}</div>
                        <div className="hint">{doc.dept} Specialist · {doc.phone}</div>
                      </div>
                    </div>
                    <span className={`badge ${doc.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                      {doc.status === 'Active' ? '● On Duty' : '○ On Leave'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12 }}>
                    <div className="kv" style={{ marginBottom: 4 }}>
                      <span className="k">Clinic Chamber:</span>
                      <span style={{ fontWeight: 700 }}>{doc.room}</span>
                    </div>
                    <div className="kv" style={{ marginBottom: 4 }}>
                      <span className="k">OPD Timings:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{doc.hours}</span>
                    </div>
                    <div className="kv" style={{ marginBottom: 4 }}>
                      <span className="k">Duty Days:</span>
                      <span>{doc.days}</span>
                    </div>
                    <div className="kv" style={{ borderTop: '1px solid var(--c-border)', paddingTop: 4 }}>
                      <span className="k">Consultation Fee:</span>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--c-primary)' }}>Rs {doc.fee.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span className="hint">
                      Tokens Booked Today: <strong>{todayCount} / {doc.maxTokens}</strong>
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setActiveTab('desk');
                      }}
                    >
                      View Free Slots →
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: 12 }}
                      onClick={() => setEditingDoctor({ ...doc })}
                    >
                      Edit Routine & Fee
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: 12,
                        borderColor: doc.status === 'Active' ? 'var(--c-error)' : 'var(--c-success)',
                        color: doc.status === 'Active' ? 'var(--c-error)' : 'var(--c-success)',
                      }}
                      onClick={() => toggleDoctorStatus(doc.id)}
                    >
                      {doc.status === 'Active' ? 'Mark On Leave' : 'Set On Duty'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE OPD TOKEN SLIP */}
      {activeTokenSlip && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setActiveTokenSlip(null)}>
          <div className="modal" style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}>
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'var(--c-surface-hover)',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>OPD Patient Appointment Token</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => {
                    const patientObj = PATIENTS.find((p) => p.name === activeTokenSlip.patient || p.id === activeTokenSlip.pid);
                    const phone = patientObj?.phone || '0300-9876543';
                    const text = `${clinic.name} OPD Token Slip:\n• Patient: ${activeTokenSlip.patient} (${activeTokenSlip.pid})\n• Token: ${activeTokenSlip.token}\n• Doctor: ${activeTokenSlip.doctor}\n• Room: ${activeTokenSlip.room}\n• Time: ${activeTokenSlip.time}\n• Date: ${activeTokenSlip.date}\nPlease arrive 10 mins prior.`;
                    sendWhatsApp(phone, text);
                    showToast('WhatsApp opened with Token Slip!');
                  }}
                  title="Share token slip directly on WhatsApp"
                >
                  💬 WhatsApp Token
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const patientObj = PATIENTS.find((p) => p.name === activeTokenSlip.patient || p.id === activeTokenSlip.pid);
                    const phone = patientObj?.phone || '0300-9876543';
                    const text = `${clinic.name}: Token ${activeTokenSlip.token} confirmed for ${activeTokenSlip.patient} with ${activeTokenSlip.doctor} at ${activeTokenSlip.time}. Room: ${activeTokenSlip.room}.`;
                    sendNativeSms(phone, text);
                  }}
                  title="Send token via phone SMS"
                >
                  📱 SMS
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => setThermalSlipData(activeTokenSlip)}
                  title="Preview & print on 80mm ESC/POS thermal receipt roll"
                >
                  🖨️ Thermal (80mm)
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print A4
                </button>
                <button className="btn-icon" onClick={() => setActiveTokenSlip(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <div className="opd-token-slip">
                <div style={{ borderBottom: '2px solid var(--c-border-strong)', paddingBottom: 10, marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--c-primary)', letterSpacing: '0.04em' }}>
                    {clinic.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                    {clinic.tagline || 'Outpatient Department (OPD) Reception Desk'}
                  </div>
                </div>

                <div className="hint" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
                  CLINICAL CONSULTATION TOKEN
                </div>

                <div className="token-badge-large">{activeTokenSlip.token}</div>

                <div style={{ background: 'var(--c-surface-hover)', padding: '10px 14px', borderRadius: 8, margin: '10px 0', border: '1px solid var(--c-border)', textAlign: 'left', fontSize: 12.5 }}>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Patient Name:</span>
                    <span style={{ fontWeight: 700 }}>{activeTokenSlip.patient}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Hospital MRN:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{activeTokenSlip.pid}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Doctor:</span>
                    <span style={{ fontWeight: 600 }}>{activeTokenSlip.doctor}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Chamber:</span>
                    <span style={{ fontWeight: 700, color: 'var(--c-primary)' }}>{activeTokenSlip.room}</span>
                  </div>
                  <div className="kv" style={{ borderTop: '1px solid var(--c-border)', paddingTop: 4 }}>
                    <span className="k">Date & Time:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {activeTokenSlip.date} · {activeTokenSlip.time}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 10 }}>
                  Please arrive at the Waiting Lounge 10 minutes prior to your scheduled time. Listen for Token call on the OPD display screen.
                </div>

                <div className="barcode-box" style={{ marginTop: 12 }}>
                  <div className="barcode-stripes" />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {activeTokenSlip.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW DOCTOR */}
      {addDocModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setAddDocModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Onboard New Doctor to Hospital</div>
                <div className="hint" style={{ fontSize: 12 }}>Register clinician into OPD Chambers & Live Scheduling Desk</div>
              </div>
              <button className="btn-icon" onClick={() => setAddDocModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAddDoctor}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Doctor Full Name *</label>
                  <input
                    className="input"
                    aria-label="Doctor Full Name"
                    placeholder="e.g. Dr. Tariq Jamil"
                    value={newDocForm.name}
                    onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Medical Specialty / Dept *</label>
                    <select
                      className="input"
                      aria-label="Medical Specialty or Department"
                      value={newDocForm.dept}
                      onChange={(e) => setNewDocForm({ ...newDocForm, dept: e.target.value })}
                    >
                      <option>Cardiology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>General Medicine</option>
                      <option>Gynecology</option>
                      <option>Dermatology</option>
                      <option>Neurology</option>
                      <option>ENT & Surgery</option>
                      <option>Ophthalmology</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Assigned Chamber / Room</label>
                    <input
                      className="input"
                      aria-label="Assigned Chamber or Room"
                      placeholder="e.g. Room 208 · OPD Wing"
                      value={newDocForm.room}
                      onChange={(e) => setNewDocForm({ ...newDocForm, room: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>OPD Consultation Hours</label>
                    <input
                      className="input"
                      aria-label="OPD Consultation Hours"
                      placeholder="e.g. 10:00 AM – 04:00 PM"
                      value={newDocForm.hours}
                      onChange={(e) => setNewDocForm({ ...newDocForm, hours: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Duty Days</label>
                    <input
                      className="input"
                      aria-label="Duty Days"
                      placeholder="e.g. Mon–Fri or Mon–Sat"
                      value={newDocForm.days}
                      onChange={(e) => setNewDocForm({ ...newDocForm, days: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Consultation Fee (Rs)</label>
                    <input
                      type="number"
                      className="input"
                      aria-label="Consultation Fee (Rs)"
                      placeholder="2000"
                      value={newDocForm.fee}
                      onChange={(e) => setNewDocForm({ ...newDocForm, fee: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Max Tokens / Day</label>
                    <input
                      type="number"
                      className="input"
                      aria-label="Max Tokens Per Day"
                      placeholder="25"
                      value={newDocForm.maxTokens}
                      onChange={(e) => setNewDocForm({ ...newDocForm, maxTokens: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Contact Phone</label>
                    <input
                      className="input"
                      aria-label="Doctor Contact Phone"
                      placeholder="0300-1234567"
                      value={newDocForm.phone}
                      onChange={(e) => setNewDocForm({ ...newDocForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setAddDocModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Icon name="check" /> Register & Activate in OPD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DOCTOR ROUTINE & TIMINGS */}
      {editingDoctor && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setEditingDoctor(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Manage Doctor Routine & Fees</div>
                <div className="hint" style={{ fontSize: 12 }}>{editingDoctor.name} · {editingDoctor.dept}</div>
              </div>
              <button className="btn-icon" onClick={() => setEditingDoctor(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleUpdateDoctorRoutine}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Current Status / Availability</label>
                  <select
                    className="input"
                    aria-label="Current Status and Availability"
                    value={editingDoctor.status}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, status: e.target.value })}
                  >
                    <option value="Active">● Active / On Duty</option>
                    <option value="On Leave">○ On Leave (Disable Slots)</option>
                  </select>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Chamber / Clinic Room</label>
                    <input
                      className="input"
                      aria-label="Chamber and Clinic Room"
                      value={editingDoctor.room}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, room: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Consultation Fee (Rs)</label>
                    <input
                      type="number"
                      className="input"
                      aria-label="Consultation Fee (Rs)"
                      value={editingDoctor.fee}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, fee: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>OPD Duty Timings</label>
                    <input
                      className="input"
                      aria-label="OPD Duty Timings"
                      value={editingDoctor.hours}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, hours: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Duty Days</label>
                    <input
                      className="input"
                      aria-label="Duty Days"
                      value={editingDoctor.days}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, days: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Max Daily Tokens</label>
                    <input
                      type="number"
                      className="input"
                      aria-label="Max Daily Tokens"
                      value={editingDoctor.maxTokens}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, maxTokens: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label>Contact Phone</label>
                    <input
                      className="input"
                      aria-label="Contact Phone"
                      value={editingDoctor.phone}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDoctor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Routine Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Express Walk-in Patient Modal */}
      {quickWalkinOpen && (
        <div className="overlay" style={{ zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal" style={{ maxWidth: 460, width: '100%' }}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Express Walk-in Patient Intake</div>
                  <div className="hint">Issue token, register patient & print thermal slip in 10 seconds</div>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setQuickWalkinOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleQuickWalkinSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Patient Full Name *</label>
                  <input
                    className="input"
                    aria-label="Patient Full Name"
                    placeholder="e.g. Tariq Mehmood"
                    value={walkinForm.name}
                    onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>WhatsApp / Mobile Phone</label>
                    <input
                      className="input"
                      aria-label="WhatsApp or Mobile Phone"
                      placeholder="e.g. 0300-1234567"
                      value={walkinForm.phone}
                      onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Triage Priority</label>
                    <select
                      className="input"
                      value={walkinForm.priority}
                      onChange={(e) => setWalkinForm({ ...walkinForm, priority: e.target.value })}
                    >
                      <option value="Normal">Normal Queue</option>
                      <option value="Urgent">Urgent / Priority</option>
                      <option value="Emergency">🚨 Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Consultant Physician *</label>
                    <select
                      className="input"
                      value={walkinForm.doctorId}
                      onChange={(e) => {
                        const doc = doctors.find((d) => d.id === e.target.value);
                        setWalkinForm({
                          ...walkinForm,
                          doctorId: e.target.value,
                          fee: doc?.fee || 2000,
                        });
                      }}
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Consultation Fee ({clinic.currency || 'Rs.'})</label>
                    <input
                      type="number"
                      className="input"
                      aria-label="Consultation Fee"
                      value={walkinForm.fee}
                      onChange={(e) => setWalkinForm({ ...walkinForm, fee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--c-surface-hover)', padding: '10px 14px', borderRadius: 8, fontSize: 12, border: '1px solid var(--c-border)' }}>
                  💡 Submitting automatically issues the next sequential token, updates the waiting queue, and prompts the <strong>80mm Thermal Print & WhatsApp dialog</strong>.
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setQuickWalkinOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none', fontWeight: 800 }}
                >
                  ⚡ Issue Token & Complete Intake
                </button>
              </div>
            </form>
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
