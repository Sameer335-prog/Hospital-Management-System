-- ==============================================================================
-- MEDORA HOSPITAL MANAGEMENT SYSTEM (HMS)
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- Clean reset to prevent column type mismatches with pre-existing partial tables
DROP TABLE IF EXISTS public.nursing_tasks CASCADE;
DROP TABLE IF EXISTS public.emergency_codes CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.medicines CASCADE;
DROP TABLE IF EXISTS public.lab_orders CASCADE;
DROP TABLE IF EXISTS public.prescription_items CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.waiting_room CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.wards CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Patient' CHECK (role IN ('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician', 'Patient')),
  phone TEXT,
  department TEXT,
  patient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS MASTER DIRECTORY & EHR
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY, -- MRN e.g. PT-00125
  name TEXT NOT NULL,
  dob TEXT,
  age INTEGER,
  gender TEXT DEFAULT 'Male',
  phone TEXT,
  cnic TEXT,
  blood TEXT DEFAULT 'O+',
  allergy TEXT DEFAULT 'None recorded',
  doctor TEXT,
  last_visit TEXT DEFAULT 'Today',
  status TEXT DEFAULT 'OPD' CHECK (status IN ('Admitted', 'OPD', 'Waiting', 'Discharged', 'Follow-up Due', 'Emergency')),
  ward TEXT DEFAULT '-',
  bed TEXT DEFAULT '-',
  admission_diagnosis TEXT,
  admission_category TEXT,
  diet TEXT DEFAULT 'Standard Hospital Diet',
  fall_risk TEXT DEFAULT 'Standard Precaution',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTORS & ATTENDING SPECIALISTS
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY, -- e.g. DOC-01
  name TEXT NOT NULL,
  dept TEXT NOT NULL,
  room TEXT,
  hours TEXT,
  fee NUMERIC DEFAULT 2000,
  days TEXT,
  max_tokens INTEGER DEFAULT 25,
  phone TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'In Surgery', 'Consulting', 'Rounds'))
);

-- 4. HOSPITAL WARDS
CREATE TABLE IF NOT EXISTS public.wards (
  id TEXT PRIMARY KEY, -- e.g. icu, cardio, ortho, peds, general
  name TEXT NOT NULL,
  type TEXT,
  floor TEXT,
  nurse_head TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INPATIENT BEDS
CREATE TABLE IF NOT EXISTS public.beds (
  code TEXT PRIMARY KEY, -- e.g. ICU-01, C-04, O-11
  ward_id TEXT REFERENCES public.wards(id) ON DELETE CASCADE,
  room TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'reserved', 'maintenance')),
  patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
  equipment TEXT DEFAULT 'Standard Medical Bed',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APPOINTMENTS & CONSULTATION BOOKINGS
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY, -- e.g. AP-3301
  token TEXT,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor TEXT NOT NULL,
  dept TEXT,
  room TEXT,
  date TEXT,
  time TEXT,
  type TEXT DEFAULT 'Consultation',
  status TEXT DEFAULT 'Waiting' CHECK (status IN ('Confirmed', 'Waiting', 'Checked-in', 'In Consultation', 'Completed', 'Cancelled')),
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
  fee NUMERIC DEFAULT 2000,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LIVE WAITING LOUNGE QUEUE
CREATE TABLE IF NOT EXISTS public.waiting_room (
  id SERIAL PRIMARY KEY,
  pid TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  doctor TEXT,
  dept TEXT,
  wait_min INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'Normal',
  arrived TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ELECTRONIC PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY, -- e.g. RX-901
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor TEXT NOT NULL,
  dept TEXT,
  date TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Dispensed', 'Completed', 'Cancelled')),
  diagnosis TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRESCRIPTION MEDICATION ITEMS
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine TEXT NOT NULL,
  dose TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT
);

-- 10. LABORATORY ORDERS & DIAGNOSTICS
CREATE TABLE IF NOT EXISTS public.lab_orders (
  id TEXT PRIMARY KEY, -- e.g. LAB-000892
  pid TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  test TEXT NOT NULL,
  doctor TEXT,
  status TEXT DEFAULT 'Sample Collected' CHECK (status IN ('Sample Collected', 'Processing', 'Result Ready', 'Verified', 'Urgent')),
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgent', 'STAT')),
  ordered TEXT,
  verified_by TEXT,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PHARMACY INVENTORY & FORMULARY
CREATE TABLE IF NOT EXISTS public.medicines (
  id TEXT PRIMARY KEY, -- e.g. MED-101
  name TEXT NOT NULL,
  generic TEXT,
  category TEXT,
  form TEXT,
  batch_no TEXT,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 20,
  unit TEXT DEFAULT 'Tablets',
  price TEXT,
  price_num NUMERIC DEFAULT 0,
  expiry TEXT,
  status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon')),
  allergy_class TEXT DEFAULT 'None'
);

-- 12. BILLING & PATIENT INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY, -- e.g. INV-5510
  pid TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  doctor TEXT,
  dept TEXT,
  date TEXT,
  total NUMERIC DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Partial', 'Unpaid', 'Cancelled')),
  payment_method TEXT DEFAULT 'Cash',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. HOSPITAL EMERGENCY BROADCAST CODES
CREATE TABLE IF NOT EXISTS public.emergency_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Acknowledged', 'Cleared')),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  cleared_at TIMESTAMPTZ
);

-- 14. NURSING WARD TASKS
CREATE TABLE IF NOT EXISTS public.nursing_tasks (
  id TEXT PRIMARY KEY,
  pid TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  type TEXT,
  detail TEXT,
  due TEXT,
  state TEXT DEFAULT 'upcoming' CHECK (state IN ('upcoming', 'due-soon', 'overdue', 'completed'))
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_tasks ENABLE ROW LEVEL SECURITY;

-- Permissive policies for hospital operations (select, insert, update, delete)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access for all" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public access for all" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_room;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_codes;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medicines;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
