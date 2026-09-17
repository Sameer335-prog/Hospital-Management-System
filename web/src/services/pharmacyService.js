import { supabase } from '../lib/supabase.js';
import { MEDICINES } from '../legacy/legacyEngine.js';

export const pharmacyService = {
  async getMedicines() {
    try {
      const { data, error } = await supabase.from('medicines').select('*').order('name', { ascending: true });
      if (error || !data || data.length === 0) {
        return [...MEDICINES];
      }
      return data.map((r) => ({
        id: r.id,
        name: r.name,
        generic: r.generic,
        category: r.category,
        form: r.form,
        batchNo: r.batch_no,
        stock: r.stock,
        minStock: r.min_stock,
        unit: r.unit,
        price: r.price,
        priceN: Number(r.price_num) || 0,
        expiry: r.expiry,
        status: r.status,
        allergyClass: r.allergy_class,
      }));
    } catch {
      return [...MEDICINES];
    }
  },

  async createMedicine(med) {
    try {
      const row = {
        id: med.id,
        name: med.name,
        generic: med.generic,
        category: med.category || 'General',
        form: med.form || 'Tablet',
        batch_no: med.batchNo || 'BT-001',
        stock: Number(med.stock) || 0,
        min_stock: Number(med.minStock) || 30,
        unit: med.unit || 'Tablets',
        price: med.price || `Rs ${med.priceN || 10}/unit`,
        price_num: Number(med.priceN) || 10,
        expiry: med.expiry || 'Dec 2027',
        status: med.status || 'In Stock',
        allergy_class: med.allergyClass || 'None',
      };
      await supabase.from('medicines').insert(row);
    } catch {
      // ignore
    }
  },

  async updateMedicine(id, updates) {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.generic !== undefined) dbUpdates.generic = updates.generic;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.form !== undefined) dbUpdates.form = updates.form;
      if (updates.batchNo !== undefined) dbUpdates.batch_no = updates.batchNo;
      if (updates.stock !== undefined) dbUpdates.stock = Number(updates.stock);
      if (updates.minStock !== undefined) dbUpdates.min_stock = Number(updates.minStock);
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.priceN !== undefined) dbUpdates.price_num = Number(updates.priceN);
      if (updates.expiry !== undefined) dbUpdates.expiry = updates.expiry;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.allergyClass !== undefined) dbUpdates.allergy_class = updates.allergyClass;

      await supabase.from('medicines').update(dbUpdates).eq('id', id);
    } catch {
      // ignore
    }
  },

  async deleteMedicine(id) {
    try {
      await supabase.from('medicines').delete().eq('id', id);
    } catch {
      // ignore
    }
  },

  async adjustStock(id, newStock, newStatus) {
    const med = MEDICINES.find((m) => m.name === id || m.id === id);
    if (med) {
      med.stock = newStock;
      if (newStatus) med.status = newStatus;
    }
    try {
      const updates = { stock: newStock };
      if (newStatus) updates.status = newStatus;
      await supabase.from('medicines').update(updates).eq('id', id);
    } catch {
      // ignore
    }
  },

  subscribe(onChange) {
    try {
      const channel = supabase
        .channel('realtime:medicines')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'medicines' }, onChange)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
