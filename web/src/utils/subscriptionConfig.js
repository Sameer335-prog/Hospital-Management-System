import { useState, useEffect } from 'react';

/**
 * subscriptionConfig.js
 * Centralized Multi-Tenant SaaS Subscription & Pricing Configuration for Medora HMS.
 * Defines commercial tiers, feature gating, billing cycles, and tenant clinic directories.
 */

export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Tier',
    badge: 'Solo Clinic',
    tagline: 'Ideal for solo doctors, dentists, pediatricians & private practices',
    priceMonthlyPKR: 5000,
    priceMonthlyUSD: 25,
    priceAnnualPKR: 48000, // 20% discount (4,000/mo)
    priceAnnualUSD: 240,
    limits: {
      doctors: 1,
      appointmentsPerMonth: 500,
      smsCreditsPerMonth: 0, // Manual WhatsApp only
      storageGB: 5,
    },
    features: [
      { name: '1 Attending Doctor / Specialist', included: true },
      { name: 'Up to 500 Patient Tokens / month', included: true },
      { name: '80mm ESC/POS Thermal Receipt Printing', included: true },
      { name: 'Native Smartphone Mobile App UI', included: true },
      { name: 'Full Patients EMR & History Directory', included: true },
      { name: 'Front-Desk Billing & Invoicing', included: true },
      { name: 'Public Lobby TV Queue Display', included: false },
      { name: 'Direct Cloud Carrier SMS Reminders', included: false },
      { name: 'Laboratory & Diagnostics Tracking', included: false },
      { name: 'Pharmacy Stock & Dispensing', included: false },
      { name: 'Medora AI Voice Booking Copilot', included: false },
      { name: 'Inpatient Ward & Bed Allocations', included: false },
    ],
    recommended: false,
  },
  growth: {
    id: 'growth',
    name: 'Growth Tier',
    badge: 'Most Popular',
    tagline: 'Engineered for multi-specialty polyclinics & growing group practices',
    priceMonthlyPKR: 12000,
    priceMonthlyUSD: 60,
    priceAnnualPKR: 115000, // 20% discount (9,600/mo)
    priceAnnualUSD: 575,
    limits: {
      doctors: 5,
      appointmentsPerMonth: Infinity,
      smsCreditsPerMonth: 500,
      storageGB: 25,
    },
    features: [
      { name: 'Up to 5 Attending Doctors / Rooms', included: true },
      { name: 'Unlimited Monthly Patient Tokens', included: true },
      { name: '80mm ESC/POS Thermal Receipt Printing', included: true },
      { name: 'Native Smartphone Mobile App UI', included: true },
      { name: 'Public Lobby TV Queue Display (/display)', included: true },
      { name: '500 Automated Cloud Carrier SMS / mo', included: true },
      { name: 'Laboratory Diagnostics & Dispatch Tracker', included: true },
      { name: 'Pharmacy Inventory & Expiring Batch Alerts', included: true },
      { name: 'Clinical Consultation Prescriptions & EMR', included: true },
      { name: 'Reception Cash Shift Reconcile & Export', included: true },
      { name: 'Medora AI Voice Booking Copilot', included: false },
      { name: 'Inpatient Ward & Acute Triage Telemetry', included: false },
    ],
    recommended: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Tier',
    badge: 'Hospital Grade',
    tagline: 'Full hospital operating system for surgical centers, complexes & inpatient hospitals',
    priceMonthlyPKR: 25000,
    priceMonthlyUSD: 150,
    priceAnnualPKR: 240000, // 20% discount (20,000/mo)
    priceAnnualUSD: 1440,
    limits: {
      doctors: Infinity,
      appointmentsPerMonth: Infinity,
      smsCreditsPerMonth: 3000,
      storageGB: 100,
    },
    features: [
      { name: 'Unlimited Doctors & Specialist Accounts', included: true },
      { name: 'Unlimited Appointments & Rapid Walk-ins', included: true },
      { name: 'Multi-Screen TV Lobby Queue Displays', included: true },
      { name: 'Medora AI Voice Booking & Speech Copilot', included: true },
      { name: 'Acute Emergency Triage & Code Broadcast', included: true },
      { name: 'Inpatient Wards, Beds & ICU Census Matrix', included: true },
      { name: 'Multi-Department Staff Role Permissions', included: true },
      { name: 'Automated 2-Hour Pre-Visit SMS Dispatch', included: true },
      { name: 'Custom Subdomain & Clinic Whitelabeling', included: true },
      { name: 'Dedicated 24/7 Priority WhatsApp Support', included: true },
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
  lastPaymentAmount: 12000,
  currency: 'Rs.',
  invoices: [
    {
      id: 'INV-S-801',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      plan: 'Growth Tier (Monthly)',
      amount: 'Rs. 12,000',
      status: 'Paid',
      method: 'Online Card · Stripe',
    },
    {
      id: 'INV-S-704',
      date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      plan: 'Growth Tier (Monthly)',
      amount: 'Rs. 12,000',
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
    mrrPKR: 12000,
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
    mrrPKR: 5000,
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
    mrrPKR: 12000,
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
    activeDoctors: 14,
    monthlyTokens: 1240,
    mrrPKR: 25000,
  },
  {
    id: 'tenant-005',
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
    mrrPKR: 5000,
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
