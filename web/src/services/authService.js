import { supabase } from '../lib/supabase.js';
import { PATIENTS } from '../legacy/legacyEngine.js';

const STORAGE_KEY = 'medora_hms_session';
const REGISTERED_USERS_KEY = 'medora_hms_custom_users';

const DEV_USERS = [
  { id: 'u-superadmin', name: 'Super Admin (SaaS Platform Owner)', email: 'superadmin@medora.hospital', password: 'superadmin123', role: 'Super Admin' },
  { id: 'u-admin', name: 'Admin User', email: 'admin@medora.hospital', password: 'admin123', role: 'Administrator' },
  { id: 'u-recep', name: 'Farah Iqbal', email: 'reception@medora.hospital', password: 'reception123', role: 'Receptionist' },
  { id: 'u-doctor', name: 'Dr. Sarah Khan', email: 's.khan@medora.hospital', password: 'doctor123', role: 'Doctor' },
  { id: 'u-nurse', name: 'Nadia Yousaf', email: 'nurse@medora.hospital', password: 'nurse123', role: 'Nurse' },
  { id: 'u-lab', name: 'Usman Tariq', email: 'lab@medora.hospital', password: 'lab123', role: 'Lab Technician' },
  { id: 'u-pharma', name: 'Zainab Hussain', email: 'pharmacy@medora.hospital', password: 'pharmacy123', role: 'Pharmacist' },
  { id: 'u-patient', name: 'Muhammad Ahmed', email: 'patient@medora.hospital', password: 'patient123', role: 'Patient', patientId: 'PT-00125' },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(user) {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAllUsers() {
  return [...DEV_USERS, ...getStoredUsers()];
}

export const authService = {
  devAccounts: DEV_USERS.map((u) => ({ email: u.email, password: u.password, role: u.role })),

  async login(email, password, remember = true) {
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. First attempt live Supabase Auth
    try {
      const { data: supaAuth, error: supaError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!supaError && supaAuth?.user) {
        // Attempt to fetch extra profile information from public.profiles
        let userProfile = null;
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supaAuth.user.id)
            .maybeSingle();
          if (pData) {
            userProfile = {
              id: supaAuth.user.id,
              name: pData.name || supaAuth.user.user_metadata?.name || normalizedEmail.split('@')[0],
              email: normalizedEmail,
              role: pData.role || supaAuth.user.user_metadata?.role || 'Patient',
              phone: pData.phone || supaAuth.user.user_metadata?.phone || '',
              department: pData.department || supaAuth.user.user_metadata?.department || '',
              patientId: pData.patient_id || supaAuth.user.user_metadata?.patient_id || null,
            };
          }
        } catch {
          // ignore
        }

        if (!userProfile) {
          userProfile = {
            id: supaAuth.user.id,
            name: supaAuth.user.user_metadata?.name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role: supaAuth.user.user_metadata?.role || 'Patient',
            phone: supaAuth.user.user_metadata?.phone || '',
            department: supaAuth.user.user_metadata?.department || '',
            patientId: supaAuth.user.user_metadata?.patient_id || null,
          };
        }

        const serialized = JSON.stringify(userProfile);
        sessionStorage.setItem(STORAGE_KEY, serialized);
        if (remember) {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
        return userProfile;
      }
    } catch {
      // Continue to local credentials fallback
    }

    // 2. Fallback to local / demo hospital credentials
    await delay(200);
    const users = getAllUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        u.email.toLowerCase() === normalizedEmail.replace('@alshifa.hospital', '@medora.hospital') ||
        u.email.toLowerCase().replace('@medora.hospital', '@alshifa.hospital') === normalizedEmail
    );
    if (!user || user.password !== password) {
      const err = new Error('Incorrect email or password.');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const publicUser = toPublicUser(user);
    const serialized = JSON.stringify(publicUser);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, serialized);
    }
    return publicUser;
  },

  async signup({ name, email, password, role = 'Patient', phone = '', department = '', gender = 'Male', dob = '' }, remember = true) {
    const normalizedEmail = String(email).trim().toLowerCase();
    let patientId = null;

    if (role === 'Patient') {
      patientId = `PT-${Date.now().toString().slice(-5)}`;
      const birthYear = dob ? new Date(dob).getFullYear() : 1995;
      const calculatedAge = Math.max(1, new Date().getFullYear() - birthYear);

      PATIENTS.unshift({
        id: patientId,
        name: name.trim(),
        age: calculatedAge,
        gender: gender || 'Male',
        phone: phone.trim() || '0300-1234567',
        doctor: 'Dr. Sarah Khan',
        lastVisit: 'Today (Online Registration)',
        status: 'OPD',
        blood: 'O+',
        allergy: 'None recorded',
        cnic: 'Pending',
        ward: '-',
        bed: '-',
        dob: dob || '1995-01-01',
      });
    }

    // 1. Attempt Supabase Auth Registration
    try {
      const { data: supaAuth, error: supaError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            phone: phone.trim(),
            department: department.trim(),
            patient_id: patientId,
          },
        },
      });

      if (!supaError && supaAuth?.user) {
        // Try creating profile record
        try {
          await supabase.from('profiles').upsert({
            id: supaAuth.user.id,
            name: name.trim(),
            email: normalizedEmail,
            role,
            phone: phone.trim(),
            department: department.trim(),
            patient_id: patientId,
          });
        } catch {
          // ignore
        }

        const supaUser = {
          id: supaAuth.user.id,
          name: name.trim(),
          email: normalizedEmail,
          role,
          phone: phone.trim(),
          department: department.trim(),
          ...(patientId ? { patientId } : {}),
        };

        const serialized = JSON.stringify(supaUser);
        sessionStorage.setItem(STORAGE_KEY, serialized);
        if (remember) {
          localStorage.setItem(STORAGE_KEY, serialized);
        }
        return supaUser;
      }
    } catch {
      // Continue to local signup
    }

    // 2. Fallback to local accounts
    await delay(250);
    const all = getAllUsers();
    if (all.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      const err = new Error('An account with this email address already exists. Please sign in instead.');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const newId = `u-${Date.now()}`;
    const newUser = {
      id: newId,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      phone: phone.trim(),
      department: department.trim(),
      ...(patientId ? { patientId } : {}),
    };

    const stored = getStoredUsers();
    stored.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(stored));

    const publicUser = toPublicUser(newUser);
    const serialized = JSON.stringify(publicUser);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, serialized);
    }
    return publicUser;
  },

  async resetPassword(email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    try {
      await supabase.auth.resetPasswordForEmail(normalizedEmail);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Password reset instructions and verification code have been dispatched to ${normalizedEmail}.`,
    };
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  },

  async me() {
    // 1. Check active Supabase session
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        let profile = null;
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();
          if (pData) profile = pData;
        } catch {
          // ignore
        }

        return {
          id: u.id,
          name: profile?.name || u.user_metadata?.name || u.email.split('@')[0],
          email: u.email,
          role: profile?.role || u.user_metadata?.role || 'Patient',
          phone: profile?.phone || u.user_metadata?.phone || '',
          department: profile?.department || u.user_metadata?.department || '',
          patientId: profile?.patient_id || u.user_metadata?.patient_id || null,
        };
      }
    } catch {
      // ignore
    }

    // 2. Fallback to local session storage
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
};
