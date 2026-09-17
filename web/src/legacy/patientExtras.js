/**
 * Extra clinical/contact fields the Patient Profile Overview screen needs
 * that aren't part of the core PATIENTS record. Kept separate from
 * legacyEngine.js so the new (real React) Patient Profile page doesn't
 * have to touch the ported legacy engine at all.
 *
 * This is still frontend-only mock data — replace with real API calls
 * once the patient profile aggregate endpoint is wired up.
 */
const DEFAULT_EXTRAS = {
  diagnosis: 'No diagnosis on file',
  currentMedication: 'None recorded',
  recentLab: null,
  emergencyContact: { name: '—', relationship: '—', phone: '—' },
  nextFollowUp: null,
  assignedNurse: '—',
  registeredOn: 'Jan 14, 2024',
  todayAppointment: null,
  recentActivity: [],
};

const PATIENT_EXTRAS = {
  'PT-00125': {
    diagnosis: 'Hypertension — controlled',
    currentMedication: 'Losartan 50mg — 1 tab OD',
    recentLab: { name: 'Lipid Profile', status: 'Processing' },
    emergencyContact: { name: 'Sana Ahmed', relationship: 'Spouse', phone: '0345-1119988' },
    nextFollowUp: 'Oct 05, 2026',
    assignedNurse: 'Nadia Yousaf',
    registeredOn: 'Jan 14, 2024',
    todayAppointment: { time: '09:30 AM', doctor: 'Dr. Sarah Khan', department: 'Cardiology', status: 'Waiting' },
    recentActivity: [
      { when: 'Today · 10:35 AM', text: 'Admitted to Cardiology Ward · Bed C-04' },
      { when: 'Today · 09:50 AM', text: 'Prescription issued — Losartan 50mg' },
      { when: 'Yesterday', text: 'Lab order placed — Lipid Profile' },
    ],
  },
  'PT-00127': {
    diagnosis: 'Pending — awaiting consultation',
    currentMedication: 'None recorded',
    recentLab: { name: 'Complete Blood Count', status: 'Urgent' },
    emergencyContact: { name: 'Guardian (Father)', relationship: 'Parent', phone: '0345-2233445' },
    nextFollowUp: null,
    assignedNurse: '—',
    registeredOn: 'Sep 05, 2026',
    todayAppointment: { time: '09:58 AM', doctor: 'Dr. Ayesha Raza', department: 'Pediatrics', status: 'Waiting' },
    recentActivity: [
      { when: 'Today · 09:58 AM', text: 'Checked in — waiting for Dr. Ayesha Raza' },
      { when: 'Today · 09:20 AM', text: 'Urgent CBC ordered' },
    ],
  },
  'PT-00130': {
    diagnosis: 'Type 2 Diabetes — follow-up due',
    currentMedication: 'Metformin 500mg — 1 tab BD',
    recentLab: { name: 'HbA1c', status: 'Verified' },
    emergencyContact: { name: 'Imran Malik', relationship: 'Son', phone: '0322-7788990' },
    nextFollowUp: 'Sep 10, 2026',
    assignedNurse: '—',
    registeredOn: 'Feb 02, 2022',
    todayAppointment: null,
    recentActivity: [
      { when: 'Sep 04, 2026', text: 'HbA1c result verified by Lab' },
      { when: 'Sep 02, 2026', text: 'Prescription issued — Losartan 50mg' },
    ],
  },
};

export function getPatientExtras(patientId) {
  return { ...DEFAULT_EXTRAS, ...PATIENT_EXTRAS[patientId] };
}
