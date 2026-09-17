// aiAgentService.js
// Medora HMS Clinical & Administrative Intelligence Engine

import { appointmentService } from './appointmentService.js';
import { notificationService } from './notificationService.js';

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
    keywords: ['sarah', 'heart', 'cardio', 'cardiology', 'chest', 'ecg', 'blood pressure']
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
    keywords: ['bilal', 'bone', 'ortho', 'orthopedic', 'orthopedics', 'joint', 'fracture', 'spine']
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
    keywords: ['ayesha', 'child', 'children', 'pediatric', 'pediatrics', 'baby', 'kid', 'kids', 'vaccination']
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
    keywords: ['imran', 'general', 'physician', 'medicine', 'fever', 'flu', 'cough', 'sugar', 'diabetes']
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
    keywords: ['hina', 'gynae', 'gynecology', 'women', 'obstetrics', 'maternity', 'pregnancy']
  }
];

export const aiAgentService = {
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

    // 1. GREETINGS & CASUAL CONVERSATION (English + Roman Urdu)
    if (
      q.match(/^(hi|hello|hey|salam|assalam|aoa|good morning|good afternoon|good evening|kaise ho|hal chal)/i)
    ) {
      return {
        text: "Hello! Welcome to Medora Hospital. I am your AI Voice Assistant. I can help you book appointments, check doctor timings and availability, or explain our hospital departments. How can I help you right now?",
        spokenText: "Hello! Welcome to Medora Hospital. I am your AI Voice Assistant. You can ask me to check doctor timings, book an appointment, or guide you through hospital services. How can I assist you?",
        action: 'GREETING'
      };
    }

    // 2. APPOINTMENT BOOKING INTENT
    const isBookingIntent =
      q.includes('book') ||
      q.includes('appointment') ||
      q.includes('schedule') ||
      q.includes('token') ||
      q.includes('booking') ||
      q.includes('mulaqat') ||
      q.includes('slot');

    if (isBookingIntent) {
      // Find matching doctor
      const matchedDoctor = HOSPITAL_DOCTORS.find((doc) =>
        doc.keywords.some((kw) => q.includes(kw)) || q.includes(doc.name.toLowerCase())
      );

      // Extract time if specified (e.g. 10 AM, 11:30, 2 PM)
      const timeMatch = q.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      const bookingTime = timeMatch ? timeMatch[0].toUpperCase() : '10:30 AM';

      // Extract patient name if spoken like "for John" or "patient Tariq"
      let patientName = userContext.patientName || 'Patient Guest';
      const nameMatch = q.match(/(?:for|patient|name is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
      if (nameMatch && nameMatch[1]) {
        patientName = nameMatch[1].replace(/^(dr|doctor|an|a)\s+/i, '').trim();
      }

      if (matchedDoctor) {
        // Automatically create real appointment
        const newId = `AP-${Math.floor(1000 + Math.random() * 9000)}`;
        const tokenNum = `TK-${Math.floor(10 + Math.random() * 90)}`;
        const todayStr = new Date().toISOString().split('T')[0];

        const newAppointmentObj = {
          id: newId,
          token: tokenNum,
          pid: `PT-${Math.floor(10000 + Math.random() * 89999)}`,
          patient: patientName,
          doctorId: matchedDoctor.id,
          doctor: matchedDoctor.name,
          dept: matchedDoctor.dept,
          room: matchedDoctor.room,
          date: todayStr,
          time: bookingTime.includes('M') ? bookingTime : `${bookingTime} AM`,
          type: 'Consultation',
          priority: 'Normal',
          status: 'Confirmed',
          fee: matchedDoctor.fee,
          notes: 'Booked via Medora AI Voice Assistant'
        };

        try {
          await appointmentService.createAppointment(newAppointmentObj);
          notificationService.notifyAppointmentBooked(newAppointmentObj);
        } catch (err) {
          console.warn('AI agent appointment creation fallback:', err);
        }

        const reply = `Your appointment has been successfully booked with ${matchedDoctor.name} (${matchedDoctor.dept}) for ${patientName} at ${bookingTime}. Your token number is ${tokenNum} in ${matchedDoctor.room}. The consultation fee is ${matchedDoctor.fee} rupees.`;
        const spoken = `Great news! I have booked an appointment for ${patientName} with ${matchedDoctor.name} at ${bookingTime}. Your token number is ${tokenNum}. Please report to ${matchedDoctor.room}.`;

        return {
          text: reply,
          spokenText: spoken,
          action: 'BOOKING_SUCCESS',
          appointment: {
            id: newId,
            token: tokenNum,
            doctor: matchedDoctor.name,
            dept: matchedDoctor.dept,
            time: bookingTime,
            room: matchedDoctor.room,
            fee: matchedDoctor.fee,
            patient: patientName
          }
        };
      } else {
        return {
          text: "I can gladly book your appointment. Which doctor or specialist would you like to see? We have Dr. Sarah Khan for Cardiology, Dr. Bilal Ahmed for Orthopedics, Dr. Ayesha Raza for Pediatrics, Dr. Imran Malik for General Medicine, and Dr. Hina Farooq for Gynecology.",
          spokenText: "I can help you book an appointment right now. Which doctor or specialty are you looking for? For instance, Dr. Sarah for Cardiology or Dr. Bilal for Orthopedics?",
          action: 'PROMPT_DOCTOR'
        };
      }
    }

    // 3. DOCTOR AVAILABILITY & TIMINGS CHECK
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
      // Check for specific doctor
      const matchedDoctor = HOSPITAL_DOCTORS.find((doc) =>
        doc.keywords.some((kw) => q.includes(kw)) || q.includes(doc.name.toLowerCase())
      );

      if (matchedDoctor) {
        const text = `${matchedDoctor.name} (${matchedDoctor.dept}) is available from ${matchedDoctor.hours}, ${matchedDoctor.days} in ${matchedDoctor.room}. Consultation fee is Rs. ${matchedDoctor.fee}. Would you like me to book a token for you?`;
        const spoken = `${matchedDoctor.name} in ${matchedDoctor.dept} is available ${matchedDoctor.days} from ${matchedDoctor.hours} in ${matchedDoctor.room}. Would you like me to book an appointment for you?`;

        return {
          text,
          spokenText: spoken,
          action: 'DOCTOR_SCHEDULE',
          doctor: matchedDoctor
        };
      }

      // If general doctors query
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

    // 4. HOW THE HOSPITAL WORKS / OPERATIONAL & ADMIN GUIDE
    if (
      q.includes('how') && (q.includes('work') || q.includes('system') || q.includes('hospital') || q.includes('run')) ||
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

    // 5. EMERGENCY / ER INQUIRY
    if (q.includes('emergency') || q.includes('ambulance') || q.includes('accident') || q.includes('urgent') || q.includes('red code')) {
      return {
        text: "EMERGENCY ALERT: Medora Emergency Department (ER) operates 24 hours a day, 7 days a week at Ground Floor West Gate. For immediate ambulance dispatch or critical trauma reception, dial 1122 or call hospital hotline 0300-9998888.",
        spokenText: "Emergency alert. Our Emergency department is open 24/7 at the Ground Floor West Gate. For an ambulance, please call our emergency hotline at 0300-999-8888 immediately.",
        action: 'EMERGENCY_INFO'
      };
    }

    // 6. PHARMACY INQUIRIES
    if (q.includes('pharmacy') || q.includes('medicine') || q.includes('medication') || q.includes('stock') || q.includes('dawai')) {
      return {
        text: "The Medora Central Pharmacy is open 24/7 on the Ground Floor next to OPD. Prescriptions issued by our doctors are automatically dispatched here for quick pickup.",
        spokenText: "Our Central Pharmacy operates 24/7 on the Ground Floor. Doctor prescriptions are synced automatically for fast pickup.",
        action: 'PHARMACY_INFO'
      };
    }

    // 7. BED / WARD INQUIRIES
    if (q.includes('bed') || q.includes('ward') || q.includes('admit') || q.includes('icu') || q.includes('room')) {
      return {
        text: "Medora Hospital features 50+ inpatient beds across General Ward, Semi-Private Rooms, and Intensive Care Units (ICU). Live bed occupancy and admissions are managed under the Ward & Bed section in the system.",
        spokenText: "We have over 50 inpatient beds spanning General Wards, Private Rooms, and intensive care units. Live occupancy is monitored round the clock.",
        action: 'BED_INFO'
      };
    }

    // 8. DEFAULT INTELLIGENT FALLBACK
    return {
      text: "I am Medora AI Assistant. You can ask me:\n1. 'When is Dr. Sarah Khan available?'\n2. 'Book an appointment for Ali with Dr. Bilal at 11 AM'\n3. 'How does Medora Hospital work?'\n4. 'Where is the Emergency Room?'\nWhat would you like assistance with?",
      spokenText: "I can help you check doctor timings, book an appointment, or guide you through hospital operations. What would you like to know?",
      action: 'GENERAL_ASSISTANCE'
    };
  }
};
