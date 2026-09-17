/**
 * Despite the filename/folder (kept as-is to avoid a risky mass import-path
 * rename across ~20 files), this module is NOT a render engine anymore.
 * The original HTML-string "legacy" render functions and the AppLayout
 * bridge that mounted them have been fully removed now that all 15 screens
 * are real React components (see src/pages/**). What remains here is:
 *   - realistic mock/demo data (DOCTORS, PATIENTS, APPOINTMENTS, etc.)
 *   - the icon SVG set (ICONS)
 *   - small pure helpers: visibleRoutes, navBadgeCount, getPatientById
 *   - role/route tables (ROUTES, ROLE_ROUTES, ROLE_LANDING, ROUTE_TITLES)
 * This is a frontend-only build — swap these exports for real API calls
 * once a backend exists, without needing to touch any page component.
 */

/* =========================================================
   DATA LAYER (realistic fictional hospital data)
   ========================================================= */
const DOCTORS = [
  {id:'DOC-01',name:'Dr. Sarah Khan',dept:'Cardiology',status:'Active',phone:'0300-1234567',schedule:'Mon–Fri, 9:00–4:00'},
  {id:'DOC-02',name:'Dr. Bilal Ahmed',dept:'Orthopedics',status:'Active',phone:'0301-2345678',schedule:'Mon–Sat, 10:00–6:00'},
  {id:'DOC-03',name:'Dr. Ayesha Raza',dept:'Pediatrics',status:'Active',phone:'0302-3456789',schedule:'Mon–Fri, 8:00–2:00'},
  {id:'DOC-04',name:'Dr. Imran Malik',dept:'General Medicine',status:'On Leave',phone:'0303-4567890',schedule:'Tue–Sat, 11:00–5:00'},
  {id:'DOC-05',name:'Dr. Hina Farooq',dept:'Gynecology',status:'Active',phone:'0304-5678901',schedule:'Mon–Fri, 9:00–3:00'},
];
const STAFF = [
  {id:'ST-11',name:'Nadia Yousaf',role:'Nurse',dept:'Cardiology Ward',status:'Active'},
  {id:'ST-12',name:'Kamran Sheikh',role:'Nurse',dept:'General Ward',status:'Active'},
  {id:'ST-13',name:'Farah Iqbal',role:'Receptionist',dept:'Front Desk',status:'Active'},
  {id:'ST-14',name:'Usman Tariq',role:'Lab Technician',dept:'Laboratory',status:'Active'},
  {id:'ST-15',name:'Zainab Hussain',role:'Pharmacist',dept:'Pharmacy',status:'Active'},
];
const PATIENTS = [
  {id:'PT-00109',name:'Tariq Mehmood',age:58,gender:'Male',phone:'0300-8881234',doctor:'Dr. Sarah Khan',lastVisit:'Today (ER)',status:'Admitted',blood:'B+',allergy:'Penicillin',cnic:'36302-1299901-1',ward:'ICU & Critical Care Unit',bed:'ICU-01',dob:'14 Jan 1968'},
  {id:'PT-00120',name:'Khalid Mansoor',age:64,gender:'Male',phone:'0301-4449876',doctor:'Dr. Imran Malik',lastVisit:'Sep 04, 2026',status:'Admitted',blood:'A+',allergy:'None recorded',cnic:'36302-8812903-2',ward:'ICU & Critical Care Unit',bed:'ICU-04',dob:'22 Aug 1962'},
  {id:'PT-00121',name:'Zubair Hashmi',age:51,gender:'Male',phone:'0333-7711223',doctor:'Dr. Sarah Khan',lastVisit:'Sep 03, 2026',status:'Admitted',blood:'O+',allergy:'Aspirin',cnic:'36302-6677881-3',ward:'Cardiology Ward',bed:'C-01',dob:'10 Nov 1974'},
  {id:'PT-00122',name:'Rasheeda Begum',age:60,gender:'Female',phone:'0321-5544332',doctor:'Dr. Sarah Khan',lastVisit:'Sep 02, 2026',status:'Admitted',blood:'AB+',allergy:'None recorded',cnic:'36302-5544112-4',ward:'Cardiology Ward',bed:'C-02',dob:'03 Feb 1966'},
  {id:'PT-00123',name:'Usman Farooq',age:39,gender:'Male',phone:'0345-6677889',doctor:'Dr. Bilal Ahmed',lastVisit:'Sep 04, 2026',status:'Admitted',blood:'A-',allergy:'Sulfa drugs',cnic:'36302-3322119-5',ward:'Orthopedic Ward',bed:'O-07',dob:'18 Jun 1987'},
  {id:'PT-00124',name:'Javed Akhtar',age:47,gender:'Male',phone:'0302-9988112',doctor:'Dr. Bilal Ahmed',lastVisit:'Sep 01, 2026',status:'Admitted',blood:'B-',allergy:'None recorded',cnic:'36302-7788992-6',ward:'Orthopedic Ward',bed:'O-09',dob:'09 May 1979'},
  {id:'PT-00125',name:'Muhammad Ahmed',age:42,gender:'Male',phone:'0333-1122334',doctor:'Dr. Sarah Khan',lastVisit:'Sep 03, 2026',status:'Admitted',blood:'B+',allergy:'Penicillin',cnic:'36302-1234567-1',ward:'Cardiology Ward',bed:'C-04',dob:'12 Mar 1984'},
  {id:'PT-00126',name:'Ayesha Bibi',age:29,gender:'Female',phone:'0321-9988776',doctor:'Dr. Hina Farooq',lastVisit:'Sep 05, 2026',status:'OPD',blood:'O+',allergy:'None recorded',cnic:'36302-7654321-2',ward:'-',bed:'-',dob:'19 Jul 1997'},
  {id:'PT-00127',name:'Fahad Iqbal',age:8,gender:'Male',phone:'0345-2233445',doctor:'Dr. Ayesha Raza',lastVisit:'Sep 05, 2026',status:'Waiting',blood:'A+',allergy:'Sulfa drugs',cnic:'Guardian: 36302-1112223-3',ward:'-',bed:'-',dob:'02 Feb 2018'},
  {id:'PT-00128',name:'Rukhsana Kausar',age:55,gender:'Female',phone:'0300-5566778',doctor:'Dr. Imran Malik',lastVisit:'Aug 28, 2026',status:'Discharged',blood:'AB-',allergy:'None recorded',cnic:'36302-9998887-4',ward:'-',bed:'-',dob:'14 Nov 1970'},
  {id:'PT-00129',name:'Bilal Chaudhry',age:34,gender:'Male',phone:'0311-6677889',doctor:'Dr. Bilal Ahmed',lastVisit:'Sep 04, 2026',status:'Admitted',blood:'O-',allergy:'None recorded',cnic:'36302-4445556-5',ward:'Orthopedic Ward',bed:'O-11',dob:'23 May 1992'},
  {id:'PT-00130',name:'Sana Malik',age:61,gender:'Female',phone:'0322-7788990',doctor:'Dr. Sarah Khan',lastVisit:'Sep 02, 2026',status:'Follow-up Due',blood:'B-',allergy:'Aspirin',cnic:'36302-2223334-6',ward:'-',bed:'-',dob:'08 Jan 1965'},
  {id:'PT-00131',name:'Hamza Sheikh',age:19,gender:'Male',phone:'0334-8899001',doctor:'Dr. Imran Malik',lastVisit:'Sep 05, 2026',status:'OPD',blood:'A-',allergy:'None recorded',cnic:'36302-3334445-7',ward:'-',bed:'-',dob:'30 Sep 2006'},
  {id:'PT-00132',name:'Nimra Yousaf',age:26,gender:'Female',phone:'0300-1231231',doctor:'Dr. Hina Farooq',lastVisit:'Sep 01, 2026',status:'OPD',blood:'O+',allergy:'None recorded',cnic:'36302-5556667-8',ward:'-',bed:'-',dob:'11 Apr 2000'},
  {id:'PT-00133',name:'Baby of Amina',age:1,gender:'Female',phone:'0312-3344556',doctor:'Dr. Ayesha Raza',lastVisit:'Sep 05, 2026',status:'Admitted',blood:'O+',allergy:'None recorded',cnic:'Mother: 36302-9988123-7',ward:'Pediatric & Neonatal Ward',bed:'P-05',dob:'15 Aug 2025'},
  {id:'PT-00134',name:'Abdul Rehman',age:70,gender:'Male',phone:'0305-1122334',doctor:'Dr. Imran Malik',lastVisit:'Sep 04, 2026',status:'Admitted',blood:'B+',allergy:'None recorded',cnic:'36302-4455667-8',ward:'General Medical Ward',bed:'G-15',dob:'12 Dec 1955'},
  {id:'PT-00136',name:'Ghulam Mustafa',age:53,gender:'Male',phone:'0307-2233445',doctor:'Dr. Imran Malik',lastVisit:'Sep 03, 2026',status:'Admitted',blood:'A+',allergy:'None recorded',cnic:'36302-8877665-9',ward:'General Medical Ward',bed:'G-18',dob:'25 Apr 1973'},
  {id:'PT-00137',name:'Zain Ali',age:4,gender:'Male',phone:'0346-7788990',doctor:'Dr. Ayesha Raza',lastVisit:'Sep 04, 2026',status:'Admitted',blood:'AB+',allergy:'Peanuts',cnic:'Guardian: 36302-5544332-1',ward:'Pediatric & Neonatal Ward',bed:'P-01',dob:'04 Oct 2021'},
];
const APPOINTMENTS = [
  {id:'AP-3301',patient:'Muhammad Ahmed',pid:'PT-00125',doctor:'Dr. Sarah Khan',dept:'Cardiology',time:'09:30 AM',type:'Follow-up',priority:'Normal',status:'Checked-in'},
  {id:'AP-3302',patient:'Ayesha Bibi',pid:'PT-00126',doctor:'Dr. Hina Farooq',dept:'Gynecology',time:'10:00 AM',type:'Consultation',priority:'Normal',status:'Waiting'},
  {id:'AP-3303',patient:'Fahad Iqbal',pid:'PT-00127',doctor:'Dr. Ayesha Raza',dept:'Pediatrics',time:'10:15 AM',type:'New Visit',priority:'Urgent',status:'Waiting'},
  {id:'AP-3304',patient:'Hamza Sheikh',pid:'PT-00131',doctor:'Dr. Imran Malik',dept:'General Medicine',time:'11:00 AM',type:'Consultation',priority:'Normal',status:'Confirmed'},
  {id:'AP-3305',patient:'Nimra Yousaf',pid:'PT-00132',doctor:'Dr. Hina Farooq',dept:'Gynecology',time:'11:30 AM',type:'Follow-up',priority:'Normal',status:'In Consultation'},
  {id:'AP-3306',patient:'Sana Malik',pid:'PT-00130',doctor:'Dr. Sarah Khan',dept:'Cardiology',time:'12:00 PM',type:'Follow-up',priority:'High',status:'Completed'},
  {id:'AP-3307',patient:'Rukhsana Kausar',pid:'PT-00128',doctor:'Dr. Imran Malik',dept:'General Medicine',time:'02:00 PM',type:'Consultation',priority:'Normal',status:'Cancelled'},
];
const LAB_ORDERS = [
  {id:'LAB-000892',patient:'Muhammad Ahmed',pid:'PT-00125',test:'Lipid Profile',doctor:'Dr. Sarah Khan',status:'Processing',priority:'Normal',ordered:'Sep 05, 09:10 AM'},
  {id:'LAB-000893',patient:'Fahad Iqbal',pid:'PT-00127',test:'Complete Blood Count',doctor:'Dr. Ayesha Raza',status:'Urgent',priority:'Urgent',ordered:'Sep 05, 10:20 AM'},
  {id:'LAB-000894',patient:'Bilal Chaudhry',pid:'PT-00129',test:'X-Ray (Left Knee)',doctor:'Dr. Bilal Ahmed',status:'Sample Collected',priority:'Normal',ordered:'Sep 04, 04:40 PM'},
  {id:'LAB-000895',patient:'Sana Malik',pid:'PT-00130',test:'HbA1c',doctor:'Dr. Sarah Khan',status:'Result Ready',priority:'Normal',ordered:'Sep 04, 11:00 AM'},
  {id:'LAB-000896',patient:'Nimra Yousaf',pid:'PT-00132',test:'Urine Routine',doctor:'Dr. Hina Farooq',status:'Verified',priority:'Normal',ordered:'Sep 03, 09:30 AM'},
];
const MEDICINES = [
  {name:'Amoxicillin 500mg',generic:'Amoxicillin',category:'Antibiotic',stock:340,unit:'Capsules',price:'Rs 8/unit',expiry:'Mar 2027',status:'In Stock'},
  {name:'Panadol 500mg',generic:'Paracetamol',category:'Analgesic',stock:12,unit:'Tablets',price:'Rs 3/unit',expiry:'Jan 2027',status:'Low Stock'},
  {name:'Augmentin 625mg',generic:'Co-Amoxiclav',category:'Antibiotic',stock:0,unit:'Tablets',price:'Rs 45/unit',expiry:'—',status:'Out of Stock'},
  {name:'Metformin 500mg',generic:'Metformin',category:'Antidiabetic',stock:210,unit:'Tablets',price:'Rs 5/unit',expiry:'Sep 2026',status:'Expiring Soon'},
  {name:'Losartan 50mg',generic:'Losartan',category:'Antihypertensive',stock:150,unit:'Tablets',price:'Rs 9/unit',expiry:'Nov 2027',status:'In Stock'},
];
const INVOICES = [
  {id:'INV-5510',patient:'Muhammad Ahmed',pid:'PT-00125',total:'Rs 18,500',paid:'Rs 10,000',due:'Rs 8,500',status:'Partially Paid',date:'Sep 05, 2026'},
  {id:'INV-5511',patient:'Ayesha Bibi',pid:'PT-00126',total:'Rs 3,200',paid:'Rs 3,200',due:'Rs 0',status:'Paid',date:'Sep 05, 2026'},
  {id:'INV-5512',patient:'Fahad Iqbal',pid:'PT-00127',total:'Rs 4,800',paid:'Rs 0',due:'Rs 4,800',status:'Unpaid',date:'Sep 05, 2026'},
  {id:'INV-5513',patient:'Bilal Chaudhry',pid:'PT-00129',total:'Rs 62,000',paid:'Rs 40,000',due:'Rs 22,000',status:'Partially Paid',date:'Sep 04, 2026'},
  {id:'INV-5514',patient:'Rukhsana Kausar',pid:'PT-00128',total:'Rs 9,000',paid:'Rs 9,000',due:'Rs 0',status:'Paid',date:'Aug 28, 2026'},
];
const WAITING_ROOM = [
  {pid:'PT-00127',patient:'Fahad Iqbal',doctor:'Dr. Ayesha Raza',dept:'Pediatrics',arrived:'09:58 AM',waitMin:37,priority:'Urgent'},
  {pid:'PT-00126',patient:'Ayesha Bibi',doctor:'Dr. Hina Farooq',dept:'Gynecology',arrived:'10:12 AM',waitMin:23,priority:'Normal'},
  {pid:'PT-00131',patient:'Hamza Sheikh',doctor:'Dr. Imran Malik',dept:'General Medicine',arrived:'10:24 AM',waitMin:11,priority:'Normal'},
];
const NURSING_TASKS = [
  {id:'TSK-01',pid:'PT-00125',patient:'Muhammad Ahmed',ward:'Cardiology · C-04',type:'Medication',detail:'Losartan 50mg — 8:00 AM dose',due:'8:00 AM',state:'overdue',minsLate:95},
  {id:'TSK-02',pid:'PT-00129',patient:'Bilal Chaudhry',ward:'Orthopedic · O-11',type:'Vitals',detail:'Routine 4-hourly vitals check',due:'10:40 AM',state:'due-soon',minsLate:0},
  {id:'TSK-03',pid:'PT-00125',patient:'Muhammad Ahmed',ward:'Cardiology · C-04',type:'Medication',detail:'Metformin 500mg — 11:00 AM dose',due:'11:00 AM',state:'upcoming',minsLate:0},
  {id:'TSK-04',pid:'PT-00129',patient:'Bilal Chaudhry',ward:'Orthopedic · O-11',type:'Nursing Note',detail:'Post-op wound check',due:'11:30 AM',state:'upcoming',minsLate:0},
  {id:'TSK-05',pid:'PT-00125',patient:'Muhammad Ahmed',ward:'Cardiology · C-04',type:'Doctor Instruction',detail:'Recheck BP before noon round',due:'12:00 PM',state:'upcoming',minsLate:0},
  {id:'TSK-06',pid:'PT-00129',patient:'Bilal Chaudhry',ward:'Orthopedic · O-11',type:'Discharge Prep',detail:'Confirm discharge summary with Dr. Ahmed',due:'2:00 PM',state:'upcoming',minsLate:0},
];
/* =========================================================
   ICONS (inline SVG, minimal line style)
   ========================================================= */
const I = {
  dash:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  patients:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15 20c.3-2.4 2-4.4 4.3-5"/></svg>',
  calendar:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  stetho:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M17 9v3a5 5 0 0 1-10 0"/><circle cx="19" cy="16" r="2.3"/></svg>',
  nurse:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="3.2"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M12 12.5v3M10.3 14h3.4"/></svg>',
  bed:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-7a2 2 0 0 1 2-2h5v5"/><path d="M3 15h18v3"/><path d="M10 9h9a2 2 0 0 1 2 2v4"/><path d="M3 18v3M21 18v3"/></svg>',
  rx:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M6 4h5.5a3.5 3.5 0 0 1 0 7H6M11 11l7 9"/></svg>',
  lab:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v6.5L4.5 19a1.8 1.8 0 0 0 1.6 2.6h11.8a1.8 1.8 0 0 0 1.6-2.6L14 9.5V3"/><path d="M7.5 15h9"/></svg>',
  pharmacy:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/><path d="M12 12v5M9.5 14.5h5"/></svg>',
  billing:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  staff:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 15a5 5 0 0 1 5.5 5"/></svg>',
  reports:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
  automation:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  settings:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"/></svg>',
  search:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  bell:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  help:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.5"/><path d="M12 17.5h.01"/></svg>',
  chevDown:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
  plus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
  x:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  print:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>',
  logout:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  menu:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  alert:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  eye:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  empty:'<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  moon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  command:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>',
  zap:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  keyboard:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/></svg>',
  clock:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  volume:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
  volumeX:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  mail:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  user:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  clipboard:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
};

const ROUTES = [
  {group:'Main', items:[
    {id:'dashboard',label:'Dashboard',icon:I.dash},
    {id:'patients',label:'Patients',icon:I.patients},
    {id:'appointments',label:'Appointments',icon:I.calendar},
  ]},
  {group:'Clinical', items:[
    {id:'consultation',label:'Consultation',icon:I.stetho},
    {id:'prescriptions',label:'Prescriptions',icon:I.rx},
    {id:'laboratory',label:'Laboratory',icon:I.lab},
  ]},
  {group:'Operations', items:[
    {id:'nursing',label:'Nursing',icon:I.nurse},
    {id:'admissions',label:'Admissions & Beds',icon:I.bed},
    {id:'pharmacy',label:'Pharmacy',icon:I.pharmacy},
    {id:'billing',label:'Billing',icon:I.billing},
  ]},
  {group:'Management', items:[
    {id:'staff',label:'Doctors & Staff',icon:I.staff},
    {id:'reports',label:'Reports',icon:I.reports},
  ]},
  {group:'System', items:[
    {id:'settings',label:'Settings',icon:I.settings},
  ]},
  {group:'Patient Services', items:[
    {id:'portal',label:'My Health Portal',icon:I.patients},
  ]},
  {group:'SaaS Platform', items:[
    {id:'super-admin',label:'Registered Clinics',icon:I.patients},
    {id:'subscription',label:'Clinic Subscriptions',icon:I.billing},
  ]},
];
/* Role scoping — each role only sees what it actually uses day to day.
   This is the fix for the "generic admin template" sidebar: nav = job, not entity list.
   NOTE: no 'automation' route/item exists anywhere in this list — automation
   is explicitly out of scope for this phase (implemented later, separately). */
const ROLE_ROUTES = {
  'Super Admin': ['super-admin', 'subscription'],
  'Administrator': ['dashboard','patients','appointments','nursing','admissions','laboratory','pharmacy','billing','staff','reports','settings','subscription','portal'],
  'Receptionist': ['dashboard','patients','appointments','billing'],
  'Doctor': ['dashboard','patients','appointments','consultation','prescriptions','laboratory'],
  'Nurse': ['dashboard','patients','nursing','admissions'],
  'Lab Technician': ['dashboard','patients','laboratory'],
  'Pharmacist': ['dashboard','patients','pharmacy'],
  'Patient': ['portal'],
};
/* Each role's real "start of shift" screen — not a generic Dashboard for everyone. */
const ROLE_LANDING = {
  'Super Admin':'super-admin',
  'Administrator':'dashboard','Receptionist':'appointments','Doctor':'dashboard',
  'Nurse':'nursing','Lab Technician':'laboratory','Pharmacist':'pharmacy',
  'Patient': 'portal',
};
function visibleRoutes(role){
  const allowed = ROLE_ROUTES[role] || ROLE_ROUTES['Administrator'];
  return ROUTES.map(g=>({group:g.group, items:g.items.filter(i=>allowed.includes(i.id))})).filter(g=>g.items.length);
}
function navBadgeCount(routeId){
  if(routeId==='laboratory') return LAB_ORDERS.filter(o=>o.status==='Urgent'||o.status==='Result Ready').length;
  if(routeId==='nursing') return NURSING_TASKS.filter(t=>t.state==='overdue').length;
  if(routeId==='pharmacy') return MEDICINES.filter(m=>m.status==='Out of Stock'||m.status==='Low Stock').length;
  if(routeId==='billing') return INVOICES.filter(i=>i.status==='Unpaid').length;
  if(routeId==='appointments') return WAITING_ROOM.length;
  return 0;
}
const ROUTE_TITLES = {
  dashboard:['Dashboard','Live overview of hospital operations'],
  patients:['Patients','Search, register and manage every patient record'],
  appointments:['Appointments','Book, track and manage the daily schedule'],
  consultation:['Doctor Consultation · OPD','Muhammad Ahmed — PT-00125'],
  prescriptions:['Prescriptions','Create and manage patient prescriptions'],
  nursing:['Nursing Station','Assigned patients, vitals and medication tasks'],
  admissions:['Admissions & Beds','Ward occupancy and bed management'],
  laboratory:['Laboratory','Test orders, samples, processing and results'],
  pharmacy:['Pharmacy & Medicines','Dispensing and inventory management'],
  billing:['Billing & Payments','Invoices, payments and financial records'],
  staff:['Doctors & Staff','Manage hospital personnel and schedules'],
  reports:['Reports','Operational reporting across the hospital'],
  settings:['Settings','Hospital configuration'],
  portal:['My Health Portal','Track your appointments, tokens, prescriptions, and lab reports'],
  'super-admin':['Registered Clinics','Multi-tenant clinic directory, subscriptions, and SaaS MRR'],
  subscription:['Clinic Subscriptions','Tier plans, billing cycles, and feature access'],
};

/* Note: HTML-string statusBadge()/avatar()/initials()/icon() helpers that
   used to live here were removed — every real React component now uses
   the genuine components/ui/StatusBadge.jsx, Avatar.jsx, and Icon.jsx
   instead (Icon.jsx reads straight from the ICONS export below). */

export { visibleRoutes, ROLE_ROUTES, ROLE_LANDING, ROUTES, ROUTE_TITLES, navBadgeCount };
export { PATIENTS, I as ICONS, LAB_ORDERS, NURSING_TASKS, DOCTORS, APPOINTMENTS, MEDICINES, INVOICES, STAFF, WAITING_ROOM };
export function getPatientById(id) {
  return PATIENTS.find((p) => p.id === id) || null;
}

