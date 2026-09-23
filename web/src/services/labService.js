import { supabase } from '../lib/supabase.js';
import { LAB_ORDERS } from '../legacy/legacyEngine.js';

export const labService = {
  async getLabOrders() {
    try {
      const { data, error } = await supabase.from('lab_orders').select('*').order('created_at', { ascending: false });
      if (error) {
        return [];
      }
      if (Array.isArray(data)) {
        return data.map((r) => ({
          id: r.id,
          pid: r.pid,
          patient: r.patient,
          test: r.test,
          doctor: r.doctor,
          status: r.status,
          priority: r.priority,
          ordered: r.ordered,
          verifiedBy: r.verified_by,
          results: r.results || [],
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async createLabOrder(order) {
    LAB_ORDERS.unshift(order);
    try {
      await supabase.from('lab_orders').insert({
        id: order.id,
        pid: order.pid,
        patient: order.patient,
        test: order.test,
        doctor: order.doctor,
        status: order.status || 'Sample Collected',
        priority: order.priority || 'Normal',
        ordered: order.ordered || 'Today',
        results: order.results || [],
      });
    } catch {
      // ignore
    }
    return order;
  },

  async updateOrderStatus(id, status, verifiedBy = null) {
    const ord = LAB_ORDERS.find((o) => o.id === id);
    if (ord) {
      ord.status = status;
      if (verifiedBy) ord.verifiedBy = verifiedBy;
    }
    try {
      const updates = { status };
      if (verifiedBy) updates.verified_by = verifiedBy;
      await supabase.from('lab_orders').update(updates).eq('id', id);
    } catch {
      // ignore
    }
  },

  subscribe(onChange) {
    try {
      const channel = supabase
        .channel('realtime:lab_orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, onChange)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
