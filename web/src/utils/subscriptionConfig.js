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
  },
  {
    id: 'tenant-002',
    name: 'City Smile Dental Clinic',
    slug: 'city-smile',
    city: 'Lahore',
    doctorInCharge: 'Dr. Usman Farooq',
    phone: '0321-7654321',
    plan: 'starter',
    status: 'trialing',
    joinedDate: '2026-09-10',
    expiresAt: '2026-09-24',
    activeDoctors: 1,
    monthlyTokens: 138,
    mrrPKR: 4500,
  },
  {
    id: 'tenant-003',
    name: 'Rawal Pediatric Care Center',
    slug: 'rawal-peds',
    city: 'Rawalpindi',
    doctorInCharge: 'Dr. Ayesha Raza',
    phone: '0333-5554443',
    plan: 'growth',
    status: 'active',
    joinedDate: '2026-07-15',
    expiresAt: '2026-10-01',
    activeDoctors: 3,
    monthlyTokens: 310,
    mrrPKR: 9500,
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
  },
  {
    id: 'tenant-005',
    name: 'LifeCare Daycare & Maternity Home',
    slug: 'lifecare-maternity',
    city: 'Faisalabad',
    doctorInCharge: 'Dr. Hina Farooq',
    phone: '0302-8877665',
    plan: 'hospital',
    status: 'active',
    joinedDate: '2026-08-10',
    expiresAt: '2026-10-10',
    activeDoctors: 8,
    monthlyTokens: 520,
    mrrPKR: 18500,
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
  },
];

export function getSubscriptionState() {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION;
  try {
    const saved = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (!saved) return DEFAULT_SUBSCRIPTION;
    return { ...DEFAULT_SUBSCRIPTION, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscriptionState(updated) {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION;
  const merged = { ...getSubscriptionState(), ...updated };
  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('medora-subscription-updated', { detail: merged }));
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
export function useSubscription() {
  const [sub, setSub] = useState(() => getSubscriptionState());

  useEffect(() => {
    const handleUpdate = (e) => {
      setSub(e.detail || getSubscriptionState());
    };
    window.addEventListener('medora-subscription-updated', handleUpdate);
    return () => window.removeEventListener('medora-subscription-updated', handleUpdate);
  }, []);

  const plan = SUBSCRIPTION_PLANS[sub.planId] || SUBSCRIPTION_PLANS.growth;
  const trialEnd = new Date(sub.trialEndsAt);
  const now = new Date();
  const diffTime = trialEnd - now;
  const daysLeftInTrial = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isTrial = sub.status === 'trialing';
  const isExpired = isTrial && daysLeftInTrial === 0;

  return {
    subscription: sub,
    plan,
    isTrial,
    daysLeftInTrial,
    isExpired,
    upgradePlan: (planId, cycle = 'monthly') => {
      const targetPlan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.growth;
      const amount = cycle === 'annual' ? targetPlan.priceAnnualPKR : targetPlan.priceMonthlyPKR;
      const newInvoice = {
        id: `INV-S-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString(),
        plan: `${targetPlan.name} (${cycle === 'annual' ? 'Annual' : 'Monthly'})`,
        amount: `Rs. ${amount.toLocaleString()}`,
        status: 'Paid',
        method: 'Instant Upgrade Card',
      };
      return saveSubscriptionState({
        planId,
        billingCycle: cycle,
        status: 'active',
        lastPaymentAmount: amount,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewalDate: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        invoices: [newInvoice, ...(sub.invoices || [])],
      });
    },
  };
}
