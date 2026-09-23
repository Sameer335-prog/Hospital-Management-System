/**
 * specialtyConfig.js
 * Multi-Specialty Clinical Archetype Engine for Medora SaaS HMS.
 * Dynamically reconfigures terminology, navigation, clinical modules,
 * consultation tools (e.g., Odontograms), fee schedules, and AI voice persona
 * according to the clinic's medical specialty.
 */

export const SPECIALTY_ARCHETYPES = {
  dental: {
    id: 'dental',
    name: 'Dr. Ali Advanced Dental Surgery & Orthodontics',
    tagline: 'Comprehensive Dentistry, Implantology & Smile Design',
    logoIcon: '🦷',
    doctorInCharge: 'Dr. Ali Raza (BDS, RDS, M.Phil)',
    accreditation: 'PMDC Reg #DEN-98124 · Fellow Academy of General Dentistry',
    practiceType: 'Dental Surgery & Orthodontics',
    phone: '0300-9876543',
    hotline: '051-2299881',
    address: 'Plaza 14, F-10 Markaz, Islamabad, Pakistan',
    currency: 'Rs.',
    receiptFooter: 'Brush & floss twice daily. Keep smiling with Medora Dental Care!',
    thankYouMessage: 'Thank you for trusting us with your smile. Wishing you excellent dental health!',

    // Terminology Dictionary
    terminology: {
      resourceUnit: 'Dental Chair',
      resourceUnitPlural: 'Dental Chairs / Operatories',
      providerTitle: 'Dental Surgeon / Orthodontist',
      providerShort: 'Dentist',
      queueLocation: 'Dental Lounge',
      procedureTitle: 'Dental Procedure & Treatment',
      emergencyTitle: '24/7 Dental Emergency & Toothache Hotline',
      appointmentNoun: 'Chair Booking',
    },

    // Navigation Customization
    disabledRoutes: ['admissions', 'nursing'], // Outpatient practices do not need overnight bed wards
    customNavLabels: {
      consultation: 'Dental Operatory & Chart',
      appointments: 'Chair Schedule',
      prescriptions: 'Dental Rx & Mouthwashes',
    },

    // Default Specialty Departments
    departments: [
      { id: 'dept-d1', name: 'General Dentistry & Prophylaxis', room: 'Chair 1 · Operatory A' },
      { id: 'dept-d2', name: 'Orthodontics & Braces', room: 'Chair 2 · Operatory B' },
      { id: 'dept-d3', name: 'Endodontics & Root Canal', room: 'Chair 3 · Operatory C' },
      { id: 'dept-d4', name: 'Oral & Maxillofacial Surgery', room: 'Surgical Operatory D' },
      { id: 'dept-d5', name: 'Periodontics & Gum Care', room: 'Hygiene Bay 1' },
      { id: 'dept-d6', name: 'Cosmetic Dentistry & Veneers', room: 'Chair 4 · Aesthetic Suite' },
    ],

    // Default Specialty Practitioners
    doctors: [
      {
        id: 'doc-d1',
        name: 'Dr. Ali Raza',
        specialty: 'Endodontist & Dental Surgeon',
        dept: 'Endodontics & Root Canal',
        room: 'Dental Chair 1 · Operatory A',
        fee: 3000,
        phone: '0300-9876543',
        days: 'Mon - Sat (9:00 AM - 5:00 PM)',
      },
      {
        id: 'doc-d2',
        name: 'Dr. Fatima Noor',
        specialty: 'Orthodontist & Dentofacial Orthopedics',
        dept: 'Orthodontics & Braces',
        room: 'Dental Chair 2 · Operatory B',
        fee: 3500,
        phone: '0300-5551234',
        days: 'Tue, Thu, Sat (11:00 AM - 7:00 PM)',
      },
      {
        id: 'doc-d3',
        name: 'Dr. Bilal Qureshi',
        specialty: 'Oral & Maxillofacial Surgeon',
        dept: 'Oral & Maxillofacial Surgery',
        room: 'Surgical Operatory D',
        fee: 4000,
        phone: '0321-4447788',
        days: 'Mon, Wed, Fri (2:00 PM - 8:00 PM)',
      },
    ],

    // Standard Procedures & Treatment Catalog
    procedures: [
      { code: 'D1110', name: 'Dental Prophylaxis (Scaling & Polishing)', fee: 3500, category: 'Hygiene' },
      { code: 'D2330', name: 'Light-Cured Composite Filling (1 Surface)', fee: 4000, category: 'Restorative' },
      { code: 'D2331', name: 'Light-Cured Composite Filling (Multi-Surface)', fee: 5500, category: 'Restorative' },
      { code: 'D3310', name: 'Root Canal Therapy - Anterior Tooth (RCT)', fee: 8500, category: 'Endodontics' },
      { code: 'D3330', name: 'Root Canal Therapy - Molar Tooth (RCT)', fee: 12000, category: 'Endodontics' },
      { code: 'D7140', name: 'Routine Tooth Extraction (Simple)', fee: 3000, category: 'Oral Surgery' },
      { code: 'D7210', name: 'Surgical Extraction / Impacted Wisdom Tooth', fee: 16000, category: 'Oral Surgery' },
      { code: 'D2740', name: 'Zirconia / Porcelain Aesthetic Crown', fee: 18000, category: 'Prosthodontics' },
      { code: 'D0220', name: 'Digital Intraoral Periapical X-Ray (IOPA)', fee: 800, category: 'Radiology' },
      { code: 'D8080', name: 'Orthodontic Braces Monthly Adjustment', fee: 5000, category: 'Orthodontics' },
      { code: 'D9972', name: 'In-Office Laser Teeth Whitening', fee: 22000, category: 'Cosmetic' },
    ],

    // Dental Quick Prescriptions
    prescriptionPresets: [
      { name: 'Augmentin 625mg (Amoxicillin + Clavulanate)', dose: '1 Tab', freq: 'Twice daily after meals', dur: '5 Days', note: 'For odontogenic infection / abscess' },
      { name: 'Flagyl 400mg (Metronidazole)', dose: '1 Tab', freq: 'TDS (3 times daily after meals)', dur: '5 Days', note: 'Anaerobic coverage for periodontal infection' },
      { name: 'Brufen 400mg (Ibuprofen)', dose: '1 Tab', freq: 'TDS as needed for dental pain', dur: '3 Days', note: 'Take strictly after meals' },
      { name: 'Hexidine 0.2% Chlorhexidine Mouthwash', dose: '10 ml', freq: 'Rinse twice daily for 60 seconds', dur: '7 Days', note: 'Do not eat or drink for 30 mins after rinse' },
      { name: 'Panadol Extra 500mg', dose: '1-2 Tabs', freq: 'Every 6-8 hours for mild ache', dur: '3 Days', note: 'Max 8 tablets in 24 hours' },
    ],

    // AI Voice Persona Overrides
    aiPrompt: {
      roleGreeting: "Hello! I am Maya, your dental healthcare concierge at Dr. Ali Advanced Dental Surgery. How may I assist your smile today? You can schedule a dental checkup, book teeth scaling, consult for braces, or report an urgent toothache.",
      emergencyDisclaimer: "If you are suffering from acute facial swelling, severe throbbing toothache, or a knocked-out permanent tooth, please head to our dental emergency operatory immediately or call our 24/7 hotline at 0300-9876543.",
      appointmentFormatPrefix: "Dental Chair",
    },
  },

  pediatric: {
    id: 'pediatric',
    name: 'KidsCare Pediatric & Vaccination Center',
    tagline: 'Comprehensive Child Healthcare, Neonatology & Growth Tracking',
    logoIcon: '👶',
    doctorInCharge: 'Dr. Ayesha Malik (MBBS, FCPS Pediatrics)',
    accreditation: 'PMDC Reg #PEDS-4412 · Pakistan Pediatric Association Member',
    practiceType: 'Pediatric & Neonatal Clinic',
    phone: '0333-5551234',
    hotline: '051-5544332',
    address: 'Lane 4, Peshawar Road, Rawalpindi, Pakistan',
    currency: 'Rs.',
    receiptFooter: 'Emergency pediatrician on call 24/7. Keep this card for immunization tracking.',
    thankYouMessage: 'Wishing your little superhero vibrant health and speedy recovery!',

    terminology: {
      resourceUnit: 'Pediatric Bay',
      resourceUnitPlural: 'Examination Bays',
      providerTitle: 'Consultant Pediatrician',
      providerShort: 'Pediatrician',
      queueLocation: 'Kids Play & Waiting Zone',
      procedureTitle: 'Immunization & Developmental Assessment',
      emergencyTitle: '24/7 Pediatric Emergency & Neonatal Helpline',
      appointmentNoun: 'Pediatric Visit',
    },

    disabledRoutes: ['admissions'], // Day clinic
    customNavLabels: {
      consultation: 'Child Checkup & Growth',
      prescriptions: 'Pediatric Drops & Syrups',
      appointments: 'Baby Clinic Schedule',
    },

    departments: [
      { id: 'dept-p1', name: 'General Pediatrics', room: 'Consultation Room 1 (Yellow Bay)' },
      { id: 'dept-p2', name: 'Child Vaccination & EPI', room: 'Immunization Suite (Blue Bay)' },
      { id: 'dept-p3', name: 'Neonatal & Infant Care', room: 'Well-Baby Nursery' },
      { id: 'dept-p4', name: 'Pediatric Nutrition & Allergy', room: 'Nutritional Clinic' },
    ],

    doctors: [
      {
        id: 'doc-p1',
        name: 'Dr. Ayesha Malik',
        specialty: 'Consultant Pediatrician',
        dept: 'General Pediatrics',
        room: 'Consultation Room 1 (Yellow Bay)',
        fee: 2500,
        phone: '0333-5551234',
        days: 'Mon - Sat (10:00 AM - 4:00 PM)',
      },
      {
        id: 'doc-p2',
        name: 'Dr. Hamza Tariq',
        specialty: 'Neonatologist & Vaccination Specialist',
        dept: 'Child Vaccination & EPI',
        room: 'Immunization Suite (Blue Bay)',
        fee: 2500,
        phone: '0321-4447788',
        days: 'Mon, Wed, Fri (3:00 PM - 8:00 PM)',
      },
    ],

    procedures: [
      { code: 'PED-VAC-01', name: 'Routine Infant Immunization (EPI Schedule)', fee: 1500, category: 'Vaccination' },
      { code: 'PED-VAC-02', name: 'Pneumococcal Conjugate Vaccine (PCV)', fee: 6500, category: 'Vaccination' },
      { code: 'PED-VAC-03', name: 'Rotavirus Oral Vaccine (2 Doses)', fee: 5200, category: 'Vaccination' },
      { code: 'PED-CHK-01', name: 'Well-Child Milestone & Growth Evaluation', fee: 2500, category: 'Consultation' },
      { code: 'PED-NEB-01', name: 'Pediatric Bronchodilator Nebulization', fee: 800, category: 'Respiratory' },
    ],

    prescriptionPresets: [
      { name: 'Syrup Calpol 120mg/5ml (Paracetamol)', dose: '5 ml (based on weight)', freq: 'TDS as needed for fever', dur: '3 Days', note: 'Max 4 doses in 24 hours' },
      { name: 'Syrup Augmentin DS 312mg/5ml', dose: '5 ml', freq: 'Twice daily after milk', dur: '5 Days', note: 'Complete the antibiotic course' },
      { name: 'Pediatric Oral Rehydration Salts (ORS)', dose: '1 Sachet in 1 Litre water', freq: 'Sip after each loose stool', dur: '3 Days', note: 'Keep prepared solution refrigerated' },
      { name: 'Saline Nasal Drops (0.9% NaCl)', dose: '2 Drops in each nostril', freq: 'Before feeding & bedtime', dur: '5 Days', note: 'Relieves infant nasal congestion' },
    ],

    aiPrompt: {
      roleGreeting: "Hello! I am Maya, healthcare concierge at KidsCare Pediatric Clinic. I am here to help schedule a child checkup, book vaccinations, or consult our pediatric specialists.",
      emergencyDisclaimer: "If your child has high unyielding fever, severe dehydration, breathing difficulty, or lethargy, please bring them to our pediatric emergency station immediately or call 051-5544332.",
      appointmentFormatPrefix: "Pediatric Bay",
    },
  },

  ophthalmology: {
    id: 'ophthalmology',
    name: 'Al-Noor Eye Hospital & Laser Vision Center',
    tagline: 'Cataract, Laser Vision Correction (LASIK) & Retina Care',
    logoIcon: '👁️',
    doctorInCharge: 'Prof. Dr. Tariq Mehmood (MBBS, FRCS Ophth)',
    accreditation: 'PMDC Reg #OPH-7718 · College of Ophthalmologists Certified',
    practiceType: 'Ophthalmology & Eye Surgery Center',
    phone: '0300-1112233',
    hotline: '051-4433221',
    address: 'Commercial Area, Sector G-9, Islamabad, Pakistan',
    currency: 'Rs.',
    receiptFooter: 'Protect your vision. Follow up post-dilatation eye examination.',
    thankYouMessage: 'Clear vision is a precious blessing. Thank you for choosing Al-Noor Eye Hospital.',

    terminology: {
      resourceUnit: 'Vision Bay / Lane',
      resourceUnitPlural: 'Refraction & Exam Lanes',
      providerTitle: 'Eye Surgeon / Ophthalmologist',
      providerShort: 'Ophthalmologist',
      queueLocation: 'Vision Lounge',
      procedureTitle: 'Refraction & Ocular Procedure',
      emergencyTitle: '24/7 Ocular Trauma & Eye Emergency Line',
      appointmentNoun: 'Eye Consultation',
    },

    disabledRoutes: ['nursing'],
    customNavLabels: {
      consultation: 'Eye Exam & Refraction',
      prescriptions: 'Ophthalmic Drops & Rx',
      appointments: 'Vision Clinic Schedule',
    },

    departments: [
      { id: 'dept-e1', name: 'Comprehensive Eye Examination', room: 'Exam Lane 1' },
      { id: 'dept-e2', name: 'Cataract & Phacoemulsification', room: 'Surgical Suite A' },
      { id: 'dept-e3', name: 'Refraction & Contact Lens', room: 'Refraction Bay 2' },
      { id: 'dept-e4', name: 'Glaucoma & Visual Fields', room: 'Perimetry Room' },
    ],

    doctors: [
      {
        id: 'doc-e1',
        name: 'Prof. Dr. Tariq Mehmood',
        specialty: 'Cataract & Anterior Segment Surgeon',
        dept: 'Cataract & Phacoemulsification',
        room: 'Exam Lane 1',
        fee: 3000,
        phone: '0300-1112233',
        days: 'Mon - Fri (10:00 AM - 4:00 PM)',
      },
      {
        id: 'doc-e2',
        name: 'Dr. Zainab Hashmi',
        specialty: 'Optometrist & Refraction Specialist',
        dept: 'Refraction & Contact Lens',
        room: 'Refraction Bay 2',
        fee: 1500,
        phone: '0301-9988776',
        days: 'Mon - Sat (9:00 AM - 3:00 PM)',
      },
    ],

    procedures: [
      { code: 'OPH-REF-01', name: 'Comprehensive Slit-Lamp Exam & Refraction', fee: 2000, category: 'Diagnostics' },
      { code: 'OPH-OCT-01', name: 'Optical Coherence Tomography (OCT Retina)', fee: 4500, category: 'Imaging' },
      { code: 'OPH-CAT-01', name: 'Phaco Cataract Surgery with Monofocal IOL', fee: 45000, category: 'Surgery' },
      { code: 'OPH-YAG-01', name: 'YAG Laser Capsulotomy (Post-Cataract)', fee: 8000, category: 'Laser' },
      { code: 'OPH-TONO-01', name: 'Goldmann Applanation Tonometry (IOP Test)', fee: 1000, category: 'Glaucoma' },
    ],

    prescriptionPresets: [
      { name: 'Moxifloxacin 0.5% Eye Drops', dose: '1 Drop in affected eye', freq: 'QID (4 times daily)', dur: '7 Days', note: 'For bacterial conjunctivitis / post-procedure' },
      { name: 'Systane Ultra / Sodium Hyaluronate Drops', dose: '1 Drop in both eyes', freq: '4-6 times daily as needed', dur: '30 Days', note: 'Preservative-free artificial tears for dry eyes' },
      { name: 'Tobramycin + Dexamethasone Drops (Tobradex)', dose: '1 Drop in operative eye', freq: 'TDS (Every 8 hours)', dur: '10 Days', note: 'Anti-inflammatory steroid combo; taper as directed' },
    ],

    aiPrompt: {
      roleGreeting: "Hello! I am Maya, your healthcare concierge at Al-Noor Eye Hospital. I can assist you in booking a comprehensive eye exam, vision refraction, or consultation with our cataract specialists.",
      emergencyDisclaimer: "If you have suffered direct chemical trauma to the eye, sudden loss of vision, or severe eye pain, please flush the eye and report to our ocular emergency room immediately.",
      appointmentFormatPrefix: "Vision Bay",
    },
  },

  polyclinic: {
    id: 'polyclinic',
    name: 'Al-Madina Family Health & Ultrasound Clinic',
    tagline: 'Family Medicine, Diagnostic Ultrasound & Clinical Laboratory',
    logoIcon: '🩺',
    doctorInCharge: 'Dr. Bilal Tariq (MBBS, MCPS Family Medicine)',
    accreditation: 'PMDC Reg #MED-7719 · Punjab Healthcare Commission Licensed',
    practiceType: 'Family Polyclinic & Diagnostics',
    phone: '0321-4447788',
    hotline: '042-3588990',
    address: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
    currency: 'Rs.',
    receiptFooter: 'Ultrasound & lab reports ready in 2 hours. WhatsApp: 0321-4447788',
    thankYouMessage: 'Your family health is our sacred mission. Get well soon!',

    terminology: {
      resourceUnit: 'Doctor Chamber',
      resourceUnitPlural: 'Consulting Chambers',
      providerTitle: 'Family Physician / Specialist',
      providerShort: 'Doctor',
      queueLocation: 'OPD Waiting Lounge',
      procedureTitle: 'Diagnostic & Clinical Service',
      emergencyTitle: '24/7 Family Clinic Helpline',
      appointmentNoun: 'Clinic Appointment',
    },

    disabledRoutes: ['admissions'], // Outpatient polyclinic
    customNavLabels: {
      consultation: 'Doctor Consultation',
      prescriptions: 'Prescriptions',
      appointments: 'OPD Schedule',
    },

    departments: [
      { id: 'dept-m1', name: 'General & Family Medicine', room: 'Chamber 1' },
      { id: 'dept-m2', name: 'Diagnostic Ultrasound', room: 'Ultrasound Suite' },
      { id: 'dept-m3', name: 'Women Health & Gynaecology', room: 'Chamber 2' },
      { id: 'dept-m4', name: 'Pathology & Phlebotomy', room: 'Lab Collection' },
    ],

    doctors: [
      {
        id: 'doc-m1',
        name: 'Dr. Bilal Tariq',
        specialty: 'Consultant Family Physician',
        dept: 'General & Family Medicine',
        room: 'Chamber 1',
        fee: 2000,
        phone: '0321-4447788',
        days: 'Mon - Sat (9:00 AM - 3:00 PM)',
      },
      {
        id: 'doc-m2',
        name: 'Dr. Samina Kausar',
        specialty: 'Obstetrician & Gynecologist',
        dept: 'Women Health & Gynaecology',
        room: 'Chamber 2',
        fee: 2500,
        phone: '0300-8877665',
        days: 'Mon, Wed, Fri (4:00 PM - 8:00 PM)',
      },
    ],

    procedures: [
      { code: 'USG-ABD-01', name: 'Abdominal & Pelvic Ultrasound Scan', fee: 3000, category: 'Ultrasound' },
      { code: 'LAB-CBC-01', name: 'Complete Blood Count (CBC) with ESR', fee: 1200, category: 'Laboratory' },
      { code: 'LAB-BSF-01', name: 'Fasting Blood Sugar & HbA1c', fee: 2000, category: 'Laboratory' },
      { code: 'ECG-12L-01', name: '12-Lead Diagnostic Electrocardiogram (ECG)', fee: 1000, category: 'Cardiology' },
    ],

    prescriptionPresets: [],
    aiPrompt: {
      roleGreeting: "Hello! I am Maya, healthcare concierge at Al-Madina Family Health Clinic. How may I assist you today? I can help you book a doctor, schedule an ultrasound, or check lab test hours.",
      emergencyDisclaimer: "For urgent acute pain, high fever, or immediate attention, our polyclinic doctors are available on a walk-in basis.",
      appointmentFormatPrefix: "Chamber",
    },
  },

  general_hospital: {
    id: 'general_hospital',
    name: 'Al-Shifa Healthcare Complex',
    tagline: 'Tertiary Care Complex, 24/7 Emergency & Surgical Specialties',
    logoIcon: '🏥',
    doctorInCharge: 'Prof. Dr. Sarah Khan (FRCS, FCPS Surgery)',
    accreditation: 'PMDC Reg #ISB-HOSP-2024-9912 · ISO 9001:2015 Certified',
    practiceType: 'Tertiary General Hospital',
    phone: '051-111-222-333',
    hotline: '0300-9998888 | 1122 (Ambulance)',
    address: 'Sector H-8/4, Islamabad, Pakistan',
    currency: 'Rs.',
    receiptFooter: 'Valid for today only. Retain slip for token call announcement on LCD screens.',
    thankYouMessage: 'Thank you for choosing Al-Shifa Healthcare Complex. Wishing you good health!',

    terminology: {
      resourceUnit: 'Room / Bed',
      resourceUnitPlural: 'Clinic Rooms & Inpatient Beds',
      providerTitle: 'Consultant Physician / Surgeon',
      providerShort: 'Consultant',
      queueLocation: 'OPD Waiting Lounge',
      procedureTitle: 'Clinical & Surgical Order',
      emergencyTitle: '24/7 Trauma Center & Ambulance Rescue 1122',
      appointmentNoun: 'OPD Appointment',
    },

    disabledRoutes: [], // All modules enabled (Wards, Admissions, Nursing, Lab, Pharmacy)
    customNavLabels: {
      consultation: 'Consultation',
      appointments: 'Appointments',
      prescriptions: 'Prescriptions',
    },

    departments: [
      { id: 'dept-g1', name: 'Cardiology', room: 'Room 204 · East Wing' },
      { id: 'dept-g2', name: 'General Medicine & Pulmonology', room: 'Room 105 · West Wing' },
      { id: 'dept-g3', name: 'General & Laparoscopic Surgery', room: 'Room 302 · Surgical Block' },
      { id: 'dept-g4', name: 'Orthopedics & Joint Replacement', room: 'Room 108 · Ground Floor' },
      { id: 'dept-g5', name: 'Pediatrics & Neonatal Care', room: 'Room 210 · North Wing' },
    ],

    doctors: [
      {
        id: 'doc-g1',
        name: 'Dr. Sarah Khan',
        specialty: 'Consultant Cardiologist',
        dept: 'Cardiology',
        room: 'Room 204 · East Wing',
        fee: 2500,
        phone: '0300-1234567',
        days: 'Mon - Fri (10:00 AM - 3:00 PM)',
      },
      {
        id: 'doc-g2',
        name: 'Dr. Tariq Mehmood',
        specialty: 'Internal Medicine Specialist',
        dept: 'General Medicine & Pulmonology',
        room: 'Room 105 · West Wing',
        fee: 2000,
        phone: '0300-7654321',
        days: 'Mon - Sat (9:00 AM - 2:00 PM)',
      },
      {
        id: 'doc-g3',
        name: 'Dr. Asad Ullah',
        specialty: 'General & Laparoscopic Surgeon',
        dept: 'General & Laparoscopic Surgery',
        room: 'Room 302 · Surgical Block',
        fee: 3000,
        phone: '0321-9988776',
        days: 'Tue, Thu, Sat (11:00 AM - 5:00 PM)',
      },
    ],

    procedures: [
      { code: 'HOSP-CONS-01', name: 'Specialist Outpatient Consultation', fee: 2500, category: 'OPD' },
      { code: 'HOSP-ADM-01', name: 'General Ward Inpatient Admission (per Day)', fee: 5000, category: 'Inpatient' },
      { code: 'HOSP-ICU-01', name: 'ICU / Critical Care Bed (per Day)', fee: 25000, category: 'Intensive Care' },
      { code: 'HOSP-OT-01', name: 'Operation Theater Facility & Anesthesia Charge', fee: 35000, category: 'Surgical' },
    ],

    prescriptionPresets: [],
    aiPrompt: {
      roleGreeting: "Hello! I am Maya, your personal healthcare concierge at Al-Shifa Healthcare Complex. It is a pleasure to assist you. What operation would you like to perform today? You can book an appointment with our specialists, check doctor consultation hours, inquire about hospital departments, or request 24/7 emergency support.",
      emergencyDisclaimer: "If this is a critical medical emergency (chest pain, acute breathlessness, or major trauma), please dial 1122 or proceed to our 24/7 Emergency & Trauma Center immediately.",
      appointmentFormatPrefix: "Room",
    },
  },
};

/**
 * Returns the resolved archetype config for a given clinic profile or archetype ID.
 */
export function getSpecialtyConfig(profileOrId) {
  if (!profileOrId) return SPECIALTY_ARCHETYPES.general_hospital;
  const archetypeId = typeof profileOrId === 'string'
    ? profileOrId
    : profileOrId.archetype || detectArchetypeFromPracticeType(profileOrId.practiceType);

  return SPECIALTY_ARCHETYPES[archetypeId] || SPECIALTY_ARCHETYPES.general_hospital;
}

/**
 * Fallback detector to map legacy practiceType string to archetype ID.
 */
function detectArchetypeFromPracticeType(practiceType = '') {
  const str = String(practiceType).toLowerCase();
  if (str.includes('dent') || str.includes('tooth') || str.includes('orthodont')) return 'dental';
  if (str.includes('pediat') || str.includes('child') || str.includes('kid')) return 'pediatric';
  if (str.includes('eye') || str.includes('ophthalm') || str.includes('optom') || str.includes('vision')) return 'ophthalmology';
  if (str.includes('poly') || str.includes('family') || str.includes('diagnostic')) return 'polyclinic';
  return 'general_hospital';
}
