import { supabase } from '../lib/supabase.js';
import { WARDS } from '../data/wardsData.js';

export const bedService = {
  async getWardsAndBeds() {
    try {
      const { data: dbWards, error: wardsErr } = await supabase.from('wards').select('*');
      const { data: dbBeds, error: bedsErr } = await supabase.from('beds').select('*');

      if (wardsErr || bedsErr || !dbWards || dbWards.length === 0 || !dbBeds || dbBeds.length === 0) {
        return JSON.parse(JSON.stringify(WARDS));
      }

      // Format into WARDS structure
      return dbWards.map((w) => {
        const wardBeds = dbBeds.filter((b) => b.ward_id === w.id);
        const roomsMap = {};
        for (const b of wardBeds) {
          if (!roomsMap[b.room]) {
            roomsMap[b.room] = [];
          }
          roomsMap[b.room].push([b.code, b.status, b.patient_id, b.equipment]);
        }
        return {
          id: w.id,
          name: w.name,
          type: w.type,
          floor: w.floor,
          nurseHead: w.nurse_head,
          rooms: Object.entries(roomsMap).map(([room, beds]) => ({ room, beds })),
        };
      });
    } catch {
      return JSON.parse(JSON.stringify(WARDS));
    }
  },

  async createBed({ code, wardId, room, status = 'available', patientId = null, equipment = 'Standard Medical Bed' }) {
    try {
      const { error } = await supabase.from('beds').insert({
        code: code.trim(),
        ward_id: wardId || 'general',
        room: room.trim(),
        status,
        patient_id: patientId || null,
        equipment: equipment || 'Standard Medical Bed',
        updated_at: new Date().toISOString(),
      });

      if (!error && patientId) {
        await supabase.from('patients').update({
          status: 'Admitted',
          bed: code.trim(),
        }).eq('id', patientId);
      }
    } catch {
      // ignore
    }
  },

  async updateBed(bedCode, { room, status, patientId, equipment }) {
    try {
      const updates = { updated_at: new Date().toISOString() };
      if (room !== undefined) updates.room = room;
      if (status !== undefined) updates.status = status;
      if (patientId !== undefined) updates.patient_id = patientId;
      if (equipment !== undefined) updates.equipment = equipment;

      await supabase.from('beds').update(updates).eq('code', bedCode);
    } catch {
      // ignore
    }
  },

  async deleteBed(bedCode) {
    try {
      await supabase.from('beds').delete().eq('code', bedCode);
    } catch {
      // ignore
    }
  },

  async assignBed(bedCode, patientId, diagnosis) {
    try {
      await supabase.from('beds').update({
        status: 'occupied',
        patient_id: patientId,
        updated_at: new Date().toISOString(),
      }).eq('code', bedCode);

      if (patientId) {
        await supabase.from('patients').update({
          status: 'Admitted',
          bed: bedCode,
          admission_diagnosis: diagnosis || 'Clinical Inpatient Care',
        }).eq('id', patientId);
      }
    } catch {
      // ignore
    }
  },

  async dischargeBed(bedCode, patientId) {
    try {
      await supabase.from('beds').update({
        status: 'cleaning',
        patient_id: null,
        updated_at: new Date().toISOString(),
      }).eq('code', bedCode);

      if (patientId) {
        await supabase.from('patients').update({
          status: 'Discharged',
          bed: '-',
          ward: '-',
        }).eq('id', patientId);
      }
    } catch {
      // ignore
    }
  },

  subscribe(onChange) {
    try {
      const channel = supabase
        .channel('realtime:beds')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, onChange)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
