import { supabase } from '../lib/supabase.js';
import { INVOICES } from '../legacy/legacyEngine.js';

export const billingService = {
  async getInvoices() {
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) {
        return [];
      }
      if (Array.isArray(data)) {
        return data.map((r) => {
        const total = Number(r.total) || 0;
        const paid = Number(r.paid) || 0;
        const due = Math.max(0, total - paid);
        return {
          id: r.id,
          pid: r.pid,
          patient: r.patient,
          doctor: r.doctor,
          dept: r.dept,
          date: r.date,
          total: `Rs ${total.toLocaleString()}`,
          paid: `Rs ${paid.toLocaleString()}`,
          due: `Rs ${due.toLocaleString()}`,
          totalNum: total,
          paidNum: paid,
          dueNum: due,
          status: r.status,
          paymentMethod: r.payment_method,
          items: r.items || [],
        };
      });
      }
      return [];
    } catch {
      return [];
    }
  },

  async recordPayment(id, paidAmount) {
    const inv = INVOICES.find((i) => i.id === id);
    if (inv) {
      inv.paid = `Rs ${paidAmount}`;
    }
    try {
      await supabase.from('invoices').update({
        paid: paidAmount,
        status: 'Paid',
      }).eq('id', id);
    } catch {
      // ignore
    }
  },

  subscribe(onChange) {
    try {
      const channel = supabase
        .channel('realtime:invoices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, onChange)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
