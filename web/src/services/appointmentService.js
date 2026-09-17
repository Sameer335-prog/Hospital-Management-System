import { supabase } from '../lib/supabase.js';
import { APPOINTMENTS, WAITING_ROOM } from '../legacy/legacyEngine.js';

const QUEUE_STORAGE_KEY = 'medora_appointments_queue';
const listeners = new Set();

// Cross-tab broadcast channel for instant multi-window and TV sync
let syncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('medora_queue_sync');
    syncChannel.onmessage = (event) => {
      notifyLocalListeners(event.data);
    };
  } catch {
    // safe fallback
  }
}

// Window storage listener for cross-tab sync fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === QUEUE_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        notifyLocalListeners(parsed);
      } catch {
        // ignore
      }
    }
  });
}

function notifyLocalListeners(data) {
  listeners.forEach((cb) => {
    try {
      cb(data);
    } catch (err) {
      console.error('Queue listener error:', err);
    }
  });
}

export const DEFAULT_APPOINTMENTS = [
  {
    id: 'AP-3301',
    token: 'TK-01',
    patient: 'Muhammad Ahmed',
    pid: 'PT-00125',
    doctorId: 'DOC-01',
    doctor: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    date: '2026-09-14',
    time: '09:30 AM',
    type: 'Routine Follow-up',
    priority: 'Normal',
    status: 'In Consultation',
    fee: 2500,
    complaint: 'Post-CABG recovery and hypertension titration',
  },
  {
    id: 'AP-3302',
    token: 'TK-02',
    patient: 'Ayesha Bibi',
    pid: 'PT-00126',
    doctorId: 'DOC-05',
    doctor: 'Dr. Hina Farooq',
    dept: 'Gynecology',
    room: 'Room 218 · East Wing',
    date: '2026-09-14',
    time: '10:00 AM',
    type: 'Specialist Consultation',
    priority: 'Normal',
    status: 'Waiting',
    fee: 2500,
    complaint: 'Routine 2nd trimester ultrasound review',
  },
  {
    id: 'AP-3303',
    token: 'TK-03',
    patient: 'Fahad Iqbal',
    pid: 'PT-00127',
    doctorId: 'DOC-03',
    doctor: 'Dr. Ayesha Raza',
    dept: 'Pediatrics',
    room: 'Room 105 · OPD Wing',
    date: '2026-09-14',
    time: '10:30 AM',
    type: 'Acute Consultation',
    priority: 'Urgent',
    status: 'Checked-in',
    fee: 2000,
    complaint: 'High-grade fever (103°F) and dehydration',
  },
  {
    id: 'AP-3304',
    token: 'TK-04',
    patient: 'Bilal Chaudhry',
    pid: 'PT-00129',
    doctorId: 'DOC-02',
    doctor: 'Dr. Bilal Ahmed',
    dept: 'Orthopedics',
    room: 'Room 112 · Ground Floor',
    date: '2026-09-14',
    time: '11:00 AM',
    type: 'Pre-Op Evaluation',
    priority: 'Normal',
    status: 'Waiting',
    fee: 2500,
    complaint: 'Post-op knee dressing and suture inspection',
  },
  {
    id: 'AP-3305',
    token: 'TK-05',
    patient: 'Sana Malik',
    pid: 'PT-00130',
    doctorId: 'DOC-01',
    doctor: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    date: '2026-09-14',
    time: '12:00 PM',
    type: 'Cardiac Follow-up',
    priority: 'Normal',
    status: 'Waiting',
    fee: 2500,
    complaint: 'Persistent palpitations and fatigue',
  },
];

function getStoredQueue() {
  if (typeof window === 'undefined') return [...DEFAULT_APPOINTMENTS];
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_APPOINTMENTS];
}

function saveStoredQueue(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(list));
    if (syncChannel) {
      syncChannel.postMessage(list);
    }
    notifyLocalListeners(list);
  } catch (err) {
    console.error('Failed to save queue state:', err);
  }
}

export const appointmentService = {
  async getAppointments() {
    const localQueue = getStoredQueue();
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('time', { ascending: true });

      if (error || !data || data.length === 0) {
        return localQueue;
      }
      const mapped = data.map((r) => ({
        id: r.id,
        token: r.token || '',
        pid: r.patient_id,
        patient: r.patient,
        doctorId: r.doctor_id,
        doctor: r.doctor,
        dept: r.dept,
        room: r.room,
        date: r.date,
        time: r.time,
        type: r.type,
        status: r.status,
        priority: r.priority,
        fee: r.fee,
        notes: r.notes,
      }));

      // Merge local appointments so any newly created appointment is never dropped
      const mergedMap = new Map();
      mapped.forEach((item) => mergedMap.set(item.id, item));
      localQueue.forEach((item) => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });
      return Array.from(mergedMap.values());
    } catch {
      return localQueue;
    }
  },

  async createAppointment(newApt) {
    const current = getStoredQueue();
    const resolved = {
      ...newApt,
      status: newApt.status || 'Waiting',
    };
    const updated = [resolved, ...current.filter((a) => a.id !== resolved.id)];
    saveStoredQueue(updated);

    // Also update in-memory APPOINTMENTS array
    if (!APPOINTMENTS.some((a) => a.id === resolved.id)) {
      APPOINTMENTS.unshift(resolved);
    }

    // Broadcast browser event for real-time reactivity in open tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medora-appointment-created', {
          detail: { appointment: resolved },
        })
      );
    }

    try {
      await supabase.from('appointments').upsert({
        id: resolved.id,
        token: resolved.token || null,
        patient_id: resolved.pid,
        patient: resolved.patient,
        doctor_id: resolved.doctorId || null,
        doctor: resolved.doctor,
        dept: resolved.dept || '',
        room: resolved.room || '',
        date: resolved.date || 'Today',
        time: resolved.time,
        type: resolved.type || 'Consultation',
        status: resolved.status,
        priority: resolved.priority || 'Normal',
        fee: resolved.fee || 2000,
        notes: resolved.notes || '',
      });
    } catch {
      // ignore
    }
    return resolved;
  },

  async updateAppointmentStatus(id, status) {
    const current = getStoredQueue();
    const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
    saveStoredQueue(updated);

    const apt = APPOINTMENTS.find((a) => a.id === id);
    if (apt) apt.status = status;

    try {
      await supabase.from('appointments').update({ status }).eq('id', id);
    } catch {
      // ignore
    }
    return updated.find((a) => a.id === id);
  },

  /**
   * Advances the clinic queue:
   * 1. Marks currently serving appointment as 'Completed'.
   * 2. Finds the next 'Waiting' or 'Checked-in' appointment and marks it 'In Consultation'.
   * 3. Broadcasts across all tabs so TV and reception instantly reflect the new token.
   */
  async callNextToken(doctorId = null) {
    const current = getStoredQueue();

    // 1. Find currently active patient(s)
    let prevActive = null;
    let nextCandidateIndex = -1;

    // Filter candidate list based on optional doctorId
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      if (doctorId && a.doctorId && a.doctorId !== doctorId) continue;

      if ((a.status === 'In Consultation' || a.status === 'Checked-in') && !prevActive) {
        prevActive = a;
      } else if (a.status === 'Waiting' && nextCandidateIndex === -1) {
        nextCandidateIndex = i;
      }
    }

    // If no active was found, take the first waiting
    if (!prevActive && nextCandidateIndex === -1) {
      nextCandidateIndex = current.findIndex((a) => a.status === 'Waiting');
    }

    const updated = current.map((a, idx) => {
      // Complete the previously active token
      if (prevActive && a.id === prevActive.id) {
        return { ...a, status: 'Completed' };
      }
      // Advance the next waiting token to In Consultation
      if (idx === nextCandidateIndex) {
        return { ...a, status: 'In Consultation' };
      }
      return a;
    });

    saveStoredQueue(updated);

    // Sync in-memory APPOINTMENTS
    updated.forEach((u) => {
      const mem = APPOINTMENTS.find((a) => a.id === u.id);
      if (mem) mem.status = u.status;
    });

    const nextCalled = nextCandidateIndex !== -1 ? updated[nextCandidateIndex] : null;

    // Send broadcast event for TV audio chime & voice trigger
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medora-token-called', {
          detail: { nextCalled, prevActive },
        })
      );
    }

    return { prevActive, nextCalled };
  },

  /**
   * Skips current patient or marks them as absent, moving them to bottom of queue
   */
  async skipCurrentToken(id) {
    const current = getStoredQueue();
    const target = current.find((a) => a.id === id);
    if (!target) return;

    const remaining = current.filter((a) => a.id !== id);
    const updated = [...remaining, { ...target, status: 'Waiting' }];
    saveStoredQueue(updated);
    return updated;
  },

  async getWaitingRoom() {
    try {
      const { data, error } = await supabase
        .from('waiting_room')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        return [...WAITING_ROOM];
      }
      return data.map((r) => ({
        id: r.id,
        pid: r.pid,
        patient: r.patient,
        doctor: r.doctor,
        dept: r.dept,
        waitMin: r.wait_min,
        priority: r.priority,
        arrived: r.arrived,
      }));
    } catch {
      return [...WAITING_ROOM];
    }
  },

  async addToWaitingRoom(entry) {
    WAITING_ROOM.push(entry);
    try {
      await supabase.from('waiting_room').insert({
        pid: entry.pid,
        patient: entry.patient,
        doctor: entry.doctor,
        dept: entry.dept,
        wait_min: entry.waitMin || 0,
        priority: entry.priority || 'Normal',
        arrived: entry.arrived || 'Just now',
      });
    } catch {
      // ignore
    }
    return entry;
  },

  /**
   * Subscribes to queue changes across tabs, local storage, and Supabase
   */
  subscribe(onChange) {
    listeners.add(onChange);

    // Also attach Supabase realtime channel if available
    let sbChannel = null;
    try {
      sbChannel = supabase
        .channel('realtime:appointments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          this.getAppointments().then(onChange);
        })
        .subscribe();
    } catch {
      // ignore
    }

    return () => {
      listeners.delete(onChange);
      if (sbChannel) {
        try {
          supabase.removeChannel(sbChannel);
        } catch {
          // ignore
        }
      }
    };
  },
};
