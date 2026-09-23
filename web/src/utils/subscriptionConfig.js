import { useState, useEffect } from 'react';

/**
 * subscriptionConfig.js
 * Centralized Multi-Tenant SaaS Subscription & Pricing Configuration for Medora HMS.
 * Defines commercial tiers, feature gating, billing cycles, and tenant clinic directories.
 */

export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Solo Doctor & Dental',
    badge: 'Solo Practice',
    tagline: 'Ideal for solo practitioners, dentists, dermatologists & private OPDs',
    priceMonthlyPKR: 4500,
    priceMonthlyUSD: 16,
    priceAnnualPKR: 43200, // 20% discount (3,600/mo)
    priceAnnualUSD: 155,
    maxDoctors: 1,
    monthlyTokens: 600,
    limits: {
      doctors: 1,
      appointmentsPerMonth: 600,
      smsCreditsPerMonth: 0, // Direct WhatsApp only
      storageGB: 5,
    },
    features: [
      { name: '1 Attending Doctor / Specialist Seat', included: true },
      { name: 'Up to 600 Patient Tokens / month', included: true },
      { name: '80mm & 58mm ESC/POS Thermal Receipt Printing', included: true },
      { name: 'Official WhatsApp Prescription & Reminders', included: true },
      { name: 'Clinical Drug Allergy Safety Guard', included: true },
      { name: 'Full Patients EMR & Medical History', included: true },
      { name: 'Counter Billing, Invoicing & Cash Handover', included: true },
      { name: 'Public TV Waiting Room Queue Display', included: false },
      { name: 'Doctor Commission & Revenue Split Ledger', included: false },
      { name: 'Laboratory Diagnostics & Requisitions', included: false },
      { name: 'Pharmacy Formulary & Batch Inventory', included: false },
      { name: 'Inpatient Wards & Bed Telemetry', included: false },
      { name: 'Medora AI Voice Copilot', included: false },
    ],
    recommended: false,
  },
  growth: {
    id: 'growth',
    name: 'Polyclinic & Aesthetics',
    badge: 'Most Popular',
    tagline: 'Engineered for multi-doctor polyclinics, dental centers & aesthetic clinics',
    priceMonthlyPKR: 9500,
    priceMonthlyUSD: 34,
    priceAnnualPKR: 91200, // 20% discount (7,600/mo)
    priceAnnualUSD: 325,
    maxDoctors: 6,
    monthlyTokens: Infinity,
    limits: {
      doctors: 6,
      appointmentsPerMonth: Infinity,
      smsCreditsPerMonth: 600,
      storageGB: 25,
    },
    features: [
      { name: 'Up to 6 Consulting Doctors & Clinical Rooms', included: true },
      { name: 'Unlimited Monthly Patient Tokens & Appointments', included: true },
      { name: 'Doctor Commission & Revenue Split Ledger (70/30, 60/40)', included: true },
      { name: 'Public TV Waiting Room Queue Display (/lobby)', included: true },
      { name: 'Official WhatsApp + 600 Carrier SMS / month', included: true },
      { name: 'Diagnostic Pathology Laboratory Tracker', included: true },
      { name: 'Pharmacy Stock & Expiring Batch Alerts', included: true },
      { name: 'Clinical Drug Allergy Cross-Referencing', included: true },
      { name: 'Reception Cash Shift Reconcile & CSV Audit', included: true },
      { name: 'Inpatient Wards & Bed Allocations', included: false },
      { name: 'Acute Emergency Triage Telemetry', included: false },
      { name: 'Medora AI Voice Copilot', included: false },
    ],
    recommended: true,
  },
  hospital: {
    id: 'hospital',
    name: 'Daycare & Maternity Hospital',
    badge: 'Inpatient Grade',
    tagline: 'Operating system for 10–25 bed surgical centers, maternity homes & clinics',
    priceMonthlyPKR: 18500,
    priceMonthlyUSD: 66,
    priceAnnualPKR: 177600, // 20% discount (14,800/mo)
    priceAnnualUSD: 635,
    maxDoctors: 18,
    monthlyTokens: Infinity,
    limits: {
      doctors: 18,
      appointmentsPerMonth: Infinity,
      smsCreditsPerMonth: 1500,
      storageGB: 75,
    },
    features: [
      { name: 'Up to 18 Specialist Doctors & Surgeons', included: true },
      { name: 'Unlimited Patient Tokens & Walk-in Queue', included: true },
      { name: 'Inpatient Wards, Bed Telemetry & Occupancy Matrix', included: true },
      { name: 'Acute Emergency Triage & Code Broadcast', included: true },
      { name: 'Nursing Station Vitals & Shift Handover Notes', included: true },
      { name: 'Discharge Summary Generator & Hospital Invoicing', included: true },
      { name: 'Doctor Commission Ledger with Instant Settlement', included: true },
      { name: 'Laboratory LIS & Pharmacy Inventory Management', included: true },
      { name: 'Multi-Screen TV Lobby Queue System', included: true },
      { name: '1,500 Cloud SMS + Unlimited WhatsApp Alerts', included: true },
      { name: 'Medora AI Voice Copilot', included: false },
      { name: 'Multi-Branch Whitelabeling', included: false },
    ],
    recommended: false,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Hospital Network & Complex',
    badge: 'Enterprise',
    tagline: 'Full hospital ecosystem with ICU telemetry, AI voice copilot & multi-branch governance',
    priceMonthlyPKR: 35000,
    priceMonthlyUSD: 125,
    priceAnnualPKR: 336000, // 20% discount (28,000/mo)
    priceAnnualUSD: 1200,
    maxDoctors: Infinity,
    monthlyTokens: Infinity,
    limits: {
      doctors: Infinity,
      appointmentsPerMonth: Infinity,
      smsCreditsPerMonth: 4000,
      storageGB: 250,
    },
    features: [
      { name: 'Unlimited Doctors, Specialists & Surgeons', included: true },
      { name: 'Unlimited Appointments, OPD & Emergency Walk-ins', included: true },
      { name: 'Unlimited Wards, Beds, Telemetry & ICU Matrix', included: true },
      { name: 'Medora AI Voice Booking & Clinical Dictation Copilot', included: true },
      { name: 'Acute Emergency Triage & Blue Code Broadcast', included: true },
      { name: 'Custom Subdomain & Hospital Logo Whitelabeling', included: true },
      { name: 'Multi-Branch Consolidated Reporting & Auditing', included: true },
      { name: '4,000 Automated SMS + Unlimited WhatsApp', included: true },
      { name: 'Doctor Revenue Splits with Auto-Reconcile', included: true },
      { name: 'Dedicated 24/7 Account Manager & Priority WhatsApp', included: true },
    ],
    recommended: false,
  },
};

const SUBSCRIPTION_STORAGE_KEY = 'medora_clinic_subscription';
const TENANTS_STORAGE_KEY = 'medora_saas_tenants';

export const DEFAULT_SUBSCRIPTION = {
  planId: 'growth',
  status: 'trialing', // 'trialing' | 'active' | 'past_due' | 'cancelled'
  billingCycle: 'monthly', // 'monthly' | 'annual'
  startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  trialEndsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days left
  renewalDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  paymentMethod: 'Credit Card (ending 4082)',
  lastPaymentAmount: 9500,
  currency: 'Rs.',
  invoices: [
    {
      id: 'INV-S-801',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      plan: 'Polyclinic & Aesthetics (Monthly)',
      amount: 'Rs. 9,500',
      status: 'Paid',
      method: 'Online Card · Stripe',
    },
    {
      id: 'INV-S-704',
      date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      plan: 'Polyclinic & Aesthetics (Monthly)',
      amount: 'Rs. 9,500',
      status: 'Paid',
      method: 'Bank Wire Transfer',
    },
  ],
};

export const INITIAL_SAAS_TENANTS = [
  {
    id: 'tenant-001',
    name: 'Al-Shifa Healthcare Complex',
    slug: 'al-shifa',
    city: 'Islamabad',
    doctorInCharge: 'Dr. Sarah Khan',
    phone: '0300-1234567',
    plan: 'growth',
    status: 'active',
    joinedDate: '2026-08-01',
    expiresAt: '2026-10-15',
    activeDoctors: 5,
    monthlyTokens: 420,
    mrrPKR: 9500,
    archetype: 'general_hospital',
    practiceType: 'Tertiary General Hospital',
  },
  {
    id: 'tenant-002',
    name: 'Dr. Ali Advanced Dental Surgery & Orthodontics',
    slug: 'city-smile',
    city: 'Lahore',
    doctorInCharge: 'Dr. Ali Raza (BDS, RDS)',
    phone: '0321-7654321',
    plan: 'starter',
    status: 'trialing',
    joinedDate: '2026-09-10',
    expiresAt: '2026-09-24',
    activeDoctors: 3,
    monthlyTokens: 138,
    mrrPKR: 4500,
    archetype: 'dental',
    practiceType: 'Dental Surgery & Orthodontics',
  },
  {
    id: 'tenant-003',
    name: 'KidsCare Pediatric & Vaccination Center',
    slug: 'rawal-peds',
    city: 'Rawalpindi',
    doctorInCharge: 'Dr. Ayesha Malik (FCPS Pediatrics)',
    phone: '0333-5554443',
    plan: 'growth',
    status: 'active',
    joinedDate: '2026-07-15',
    expiresAt: '2026-10-01',
    activeDoctors: 3,
    monthlyTokens: 310,
    mrrPKR: 9500,
    archetype: 'pediatric',
    practiceType: 'Pediatric & Neonatal Clinic',
  },
  {
    id: 'tenant-004',
    name: 'National Medicare Surgical Hospital',
    slug: 'national-medicare',
    city: 'Karachi',
    doctorInCharge: 'Dr. Bilal Ahmed',
    phone: '0312-9988776',
    plan: 'enterprise',
    status: 'active',
    joinedDate: '2026-06-20',
    expiresAt: '2026-11-20',
    activeDoctors: 24,
    monthlyTokens: 1240,
    mrrPKR: 35000,
    archetype: 'general_hospital',
    practiceType: 'Surgical Hospital',
  },
  {
    id: 'tenant-005',
    name: 'Al-Madina Family Health & Ultrasound Clinic',
    slug: 'al-madina',
    city: 'Faisalabad',
    doctorInCharge: 'Dr. Bilal Tariq',
    phone: '0302-8877665',
    plan: 'hospital',
    status: 'active',
    joinedDate: '2026-08-10',
    expiresAt: '2026-10-10',
    activeDoctors: 4,
    monthlyTokens: 520,
    mrrPKR: 18500,
    archetype: 'polyclinic',
    practiceType: 'Family Polyclinic & Diagnostics',
  },
  {
    id: 'tenant-006',
    name: 'Apex Orthopedic & Spine Clinic',
    slug: 'apex-ortho',
    city: 'Peshawar',
    doctorInCharge: 'Dr. Tariq Mehmood',
    phone: '0345-1122334',
    plan: 'starter',
    status: 'past_due',
    joinedDate: '2026-08-12',
    expiresAt: '2026-09-12',
    activeDoctors: 1,
    monthlyTokens: 84,
    mrrPKR: 4500,
    archetype: 'general_hospital',
    practiceType: 'Orthopedic Specialty Center',
  },
  {
    id: 'tenant-007',
    name: 'Al-Noor Eye Hospital & Laser Vision Center',
    slug: 'al-noor-eye',
    city: 'Islamabad',
    doctorInCharge: 'Prof. Dr. Tariq Mehmood (FRCS Ophth)',
    phone: '0300-1112233',
    plan: 'growth',
    status: 'active',
    joinedDate: '2026-08-15',
    expiresAt: '2026-11-01',
    activeDoctors: 4,
    monthlyTokens: 380,
    mrrPKR: 12500,
    archetype: 'ophthalmology',
    practiceType: 'Ophthalmology & Eye Surgery Center',
  },
];

export function getClinicArchetypeFeatures(planKey, archetypeId = 'general_hospital') {
  const plan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.growth;
  
  if (archetypeId === 'dental') {
    if (planKey === 'starter') {
      return [
        { name: '1 Specialist Dental Chair Seat', included: true },
        { name: 'Interactive Tooth Chart & Odontogram (32 Adult & 20 Pediatric Teeth)', included: true },
        { name: 'Dental Treatment Planning (Scaling, RCT, Extractions & Fillings)', included: true },
        { name: 'Up to 600 Patient Tokens & Appointments / month', included: true },
        { name: '80mm & 58mm ESC/POS Thermal Receipt Printing', included: true },
        { name: 'Official WhatsApp Prescription & Recall Reminders', included: true },
        { name: 'Dental Consumables Counter Billing & Cash Drawer Register', included: true },
        { name: 'Waiting Room TV Queue Display (/lobby)', included: false },
        { name: 'Dental Radiography Imaging (IOPA, OPG, CBCT X-Rays)', included: false },
        { name: 'Dental Consumables, Composites & Anesthetics Stock Alerts', included: false },
        { name: 'Associate Dentist Commission Split Ledger (70/30, 60/40)', included: false },
        { name: 'Daycare Surgical Beds & Maxillofacial OT', included: false },
        { name: 'Medora AI Voice Dictation for Dental Procedures', included: false },
      ];
    }
    if (planKey === 'growth') {
      return [
        { name: 'Up to 6 Dental Chairs & Associate Dentists', included: true },
        { name: 'Unlimited Monthly Dental Patient Tokens & Walk-ins', included: true },
        { name: 'Dental Radiography Requisitions (IOPA, OPG, Bitewings) with LIS Tracker', included: true },
        { name: 'Dental Consumables, Composites & Anesthetic Expiry Alerts', included: true },
        { name: 'Waiting Room TV Token Calling Display (/lobby) with Audio Chime', included: true },
        { name: 'Associate Dentist Commission Split Ledger (70/30, 60/40 Settlement)', included: true },
        { name: 'Official WhatsApp + 600 Carrier SMS / month', included: true },
        { name: 'Interactive Tooth Chart & Full Dental EMR History', included: true },
        { name: 'Reception Cash Shift Reconcile & CSV Audit Export', included: true },
        { name: 'Daycare Surgical Beds & Maxillofacial OT', included: false },
        { name: 'Acute Emergency Trauma Triage Telemetry', included: false },
        { name: 'Medora AI Voice Copilot', included: false },
      ];
    }
    if (planKey === 'hospital') {
      return [
        { name: 'Up to 18 Dental Specialists, Maxillofacial Surgeons & Anesthetists', included: true },
        { name: 'Daycare Surgical Beds & Post-Op Recovery Telemetry', included: true },
        { name: 'Acute Dental & Maxillofacial Emergency Trauma Triage', included: true },
        { name: 'Nursing Station Vitals & Pre-Op / Post-Op Handover Notes', included: true },
        { name: 'Daycare Discharge Summary Generator & Surgical Invoicing', included: true },
        { name: 'Full Radiography LIS & Dental Pharmacy Formulary', included: true },
        { name: 'Visiting Surgeon Commission Ledger with Instant Settlement', included: true },
        { name: 'Multi-Screen TV Lobby Queue System', included: true },
        { name: '1,500 Cloud SMS + Unlimited WhatsApp Alerts', included: true },
        { name: 'Medora AI Voice Copilot', included: false },
      ];
    }
    return [
      { name: 'Unlimited Multi-Branch Dental Surgery Centers & Chairs', included: true },
      { name: 'Medora AI Voice Booking & Clinical Dictation Copilot', included: true },
      { name: 'Multi-Branch Consolidated Financial & Clinical Audit', included: true },
      { name: 'Custom Subdomain & Practice Logo Whitelabeling', included: true },
      { name: '4,000 Automated SMS + Unlimited WhatsApp', included: true },
      { name: 'Dedicated 24/7 Account Manager & Priority WhatsApp SLA', included: true },
    ];
  }

  if (archetypeId === 'pediatric') {
    if (planKey === 'starter') {
      return [
        { name: '1 Specialist Pediatrician Seat', included: true },
        { name: 'WHO Growth Percentiles Tracker (Weight, Height, Head Circumference)', included: true },
        { name: 'EPI & Private Immunization / Vaccination Schedules & Cards', included: true },
        { name: 'Up to 600 Patient Tokens & Appointments / month', included: true },
        { name: 'Official Direct WhatsApp Vaccine & Milestone Reminders for Parents', included: true },
        { name: '80mm & 58mm Thermal Slip & Counter Billing Register', included: true },
        { name: 'Waiting Room TV Queue Display (/lobby)', included: false },
        { name: 'Vaccine Cold-Chain Stock & Low Batch Alerts', included: false },
        { name: 'Consulting Pediatrician Revenue Split Ledger', included: false },
      ];
    }
    if (planKey === 'growth') {
      return [
        { name: 'Up to 6 Pediatric Consulting Rooms & Examination Bays', included: true },
        { name: 'Unlimited Monthly Pediatric Tokens & Walk-ins', included: true },
        { name: 'Vaccine Cold-Chain Inventory & Expiring Batch Alerts', included: true },
        { name: 'Waiting Room TV Display (/lobby) with Gentle Audio Chime', included: true },
        { name: 'Automated 24h Carrier SMS Booster Reminders to Parents (600 SMS/mo)', included: true },
        { name: 'Pediatric Blood Picture & Diagnostic Laboratory Tracker', included: true },
        { name: 'Consulting Pediatrician Revenue Split Ledger', included: true },
        { name: 'Pediatric Emergency Triage & Code Broadcast', included: false },
      ];
    }
    if (planKey === 'hospital') {
      return [
        { name: 'Up to 18 Pediatricians, Neonatologists & Pediatric Surgeons', included: true },
        { name: 'Neonatal / Pediatric Inpatient Beds, Phototherapy & Telemetry', included: true },
        { name: 'Acute Pediatric Emergency Triage & Code Broadcast', included: true },
        { name: 'Nursing Station Vitals & Pediatric Dosing Safety Matrix', included: true },
        { name: 'Discharge Summary Generator & Hospital Invoicing', included: true },
      ];
    }
    return [
      { name: 'Unlimited Children’s Hospital Network & Multi-Branch Governance', included: true },
      { name: 'Medora AI Voice Copilot for Pediatric Consultations', included: true },
      { name: 'Consolidated Vaccine Registry & Multi-Branch Reporting', included: true },
    ];
  }

  if (archetypeId === 'ophthalmology') {
    if (planKey === 'starter') {
      return [
        { name: '1 Eye Specialist / Optometrist Seat', included: true },
        { name: 'Snellen / LogMAR Visual Acuity & Refraction Rx Chart', included: true },
        { name: 'Automated Eyeglasses Prescription with Sph/Cyl/Axis/Add', included: true },
        { name: 'WhatsApp Optical Prescription to Patient', included: true },
        { name: 'Thermal Receipt Printing & Counter Billing', included: true },
        { name: 'Waiting Room TV Queue Display (/lobby)', included: false },
        { name: 'Optical Shop Dispensary & Lens Inventory', included: false },
      ];
    }
    if (planKey === 'growth') {
      return [
        { name: 'Up to 6 Refraction Lanes & Eye Examination Chambers', included: true },
        { name: 'Optical Shop Dispensary & Lens/Frames Inventory Management', included: true },
        { name: 'Slit Lamp & OCT / Fundus Imaging Requisitions', included: true },
        { name: 'Waiting Room TV Display (/lobby) with Audio Token Calling', included: true },
        { name: 'Visiting Ophthalmologist Revenue Split Ledger', included: true },
      ];
    }
    if (planKey === 'hospital') {
      return [
        { name: 'Daycare Cataract Surgery Beds & Phacoemulsification OT Matrix', included: true },
        { name: 'Ophthalmic Emergency Triage & Acute Trauma Care', included: true },
        { name: 'Nursing Station Eye Vitals & Post-Op Drops Protocol', included: true },
      ];
    }
    return [
      { name: 'Unlimited Eye Hospital Network & Multi-Branch Reporting', included: true },
      { name: 'Medora AI Voice Copilot & Whitelabeling', included: true },
    ];
  }

  // Default General Hospital / Polyclinic
  return plan.features;
}

export function getActiveClinicId() {
  if (typeof window === 'undefined') return 'tenant-001';
  try {
    const raw = localStorage.getItem('medora_hospital_profile');
    if (!raw) return 'tenant-001';
    const profile = JSON.parse(raw);
    return profile.id || 'tenant-001';
  } catch {
    return 'tenant-001';
  }
}

export function getSubscriptionState(clinicId) {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION;
  const cid = clinicId || getActiveClinicId();
  try {
    const saved = localStorage.getItem(`medora_clinic_subscription_${cid}`);
    if (saved) {
      return { ...DEFAULT_SUBSCRIPTION, ...JSON.parse(saved) };
    }

    // Check if there is a legacy single-key subscription that belongs to this clinic
    const legacy = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (legacy && (!cid || cid === 'tenant-001')) {
      const parsedLegacy = JSON.parse(legacy);
      localStorage.setItem(`medora_clinic_subscription_${cid}`, JSON.stringify(parsedLegacy));
      return { ...DEFAULT_SUBSCRIPTION, ...parsedLegacy };
    }

    // If no existing record, find matching tenant in INITIAL_SAAS_TENANTS / saved tenants
    const tenants = getTenantClinics();
    const tenant = tenants.find((t) => t.id === cid) || INITIAL_SAAS_TENANTS.find((t) => t.id === cid);
    const planId = tenant?.plan || 'starter';
    const planObj = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.starter;
    const isAct = tenant?.status === 'active';
    const initialSub = {
      planId,
      status: tenant?.status || 'trialing',
      billingCycle: 'monthly',
      startDate: tenant?.joinedDate ? new Date(tenant.joinedDate).toISOString() : new Date().toISOString(),
      trialEndsAt: tenant?.expiresAt ? new Date(tenant.expiresAt).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
      renewalDate: tenant?.expiresAt ? new Date(tenant.expiresAt).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      paymentMethod: isAct ? 'JazzCash Business (Till: 00291482)' : 'Trial Account',
      lastPaymentAmount: planObj.priceMonthlyPKR,
      currency: 'Rs.',
      invoices: [
        {
          id: `INV-${(tenant?.slug || cid).toUpperCase().slice(0, 10)}-01`,
          date: tenant?.joinedDate ? new Date(tenant.joinedDate).toLocaleDateString() : new Date().toLocaleDateString(),
          plan: `${planObj.name} (Monthly)`,
          amount: `Rs. ${planObj.priceMonthlyPKR.toLocaleString()}`,
          status: isAct ? 'Paid' : 'Trialing',
          method: isAct ? 'JazzCash Business Merchant' : 'Complimentary Trial',
        },
      ],
    };
    localStorage.setItem(`medora_clinic_subscription_${cid}`, JSON.stringify(initialSub));
    return initialSub;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscriptionState(updated, clinicId) {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION;
  const cid = clinicId || getActiveClinicId();
  const current = getSubscriptionState(cid);
  const merged = { ...current, ...updated };
  try {
    localStorage.setItem(`medora_clinic_subscription_${cid}`, JSON.stringify(merged));
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(merged));

    // Synchronize with tenant clinic directory
    const tenants = getTenantClinics();
    let tenantUpdated = false;
    const updatedTenants = tenants.map((t) => {
      if (t.id === cid) {
        tenantUpdated = true;
        const planObj = SUBSCRIPTION_PLANS[merged.planId] || SUBSCRIPTION_PLANS.growth;
        return {
          ...t,
          plan: merged.planId,
          status: merged.status || t.status,
          mrrPKR: merged.billingCycle === 'annual' ? Math.round(planObj.priceAnnualPKR / 12) : planObj.priceMonthlyPKR,
          expiresAt: merged.renewalDate ? merged.renewalDate.split('T')[0] : t.expiresAt,
        };
      }
      return t;
    });

    if (tenantUpdated) {
      saveTenantClinics(updatedTenants);
    }

    window.dispatchEvent(new CustomEvent('medora-subscription-updated', { detail: merged, clinicId: cid }));
  } catch (err) {
    console.error('Failed to save subscription state:', err);
  }
  return merged;
}

export function getTenantClinics() {
  if (typeof window === 'undefined') return INITIAL_SAAS_TENANTS;
  try {
    const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!saved) return INITIAL_SAAS_TENANTS;
    return JSON.parse(saved);
  } catch {
    return INITIAL_SAAS_TENANTS;
  }
}

export function saveTenantClinics(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('medora-tenants-updated', { detail: list }));
  } catch (err) {
    console.error('Failed to save tenants:', err);
  }
}

/**
 * React hook to subscribe to live subscription changes
 */
export function useSubscription(explicitClinicId) {
  const [activeId, setActiveId] = useState(() => explicitClinicId || getActiveClinicId());
  const [sub, setSub] = useState(() => getSubscriptionState(activeId));

  useEffect(() => {
    const syncSub = () => {
      const cid = explicitClinicId || getActiveClinicId();
      setActiveId(cid);
      setSub(getSubscriptionState(cid));
    };

    const handleSubUpdate = (e) => {
      const cid = explicitClinicId || getActiveClinicId();
      if (!e.detail || !e.detail.clinicId || e.detail.clinicId === cid) {
        setSub(getSubscriptionState(cid));
      }
    };

    window.addEventListener('medora-subscription-updated', handleSubUpdate);
    window.addEventListener('clinic-profile-updated', syncSub);
    window.addEventListener('medora-clinic-switched', syncSub);

    return () => {
      window.removeEventListener('medora-subscription-updated', handleSubUpdate);
      window.removeEventListener('clinic-profile-updated', syncSub);
      window.removeEventListener('medora-clinic-switched', syncSub);
    };
  }, [explicitClinicId]);

  const plan = SUBSCRIPTION_PLANS[sub.planId] || SUBSCRIPTION_PLANS.growth;
  const trialEnd = new Date(sub.trialEndsAt);
  const now = new Date();
  const diffTime = trialEnd - now;
  const daysLeftInTrial = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isTrial = sub.status === 'trialing';
  const isExpired = isTrial && daysLeftInTrial === 0;

  return {
    clinicId: activeId,
    subscription: sub,
    plan,
    isTrial,
    daysLeftInTrial,
    isExpired,
    upgradePlan: (planId, cycle = 'monthly', customMethod = null) => {
      const targetPlan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.growth;
      const amount = cycle === 'annual' ? targetPlan.priceAnnualPKR : targetPlan.priceMonthlyPKR;
      const paymentLabel = customMethod || 'JazzCash Business (Till: 00291482)';
      const newInvoice = {
        id: `INV-${activeId.toUpperCase().slice(-7)}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString(),
        plan: `${targetPlan.name} (${cycle === 'annual' ? 'Annual' : 'Monthly'})`,
        amount: `Rs. ${amount.toLocaleString()}`,
        status: 'Paid',
        method: paymentLabel,
      };
      return saveSubscriptionState(
        {
          planId,
          billingCycle: cycle,
          status: 'active',
          lastPaymentAmount: amount,
          paymentMethod: paymentLabel,
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          renewalDate: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          invoices: [newInvoice, ...(sub.invoices || [])],
        },
        activeId
      );
    },
  };
}
