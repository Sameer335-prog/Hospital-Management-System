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

function getStoredQueue() {
  if (typeof window === 'undefined') return [...APPOINTMENTS];
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...APPOINTMENTS];
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
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('time', { ascending: true });

      if (error || !data || data.length === 0) {
        return getStoredQueue();
      }
      const mapped = data.map((r) => ({
        id: r.id,
        token: r.token || '',
        pid: r.patient_id,
        patient: r.patient,
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
      return mapped;
    } catch {
      return getStoredQueue();
    }
  },

  async createAppointment(newApt) {
    const current = getStoredQueue();
    const updated = [newApt, ...current];
    saveStoredQueue(updated);

    // Also update in-memory APPOINTMENTS array
    if (!APPOINTMENTS.some((a) => a.id === newApt.id)) {
      APPOINTMENTS.unshift(newApt);
    }

    try {
      await supabase.from('appointments').upsert({
        id: newApt.id,
        token: newApt.token || null,
        patient_id: newApt.pid,
        patient: newApt.patient,
        doctor: newApt.doctor,
        dept: newApt.dept || '',
        time: newApt.time,
        type: newApt.type || 'Consultation',
        status: newApt.status || 'Waiting',
        priority: newApt.priority || 'Normal',
        notes: newApt.notes || '',
      });
    } catch {
      // ignore
    }
    return newApt;
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
