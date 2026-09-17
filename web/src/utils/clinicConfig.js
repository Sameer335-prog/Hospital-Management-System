import { useState, useEffect } from 'react';

/**
 * clinicConfig.js
 * Centralized dynamic clinic profile & whitelabeling configuration.
 * Allows small clinics & private practices to customize their branding,
 * thermal receipt headers, and WhatsApp templates from /settings.
 */

export const DEFAULT_CLINIC_PROFILE = {
  name: 'Medora Healthcare Clinic',
  tagline: 'Outpatient & Specialist Care Complex',
  doctorInCharge: 'Dr. Sarah Khan (MBBS, FCPS)',
  phone: '0300-1234567',
  hotline: '051-111-222-333',
  address: 'Sector H-8/4, Islamabad, Pakistan',
  ntn: '2849102-4',
  email: 'clinic@medora.hospital',
  website: 'www.medora-clinic.pk',
  currency: 'Rs.',
  paperWidth: '80mm', // '80mm' | '58mm'
  receiptFooter: 'Valid for today only. Retain for token call announcement.',
  thankYouMessage: 'Thank you for choosing our clinic. Get well soon!',
  taxRate: '0',
  practiceType: 'General OPD & Specialist Clinic', // Dental, Pediatric, Polyclinic, etc.
};

const STORAGE_KEY = 'medora_hospital_profile';

export function getClinicProfile() {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_CLINIC_PROFILE;
    return { ...DEFAULT_CLINIC_PROFILE, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_CLINIC_PROFILE;
  }
}

export function saveClinicProfile(updated) {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_PROFILE;
  const merged = { ...getClinicProfile(), ...updated };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('clinic-profile-updated', { detail: merged }));
  } catch (err) {
    console.error('Failed to save clinic profile:', err);
  }
  return merged;
}

/**
 * React hook to subscribe to live clinic profile updates.
 */
export function useClinicProfile() {
  const [profile, setProfile] = useState(() => getClinicProfile());

  useEffect(() => {
    const handleUpdate = (e) => {
      setProfile(e.detail || getClinicProfile());
    };
    window.addEventListener('clinic-profile-updated', handleUpdate);
    return () => window.removeEventListener('clinic-profile-updated', handleUpdate);
  }, []);

  return profile;
}
