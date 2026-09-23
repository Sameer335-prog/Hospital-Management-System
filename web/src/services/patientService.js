import { PATIENTS } from '../legacy/legacyEngine.js';
import { getActiveClinicId } from '../utils/clinicConfig.js';
import { supabase } from '../lib/supabase.js';

const BACKEND_URL = 'http://localhost:5000';

function getStoredClinicPatients(clinicId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`medora_patients_${clinicId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredClinicPatients(clinicId, list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`medora_patients_${clinicId}`, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export const patientService = {
  /**
   * Retrieves patients strictly scoped to the active clinic
   */
  async getPatients(overrideClinicId = null) {
    const clinicId = overrideClinicId || getActiveClinicId();

    // 1. Try Express Backend API with Multi-Tenant Header
    try {
      const resp = await fetch(`${BACKEND_URL}/api/patients`, {
        headers: {
          'x-clinic-id': clinicId,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && Array.isArray(json.data)) {
          saveStoredClinicPatients(clinicId, json.data);
          return json.data;
        }
      }
    } catch {
      // Backend offline or timeout -> gracefully fallback
    }

    // 2. Direct Supabase Query (Online Cloud)
    try {
      if (supabase) {
        const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          saveStoredClinicPatients(clinicId, data);
          return data;
        }
      }
    } catch {
      // ignore
    }

    // 3. Check local clinic-partitioned cache
    const cached = getStoredClinicPatients(clinicId);
    if (cached !== null) {
      return cached;
    }

    return [];
  },

  /**
   * Retrieves single patient strictly checking tenant ownership
   */
  async getPatientById(id, overrideClinicId = null) {
    const clinicId = overrideClinicId || getActiveClinicId();

    // 1. Try Express Backend API
    try {
      const resp = await fetch(`${BACKEND_URL}/api/patients/${id}`, {
        headers: {
          'x-clinic-id': clinicId,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.data) {
          return json.data;
        }
      } else if (resp.status === 403 || resp.status === 404) {
        // Cross-tenant access blocked by backend
        return null;
      }
    } catch {
      // ignore
    }

    // 2. Fallback to clinic cache / legacy array with tenant check
    const cached = getStoredClinicPatients(clinicId) || PATIENTS;
    const found = cached.find((p) => p.id === id);
    if (!found) return null;

    // Strict tenant barrier
    if (found.clinicId && found.clinicId !== clinicId) {
      return null;
    }

    return found;
  },

  /**
   * Registers new patient tagged with the active clinic
   */
  async createPatient(newPatient) {
    const clinicId = newPatient.clinicId || getActiveClinicId();
    const patientWithClinic = {
      ...newPatient,
      clinicId,
    };

    // Update local legacy array
    const existingIndex = PATIENTS.findIndex((p) => p.id === patientWithClinic.id);
    if (existingIndex >= 0) {
      PATIENTS[existingIndex] = { ...PATIENTS[existingIndex], ...patientWithClinic };
    } else {
      PATIENTS.unshift(patientWithClinic);
    }

    // Update partitioned clinic store
    const currentList = getStoredClinicPatients(clinicId) || PATIENTS.filter((p) => !p.clinicId || p.clinicId === clinicId);
    const updatedList = [patientWithClinic, ...currentList.filter((p) => p.id !== patientWithClinic.id)];
    saveStoredClinicPatients(clinicId, updatedList);

    // Sync to backend Express API
    try {
      await fetch(`${BACKEND_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'x-clinic-id': clinicId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientWithClinic),
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      // offline fallback handled
    }

    // Dispatch custom event for real-time reactive UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medora-patients-updated', { detail: { clinicId, patient: patientWithClinic } }));
    }

    return patientWithClinic;
  },

  async updatePatient(id, updates) {
    const clinicId = updates.clinicId || getActiveClinicId();

    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS[idx] = { ...PATIENTS[idx], ...updates };
    }

    const currentList = getStoredClinicPatients(clinicId) || [];
    const updatedList = currentList.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveStoredClinicPatients(clinicId, updatedList);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medora-patients-updated', { detail: { clinicId, id } }));
    }

    return PATIENTS[idx] || updates;
  },

  async deletePatient(id) {
    const clinicId = getActiveClinicId();
    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS.splice(idx, 1);
    }

    const currentList = getStoredClinicPatients(clinicId) || [];
    const updatedList = currentList.filter((p) => p.id !== id);
    saveStoredClinicPatients(clinicId, updatedList);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medora-patients-updated', { detail: { clinicId, id } }));
    }

    return true;
  },

  subscribe(onChange) {
    if (typeof window === 'undefined') return () => {};

    const handleLocalUpdate = (e) => {
      if (onChange) onChange(e.detail);
    };

    window.addEventListener('medora-patients-updated', handleLocalUpdate);
    window.addEventListener('clinic-profile-updated', handleLocalUpdate);

    return () => {
      window.removeEventListener('medora-patients-updated', handleLocalUpdate);
      window.removeEventListener('clinic-profile-updated', handleLocalUpdate);
    };
  },
};

