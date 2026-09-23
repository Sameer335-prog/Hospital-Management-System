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
      laboratory: 'Dental Radiography & Lab',
      pharmacy: 'Dental Pharmacy & Materials',
      patients: 'Dental Patients',
      reports: 'Practice & Chair Analytics',
      staff: 'Dental Surgeons & Assistants',
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

    // Dental Specialty Appointments
    archetypeAppointments: [
      {
        id: 'AP-D01',
        token: 'TK-01',
        patient: 'Muhammad Ahmed',
        pid: 'PT-00125',
        doctorId: 'doc-d1',
        doctor: 'Dr. Ali Raza',
        dept: 'Endodontics & Root Canal',
        room: 'Dental Chair 1 · Operatory A',
        date: '2026-09-14',
        time: '09:30 AM',
        type: 'Root Canal Therapy (RCT)',
        priority: 'Normal',
        status: 'In Consultation',
        complaint: 'Tooth #19 severe nocturnal throbbing pain, deep occlusal caries',
        fee: 8500,
      },
      {
        id: 'AP-D02',
        token: 'TK-02',
        patient: 'Ayesha Bibi',
        pid: 'PT-00126',
        doctorId: 'doc-d2',
        doctor: 'Dr. Fatima Noor',
        dept: 'Orthodontics & Braces',
        room: 'Dental Chair 2 · Operatory B',
        date: '2026-09-14',
        time: '10:00 AM',
        type: 'Braces Archwire Adjustment',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'Monthly orthodontic archwire tightening and elastomeric power chain change',
        fee: 5000,
      },
      {
        id: 'AP-D03',
        token: 'TK-03',
        patient: 'Fahad Iqbal',
        pid: 'PT-00127',
        doctorId: 'doc-d3',
        doctor: 'Dr. Bilal Qureshi',
        dept: 'Oral & Maxillofacial Surgery',
        room: 'Surgical Operatory D',
        date: '2026-09-14',
        time: '10:30 AM',
        type: 'Impacted Wisdom Extraction',
        priority: 'Urgent',
        status: 'Checked-in',
        complaint: 'Severe pericoronitis, trismus and swelling around lower right 3rd molar (#32)',
        fee: 16000,
      },
      {
        id: 'AP-D04',
        token: 'TK-04',
        patient: 'Bilal Chaudhry',
        pid: 'PT-00129',
        doctorId: 'doc-d1',
        doctor: 'Dr. Ali Raza',
        dept: 'General Dentistry & Prophylaxis',
        room: 'Dental Chair 1 · Operatory A',
        date: '2026-09-14',
        time: '11:00 AM',
        type: 'Ultrasonic Scaling & Polishing',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'Calculus removal, plaque debridement and subgingival irrigation',
        fee: 3500,
      },
      {
        id: 'AP-D05',
        token: 'TK-05',
        patient: 'Sana Malik',
        pid: 'PT-00130',
        doctorId: 'doc-d2',
        doctor: 'Dr. Fatima Noor',
        dept: 'Cosmetic Dentistry & Veneers',
        room: 'Dental Chair 2 · Operatory B',
        date: '2026-09-14',
        time: '12:00 PM',
        type: 'Laser Teeth Whitening',
        priority: 'Normal',
        status: 'Confirmed',
        complaint: 'In-office dual arch teeth bleaching and shade determination',
        fee: 22000,
      },
    ],

    // Dental Quick Prescriptions
    prescriptionPresets: [
      { name: 'Augmentin 625mg (Amoxicillin + Clavulanate)', dose: '1 Tab', freq: 'Twice daily after meals', dur: '5 Days', note: 'For odontogenic infection / abscess' },
      { name: 'Flagyl 400mg (Metronidazole)', dose: '1 Tab', freq: 'TDS (3 times daily after meals)', dur: '5 Days', note: 'Anaerobic coverage for periodontal infection' },
      { name: 'Brufen 400mg (Ibuprofen)', dose: '1 Tab', freq: 'TDS as needed for dental pain', dur: '3 Days', note: 'Take strictly after meals' },
      { name: 'Hexidine 0.2% Chlorhexidine Mouthwash', dose: '10 ml', freq: 'Rinse twice daily for 60 seconds', dur: '7 Days', note: 'Do not eat or drink for 30 mins after rinse' },
      { name: 'Panadol Extra 500mg', dose: '1-2 Tabs', freq: 'Every 6-8 hours for mild ache', dur: '3 Days', note: 'Max 8 tablets in 24 hours' },
    ],

    // Dental Specialty Sample Prescriptions
    archetypePrescriptions: [
      {
        id: 'RX-D01', pid: 'PT-00125', patient: 'Muhammad Ahmed', doctor: 'Dr. Ali Raza', date: 'Sep 03, 2026', status: 'Active',
        items: [
          { medicine: 'Augmentin 625mg (Amoxicillin + Clavulanate)', dose: '1 Tab', frequency: 'Twice daily after meals', duration: '5 days' },
          { medicine: 'Flagyl 400mg (Metronidazole)', dose: '1 Tab', frequency: 'Every 8 hours', duration: '5 days' },
          { medicine: 'Hexidine 0.2% Chlorhexidine Mouthwash', dose: '10 ml', frequency: 'Twice daily rinse for 60s', duration: '7 days' },
        ],
      },
      {
        id: 'RX-D02', pid: 'PT-00130', patient: 'Sana Malik', doctor: 'Dr. Fatima Noor', date: 'Sep 02, 2026', status: 'Dispensed',
        items: [
          { medicine: 'Orthodontic Relief Wax + Panadol Extra 500mg', dose: '1 Tab', frequency: 'PRN for braces soreness', duration: '3 days' },
        ],
      },
      {
        id: 'RX-D03', pid: 'PT-00127', patient: 'Fahad Iqbal', doctor: 'Dr. Bilal Qureshi', date: 'Sep 05, 2026', status: 'Active',
        items: [
          { medicine: 'Brufen 400mg (Ibuprofen)', dose: '1 Tab', frequency: 'Every 8 hours after food', duration: '3 days' },
          { medicine: 'Amoxicillin 500mg Capsules', dose: '1 Cap', frequency: 'Every 8 hours', duration: '5 days' },
        ],
      },
    ],

    // Dental Lab & Radiography Configuration
    labTitle: 'Dental Radiography & CAD/CAM Prosthetic Lab',
    labSub: 'Intraoral Digital Sensors (IOPA) · Panoramic OPG · 3D CBCT · Zirconia Milling Tracking',
    labTests: [
      { name: 'Intraoral Periapical Radiograph (IOPA)', code: 'IOPA', turnaround: '10 min', range: 'Normal alveolar bone crest, intact lamina dura, no periapical radiolucency' },
      { name: 'Orthopantomogram (Full Mouth OPG)', code: 'OPG', turnaround: '15 min', range: 'Symmetric mandibular condyles, no radiopaque lesions, third molars visible' },
      { name: 'Bitewing Radiograph (Caries Detection)', code: 'BWX', turnaround: '10 min', range: 'Zero interproximal enamel demineralization' },
      { name: 'Cone Beam Computed Tomography (CBCT 3D)', code: 'CBCT', turnaround: '45 min', range: 'Adequate bone height (>12mm) and thickness (>6mm) for implant fixture' },
      { name: 'CAD/CAM Zirconia Crown Milling', code: 'CAD-ZR', turnaround: '24 hrs', range: 'Precision marginal adaptation (<40µm), shade A2 glaze passed' },
      { name: 'Ceramic Porcelain Veneer Fabrication', code: 'VNR', turnaround: '48 hrs', range: 'Shade match OM2 bleached, interior etched with 9% HF acid' },
      { name: 'Lateral Cephalometric Tracing & Analysis', code: 'CEPH', turnaround: '30 min', range: 'SNA 82° (±2), SNB 80° (±2), ANB 2° (Class I skeletal)' },
      { name: 'Endodontic Working Length Radiograph', code: 'WLR', turnaround: '10 min', range: 'Apical constriction verified 0.5mm coronal to radiographic apex' },
      { name: 'Dental Study Model & Alginate Cast', code: 'CAST', turnaround: '4 hrs', range: 'Type IV dental stone cast, zero air voids, centric occlusion indexed' },
      { name: 'Oral Soft Tissue Incisional Biopsy', code: 'BIO-D', turnaround: '3 days', range: 'Benign hyperkeratosis, negative for dysplastic changes' },
    ],
    archetypeLabOrders: [
      { id: 'LAB-D101', patient: 'Muhammad Ahmed', pid: 'PT-00125', test: 'Intraoral Periapical Radiograph (IOPA)', doctor: 'Dr. Ali Raza', status: 'Result Ready', priority: 'Urgent', ordered: 'Today, 09:30 AM', value: 'Periapical radiolucency on distal root of Tooth #19 (Apical Periodontitis)', range: 'Normal periapex' },
      { id: 'LAB-D102', patient: 'Fahad Iqbal', pid: 'PT-00127', test: 'Orthopantomogram (Full Mouth OPG)', doctor: 'Dr. Bilal Qureshi', status: 'Processing', priority: 'Urgent', ordered: 'Today, 10:15 AM', value: 'Horizontally impacted lower right 3rd molar (#32) in close proximity to IAC', range: 'Normal eruption path' },
      { id: 'LAB-D103', patient: 'Ayesha Bibi', pid: 'PT-00126', test: 'Lateral Cephalometric Tracing & Analysis', doctor: 'Dr. Fatima Noor', status: 'Sample Collected', priority: 'Normal', ordered: 'Today, 10:45 AM', value: 'Tracing in progress', range: 'ANB 2° ± 1°' },
      { id: 'LAB-D104', patient: 'Sana Malik', pid: 'PT-00130', test: 'CAD/CAM Zirconia Crown Milling', doctor: 'Dr. Ali Raza', status: 'Verified', priority: 'Normal', ordered: 'Yesterday, 02:00 PM', value: 'Crown sintered & glazed (Tooth #8, Vita Shade A1, contact points verified)', range: 'Pass' },
      { id: 'LAB-D105', patient: 'Bilal Chaudhry', pid: 'PT-00129', test: 'Bitewing Radiograph (Caries Detection)', doctor: 'Dr. Ali Raza', status: 'Result Ready', priority: 'Normal', ordered: 'Today, 11:20 AM', value: 'Incipient D1 interproximal enamel lesion on mesial surface of Tooth #14', range: 'No radiolucency' },
    ],

    // Dental Pharmacy & Consumables
    pharmacyTitle: 'Dental Pharmacy & Operatory Consumables',
    pharmacySub: 'Local Anesthetics · Antibiotics · Endodontic Sealers · Composite Resins & Restorative Cements',
    pharmacyMedicines: [
      { id: 'MED-D01', name: 'Lignocaine 2% + Adrenaline (1:80,000)', generic: 'Lidocaine HCl + Epinephrine', category: 'Local Anesthetic', form: 'Cartridge 1.8ml', batchNo: 'LA-2026A', stock: 120, minStock: 30, unit: 'Cartridges', price: 'Rs 150/unit', priceN: 150, expiry: 'Dec 2027', daysToExpiry: 450, status: 'In Stock', allergyClass: 'Amide Anesthetic' },
      { id: 'MED-D02', name: 'Articaine 4% + Adrenaline (1:100,000)', generic: 'Articaine HCl', category: 'Local Anesthetic', form: 'Cartridge 1.7ml', batchNo: 'ART-991', stock: 85, minStock: 25, unit: 'Cartridges', price: 'Rs 320/unit', priceN: 320, expiry: 'Oct 2027', daysToExpiry: 390, status: 'In Stock', allergyClass: 'Amide Anesthetic' },
      { id: 'MED-D03', name: 'Topical Benzocaine 20% Gel (Fast Numbing)', generic: 'Benzocaine Gel', category: 'Local Anesthetic', form: 'Gel Tube 30g', batchNo: 'BEN-44', stock: 14, minStock: 5, unit: 'Tubes', price: 'Rs 650/unit', priceN: 650, expiry: 'May 2027', daysToExpiry: 240, status: 'In Stock', allergyClass: 'Ester Anesthetic' },
      { id: 'MED-D04', name: 'Augmentin 625mg (Co-Amoxiclav)', generic: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', form: 'Tablet', batchNo: 'AUG-882', stock: 180, minStock: 40, unit: 'Tablets', price: 'Rs 45/unit', priceN: 45, expiry: 'Jan 2028', daysToExpiry: 480, status: 'In Stock', allergyClass: 'Penicillin' },
      { id: 'MED-D05', name: 'Flagyl 400mg (Metronidazole)', generic: 'Metronidazole', category: 'Antibiotic', form: 'Tablet', batchNo: 'FLG-102', stock: 240, minStock: 50, unit: 'Tablets', price: 'Rs 8/unit', priceN: 8, expiry: 'Nov 2027', daysToExpiry: 420, status: 'In Stock', allergyClass: 'Nitroimidazole' },
      { id: 'MED-D06', name: 'Brufen 400mg (Ibuprofen)', generic: 'Ibuprofen', category: 'Analgesic', form: 'Tablet', batchNo: 'BRU-330', stock: 320, minStock: 60, unit: 'Tablets', price: 'Rs 5/unit', priceN: 5, expiry: 'Feb 2028', daysToExpiry: 510, status: 'In Stock', allergyClass: 'NSAID' },
      { id: 'MED-D07', name: 'Synflex 550mg (Naproxen Sodium)', generic: 'Naproxen Sodium', category: 'Analgesic', form: 'Tablet', batchNo: 'SYN-71', stock: 95, minStock: 30, unit: 'Tablets', price: 'Rs 22/unit', priceN: 22, expiry: 'Sep 2027', daysToExpiry: 360, status: 'In Stock', allergyClass: 'NSAID' },
      { id: 'MED-D08', name: 'Hexidine 0.2% Chlorhexidine Mouthwash', generic: 'Chlorhexidine Gluconate', category: 'Antiseptic', form: 'Bottle 300ml', batchNo: 'HEX-509', stock: 65, minStock: 20, unit: 'Bottles', price: 'Rs 350/unit', priceN: 350, expiry: 'Aug 2027', daysToExpiry: 330, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D09', name: 'Filtek Z250 Universal Composite (Shade A2)', generic: 'Nano-Hybrid Composite Resin', category: 'Restorative Material', form: 'Syringe 4g', batchNo: 'FLT-11', stock: 18, minStock: 6, unit: 'Syringes', price: 'Rs 4,200/unit', priceN: 4200, expiry: 'Jun 2028', daysToExpiry: 620, status: 'In Stock', allergyClass: 'Methacrylate' },
      { id: 'MED-D10', name: 'Single Bond Universal Adhesive 5ml', generic: 'Dental Bonding Adhesive', category: 'Restorative Material', form: 'Vial 5ml', batchNo: 'SBD-90', stock: 8, minStock: 3, unit: 'Vials', price: 'Rs 7,500/unit', priceN: 7500, expiry: 'Apr 2027', daysToExpiry: 210, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D11', name: '3M Ketac Molar Glass Ionomer (GIC)', generic: 'Glass Ionomer Restorative Cement', category: 'Restorative Material', form: 'Powder/Liquid Kit', batchNo: 'KTC-42', stock: 12, minStock: 4, unit: 'Kits', price: 'Rs 5,800/unit', priceN: 5800, expiry: 'Oct 2027', daysToExpiry: 395, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D12', name: 'AH Plus Jet Endodontic Root Canal Sealer', generic: 'Epoxy Resin Root Canal Sealer', category: 'Endodontic Material', form: 'Automix Syringe 15g', batchNo: 'AHP-09', stock: 6, minStock: 2, unit: 'Syringes', price: 'Rs 11,500/unit', priceN: 11500, expiry: 'Mar 2028', daysToExpiry: 540, status: 'In Stock', allergyClass: 'Epoxy' },
      { id: 'MED-D13', name: 'Gutta Percha Points (Assorted 15–40)', generic: 'Standardized Gutta Percha Cones', category: 'Endodontic Material', form: 'Box 120 Points', batchNo: 'GP-602', stock: 24, minStock: 8, unit: 'Boxes', price: 'Rs 1,200/unit', priceN: 1200, expiry: 'Dec 2029', daysToExpiry: 1180, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D14', name: 'Sodium Hypochlorite 5.25% Irrigant (500ml)', generic: 'NaOCl Solution', category: 'Endodontic Material', form: 'Bottle 500ml', batchNo: 'HYP-31', stock: 15, minStock: 5, unit: 'Bottles', price: 'Rs 450/unit', priceN: 450, expiry: 'Nov 2026', daysToExpiry: 65, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D15', name: 'Surgical Silk Suture 3-0 Reverse Cutting', generic: 'Braided Non-Absorbable Silk Suture', category: 'Surgical Consumable', form: 'Box 12 Packets', batchNo: 'SLK-22', stock: 16, minStock: 5, unit: 'Boxes', price: 'Rs 2,400/unit', priceN: 2400, expiry: 'Jan 2029', daysToExpiry: 850, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-D16', name: 'Alvogyl Dry Socket Antiseptic Paste', generic: 'Iodoform + Butamben Dressing', category: 'Surgical Consumable', form: 'Jar 12g', batchNo: 'ALV-05', stock: 4, minStock: 2, unit: 'Jars', price: 'Rs 6,800/unit', priceN: 6800, expiry: 'Sep 2027', daysToExpiry: 360, status: 'Low Stock', allergyClass: 'Iodine' },
    ],

    // Dental Patient Directory
    archetypePatients: [
      { id: 'PT-00125', name: 'Muhammad Ahmed', age: 34, gender: 'Male', phone: '0300-1234567', blood: 'B+', allergy: 'Penicillin', condition: 'Acute Pulpitis (Tooth #19)', doctor: 'Dr. Ali Raza', status: 'OPD', room: 'Dental Chair 1 · Operatory A', registered: 'Jan 12, 2026' },
      { id: 'PT-00126', name: 'Ayesha Bibi', age: 22, gender: 'Female', phone: '0312-3456789', blood: 'O+', allergy: 'None', condition: 'Class II Division 1 Malocclusion', doctor: 'Dr. Fatima Noor', status: 'Waiting', room: 'Dental Chair 2 · Operatory B', registered: 'Feb 03, 2026' },
      { id: 'PT-00127', name: 'Fahad Iqbal', age: 28, gender: 'Male', phone: '0333-9876543', blood: 'A+', allergy: 'Aspirin', condition: 'Impacted 3rd Molar (#32) Pericoronitis', doctor: 'Dr. Bilal Qureshi', status: 'OPD', room: 'Surgical Operatory D', registered: 'Mar 19, 2026' },
      { id: 'PT-00129', name: 'Bilal Chaudhry', age: 41, gender: 'Male', phone: '0345-1122334', blood: 'AB+', allergy: 'None', condition: 'Generalized Chronic Marginal Gingivitis', doctor: 'Dr. Ali Raza', status: 'Follow-up Due', room: 'Dental Chair 1 · Operatory A', registered: 'Apr 02, 2026' },
      { id: 'PT-00130', name: 'Sana Malik', age: 26, gender: 'Female', phone: '0321-5544332', blood: 'A-', allergy: 'Sulfa', condition: 'Diastema & Anterior Discoloration', doctor: 'Dr. Fatima Noor', status: 'OPD', room: 'Dental Chair 2 · Operatory B', registered: 'May 11, 2026' },
    ],

    // Financial & Departmental Streams for Reports
    financialStreams: [
      { dept: 'Endodontics & Root Canal Therapy', visits: 142, grossPKR: 1207000, expensesPKR: 185000 },
      { dept: 'Orthodontics & Dentofacial Braces', visits: 98, grossPKR: 490000, expensesPKR: 72000 },
      { dept: 'Oral & Maxillofacial Surgery', visits: 64, grossPKR: 1024000, expensesPKR: 160000 },
      { dept: 'Cosmetic Dentistry & Smile Design', visits: 52, grossPKR: 1144000, expensesPKR: 195000 },
      { dept: 'Dental Prophylaxis & Periodontics', visits: 118, grossPKR: 413000, expensesPKR: 48000 },
      { dept: 'Prosthodontics & Zirconia Crowns', visits: 46, grossPKR: 828000, expensesPKR: 140000 },
      { dept: 'Dental Radiography & 3D CBCT', visits: 184, grossPKR: 294400, expensesPKR: 38000 },
    ],

    // Dental Staff Roster
    staffMembers: [
      { id: 'DOC-D01', name: 'Dr. Ali Raza', role: 'Doctor', dept: 'Endodontics & Root Canal', contact: '0300-9876543', schedule: 'Mon–Sat, 9:00–5:00', status: 'Active' },
      { id: 'DOC-D02', name: 'Dr. Fatima Noor', role: 'Doctor', dept: 'Orthodontics & Braces', contact: '0300-5551234', schedule: 'Tue, Thu, Sat, 11:00–7:00', status: 'Active' },
      { id: 'DOC-D03', name: 'Dr. Bilal Qureshi', role: 'Doctor', dept: 'Oral & Maxillofacial Surgery', contact: '0321-4447788', schedule: 'Mon, Wed, Fri, 2:00–8:00', status: 'Active' },
      { id: 'ST-D01', name: 'Zahra Batool', role: 'Nurse', dept: 'Operatory A (Sterilization & Suction)', contact: '0301-8889911', schedule: 'Daily 9:00–5:00', status: 'Active' },
      { id: 'ST-D02', name: 'Usman Ghani', role: 'Nurse', dept: 'Hygiene & Prophylaxis Bay', contact: '0302-7776655', schedule: 'Daily 10:00–6:00', status: 'Active' },
      { id: 'ST-D03', name: 'Khadija Bibi', role: 'Receptionist', dept: 'Front Desk & Patient Triage', contact: '0303-4443322', schedule: 'Daily 8:30–5:30', status: 'Active' },
      { id: 'ST-D04', name: 'Tariq Mehmood', role: 'Lab Technician', dept: 'CBCT & OPG Imaging Suite', contact: '0304-2221100', schedule: 'Daily 9:00–5:00', status: 'Active' },
      { id: 'ST-D05', name: 'Sadia Imran', role: 'Pharmacist', dept: 'Dental Materials & Dispensary', contact: '0305-9990011', schedule: 'Daily 9:00–6:00', status: 'Active' },
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
      laboratory: 'Pediatric Micro-Sample Lab',
      pharmacy: 'Pediatric Pharmacy & Vaccines',
      patients: 'Pediatric Patients (Kids)',
      reports: 'Growth & Vaccine Analytics',
      staff: 'Pediatricians & Nurses',
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

    // Pediatric Specialty Appointments
    archetypeAppointments: [
      {
        id: 'AP-P01',
        token: 'TK-01',
        patient: 'Baby Zain (8m)',
        pid: 'PT-00140',
        doctorId: 'doc-p2',
        doctor: 'Dr. Hamza Tariq',
        dept: 'Child Vaccination & EPI',
        room: 'Immunization Suite (Blue Bay)',
        date: '2026-09-14',
        time: '09:30 AM',
        type: 'Routine EPI Vaccination',
        priority: 'Normal',
        status: 'In Consultation',
        complaint: '9-Month Measles-1 and MR booster dose administration',
        fee: 1500,
      },
      {
        id: 'AP-P02',
        token: 'TK-02',
        patient: 'Fatima Zahra (4y)',
        pid: 'PT-00141',
        doctorId: 'doc-p1',
        doctor: 'Dr. Ayesha Malik',
        dept: 'General Pediatrics',
        room: 'Consultation Room 1 (Yellow Bay)',
        date: '2026-09-14',
        time: '10:00 AM',
        type: 'Acute Consultation',
        priority: 'Urgent',
        status: 'Waiting',
        complaint: 'Spiking pyrexia 103°F, productive croup cough & wheezing',
        fee: 2500,
      },
      {
        id: 'AP-P03',
        token: 'TK-03',
        patient: 'Ibrahim Khan (18m)',
        pid: 'PT-00142',
        doctorId: 'doc-p1',
        doctor: 'Dr. Ayesha Malik',
        dept: 'General Pediatrics',
        room: 'Consultation Room 1 (Yellow Bay)',
        date: '2026-09-14',
        time: '10:30 AM',
        type: 'Well-Child Check',
        priority: 'Normal',
        status: 'Checked-in',
        complaint: 'Routine developmental milestones & WHO growth percentile evaluation',
        fee: 2500,
      },
      {
        id: 'AP-P04',
        token: 'TK-04',
        patient: 'Ayaan Ahmed (2y)',
        pid: 'PT-00143',
        doctorId: 'doc-p2',
        doctor: 'Dr. Hamza Tariq',
        dept: 'Child Vaccination & EPI',
        room: 'Immunization Suite (Blue Bay)',
        date: '2026-09-14',
        time: '11:00 AM',
        type: 'Pneumococcal Booster',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'PCV booster vaccine and vitamin A supplementation',
        fee: 6500,
      },
      {
        id: 'AP-P05',
        token: 'TK-05',
        patient: 'Maryam Bibi (6m)',
        pid: 'PT-00144',
        doctorId: 'doc-p1',
        doctor: 'Dr. Ayesha Malik',
        dept: 'Neonatal & Infant Care',
        room: 'Well-Baby Nursery',
        date: '2026-09-14',
        time: '12:00 PM',
        type: 'Weaning & Nutrition Guidance',
        priority: 'Normal',
        status: 'Confirmed',
        complaint: 'Complementary solid food introduction and infant regurgitation advice',
        fee: 2500,
      },
    ],

    prescriptionPresets: [
      { name: 'Syrup Calpol 120mg/5ml (Paracetamol)', dose: '5 ml (based on weight)', freq: 'TDS as needed for fever', dur: '3 Days', note: 'Max 4 doses in 24 hours' },
      { name: 'Syrup Augmentin DS 312mg/5ml', dose: '5 ml', freq: 'Twice daily after milk', dur: '5 Days', note: 'Complete the antibiotic course' },
      { name: 'Pediatric Oral Rehydration Salts (ORS)', dose: '1 Sachet in 1 Litre water', freq: 'Sip after each loose stool', dur: '3 Days', note: 'Keep prepared solution refrigerated' },
      { name: 'Saline Nasal Drops (0.9% NaCl)', dose: '2 Drops in each nostril', freq: 'Before feeding & bedtime', dur: '5 Days', note: 'Relieves infant nasal congestion' },
    ],

    // Pediatric Specialty Sample Prescriptions
    archetypePrescriptions: [
      {
        id: 'RX-P01', pid: 'PT-00130', patient: 'Baby Zainab', doctor: 'Dr. Ayesha Malik', date: 'Sep 03, 2026', status: 'Active',
        items: [
          { medicine: 'Syrup Calpol 120mg/5ml (Paracetamol)', dose: '5 ml (wt based)', frequency: 'Every 8 hours PRN for fever', duration: '3 days' },
          { medicine: 'Saline Nasal Drops (0.9% NaCl)', dose: '2 Drops in each nostril', frequency: 'Before feeds & bedtime', duration: '5 days' },
        ],
      },
      {
        id: 'RX-P02', pid: 'PT-00127', patient: 'Master Fahad', doctor: 'Dr. Ayesha Malik', date: 'Sep 02, 2026', status: 'Dispensed',
        items: [
          { medicine: 'Syrup Augmentin DS 312mg/5ml', dose: '5 ml', frequency: 'Twice daily after milk', duration: '5 days' },
          { medicine: 'Pediatric Oral Rehydration Salts (ORS)', dose: '1 Sachet in 1 Litre', frequency: 'Sip after each loose stool', duration: '3 days' },
        ],
      },
      {
        id: 'RX-P03', pid: 'PT-00125', patient: 'Muhammad Ahmed (Child)', doctor: 'Dr. Ayesha Malik', date: 'Sep 05, 2026', status: 'Active',
        items: [
          { medicine: 'Syrup Brufen 100mg/5ml', dose: '5 ml', frequency: 'Every 8 hours after food', duration: '3 days' },
          { medicine: 'Pediatric Saline Nebulization Solution', dose: '3 ml', frequency: 'Twice daily via nebulizer', duration: '3 days' },
        ],
      },
    ],

    // Pediatric Lab & Diagnostics
    labTitle: 'Pediatric Diagnostic & Micro-Sample Lab',
    labSub: 'Finger-prick Micro-Volumes · Neonatal Bilirubin · Stool Reducing Substances · EPI Mantoux',
    labTests: [
      { name: 'Pediatric Micro-CBC & Differential', code: 'P-CBC', turnaround: '45 min', range: 'Hb 11.5–15.5 g/dL, WBC 5,000–12,000/µL, Platelets 150k–450k' },
      { name: 'Neonatal Bilirubin (Total & Direct)', code: 'BILI-N', turnaround: '30 min', range: 'Total < 12.0 mg/dL (Physiological safe range)' },
      { name: 'Serum Ferritin & Pediatric Iron Panel', code: 'FER-P', turnaround: '2 hrs', range: '20–200 ng/mL' },
      { name: 'Stool Routine & Reducing Substances', code: 'STL-R', turnaround: '1 hr', range: 'Negative for reducing sugars, zero RBCs, no parasites' },
      { name: 'Mantoux Tuberculin Skin Test (5 TU)', code: 'PPD', turnaround: '48 hrs', range: 'Induration < 5mm (Negative in immunocompetent child)' },
      { name: 'Micro-Sample Electrolytes (Na, K, Cl)', code: 'ELEC-P', turnaround: '45 min', range: 'Na 135–145 mmol/L, K 3.5–5.0 mmol/L' },
      { name: 'Urine Routine & Pediatric Dipstick', code: 'URN-P', turnaround: '30 min', range: 'Specific gravity 1.010–1.025, Protein Nil, Sugar Nil' },
    ],
    archetypeLabOrders: [
      { id: 'LAB-P101', patient: 'Baby of Sana (Infant)', pid: 'PT-P01', test: 'Neonatal Bilirubin (Total & Direct)', doctor: 'Dr. Ayesha Malik', status: 'Result Ready', priority: 'Urgent', ordered: 'Today, 08:45 AM', value: 'Total Bilirubin 8.4 mg/dL (Direct 0.6 mg/dL) — Phototherapy not required', range: 'Safe (< 12 mg/dL)' },
      { id: 'LAB-P102', patient: 'Zain Ali (3 yrs)', pid: 'PT-P02', test: 'Pediatric Micro-CBC & Differential', doctor: 'Dr. Bilal Qureshi', status: 'Processing', priority: 'Urgent', ordered: 'Today, 09:15 AM', value: 'Micro-sample drawn via finger-prick, running automated impedance count', range: 'Hb 12.0 g/dL' },
      { id: 'LAB-P103', patient: 'Fatima Zahra (1 yr)', pid: 'PT-P03', test: 'Stool Routine & Reducing Substances', doctor: 'Dr. Ayesha Malik', status: 'Verified', priority: 'Normal', ordered: 'Yesterday, 04:00 PM', value: 'Negative for rotavirus antigen, reducing substances absent, no Giardia cysts', range: 'Negative' },
    ],

    // Pediatric Pharmacy & Cold-Chain Store
    pharmacyTitle: 'Pediatric Pharmacy & Immunization Store',
    pharmacySub: 'WHO Pre-qualified Vaccines · Oral Suspensions · Rehydration Salts · Growth Supplements',
    pharmacyMedicines: [
      { id: 'MED-P01', name: 'Panadol Infant Drops (100mg/ml)', generic: 'Paracetamol Drops', category: 'Pediatric Antipyretic', form: 'Drops 15ml', batchNo: 'PAN-D01', stock: 150, minStock: 30, unit: 'Bottles', price: 'Rs 120/unit', priceN: 120, expiry: 'Dec 2027', daysToExpiry: 450, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-P02', name: 'Brufen Pediatric Suspension (100mg/5ml)', generic: 'Ibuprofen Suspension', category: 'Pediatric Analgesic', form: 'Syrup 120ml', batchNo: 'BRU-S1', stock: 80, minStock: 25, unit: 'Bottles', price: 'Rs 140/unit', priceN: 140, expiry: 'Oct 2027', daysToExpiry: 390, status: 'In Stock', allergyClass: 'NSAID' },
      { id: 'MED-P03', name: 'Augmentin DS Suspension (312.5mg/5ml)', generic: 'Co-Amoxiclav Powder for Oral Susp', category: 'Pediatric Antibiotic', form: 'Bottle 70ml', batchNo: 'AUG-DS', stock: 65, minStock: 20, unit: 'Bottles', price: 'Rs 310/unit', priceN: 310, expiry: 'May 2027', daysToExpiry: 240, status: 'In Stock', allergyClass: 'Penicillin' },
      { id: 'MED-P04', name: 'Hexavalent Vaccine (DTaP-IPV-HepB-Hib)', generic: 'Combination Pediatric Vaccine', category: 'Vaccine (Cold-Chain 2°–8°C)', form: 'Prefilled Syringe 0.5ml', batchNo: 'HEX-V09', stock: 45, minStock: 15, unit: 'Vials', price: 'Rs 4,800/unit', priceN: 4800, expiry: 'Jan 2028', daysToExpiry: 480, status: 'In Stock', allergyClass: 'Vaccine' },
      { id: 'MED-P05', name: 'Rotarix Oral Rotavirus Vaccine', generic: 'Live Attenuated Rotavirus', category: 'Vaccine (Cold-Chain 2°–8°C)', form: 'Oral Applicator 1.5ml', batchNo: 'ROT-33', stock: 30, minStock: 10, unit: 'Doses', price: 'Rs 3,200/unit', priceN: 3200, expiry: 'Nov 2027', daysToExpiry: 420, status: 'In Stock', allergyClass: 'Vaccine' },
      { id: 'MED-P06', name: 'Zincat Pediatric Syrup (20mg/5ml)', generic: 'Zinc Sulfate Monohydrate', category: 'Pediatric Supplement', form: 'Syrup 60ml', batchNo: 'ZNC-12', stock: 90, minStock: 20, unit: 'Bottles', price: 'Rs 95/unit', priceN: 95, expiry: 'Feb 2028', daysToExpiry: 510, status: 'In Stock', allergyClass: 'None' },
      { id: 'MED-P07', name: 'Pediatric Oral Electrolyte Salts (ORS)', generic: 'WHO Oral Rehydration Formula', category: 'Electrolyte Solution', form: 'Box 20 Sachets', batchNo: 'ORS-99', stock: 120, minStock: 40, unit: 'Boxes', price: 'Rs 380/unit', priceN: 380, expiry: 'Sep 2028', daysToExpiry: 720, status: 'In Stock', allergyClass: 'None' },
    ],

    // Pediatric Patient Directory
    archetypePatients: [
      { id: 'PT-P01', name: 'Baby of Sana (Infant 3 mos)', age: 0, gender: 'Male', phone: '0300-4441122', blood: 'O+', allergy: 'None', condition: 'Routine 10-Week Immunization (Hexavalent-2)', doctor: 'Dr. Ayesha Malik', status: 'OPD', room: 'Consultation Room 1 (Yellow Bay)', registered: 'Aug 10, 2026' },
      { id: 'PT-P02', name: 'Zain Ali (Child 3 yrs)', age: 3, gender: 'Male', phone: '0321-9988776', blood: 'B+', allergy: 'Penicillin', condition: 'Acute Viral Bronchiolitis with Wheeze', doctor: 'Dr. Bilal Qureshi', status: 'OPD', room: 'Well-Baby Nursery', registered: 'Sep 01, 2026' },
      { id: 'PT-P03', name: 'Fatima Zahra (1 yr)', age: 1, gender: 'Female', phone: '0333-1122445', blood: 'A+', allergy: 'None', condition: 'Acute Gastroenteritis & Mild Dehydration', doctor: 'Dr. Ayesha Malik', status: 'Waiting', room: 'Consultation Room 1 (Yellow Bay)', registered: 'Sep 04, 2026' },
    ],

    // Financial Streams
    financialStreams: [
      { dept: 'Child Vaccination & Cold-Chain EPI', visits: 184, grossPKR: 883200, expensesPKR: 125000 },
      { dept: 'General Outpatient Pediatrics', visits: 165, grossPKR: 495000, expensesPKR: 62000 },
      { dept: 'Neonatal & Well-Baby Nursery', visits: 72, grossPKR: 360000, expensesPKR: 48000 },
      { dept: 'Pediatric Allergy & Nutrition', visits: 54, grossPKR: 216000, expensesPKR: 32000 },
      { dept: 'Pediatric Micro-Sample Laboratory', visits: 142, grossPKR: 284000, expensesPKR: 41000 },
    ],

    // Staff Roster
    staffMembers: [
      { id: 'DOC-P01', name: 'Dr. Ayesha Malik', role: 'Doctor', dept: 'General Pediatrics', contact: '0333-5551234', schedule: 'Mon–Sat, 9:00–4:00', status: 'Active' },
      { id: 'DOC-P02', name: 'Dr. Bilal Qureshi', role: 'Doctor', dept: 'Neonatal & Infant Care', contact: '0300-8884433', schedule: 'Mon, Wed, Fri, 10:00–6:00', status: 'Active' },
      { id: 'ST-P01', name: 'Sister Maryam', role: 'Nurse', dept: 'Child Vaccination & Cold-Chain', contact: '0301-4445566', schedule: 'Daily 8:30–4:30', status: 'Active' },
      { id: 'ST-P02', name: 'Rashid Khan', role: 'Lab Technician', dept: 'Pediatric Micro-Sample Lab', contact: '0302-3332211', schedule: 'Daily 9:00–5:00', status: 'Active' },
      { id: 'ST-P03', name: 'Saima Bano', role: 'Pharmacist', dept: 'Pediatric Dispensary', contact: '0303-6667788', schedule: 'Daily 9:00–6:00', status: 'Active' },
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

    // Ophthalmology Specialty Appointments
    archetypeAppointments: [
      {
        id: 'AP-E01',
        token: 'TK-01',
        patient: 'Haji Bashir (67y)',
        pid: 'PT-00150',
        doctorId: 'doc-e1',
        doctor: 'Prof. Dr. Tariq Mehmood',
        dept: 'Cataract & Phacoemulsification',
        room: 'Exam Lane 1',
        date: '2026-09-14',
        time: '09:30 AM',
        type: 'Pre-Op Cataract Workup',
        priority: 'Normal',
        status: 'In Consultation',
        complaint: 'Grade 3 nuclear sclerotic cataract Right eye, vision 6/36, biometry plan',
        fee: 3000,
      },
      {
        id: 'AP-E02',
        token: 'TK-02',
        patient: 'Zoya Rehan (24y)',
        pid: 'PT-00151',
        doctorId: 'doc-e2',
        doctor: 'Dr. Zainab Hashmi',
        dept: 'Refraction & Contact Lens',
        room: 'Refraction Bay 2',
        date: '2026-09-14',
        time: '10:00 AM',
        type: 'Laser Vision / LASIK Screen',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'Myopic astigmatism evaluation (-4.25 DS / -1.50 DC) for custom Femto-LASIK',
        fee: 2000,
      },
      {
        id: 'AP-E03',
        token: 'TK-03',
        patient: 'Khurram Shehzad (49y)',
        pid: 'PT-00152',
        doctorId: 'doc-e1',
        doctor: 'Prof. Dr. Tariq Mehmood',
        dept: 'Glaucoma & Visual Fields',
        room: 'Perimetry Room',
        date: '2026-09-14',
        time: '10:30 AM',
        type: 'Glaucoma Follow-up',
        priority: 'Urgent',
        status: 'Checked-in',
        complaint: 'Elevated IOP 26 mmHg OS on Xalatan, Humphrey visual field defect review',
        fee: 3000,
      },
      {
        id: 'AP-E04',
        token: 'TK-04',
        patient: 'Sadia Qasim (35y)',
        pid: 'PT-00153',
        doctorId: 'doc-e2',
        doctor: 'Dr. Zainab Hashmi',
        dept: 'Comprehensive Eye Examination',
        room: 'Exam Lane 1',
        date: '2026-09-14',
        time: '11:00 AM',
        type: 'Diabetic Retinopathy Screen',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'Type 2 diabetic 10yr duration, dilated fundoscopy and macular OCT screening',
        fee: 2500,
      },
      {
        id: 'AP-E05',
        token: 'TK-05',
        patient: 'Hamza Waseem (11y)',
        pid: 'PT-00154',
        doctorId: 'doc-e2',
        doctor: 'Dr. Zainab Hashmi',
        dept: 'Refraction & Contact Lens',
        room: 'Refraction Bay 2',
        date: '2026-09-14',
        time: '12:00 PM',
        type: 'Pediatric Cycloplegic Refraction',
        priority: 'Normal',
        status: 'Confirmed',
        complaint: 'Accommodative esotropia and progressive school board blurring',
        fee: 1500,
      },
    ],

    prescriptionPresets: [
      { name: 'Moxifloxacin 0.5% Eye Drops', dose: '1 Drop in affected eye', freq: 'QID (4 times daily)', dur: '7 Days', note: 'For bacterial conjunctivitis / post-procedure' },
      { name: 'Systane Ultra / Sodium Hyaluronate Drops', dose: '1 Drop in both eyes', freq: '4-6 times daily as needed', dur: '30 Days', note: 'Preservative-free artificial tears for dry eyes' },
      { name: 'Tobramycin + Dexamethasone Drops (Tobradex)', dose: '1 Drop in operative eye', freq: 'TDS (Every 8 hours)', dur: '10 Days', note: 'Anti-inflammatory steroid combo; taper as directed' },
    ],

    // Ophthalmology Specialty Sample Prescriptions
    archetypePrescriptions: [
      {
        id: 'RX-O01', pid: 'PT-00125', patient: 'Muhammad Ahmed', doctor: 'Prof. Dr. Tariq Mehmood', date: 'Sep 03, 2026', status: 'Active',
        items: [
          { medicine: 'Moxifloxacin 0.5% Eye Drops', dose: '1 Drop (OD)', frequency: '4 times daily', duration: '7 days' },
          { medicine: 'Systane Ultra Lubricant Eye Drops', dose: '1 Drop both eyes', frequency: 'Every 4-6 hours', duration: '30 days' },
        ],
      },
      {
        id: 'RX-O02', pid: 'PT-00130', patient: 'Sana Malik', doctor: 'Dr. Hina Asif', date: 'Sep 02, 2026', status: 'Dispensed',
        items: [
          { medicine: 'Tobramycin + Dexamethasone Drops (Tobradex)', dose: '1 Drop (OS)', frequency: 'Every 8 hours', duration: '10 days' },
        ],
      },
      {
        id: 'RX-O03', pid: 'PT-00127', patient: 'Fahad Iqbal', doctor: 'Prof. Dr. Tariq Mehmood', date: 'Sep 05, 2026', status: 'Active',
        items: [
          { medicine: 'Timolol 0.5% Ophthalmic Solution', dose: '1 Drop both eyes', frequency: 'Twice daily (12 hrs apart)', duration: '30 days' },
          { medicine: 'Sodium Hyaluronate 0.1% Eye Drops', dose: '1 Drop as needed', frequency: '4 times daily', duration: '30 days' },
        ],
      },
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

    // Polyclinic Specialty Appointments
    archetypeAppointments: [
      {
        id: 'AP-M01',
        token: 'TK-01',
        patient: 'Kamran Akram (42y)',
        pid: 'PT-00160',
        doctorId: 'doc-m1',
        doctor: 'Dr. Bilal Tariq',
        dept: 'General & Family Medicine',
        room: 'Chamber 1',
        date: '2026-09-14',
        time: '09:30 AM',
        type: 'Family Practice Consult',
        priority: 'Normal',
        status: 'In Consultation',
        complaint: 'Hypertension titration & routine metabolic panel review',
        fee: 2000,
      },
      {
        id: 'AP-M02',
        token: 'TK-02',
        patient: 'Nusrat Perveen (34y)',
        pid: 'PT-00161',
        doctorId: 'doc-m2',
        doctor: 'Dr. Samina Kausar',
        dept: 'Women Health & Gynaecology',
        room: 'Chamber 2',
        date: '2026-09-14',
        time: '10:00 AM',
        type: 'Antenatal Ultrasound Review',
        priority: 'Normal',
        status: 'Waiting',
        complaint: 'Routine 24-week anomaly scan assessment and iron supplementation',
        fee: 2500,
      },
      {
        id: 'AP-M03',
        token: 'TK-03',
        patient: 'Zahid Mahmood (58y)',
        pid: 'PT-00162',
        doctorId: 'doc-m1',
        doctor: 'Dr. Bilal Tariq',
        dept: 'Diagnostic Ultrasound',
        room: 'Ultrasound Suite',
        date: '2026-09-14',
        time: '10:30 AM',
        type: 'Abdominal Ultrasound',
        priority: 'Normal',
        status: 'Checked-in',
        complaint: 'Right hypochondriac dull ache, suspected fatty liver / cholelithiasis',
        fee: 3000,
      },
    ],

    prescriptionPresets: [
      { name: 'Panadol 500mg (Paracetamol)', dose: '1-2 Tabs', freq: 'Every 6-8 hours for fever/bodyache', dur: '3 Days', note: 'Max 8 tabs in 24 hours' },
      { name: 'Omeprazole 20mg (Risek)', dose: '1 Cap', freq: 'Once daily 30 mins before breakfast', dur: '14 Days', note: 'For GERD / gastric acidity' },
      { name: 'Amoxicillin 500mg Capsules', dose: '1 Cap', freq: 'Every 8 hours after food', dur: '5 Days', note: 'Complete full course' },
      { name: 'Brufen 400mg (Ibuprofen)', dose: '1 Tab', freq: 'Every 8 hours after meals', dur: '3 Days', note: 'Anti-inflammatory & pain relief' },
    ],

    // Polyclinic Specialty Sample Prescriptions
    archetypePrescriptions: [
      {
        id: 'RX-PC01', pid: 'PT-00125', patient: 'Muhammad Ahmed', doctor: 'Dr. Bilal Tariq', date: 'Sep 03, 2026', status: 'Active',
        items: [
          { medicine: 'Panadol 500mg (Paracetamol)', dose: '1-2 Tabs', frequency: 'Every 8 hours', duration: '3 days' },
          { medicine: 'Omeprazole 20mg (Risek)', dose: '1 Cap', frequency: 'Once daily before breakfast', duration: '14 days' },
        ],
      },
      {
        id: 'RX-PC02', pid: 'PT-00130', patient: 'Sana Malik', doctor: 'Dr. Samina Kausar', date: 'Sep 02, 2026', status: 'Dispensed',
        items: [
          { medicine: 'Amoxicillin 500mg Capsules', dose: '1 Cap', frequency: 'Every 8 hours', duration: '5 days' },
          { medicine: 'Multivitamin & Iron Folate', dose: '1 Tab', frequency: 'Once daily', duration: '30 days' },
        ],
      },
    ],

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

    // Hospital Appointments
    archetypeAppointments: [
      {
        id: 'AP-3301',
        token: 'TK-01',
        patient: 'Muhammad Ahmed',
        pid: 'PT-00125',
        doctorId: 'doc-g1',
        doctor: 'Dr. Sarah Khan',
        dept: 'Cardiology',
        room: 'Room 204 · East Wing',
        date: '2026-09-14',
        time: '09:30 AM',
        type: 'Routine Follow-up',
        priority: 'Normal',
        status: 'In Consultation',
        fee: 2500,
        complaint: 'Post-CABG recovery and hypertension titration',
      },
      {
        id: 'AP-3302',
        token: 'TK-02',
        patient: 'Ayesha Bibi',
        pid: 'PT-00126',
        doctorId: 'doc-g2',
        doctor: 'Dr. Tariq Mehmood',
        dept: 'General Medicine & Pulmonology',
        room: 'Room 105 · West Wing',
        date: '2026-09-14',
        time: '10:00 AM',
        type: 'Specialist Consultation',
        priority: 'Normal',
        status: 'Waiting',
        fee: 2000,
        complaint: 'Persistent dry cough and post-viral fatigue',
      },
      {
        id: 'AP-3303',
        token: 'TK-03',
        patient: 'Bilal Chaudhry',
        pid: 'PT-00129',
        doctorId: 'doc-g3',
        doctor: 'Dr. Asad Ullah',
        dept: 'General & Laparoscopic Surgery',
        room: 'Room 302 · Surgical Block',
        date: '2026-09-14',
        time: '11:00 AM',
        type: 'Pre-Op Evaluation',
        priority: 'Normal',
        status: 'Waiting',
        fee: 3000,
        complaint: 'Laparoscopic cholecystectomy pre-anesthesia fitness',
      },
    ],

    prescriptionPresets: [
      { name: 'Losartan 50mg Tablets', dose: '1 Tab', freq: 'Once daily morning', dur: '30 Days', note: 'Hypertension maintenance' },
      { name: 'Metformin 500mg Tablets', dose: '1 Tab', freq: 'Twice daily with meals', dur: '30 Days', note: 'Type 2 Diabetes glycemic control' },
      { name: 'Ceftriaxone 1g IV Infusion', dose: '1 Vial', freq: 'Twice daily IV', dur: '3 Days', note: 'Broad-spectrum inpatient coverage' },
      { name: 'Omeprazole 40mg IV/Oral', dose: '1 Dose', freq: 'Once daily before breakfast', dur: '5 Days', note: 'GI prophylaxis' },
      { name: 'Paracetamol 500mg', dose: '1 Tab', freq: 'Every 8 hours PRN', dur: '5 Days', note: 'Antipyretic / Analgesic' },
    ],

    // General Hospital Sample Prescriptions
    archetypePrescriptions: [
      {
        id: 'RX-901', pid: 'PT-00125', patient: 'Muhammad Ahmed', doctor: 'Dr. Sarah Khan', date: 'Sep 03, 2026', status: 'Active',
        items: [
          { medicine: 'Losartan 50mg', dose: '1 tab', frequency: 'Once daily', duration: '30 days' },
          { medicine: 'Metformin 500mg', dose: '1 tab', frequency: 'Twice daily', duration: '30 days' },
        ],
      },
      {
        id: 'RX-902', pid: 'PT-00130', patient: 'Sana Malik', doctor: 'Dr. Sarah Khan', date: 'Sep 02, 2026', status: 'Dispensed',
        items: [{ medicine: 'Losartan 50mg', dose: '1 tab', frequency: 'Once daily', duration: '30 days' }],
      },
      {
        id: 'RX-903', pid: 'PT-00127', patient: 'Fahad Iqbal', doctor: 'Dr. Ayesha Raza', date: 'Sep 05, 2026', status: 'Active',
        items: [{ medicine: 'Paracetamol 500mg', dose: '1 tab', frequency: 'Every 8 hours', duration: '5 days' }],
      },
    ],

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
