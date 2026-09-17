// aiAgentService.js
// Medora HMS Clinical & Administrative Intelligence Engine

import { appointmentService } from './appointmentService.js';
import { notificationService } from './notificationService.js';
import { PATIENTS } from '../legacy/legacyEngine.js';

export const HOSPITAL_DOCTORS = [
  {
    id: 'DOC-01',
    name: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    hours: '09:00 AM – 02:00 PM',
    fee: 2500,
    days: 'Monday to Friday',
    phone: '0300-1234567',
    keywords: [
      'sarah', 'khan', 'heart', 'cardio', 'cardiology', 'cardiologist',
      'chest', 'ecg', 'blood pressure', 'hypertension', 'palpitation', 'bp'
    ]
  },
  {
    id: 'DOC-02',
    name: 'Dr. Bilal Ahmed',
    dept: 'Orthopedics',
    room: 'Room 112 · Ground Floor',
    hours: '10:00 AM – 04:00 PM',
    fee: 2500,
    days: 'Monday to Saturday',
    phone: '0301-2345678',
    keywords: [
      'bilal', 'ahmed', 'bone', 'ortho', 'orthopedic', 'orthopedics',
      'orthopedic surgeon', 'joint', 'fracture', 'spine', 'knee', 'back pain', 'leg pain'
    ]
  },
  {
    id: 'DOC-03',
    name: 'Dr. Ayesha Raza',
    dept: 'Pediatrics',
    room: 'Room 105 · OPD Wing',
    hours: '08:30 AM – 01:30 PM',
    fee: 2000,
    days: 'Monday to Friday',
    phone: '0302-3456789',
    keywords: [
      'ayesha', 'raza', 'child', 'children', 'pediatric', 'pediatrics',
      'pediatrician', 'baby', 'kid', 'kids', 'vaccination', 'infant', 'newborn'
    ]
  },
  {
    id: 'DOC-04',
    name: 'Dr. Imran Malik',
    dept: 'General Medicine',
    room: 'Room 301 · West Wing',
    hours: '11:00 AM – 05:00 PM',
    fee: 2000,
    days: 'Tuesday to Saturday',
    phone: '0303-4567890',
    keywords: [
      'imran', 'malik', 'general', 'physician', 'medicine', 'fever', 'flu',
      'cough', 'sugar', 'diabetes', 'headache', 'infection', 'stomach', 'vomit', 'diarrhea'
    ]
  },
  {
    id: 'DOC-05',
    name: 'Dr. Hina Farooq',
    dept: 'Gynecology',
    room: 'Room 218 · East Wing',
    hours: '09:00 AM – 03:00 PM',
    fee: 2500,
    days: 'Monday to Friday',
    phone: '0304-5678901',
    keywords: [
      'hina', 'farooq', 'gynae', 'gynecology', 'gynecologist', 'women',
      'obstetrics', 'maternity', 'pregnancy', 'pregnant', 'female'
    ]
  }
];

// Active multi-turn conversation memory for seamless appointment booking
let activeBookingSession = {
  stage: null, // null | 'AWAITING_DOCTOR' | 'CONFIRM_BOOKING'
  doctor: null,
  time: null,
  patientName: null
};

function isBookingIntentText(q) {
  return (
    q.includes('book') ||
    q.includes('appointment') ||
    q.includes('schedule') ||
    q.includes('token') ||
    q.includes('booking') ||
    q.includes('mulaqat') ||
    q.includes('slot') ||
    q.includes('consultation') ||
    q.includes('see doctor') ||
    q.includes('see a doctor') ||
    q.includes('checkup') ||
    q.includes('visit')
  );
}

/**
 * Execute real appointment booking and dispatch across the entire Medora ecosystem
 */
async function bookAppointmentInternal({ doctor, time, patientName, notes }) {
  const currentQueue = await appointmentService.getAppointments();
  const nextTokenNum = (Array.isArray(currentQueue) ? currentQueue.length : 5) + 1;
  const tokenStr = `TK-${String(nextTokenNum).padStart(2, '0')}`;
  const newId = `AP-${Date.now().toString().slice(-4)}`;
  const resolvedTime = time || '10:30 AM';
  const resolvedPatient = patientName && patientName.trim() ? patientName.trim() : 'Patient Guest';
  const resolvedPid = `PT-${Math.floor(10000 + Math.random() * 89999)}`;
  const todayStr = '2026-09-14'; // Syncs with active receptionist desk calendar

  const newAppointmentObj = {
    id: newId,
    token: tokenStr,
    pid: resolvedPid,
    patient: resolvedPatient,
    doctorId: doctor.id,
    doctor: doctor.name,
    dept: doctor.dept,
    room: doctor.room,
    date: todayStr,
    time: resolvedTime.includes('M') ? resolvedTime : `${resolvedTime} AM`,
    type: 'Consultation',
    priority: 'Normal',
    status: 'Waiting', // Appears in OPD Waiting Lounge, TV Display, and Desk
    fee: doctor.fee || 2000,
    notes: notes || 'Booked via Medora AI Assistant'
  };

  // Add to PATIENTS registry if not present
  if (!PATIENTS.some((p) => p.name.toLowerCase() === resolvedPatient.toLowerCase())) {
    PATIENTS.unshift({
      id: resolvedPid,
      name: resolvedPatient,
      phone: '0300-1234567',
      doctor: doctor.name,
      status: 'Waiting',
      lastVisit: 'Today (AI Booking)',
      blood: 'B+',
      allergy: 'None recorded'
    });
  }

  // Create via appointmentService
  await appointmentService.createAppointment(newAppointmentObj);

  // Trigger notification engine
  try {
    notificationService.notifyAppointmentBooked(newAppointmentObj);
  } catch (err) {
    console.warn('AI notification trigger fallback:', err);
  }

  // Clear session
  activeBookingSession = { stage: null, doctor: null, time: null, patientName: null };

  return newAppointmentObj;
}

export const aiAgentService = {
  /**
   * Reset booking conversation session
   */
  resetSession() {
    activeBookingSession = { stage: null, doctor: null, time: null, patientName: null };
  },

  /**
   * Process a text or voice query and return conversational text + actions
   */
  async processQuery(rawQuery, userContext = { role: 'patient', patientName: '' }) {
    if (!rawQuery || !rawQuery.trim()) {
      return {
        text: "I didn't catch that. Could you please repeat your question?",
        spokenText: "I didn't catch that. Could you please repeat your question?",
        action: 'PROMPT_RETRY'
      };
    }

    const q = rawQuery.toLowerCase().trim();

    // 0. RESET / CANCEL INTENT
    if (q === 'cancel' || q === 'stop' || q === 'nevermind' || q === 'reset' || q === 'nahi') {
      this.resetSession();
      return {
        text: "Booking cancelled. How else can I assist you with Medora Hospital services?",
        spokenText: "Booking cancelled. How else may I assist you?",
        action: 'CANCELLED'
      };
    }

    // 1. GREETINGS & CASUAL CONVERSATION
    if (
      q.match(/^(hi|hello|hey|salam|assalam|aoa|good morning|good afternoon|good evening|kaise ho|hal chal)$/i)
    ) {
      return {
        text: "Hello! Welcome to Medora Hospital. I am your AI Voice Assistant. I can help you book appointments, check doctor timings and availability, or explain our hospital departments. How can I help you right now?",
        spokenText: "Hello! Welcome to Medora Hospital. I am your AI Voice Assistant. You can ask me to check doctor timings, book an appointment, or guide you through hospital services. How can I assist you?",
        action: 'GREETING'
      };
    }

    // Extract time if specified (e.g. 10 AM, 11:30, 2 PM)
    const timeMatch = q.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const bookingTime = timeMatch ? timeMatch[0].toUpperCase() : null;

    // Extract patient name if spoken like "for John" or "patient Tariq"
    let patientName = userContext.patientName || '';
    const nameMatch = q.match(/(?:for|patient|name is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      patientName = nameMatch[1].replace(/^(dr|doctor|an|a)\s+/i, '').trim();
    }
    if (!patientName) {
      patientName = activeBookingSession.patientName || 'Patient Guest';
    }

    // Doctor matching helper
    const matchedDoctor = HOSPITAL_DOCTORS.find((doc) =>
      doc.keywords.some((kw) => q.includes(kw)) || q.includes(doc.name.toLowerCase())
    );

    // Number matching (1 to 5) for doctor selection
    let numberDoctor = null;
    if (q === '1' || q === 'one' || q.includes('option 1')) numberDoctor = HOSPITAL_DOCTORS[0];
    if (q === '2' || q === 'two' || q.includes('option 2')) numberDoctor = HOSPITAL_DOCTORS[1];
    if (q === '3' || q === 'three' || q.includes('option 3')) numberDoctor = HOSPITAL_DOCTORS[2];
    if (q === '4' || q === 'four' || q.includes('option 4')) numberDoctor = HOSPITAL_DOCTORS[3];
    if (q === '5' || q === 'five' || q.includes('option 5')) numberDoctor = HOSPITAL_DOCTORS[4];

    // Affirmative intent: "yes", "confirm", "book it", "haan", "sure", "ok"
    const isAffirmative = Boolean(
      q.match(/^(yes|yeah|yep|sure|ok|okay|haan|ji|confirm|book it|please do|do it|next slot)$/i) ||
      q.includes('yes please') ||
      q.includes('book it') ||
      q.includes('confirm')
    );

    // 2. STATEFUL MULTI-TURN CONTINUATION
    if (activeBookingSession.stage === 'CONFIRM_BOOKING' && activeBookingSession.doctor) {
      if (isAffirmative || isBookingIntentText(q) || bookingTime) {
        const doc = activeBookingSession.doctor;
        const apptTime = bookingTime || activeBookingSession.time || '10:30 AM';
        const appt = await bookAppointmentInternal({
          doctor: doc,
          time: apptTime,
          patientName,
          notes: 'Confirmed via Medora AI'
        });

        const reply = `✅ Confirmed! Your appointment has been booked with ${doc.name} (${doc.dept}) for ${appt.patient} at ${appt.time}. Your token is ${appt.token} in ${doc.room}. Consultation fee is Rs. ${doc.fee}.`;
        const spoken = `Great news! I have booked your appointment with ${doc.name} at ${appt.time}. Your token number is ${appt.token}. Please report to ${doc.room}.`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'BOOKING_SUCCESS',
          appointment: appt
        };
      }
    }

    if (activeBookingSession.stage === 'AWAITING_DOCTOR') {
      const selectedDoc = matchedDoctor || numberDoctor;
      if (selectedDoc) {
        const apptTime = bookingTime || '10:30 AM';
        const appt = await bookAppointmentInternal({
          doctor: selectedDoc,
          time: apptTime,
          patientName,
          notes: 'Booked via Medora AI Doctor Selection'
        });

        const reply = `✅ Appointment Confirmed! You are booked with ${selectedDoc.name} (${selectedDoc.dept}) for ${appt.patient} at ${appt.time}. Your token is ${appt.token} in ${selectedDoc.room}. Fee: Rs. ${selectedDoc.fee}.`;
        const spoken = `Done! Your token is ${appt.token} with ${selectedDoc.name} in ${selectedDoc.room}. You are live in the OPD queue.`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'BOOKING_SUCCESS',
          appointment: appt
        };
      }
    }

    // 3. APPOINTMENT BOOKING INTENT
    const isBooking = isBookingIntentText(q);

    if (isBooking) {
      const targetDoc = matchedDoctor || numberDoctor;

      if (targetDoc) {
        const apptTime = bookingTime || '10:30 AM';
        const appt = await bookAppointmentInternal({
          doctor: targetDoc,
          time: apptTime,
          patientName,
          notes: 'Booked via Medora AI Direct Booking'
        });

        const reply = `✅ Your appointment has been successfully booked with ${targetDoc.name} (${targetDoc.dept}) for ${appt.patient} at ${appt.time}.\n\n• Token Number: ${appt.token}\n• Room: ${targetDoc.room}\n• Consultation Fee: Rs. ${targetDoc.fee}\n• Status: Waiting in OPD Queue & Live on Lobby TV.`;
        const spoken = `Great news! I have booked your appointment with ${targetDoc.name} at ${appt.time}. Your token number is ${appt.token}. Please proceed to ${targetDoc.room}.`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'BOOKING_SUCCESS',
          appointment: appt
        };
      } else {
        // Start multi-turn booking flow
        activeBookingSession = {
          stage: 'AWAITING_DOCTOR',
          doctor: null,
          time: bookingTime || '10:30 AM',
          patientName
        };

        const reply = `I would be happy to book an appointment for you! Which doctor or specialist would you like to see?\n\n1. Dr. Sarah Khan (Cardiology) · Rs. 2500\n2. Dr. Bilal Ahmed (Orthopedics) · Rs. 2500\n3. Dr. Ayesha Raza (Pediatrics) · Rs. 2000\n4. Dr. Imran Malik (General Medicine) · Rs. 2000\n5. Dr. Hina Farooq (Gynecology) · Rs. 2500\n\nYou can say or tap any doctor's name to confirm.`;
        const spoken = `I can help you book an appointment right now. Which specialist would you like to consult with? For example, Dr. Sarah for Cardiology or Dr. Bilal for Orthopedics?`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'PROMPT_DOCTOR',
          doctors: HOSPITAL_DOCTORS
        };
      }
    }

    // 4. DOCTOR AVAILABILITY & TIMINGS CHECK
    const isAvailabilityQuery =
      q.includes('available') ||
      q.includes('availability') ||
      q.includes('timing') ||
      q.includes('timings') ||
      q.includes('time') ||
      q.includes('schedule') ||
      q.includes('when') ||
      q.includes('kab') ||
      q.includes('doctor') ||
      q.includes('dr');

    if (isAvailabilityQuery) {
      if (matchedDoctor) {
        // Stage session so user can reply "Yes" or "Book it"
        activeBookingSession = {
          stage: 'CONFIRM_BOOKING',
          doctor: matchedDoctor,
          time: '10:30 AM',
          patientName
        };

        const text = `${matchedDoctor.name} (${matchedDoctor.dept}) is available ${matchedDoctor.hours}, ${matchedDoctor.days} in ${matchedDoctor.room}. Consultation fee is Rs. ${matchedDoctor.fee}.\n\nWould you like me to book a token for you right now? Just say "Yes" or tap "Book Dr. ${matchedDoctor.name.split(' ')[1]}".`;
        const spoken = `${matchedDoctor.name} in ${matchedDoctor.dept} is available ${matchedDoctor.days} from ${matchedDoctor.hours} in ${matchedDoctor.room}. Would you like me to book an appointment for you?`;

        return {
          text,
          spokenText: spoken,
          action: 'DOCTOR_SCHEDULE',
          doctor: matchedDoctor
        };
      }

      const doctorSummary = HOSPITAL_DOCTORS.map(
        (d) => `• ${d.name} (${d.dept}): ${d.hours} [${d.days}] - ${d.room}`
      ).join('\n');

      return {
        text: `Here is our current OPD doctor availability schedule:\n\n${doctorSummary}\n\nYou can tell me which doctor you would like to consult with.`,
        spokenText: "Our main OPD consultants are Dr. Sarah Khan for Cardiology, Dr. Bilal Ahmed for Orthopedics, Dr. Ayesha Raza for Pediatrics, and Dr. Imran Malik for General Medicine. Which specialist would you like to book?",
        action: 'ALL_DOCTORS_SCHEDULE',
        doctors: HOSPITAL_DOCTORS
      };
    }

    // 5. HOW THE HOSPITAL WORKS / OPERATIONAL & ADMIN GUIDE
    if (
      (q.includes('how') && (q.includes('work') || q.includes('system') || q.includes('hospital') || q.includes('run'))) ||
      q.includes('workflow') ||
      q.includes('process') ||
      q.includes('guide') ||
      q.includes('tell admin')
    ) {
      const guideText = `Medora Hospital operates on an integrated clinical workflow:
1. Reception & Triage: Patients check-in, receive an automated digital token, and are assigned to OPD waiting lists.
2. Clinical Consultation: Doctors view live electronic medical records (EMR), write digital prescriptions, and order lab tests.
3. Pharmacy & Inventory: Real-time stock management alerts low supplies, manages dispensing, and tracks formulary batches.
4. Inpatient Ward & Beds: Visual bed telemetry monitors ICU, Semi-Private, and General ward occupancy with admission/discharge status.
5. 24/7 Emergency (ER): Red code trauma triage with rapid ambulance reception and critical care monitoring.
6. Billing & Cashier: Automated invoices consolidated across pharmacy, bed days, and doctor fees.`;

      const spokenGuide = "Medora Hospital runs on a synchronized clinical management system. First, patients register at reception to get a digital queue token. Next, our doctors conduct consultations and issue electronic prescriptions. Lab orders and pharmacy prescriptions sync automatically. Inpatients are assigned to monitored beds across general and ICU wards, and billing consolidates in real time.";

      return {
        text: guideText,
        spokenText: spokenGuide,
        action: 'HOSPITAL_OPERATIONS_GUIDE'
      };
    }

    // 6. EMERGENCY / ER INQUIRY
    if (q.includes('emergency') || q.includes('ambulance') || q.includes('accident') || q.includes('urgent') || q.includes('red code')) {
      return {
        text: "EMERGENCY ALERT: Medora Emergency Department (ER) operates 24 hours a day, 7 days a week at Ground Floor West Gate. For immediate ambulance dispatch or critical trauma reception, dial 1122 or call hospital hotline 0300-9998888.",
        spokenText: "Emergency alert. Our Emergency department is open 24/7 at the Ground Floor West Gate. For an ambulance, please call our emergency hotline at 0300-999-8888 immediately.",
        action: 'EMERGENCY_INFO'
      };
    }

    // 7. PHARMACY INQUIRIES
    if (q.includes('pharmacy') || q.includes('medicine') || q.includes('medication') || q.includes('stock') || q.includes('dawai')) {
      return {
        text: "The Medora Central Pharmacy is open 24/7 on the Ground Floor next to OPD. Prescriptions issued by our doctors are automatically dispatched here for quick pickup.",
        spokenText: "Our Central Pharmacy operates 24/7 on the Ground Floor. Doctor prescriptions are synced automatically for fast pickup.",
        action: 'PHARMACY_INFO'
      };
    }

    // 8. BED / WARD INQUIRIES
    if (q.includes('bed') || q.includes('ward') || q.includes('admit') || q.includes('icu') || q.includes('room')) {
      return {
        text: "Medora Hospital features 50+ inpatient beds across General Ward, Semi-Private Rooms, and Intensive Care Units (ICU). Live bed occupancy and admissions are managed under the Ward & Bed section in the system.",
        spokenText: "We have over 50 inpatient beds spanning General Wards, Private Rooms, and intensive care units. Live occupancy is monitored round the clock.",
        action: 'BED_INFO'
      };
    }

    // 9. DEFAULT INTELLIGENT FALLBACK
    return {
      text: "I am Medora AI Assistant. You can ask me:\n1. 'When is Dr. Sarah Khan available?'\n2. 'Book an appointment with Dr. Bilal at 11 AM'\n3. 'How does Medora Hospital work?'\n4. 'Where is the Emergency Room?'\nWhat would you like assistance with?",
      spokenText: "I can help you check doctor timings, book an appointment, or guide you through hospital operations. What would you like to know?",
      action: 'GENERAL_ASSISTANCE'
    };
  }
};
