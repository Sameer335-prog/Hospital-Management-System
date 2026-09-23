import { useState, useEffect } from 'react';

/**
 * clinicConfig.js
 * Centralized dynamic clinic profile & whitelabeling configuration.
 * Allows small clinics & private practices to customize their branding,
 * thermal receipt headers, and WhatsApp templates from /settings.
 */

import { SPECIALTY_ARCHETYPES, getSpecialtyConfig } from './specialtyConfig.js';

export const DEFAULT_CLINIC_PROFILE = {
  id: 'tenant-001',
  archetype: 'general_hospital', // 'dental' | 'pediatric' | 'ophthalmology' | 'polyclinic' | 'general_hospital'
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

  // Detect archetype
  let archetypeId = target.archetype;
  if (!archetypeId) {
    const combined = `${target.name || ''} ${target.practiceType || ''}`.toLowerCase();
    if (combined.includes('dent') || combined.includes('tooth') || combined.includes('orthodont')) archetypeId = 'dental';
    else if (combined.includes('pediat') || combined.includes('child') || combined.includes('kid')) archetypeId = 'pediatric';
    else if (combined.includes('eye') || combined.includes('ophthalm') || combined.includes('vision')) archetypeId = 'ophthalmology';
    else if (combined.includes('poly') || combined.includes('family') || combined.includes('diagnost')) archetypeId = 'polyclinic';
    else archetypeId = 'general_hospital';
  }

  const arch = SPECIALTY_ARCHETYPES[archetypeId] || SPECIALTY_ARCHETYPES.general_hospital;

  const updatedProfile = {
    ...getClinicProfile(),
    id: target.id || 'tenant-001',
    archetype: arch.id,
    name: target.name || arch.name,
    tagline: arch.tagline,
    logoIcon: arch.logoIcon,
    doctorInCharge: target.doctorInCharge || arch.doctorInCharge,
    accreditation: arch.accreditation,
    phone: target.phone || arch.phone,
    hotline: arch.hotline,
    address: target.address || (target.city ? `${target.city}, Pakistan` : arch.address),
    practiceType: target.practiceType || arch.practiceType,
    currency: arch.currency || 'Rs.',
    receiptFooter: arch.receiptFooter,
    thankYouMessage: arch.thankYouMessage,
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

  // Partitioned Tenant Database Isolation
  try {
    if (typeof window !== 'undefined') {
      const tenantId = target.id || 'tenant-001';

      // 1. Appointments Queue: isolated per tenant
      const queueKey = `medora_appointments_queue_${tenantId}`;
      let queue = null;
      const rawQueue = localStorage.getItem(queueKey);
      if (rawQueue) {
        queue = JSON.parse(rawQueue);
      } else {
        queue = arch.archetypeAppointments || [];
        localStorage.setItem(queueKey, JSON.stringify(queue));
      }
      localStorage.setItem('medora_appointments_queue', JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('medora-queue-reset', { detail: queue }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('medora_queue_sync');
        bc.postMessage(queue);
        bc.close();
      }

      // 2. Prescriptions: isolated per tenant
      const rxKey = `medora_prescriptions_list_${tenantId}`;
      let rxs = null;
      const rawRxs = localStorage.getItem(rxKey);
      if (rawRxs) {
        rxs = JSON.parse(rawRxs);
      } else {
        rxs = arch.archetypePrescriptions || [];
        localStorage.setItem(rxKey, JSON.stringify(rxs));
      }
      localStorage.setItem('medora_prescriptions_list', JSON.stringify(rxs));
      window.dispatchEvent(new CustomEvent('medora-prescriptions-reset', { detail: rxs }));
    }
  } catch {
    // safe fallback
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

/**
 * 1-Click apply a complete specialty archetype preset
 */
export function applySpecialtyPreset(archetypeId) {
  const archetype = SPECIALTY_ARCHETYPES[archetypeId];
  if (!archetype) return getClinicProfile();

  const current = getClinicProfile();
  const updated = {
    ...current,
    archetype: archetype.id,
    name: archetype.name,
    tagline: archetype.tagline,
    logoIcon: archetype.logoIcon,
    doctorInCharge: archetype.doctorInCharge,
    accreditation: archetype.accreditation,
    practiceType: archetype.practiceType,
    phone: archetype.phone,
    hotline: archetype.hotline,
    address: archetype.address,
    currency: archetype.currency,
    receiptFooter: archetype.receiptFooter,
    thankYouMessage: archetype.thankYouMessage,
  };

  saveClinicProfile(updated);

  // Automatically reset appointments queue to match specialty (zero hospital bleed-through)
  try {
    if (typeof window !== 'undefined') {
      const tenantId = current.id || 'tenant-001';
      if (archetype.archetypeAppointments) {
        localStorage.setItem(`medora_appointments_queue_${tenantId}`, JSON.stringify(archetype.archetypeAppointments));
        localStorage.setItem('medora_appointments_queue', JSON.stringify(archetype.archetypeAppointments));
        window.dispatchEvent(new CustomEvent('medora-queue-reset', { detail: archetype.archetypeAppointments }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('medora_queue_sync');
          bc.postMessage(archetype.archetypeAppointments);
          bc.close();
        }
      }
      if (archetype.archetypePrescriptions) {
        localStorage.setItem(`medora_prescriptions_list_${tenantId}`, JSON.stringify(archetype.archetypePrescriptions));
        localStorage.setItem('medora_prescriptions_list', JSON.stringify(archetype.archetypePrescriptions));
        window.dispatchEvent(new CustomEvent('medora-prescriptions-reset', { detail: archetype.archetypePrescriptions }));
      }
    }
  } catch {
    // safe fallback
  }

  return updated;
}

export { SPECIALTY_ARCHETYPES, getSpecialtyConfig };

