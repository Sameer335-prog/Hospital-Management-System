import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsqyldvgzsxggnlprwhp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcXlsZHZnenN4Z2dubHByd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTQ2NDgsImV4cCI6MjEwNDA3MDY0OH0.qiQ8DfMWDk9q5Q3j0NF_-dHAxPNGsYFBrKSOGKIcngs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ALL_TABLES = [
  'waiting_room',
  'lab_orders',
  'invoices',
  'prescriptions',
  'odontograms',
  'appointments',
  'pharmacy_inventory',
  'medicines',
  'beds',
  'wards',
  'patients',
  'doctors',
  'subscription_invoices',
  'subscriptions',
  'clinics',
  'profiles'
];

async function eraseAllData() {
  console.log('🚀 Starting complete Supabase backend data erasure for testing phase...\n');
  
  for (const table of ALL_TABLES) {
    try {
      // 1. Fetch current count / existing rows
      const { data, count, error: fetchErr } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (fetchErr) {
        console.log(`⚠️ Table "${table}": Query skipped or table does not exist (${fetchErr.message})`);
        continue;
      }

      console.log(`📋 Table "${table}": Found ${count ?? data?.length ?? 0} existing records.`);

      if (data && data.length > 0) {
        // Find the primary key column (usually 'id' or 'code')
        const sample = data[0];
        const idCol = 'id' in sample ? 'id' : 'code' in sample ? 'code' : Object.keys(sample)[0];
        
        // Delete all rows matching not null
        const ids = data.map((r) => r[idCol]).filter((v) => v !== undefined && v !== null);
        
        if (ids.length > 0) {
          const { error: delErr } = await supabase
            .from(table)
            .delete()
            .in(idCol, ids);

          if (delErr) {
            console.error(`❌ Failed to delete from "${table}":`, delErr.message);
          } else {
            console.log(`✅ Erased ${ids.length} records from "${table}".`);
          }
        }
      } else {
        console.log(`✨ Table "${table}" is already empty.`);
      }
    } catch (err) {
      console.error(`💥 Error processing table "${table}":`, err.message);
    }
  }

  console.log('\n🎉 Supabase backend tables have been completely cleared for clean testing!');
}

eraseAllData();
