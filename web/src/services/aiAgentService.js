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
 * Check if the query is a request for jokes or humor (strictly prohibited)
 */
function isJokeQuery(q) {
  return (
    q.includes('joke') ||
    q.includes('funny') ||
    q.includes('make me laugh') ||
    q.includes('tell me something funny') ||
    q.includes('humor') ||
    q.includes('latifa') ||
    q.includes('chutkula') ||
    q.includes('comedy')
  );
}

/**
 * Check if a query is related to hospital healthcare operations
 */
function isHospitalRelatedQuery(q) {
  const hospitalKeywords = [
    'doctor', 'dr', 'specialist', 'physician', 'surgeon', 'cardiologist', 'orthopedic', 'pediatrician',
    'gynecologist', 'appointment', 'book', 'schedule', 'token', 'opd', 'clinic', 'hospital', 'medora',
    'timing', 'timings', 'time', 'hours', 'available', 'availability', 'fee', 'fees', 'charges', 'cost',
    'emergency', 'er', 'ambulance', 'trauma', 'urgent', '1122', 'hotline',
    'pharmacy', 'medicine', 'medicines', 'drug', 'prescription', 'dawai',
    'bed', 'beds', 'ward', 'icu', 'admit', 'admission', 'discharge', 'room', 'inpatient',
    'lab', 'laboratory', 'test', 'tests', 'blood', 'report', 'reports', 'xray', 'ecg',
    'bill', 'billing', 'invoice', 'payment', 'cashier', 'insurance',
    'operation', 'operations', 'workflow', 'system', 'process', 'guide', 'service', 'services', 'reception', 'triage'
  ];
  return hospitalKeywords.some((kw) => q.includes(kw));
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
    notes: notes || 'Booked via Medora AI Assistant (Client Confirmed)'
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
   * Get active booking session details
   */
  getActiveBookingSession() {
    return { ...activeBookingSession };
  },

  /**
   * Reset booking conversation session
   */
  resetSession() {
    activeBookingSession = { stage: null, doctor: null, time: null, patientName: null };
  },

  /**
   * Cancel pending booking explicitly from client side
   */
  cancelPendingBooking() {
    activeBookingSession = { stage: null, doctor: null, time: null, patientName: null };
    return {
      text: "Understood. The pending appointment booking has been cancelled. What other hospital operation would you like to perform?",
      spokenText: "Understood. I have cancelled the pending appointment. What other hospital operation would you like to perform?",
      action: 'CANCELLED'
    };
  },

  /**
   * Direct client-side confirmation trigger (e.g. from Confirm button in UI)
   */
  async confirmPendingBooking(userContext = { patientName: '' }) {
    if (activeBookingSession.stage === 'CONFIRM_BOOKING' && activeBookingSession.doctor) {
      const doc = activeBookingSession.doctor;
      const apptTime = activeBookingSession.time || '10:30 AM';
      const patientName = userContext.patientName || activeBookingSession.patientName || 'Patient Guest';

      const appt = await bookAppointmentInternal({
        doctor: doc,
        time: apptTime,
        patientName,
        notes: 'Confirmed directly via client-side confirmation'
      });

      const humanThankYouText = `💐 **Thank You So Much, ${appt.patient}!**\n\nYour appointment is officially confirmed and registered in our live clinic queue.\n\n• **Token Number**: **${appt.token}**\n• **Consultant**: ${doc.name} (${doc.dept})\n• **Time & Room**: ${appt.time} · ${doc.room}\n• **Patient Name**: ${appt.patient}\n• **Consultation Fee**: Rs. ${doc.fee}\n• **Queue Status**: Live in OPD Queue & Displayed on Lobby Board\n\nWe are honored to care for you at Medora Hospital. Please arrive 10 minutes prior to your consultation. Wishing you excellent health! How else may I assist you today?`;

      const humanThankYouSpoken = `Thank you so much, ${appt.patient}! Your appointment has been successfully confirmed. Your token number is ${appt.token} with ${doc.name} in ${doc.room} for ${appt.time}. We truly appreciate you choosing Medora Hospital and look forward to taking great care of you. Wishing you wonderful health! Please let me know if you need anything else.`;

      return {
        text: humanThankYouText,
        spokenText: humanThankYouSpoken,
        action: 'BOOKING_SUCCESS',
        appointment: appt
      };
    }

    return {
      text: "There is no pending appointment awaiting confirmation. What hospital operation would you like to perform?",
      spokenText: "There is no pending appointment awaiting confirmation. What hospital operation would you like to perform?",
      action: 'NO_PENDING_BOOKING'
    };
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

    // 0. JOKE PROHIBITION POLICY
    if (isJokeQuery(q)) {
      return {
        text: "I am Maya, your personal healthcare concierge at Medora Hospital. To maintain clinical precision and respect for patient care, I do not tell jokes or share humor. I am exclusively here to assist you with doctor appointments, clinic schedules, and hospital departments. What operation would you like to perform today?",
        spokenText: "I am Maya, your healthcare concierge at Medora Hospital. To maintain clinical focus, I do not tell jokes. I am here exclusively to help you with doctor appointments, clinic schedules, and hospital services. What operation would you like to perform?",
        action: 'POLICY_RESTRICTION'
      };
    }

    // 1. RESET / CANCEL INTENT
    if (q === 'cancel' || q === 'stop' || q === 'nevermind' || q === 'reset' || q === 'nahi' || q === 'no cancel' || q === "don't book") {
      this.resetSession();
      return {
        text: "Understood. The pending request has been cancelled. What other hospital operation would you like to perform?",
        spokenText: "Understood. I have cancelled the pending request. What other hospital operation would you like to perform?",
        action: 'CANCELLED'
      };
    }

    // 2. GREETINGS & INTRODUCTIONS
    if (
      q.match(/^(hi|hello|hey|salam|assalam|aoa|good morning|good afternoon|good evening|kaise ho|hal chal|who are you)$/i) ||
      q.includes('introduce yourself') ||
      q.includes('who are you')
    ) {
      return {
        text: "Hello! I am Maya, your personal healthcare concierge at Medora Hospital. It is a pleasure to speak with you today.\n\nWhat operation would you like to perform?\n1. 📅 Book an appointment with a specialist\n2. 👨‍⚕️ Check doctor timings and consultation hours\n3. 🏥 Inquire about hospital departments & services\n4. 🚨 24/7 Emergency & ambulance information",
        spokenText: "Hello! I am Maya, your personal healthcare concierge at Medora Hospital. It is a pleasure to speak with you today. What operation would you like to perform? For example, would you like to schedule an appointment with a doctor, check consultation hours, or learn about our hospital services?",
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

    // Affirmative intent: "yes", "confirm", "book it", "haan", "sure", "ok", "please do"
    const isAffirmative = Boolean(
      q.match(/^(yes|yeah|yep|sure|ok|okay|haan|ji|confirm|book it|please do|do it|go ahead|yes please|confirm it)$/i) ||
      q.includes('yes please') ||
      q.includes('please confirm') ||
      q.includes('book it') ||
      q.includes('confirm booking') ||
      q.includes('go ahead') ||
      q.includes('yes confirm')
    );

    // Negative intent during confirmation: "no", "don't", "cancel", "stop", "wait", "change"
    const isNegative = Boolean(
      q.match(/^(no|nope|dont|don't|cancel|stop|wait|nahi|na|change)$/i) ||
      q.includes('do not book') ||
      q.includes('no cancel')
    );

    // 3. STEP 2: CLIENT CONFIRMATION STAGE
    if (activeBookingSession.stage === 'CONFIRM_BOOKING' && activeBookingSession.doctor) {
      if (isNegative) {
        this.resetSession();
        return {
          text: "Understood. The appointment booking has been cancelled. What other hospital operation would you like to perform?",
          spokenText: "Understood. I have cancelled the pending appointment. What other hospital operation would you like to perform?",
          action: 'CANCELLED'
        };
      }

      if (isAffirmative || isBookingIntentText(q)) {
        const doc = activeBookingSession.doctor;
        const apptTime = bookingTime || activeBookingSession.time || '10:30 AM';
        const appt = await bookAppointmentInternal({
          doctor: doc,
          time: apptTime,
          patientName,
          notes: 'Confirmed via Medora AI Client Voice/Action'
        });

        const humanThankYouText = `💐 **Thank You So Much, ${appt.patient}!**\n\nYour appointment is officially confirmed and registered in our live clinic queue.\n\n• **Token Number**: **${appt.token}**\n• **Consultant**: ${doc.name} (${doc.dept})\n• **Scheduled Time**: ${appt.time}\n• **Clinic Room**: ${doc.room}\n• **Consultation Fee**: Rs. ${doc.fee}\n• **Queue Status**: Live in OPD Waiting Lounge\n\nWe truly appreciate you choosing Medora Hospital, and our clinical team looks forward to taking great care of you. Please arrive 10 minutes before your consultation. Wishing you wonderful health and wellness! How else may I assist you today?`;

        const humanThankYouSpoken = `Thank you so much, ${appt.patient}! Your appointment has been successfully confirmed. Your token number is ${appt.token} with ${doc.name} in ${doc.room} for ${appt.time}. We truly appreciate you choosing Medora Hospital and look forward to taking great care of you. Wishing you wonderful health! Please let me know if you need anything else.`;

        return {
          text: humanThankYouText,
          spokenText: humanThankYouSpoken,
          action: 'BOOKING_SUCCESS',
          appointment: appt
        };
      } else {
        // Still awaiting explicit confirmation from client side
        const doc = activeBookingSession.doctor;
        const apptTime = activeBookingSession.time || '10:30 AM';
        return {
          text: `Please confirm your appointment details:\n• Doctor: ${doc.name} (${doc.dept})\n• Time: ${apptTime} (Today)\n• Room: ${doc.room}\n• Fee: Rs. ${doc.fee}\n• Patient: ${patientName}\n\nWould you like me to confirm this booking for you? Please say **"Yes, confirm"** or tap **Confirm Booking**.`,
          spokenText: `Would you like me to go ahead and confirm your appointment with ${doc.name} for today at ${apptTime}? Please say yes or tap confirm on your screen.`,
          action: 'CONFIRMATION_REQUIRED',
          pendingAppointment: {
            doctor: doc,
            time: apptTime,
            patientName,
            fee: doc.fee,
            room: doc.room,
            dept: doc.dept
          }
        };
      }
    }

    // 4. SELECTION FROM AWAITING_DOCTOR STAGE
    if (activeBookingSession.stage === 'AWAITING_DOCTOR') {
      const selectedDoc = matchedDoctor || numberDoctor;
      if (selectedDoc) {
        const apptTime = bookingTime || '10:30 AM';
        // DO NOT book directly — stage it for explicit client-side confirmation
        activeBookingSession = {
          stage: 'CONFIRM_BOOKING',
          doctor: selectedDoc,
          time: apptTime,
          patientName
        };

        const reply = `📋 **Appointment Booking Summary for Confirmation**\n\n• **Consultant**: ${selectedDoc.name} (${selectedDoc.dept})\n• **Consultation Time**: ${apptTime} (Today)\n• **Room**: ${selectedDoc.room}\n• **Consultation Fee**: Rs. ${selectedDoc.fee}\n• **Patient Name**: ${patientName}\n\nWould you like me to go ahead and confirm this appointment for you? Please say **"Yes, confirm"** or tap **Confirm Booking** below.`;
        const spoken = `I have arranged your appointment details with ${selectedDoc.name} in ${selectedDoc.dept} for today at ${apptTime}. The consultation fee is ${selectedDoc.fee} rupees in ${selectedDoc.room}. Would you like me to go ahead and confirm this booking for you?`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'CONFIRMATION_REQUIRED',
          pendingAppointment: {
            doctor: selectedDoc,
            time: apptTime,
            patientName,
            fee: selectedDoc.fee,
            room: selectedDoc.room,
            dept: selectedDoc.dept
          }
        };
      }
    }

    // 5. APPOINTMENT BOOKING INTENT
    const isBooking = isBookingIntentText(q);

    if (isBooking) {
      const targetDoc = matchedDoctor || numberDoctor;

      if (targetDoc) {
        const apptTime = bookingTime || '10:30 AM';
        // DO NOT book directly — stage it for explicit client-side confirmation
        activeBookingSession = {
          stage: 'CONFIRM_BOOKING',
          doctor: targetDoc,
          time: apptTime,
          patientName
        };

        const reply = `📋 **Appointment Booking Summary for Confirmation**\n\n• **Consultant**: ${targetDoc.name} (${targetDoc.dept})\n• **Consultation Time**: ${apptTime} (Today)\n• **Room**: ${targetDoc.room}\n• **Consultation Fee**: Rs. ${targetDoc.fee}\n• **Patient Name**: ${patientName}\n\nWould you like me to go ahead and confirm this appointment for you? Please say **"Yes, confirm"** or tap **Confirm Booking** below.`;
        const spoken = `I have arranged your appointment with ${targetDoc.name} in ${targetDoc.dept} for today at ${apptTime}. The consultation fee is ${targetDoc.fee} rupees in ${targetDoc.room}. Would you like me to go ahead and confirm this booking for you?`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'CONFIRMATION_REQUIRED',
          pendingAppointment: {
            doctor: targetDoc,
            time: apptTime,
            patientName,
            fee: targetDoc.fee,
            room: targetDoc.room,
            dept: targetDoc.dept
          }
        };
      } else {
        // Start multi-turn booking flow — prompt doctor selection
        activeBookingSession = {
          stage: 'AWAITING_DOCTOR',
          doctor: null,
          time: bookingTime || '10:30 AM',
          patientName
        };

        const reply = `I would be delighted to arrange an appointment for you! Which specialist doctor would you like to consult with?\n\n1. Dr. Sarah Khan (Cardiology) · Rs. 2,500\n2. Dr. Bilal Ahmed (Orthopedics) · Rs. 2,500\n3. Dr. Ayesha Raza (Pediatrics) · Rs. 2,000\n4. Dr. Imran Malik (General Medicine) · Rs. 2,000\n5. Dr. Hina Farooq (Gynecology) · Rs. 2,500\n\nYou can say or tap any doctor's name to proceed.`;
        const spoken = `I would be delighted to assist you with booking an appointment. Which specialist would you like to consult with? For example, Dr. Sarah for Cardiology or Dr. Bilal for Orthopedics?`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'PROMPT_DOCTOR',
          doctors: HOSPITAL_DOCTORS
        };
      }
    }

    // 6. DOCTOR AVAILABILITY & TIMINGS CHECK
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
        // Stage session so user can easily confirm
        activeBookingSession = {
          stage: 'CONFIRM_BOOKING',
          doctor: matchedDoctor,
          time: '10:30 AM',
          patientName
        };

        const text = `${matchedDoctor.name} (${matchedDoctor.dept}) is available ${matchedDoctor.hours}, ${matchedDoctor.days} in ${matchedDoctor.room}. The consultation fee is Rs. ${matchedDoctor.fee}.\n\nWould you like me to book an appointment with ${matchedDoctor.name} for you today? Please say **"Yes, confirm"** or tap **Confirm Booking**.`;
        const spoken = `${matchedDoctor.name} in ${matchedDoctor.dept} is available ${matchedDoctor.days} from ${matchedDoctor.hours} in ${matchedDoctor.room}. Would you like me to book an appointment with ${matchedDoctor.name} for you today?`;

        return {
          text,
          spokenText: spoken,
          action: 'CONFIRMATION_REQUIRED',
          pendingAppointment: {
            doctor: matchedDoctor,
            time: '10:30 AM',
            patientName,
            fee: matchedDoctor.fee,
            room: matchedDoctor.room,
            dept: matchedDoctor.dept
          },
          doctor: matchedDoctor
        };
      }

      const doctorSummary = HOSPITAL_DOCTORS.map(
        (d) => `• **${d.name}** (${d.dept}): ${d.hours} [${d.days}] · ${d.room} · Rs. ${d.fee}`
      ).join('\n');

      return {
        text: `Here is our current OPD specialist consultation schedule:\n\n${doctorSummary}\n\nWhich doctor or department would you like to consult?`,
        spokenText: "Our main OPD consultants are Dr. Sarah Khan for Cardiology, Dr. Bilal Ahmed for Orthopedics, Dr. Ayesha Raza for Pediatrics, Dr. Imran Malik for General Medicine, and Dr. Hina Farooq for Gynecology. Which specialist would you like to consult?",
        action: 'ALL_DOCTORS_SCHEDULE',
        doctors: HOSPITAL_DOCTORS
      };
    }

    // 7. HOW THE HOSPITAL WORKS / OPERATIONAL & CLINICAL GUIDE
    if (
      (q.includes('how') && (q.includes('work') || q.includes('system') || q.includes('hospital') || q.includes('run'))) ||
      q.includes('workflow') ||
      q.includes('process') ||
      q.includes('guide') ||
      q.includes('tell admin')
    ) {
      const guideText = `Medora Hospital operates an integrated clinical management ecosystem:
1. Reception & Triage: Patients register at the desk or online, receive an automated digital queue token, and are routed to OPD.
2. Clinical Consultation: Doctors access real-time electronic health records, issue electronic prescriptions, and place digital lab orders.
3. Pharmacy & Inventory: Formulary medications are automatically synced with the dispensary for rapid patient collection.
4. Inpatient Ward & Beds: Real-time visual telemetry tracks ICU, Semi-Private, and General Ward bed occupancy.
5. 24/7 Emergency (ER): Dedicated rapid trauma reception with 24/7 ambulance triage.
6. Billing & Cashier: Consolidated electronic invoicing across consultations, lab investigations, and pharmacy.`;

      const spokenGuide = "Medora Hospital operates on a synchronized clinical management system. First, patients register at reception to receive a digital queue token. Next, our doctors conduct consultations and issue electronic prescriptions. Lab orders and pharmacy prescriptions sync automatically. Inpatients are assigned to monitored beds across general and ICU wards, and billing consolidates in real time.";

      return {
        text: guideText,
        spokenText: spokenGuide,
        action: 'HOSPITAL_OPERATIONS_GUIDE'
      };
    }

    // 8. EMERGENCY / ER INQUIRY
    if (q.includes('emergency') || q.includes('ambulance') || q.includes('accident') || q.includes('urgent') || q.includes('red code')) {
      return {
        text: "🚨 **EMERGENCY DEPARTMENT (ER)**\nMedora Emergency operates 24 hours a day, 7 days a week at the Ground Floor West Gate.\n\n• **Hospital Emergency Hotline**: 0300-9998888\n• **National Ambulance Service**: 1122\n• **Trauma Triage**: Red, Yellow, and Green priority bays with on-duty emergency physicians.",
        spokenText: "Emergency alert. Our Emergency Department is open 24 hours a day at the Ground Floor West Gate. For immediate ambulance dispatch, please call our emergency hotline at 0300-999-8888 or dial 1122.",
        action: 'EMERGENCY_INFO'
      };
    }

    // 9. PHARMACY INQUIRIES
    if (q.includes('pharmacy') || q.includes('medicine') || q.includes('medication') || q.includes('stock') || q.includes('dawai')) {
      return {
        text: "💊 **MEDORA CENTRAL PHARMACY**\nOur in-house central pharmacy is open 24/7 on the Ground Floor adjacent to OPD Reception.\n\nPrescriptions issued by Medora physicians are automatically synced for immediate preparation and collection.",
        spokenText: "Our Central Pharmacy operates 24/7 on the Ground Floor next to OPD. Doctor prescriptions are transmitted electronically for rapid pickup.",
        action: 'PHARMACY_INFO'
      };
    }

    // 10. BED / WARD INQUIRIES
    if (q.includes('bed') || q.includes('ward') || q.includes('admit') || q.includes('icu') || q.includes('room')) {
      return {
        text: "🏥 **INPATIENT WARDS & CRITICAL CARE**\nMedora Hospital features over 50 inpatient beds across:\n• General Wards (Male & Female)\n• Semi-Private and Private Rooms\n• Intensive Care Unit (ICU) and High Dependency Unit (HDU)\n\nLive occupancy and admissions are coordinated through the Ward & Bed Telemetry department.",
        spokenText: "We maintain over 50 inpatient beds across General Wards, Private Rooms, and Intensive Care Units. Inpatient telemetry is monitored 24 hours a day.",
        action: 'BED_INFO'
      };
    }

    // 11. CHECK IF OUT OF SCOPE / IRRELEVANT ("WRONG QUESTION")
    if (!isHospitalRelatedQuery(q)) {
      return {
        text: "I am Maya, your dedicated healthcare concierge for Medora Hospital. I am strictly programmed to assist with hospital operations and cannot answer questions unrelated to our medical services.\n\nI can assist you with:\n1. 📅 Scheduling specialist doctor appointments\n2. 👨‍⚕️ Checking doctor consultation hours & fees\n3. 🏥 Inpatient wards and bed telemetry\n4. 🚨 24/7 Emergency and Central Pharmacy care\n\nWhat hospital operation would you like to perform?",
        spokenText: "I am Maya, your healthcare concierge for Medora Hospital. I am strictly dedicated to hospital services and cannot answer unrelated questions. I can help you schedule doctor appointments, check consultation hours, or guide you through our hospital departments. What operation would you like to perform?",
        action: 'OUT_OF_SCOPE'
      };
    }

    // 12. DEFAULT REASSURING FALLBACK
    return {
      text: "I am Maya, your Medora Hospital healthcare concierge. What operation would you like to perform?\n1. 'Book an appointment with Dr. Sarah Khan at 11 AM'\n2. 'When is Dr. Bilal Ahmed available?'\n3. 'How does Medora Hospital work?'\n4. 'Where is the 24/7 Emergency Room?'",
      spokenText: "I am Maya, your healthcare concierge at Medora Hospital. What operation would you like to perform? You can ask me to book an appointment, check doctor timings, or guide you through our hospital services.",
      action: 'GENERAL_ASSISTANCE'
    };
  }
};
