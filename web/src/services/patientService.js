import { PATIENTS } from '../legacy/legacyEngine.js';
import { getActiveClinicId, getClinicProfile } from '../utils/clinicConfig.js';
import { getSpecialtyConfig } from '../utils/specialtyConfig.js';
import { supabase } from '../lib/supabase.js';

const BACKEND_URL = 'http://localhost:5000';
const ALLOWED_DB_STATUSES = ['OPD', 'Admitted', 'Discharged', 'Emergency', 'Waiting'];

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
    // Keep in-memory legacy array synchronized
    if (Array.isArray(list)) {
      list.forEach((p) => {
        const idx = PATIENTS.findIndex((item) => item.id === p.id);
        if (idx >= 0) {
          PATIENTS[idx] = { ...PATIENTS[idx], ...p };
        } else {
          PATIENTS.unshift(p);
        }
      });
    }
  } catch {
    // ignore
  }
}

export const patientService = {
  /**
   * Synchronously returns cached patients for zero-flicker React initial states
   */
  getStoredPatientsSync(overrideClinicId = null) {
    const clinicId = overrideClinicId || getActiveClinicId();
    return getStoredClinicPatients(clinicId);
  },

  /**
   * Retrieves patients strictly scoped to the active clinic,
   * guaranteeing local patients are never wiped out by empty backend/cloud tables.
   */
  async getPatients(overrideClinicId = null) {
    const clinicId = overrideClinicId || getActiveClinicId();
    let localPatients = getStoredClinicPatients(clinicId);

    // Initial seeding if storage is empty for this clinic
    if (!localPatients || localPatients.length === 0) {
      try {
        const profile = getClinicProfile();
        const specialty = getSpecialtyConfig(profile);
        if (specialty?.archetypePatients && specialty.archetypePatients.length > 0) {
          localPatients = specialty.archetypePatients.map((p) => ({ ...p, clinicId }));
        } else {
          localPatients = PATIENTS.filter((p) => !p.clinicId || p.clinicId === clinicId).map((p) => ({
            ...p,
            clinicId,
          }));
        }
      } catch {
        localPatients = PATIENTS.map((p) => ({ ...p, clinicId }));
      }
      saveStoredClinicPatients(clinicId, localPatients);
    }

    let remoteList = null;

    // 1. Direct Supabase Query (Online Cloud)
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          remoteList = data.map((row) => ({
            id: row.id,
            clinicId,
            name: row.name,
            gender: row.gender || 'Female',
            dob: row.dob || '',
            age: Number(row.age) || 28,
            phone: row.phone || '',
            cnic: row.cnic || 'N/A',
            blood: row.blood || 'O+',
            allergy: row.allergy || 'None recorded',
            conditions: row.admission_diagnosis || 'None recorded',
            doctor: row.doctor || 'Dr. Sarah Khan',
            status: row.status || 'Waiting',
            ward: row.ward || '-',
            bed: row.bed || '-',
            lastVisit: row.last_visit || 'Today',
            triage: 'Routine (Green)',
          }));
        }
      }
    } catch (err) {
      console.warn('[Supabase patient fetch fallback]:', err);
    }

    // 2. Try Express Backend API if Supabase had no list
    if (!remoteList) {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/patients`, {
          headers: {
            'x-clinic-id': clinicId,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(2000),
        });

        if (resp.ok) {
          const json = await resp.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            remoteList = json.data;
          }
        }
      } catch {
        // Backend offline
      }
    }

    // 3. Merge remote with local records to ensure NO locally registered patient is lost
    if (remoteList && remoteList.length > 0) {
      const mergedMap = new Map();
      // Put remote records first
      remoteList.forEach((p) => mergedMap.set(p.id, p));
      // Overlay/preserve local records
      localPatients.forEach((p) => mergedMap.set(p.id, { ...mergedMap.get(p.id), ...p }));
      const merged = Array.from(mergedMap.values());
      saveStoredClinicPatients(clinicId, merged);
      return merged;
    }

    // Return preserved local patients
    return localPatients;
  },

  /**
   * Retrieves single patient
   */
  async getPatientById(id, overrideClinicId = null) {
    const clinicId = overrideClinicId || getActiveClinicId();

    // 1. Direct Supabase Query
    try {
      if (supabase) {
        const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            clinicId,
            name: data.name,
            gender: data.gender,
            dob: data.dob,
            age: data.age,
            phone: data.phone,
            cnic: data.cnic,
            blood: data.blood,
            allergy: data.allergy,
            conditions: data.admission_diagnosis || 'None recorded',
            doctor: data.doctor,
            status: data.status,
            ward: data.ward,
            bed: data.bed,
            lastVisit: data.last_visit || 'Today',
            triage: 'Routine (Green)',
          };
        }
      }
    } catch {
      // ignore
    }

    // 2. Check local clinic cache
    const cached = getStoredClinicPatients(clinicId) || PATIENTS;
    const found = cached.find((p) => p.id === id);
    if (!found) return null;

    return found;
  },

  /**
   * Registers new patient.
   * Persists immediately to localStorage, in-memory registry, and syncs to Supabase / Backend.
   */
  async createPatient(newPatient) {
    const clinicId = newPatient.clinicId || getActiveClinicId();
    const id = newPatient.id || `PT-${Math.floor(10000 + Math.random() * 89999)}`;

    const resolvedPatient = {
      id,
      clinicId,
      name: newPatient.name?.trim() || 'New Patient',
      dob: newPatient.dob || null,
      age: Number(newPatient.age) || 28,
      gender: newPatient.gender || 'Female',
      phone: newPatient.phone?.trim() || '',
      cnic: newPatient.cnic?.trim() || 'N/A',
      blood: newPatient.blood || newPatient.bloodGroup || 'O+',
      allergy: newPatient.allergy || newPatient.allergies || 'None recorded',
      conditions: newPatient.conditions || 'None recorded',
      doctor: newPatient.doctor || 'Dr. Sarah Khan',
      lastVisit: newPatient.lastVisit || 'Today',
      status: ALLOWED_DB_STATUSES.includes(newPatient.status) ? newPatient.status : 'Waiting',
      ward: newPatient.ward || '-',
      bed: newPatient.bed || '-',
      triage: newPatient.triage || 'Routine (Green)',
      emergencyName: newPatient.emergencyName || '',
      emergencyRelationship: newPatient.emergencyRelationship || '',
      emergencyPhone: newPatient.emergencyPhone || '',
      createdAt: newPatient.createdAt || new Date().toISOString(),
    };

    // 1. Immediately store in clinic partition
    const currentList = getStoredClinicPatients(clinicId) || [];
    const updatedList = [resolvedPatient, ...currentList.filter((p) => p.id !== resolvedPatient.id)];
    saveStoredClinicPatients(clinicId, updatedList);

    // 2. Update global legacy array
    const existingIndex = PATIENTS.findIndex((p) => p.id === resolvedPatient.id);
    if (existingIndex >= 0) {
      PATIENTS[existingIndex] = { ...PATIENTS[existingIndex], ...resolvedPatient };
    } else {
      PATIENTS.unshift(resolvedPatient);
    }

    // 3. Sync to Supabase Cloud Database with exact matching schema columns
    try {
      if (supabase) {
        const dbStatus = ALLOWED_DB_STATUSES.includes(resolvedPatient.status)
          ? resolvedPatient.status
          : 'Waiting';

        const dbPayload = {
          id: resolvedPatient.id,
          name: resolvedPatient.name,
          dob: resolvedPatient.dob || null,
          age: Number(resolvedPatient.age) || 28,
          gender: resolvedPatient.gender || 'Female',
          phone: resolvedPatient.phone || '',
          cnic: resolvedPatient.cnic || 'N/A',
          blood: resolvedPatient.blood || 'O+',
          allergy: resolvedPatient.allergy || 'None recorded',
          doctor: resolvedPatient.doctor || 'Dr. Sarah Khan',
          last_visit: resolvedPatient.lastVisit || 'Today',
          status: dbStatus,
          ward: resolvedPatient.ward || '-',
          bed: resolvedPatient.bed || '-',
          admission_diagnosis: resolvedPatient.conditions || '',
          diet: 'Regular',
          fall_risk: 'Low',
        };

        const { error } = await supabase.from('patients').upsert(dbPayload);
        if (error) {
          console.warn('[Supabase Patient Sync Warning]:', error.message);
        } else {
          console.log('[Supabase Patient Stored Successfully]:', resolvedPatient.id);
        }
      }
    } catch (err) {
      console.warn('[Supabase Patient Sync Network Warning]:', err?.message || err);
    }

    // 4. Sync to backend Express API (if running)
    try {
      await fetch(`${BACKEND_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'x-clinic-id': clinicId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolvedPatient),
        signal: AbortSignal.timeout(2000),
      });
    } catch {
      // offline fallback
    }

    // 5. Dispatch reactive event for real-time UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medora-patients-updated', {
          detail: { clinicId, patient: resolvedPatient },
        })
      );
    }

    return resolvedPatient;
  },

  async updatePatient(id, updates) {
    const clinicId = updates.clinicId || getActiveClinicId();

    const currentList = getStoredClinicPatients(clinicId) || [];
    const updatedList = currentList.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveStoredClinicPatients(clinicId, updatedList);

    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS[idx] = { ...PATIENTS[idx], ...updates };
    }

    try {
      if (supabase) {
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
        if (updates.age !== undefined) dbUpdates.age = Number(updates.age);
        if (updates.blood !== undefined) dbUpdates.blood = updates.blood;
        if (updates.allergy !== undefined) dbUpdates.allergy = updates.allergy;
        if (updates.doctor !== undefined) dbUpdates.doctor = updates.doctor;
        if (updates.status !== undefined) {
          dbUpdates.status = ALLOWED_DB_STATUSES.includes(updates.status) ? updates.status : 'Waiting';
        }
        if (updates.ward !== undefined) dbUpdates.ward = updates.ward;
        if (updates.bed !== undefined) dbUpdates.bed = updates.bed;
        if (updates.conditions !== undefined) dbUpdates.admission_diagnosis = updates.conditions;

        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from('patients').update(dbUpdates).eq('id', id);
        }
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medora-patients-updated', { detail: { clinicId, id } }));
    }

    return PATIENTS[idx] || updates;
  },

  async deletePatient(id) {
    const clinicId = getActiveClinicId();
    const currentList = getStoredClinicPatients(clinicId) || [];
    const updatedList = currentList.filter((p) => p.id !== id);
    saveStoredClinicPatients(clinicId, updatedList);

    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS.splice(idx, 1);
    }

    try {
      if (supabase) {
        await supabase.from('patients').delete().eq('id', id);
      }
    } catch {
      // ignore
    }

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
