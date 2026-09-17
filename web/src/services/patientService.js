import { supabase } from '../lib/supabase.js';
import { PATIENTS } from '../legacy/legacyEngine.js';

function mapDbRowToPatient(row) {
  return {
    id: row.id,
    name: row.name,
    dob: row.dob || '',
    age: row.age || 0,
    gender: row.gender || 'Male',
    phone: row.phone || '',
    cnic: row.cnic || 'N/A',
    blood: row.blood || 'O+',
    allergy: row.allergy || 'None recorded',
    doctor: row.doctor || 'Dr. Sarah Khan',
    lastVisit: row.last_visit || 'Today',
    status: row.status || 'OPD',
    ward: row.ward || '-',
    bed: row.bed || '-',
    admissionDiagnosis: row.admission_diagnosis || '',
    admissionCategory: row.admission_category || '',
    diet: row.diet || 'Standard Hospital Diet',
    fallRisk: row.fall_risk || 'Standard Precaution',
    createdAt: row.created_at,
  };
}

function mapPatientToDbRow(p) {
  return {
    id: p.id,
    name: p.name,
    dob: p.dob || null,
    age: Number(p.age) || 0,
    gender: p.gender || 'Male',
    phone: p.phone || null,
    cnic: p.cnic || null,
    blood: p.blood || 'O+',
    allergy: p.allergy || 'None recorded',
    doctor: p.doctor || 'Dr. Sarah Khan',
    last_visit: p.lastVisit || 'Today',
    status: p.status || 'OPD',
    ward: p.ward || '-',
    bed: p.bed || '-',
    admission_diagnosis: p.admissionDiagnosis || null,
    admission_category: p.admissionCategory || null,
    diet: p.diet || 'Standard Hospital Diet',
    fall_risk: p.fallRisk || 'Standard Precaution',
  };
}

export const patientService = {
  async getPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data || data.length === 0) {
        return [...PATIENTS];
      }
      return data.map(mapDbRowToPatient);
    } catch {
      return [...PATIENTS];
    }
  },

  async getPatientById(id) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToPatient(data);
      }
    } catch {
      // ignore
    }
    return PATIENTS.find((p) => p.id === id) || null;
  },

  async createPatient(newPatient) {
    // Keep local legacy array synchronized immediately
    const existingIndex = PATIENTS.findIndex((p) => p.id === newPatient.id);
    if (existingIndex >= 0) {
      PATIENTS[existingIndex] = { ...PATIENTS[existingIndex], ...newPatient };
    } else {
      PATIENTS.unshift(newPatient);
    }

    try {
      const dbRow = mapPatientToDbRow(newPatient);
      const { data, error } = await supabase
        .from('patients')
        .upsert(dbRow)
        .select()
        .single();

      if (!error && data) {
        return mapDbRowToPatient(data);
      }
    } catch {
      // Gracefully fall back to local state
    }
    return newPatient;
  },

  async updatePatient(id, updates) {
    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS[idx] = { ...PATIENTS[idx], ...updates };
    }

    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
      if (updates.age !== undefined) dbUpdates.age = Number(updates.age);
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.cnic !== undefined) dbUpdates.cnic = updates.cnic;
      if (updates.blood !== undefined) dbUpdates.blood = updates.blood;
      if (updates.allergy !== undefined) dbUpdates.allergy = updates.allergy;
      if (updates.doctor !== undefined) dbUpdates.doctor = updates.doctor;
      if (updates.lastVisit !== undefined) dbUpdates.last_visit = updates.lastVisit;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.ward !== undefined) dbUpdates.ward = updates.ward;
      if (updates.bed !== undefined) dbUpdates.bed = updates.bed;
      if (updates.admissionDiagnosis !== undefined) dbUpdates.admission_diagnosis = updates.admissionDiagnosis;
      if (updates.admissionCategory !== undefined) dbUpdates.admission_category = updates.admissionCategory;
      if (updates.diet !== undefined) dbUpdates.diet = updates.diet;
      if (updates.fallRisk !== undefined) dbUpdates.fall_risk = updates.fallRisk;

      await supabase.from('patients').update(dbUpdates).eq('id', id);
    } catch {
      // Gracefully continue with local state
    }
    return PATIENTS[idx] || updates;
  },

  async deletePatient(id) {
    const idx = PATIENTS.findIndex((p) => p.id === id);
    if (idx >= 0) {
      PATIENTS.splice(idx, 1);
    }

    try {
      await supabase.from('patients').delete().eq('id', id);
    } catch {
      // ignore
    }
    return true;
  },

  subscribe(onChange) {
    try {
      const channel = supabase
        .channel('realtime:patients')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patients' },
          (payload) => {
            if (onChange) onChange(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
