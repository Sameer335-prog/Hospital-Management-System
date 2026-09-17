import { useState, useEffect } from 'react';

/**
 * clinicConfig.js
 * Centralized dynamic clinic profile & whitelabeling configuration.
 * Allows small clinics & private practices to customize their branding,
 * thermal receipt headers, and WhatsApp templates from /settings.
 */

export const DEFAULT_CLINIC_PROFILE = {
  id: 'tenant-001',
  name: 'Al-Shifa Healthcare Complex',
  tagline: 'Outpatient & Specialist Care Complex',
  doctorInCharge: 'Dr. Sarah Khan (MBBS, FCPS)',
  logoIcon: '🏥',
  logoImage: '',
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

export function getActiveClinicId() {
  const profile = getClinicProfile();
  return profile.id || 'tenant-001';
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
 * Switch active clinic to test multi-tenancy isolation
 */
export function switchActiveClinic(clinicOrId) {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_PROFILE;
  let target = clinicOrId;

  if (typeof clinicOrId === 'string') {
    try {
      const raw = localStorage.getItem('medora_saas_tenants');
      const tenants = raw ? JSON.parse(raw) : [];
      target = tenants.find((t) => t.id === clinicOrId) || { id: clinicOrId, name: clinicOrId };
    } catch {
      target = { id: clinicOrId, name: clinicOrId };
    }
  }

  const updatedProfile = {
    ...getClinicProfile(),
    id: target.id || 'tenant-001',
    name: target.name || 'Clinic',
    doctorInCharge: target.doctorInCharge || 'Attending Physician',
    phone: target.phone || '0300-1234567',
    address: `${target.city || 'Islamabad'}, Pakistan`,
    practiceType: target.practiceType || 'Specialist Clinic',
  };

  saveClinicProfile(updatedProfile);

  // Sync plan if specified
  if (target.plan) {
    try {
      const subKey = 'medora_clinic_subscription';
      const existing = JSON.parse(localStorage.getItem(subKey) || '{}');
      const updatedSub = { ...existing, planId: target.plan };
      localStorage.setItem(subKey, JSON.stringify(updatedSub));
      window.dispatchEvent(new CustomEvent('medora-subscription-updated', { detail: updatedSub }));
    } catch {
      // ignore
    }
  }

  return updatedProfile;
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
