import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nsqyldvgzsxggnlprwhp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcXlsZHZnenN4Z2dubHByd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTQ2NDgsImV4cCI6MjEwNDA3MDY0OH0.qiQ8DfMWDk9q5Q3j0NF_-dHAxPNGsYFBrKSOGKIcngs';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
