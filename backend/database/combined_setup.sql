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
-- ==============================================================================
-- MEDORA HOSPITAL MANAGEMENT SYSTEM (HMS)
-- SUPABASE POSTGRESQL INITIAL SEED DATA
-- ==============================================================================

-- 1. SEED DOCTORS
INSERT INTO public.doctors (id, name, dept, room, hours, fee, days, max_tokens, phone, status) VALUES
  ('DOC-01', 'Dr. Sarah Khan', 'Cardiology', 'Room 204 · East Wing', '09:00 AM – 02:00 PM', 2500, 'Mon–Fri', 20, '0300-1234567', 'Active'),
  ('DOC-02', 'Dr. Bilal Ahmed', 'Orthopedics', 'Room 112 · Ground Floor', '10:00 AM – 04:00 PM', 2500, 'Mon–Sat', 25, '0301-2345678', 'Active'),
  ('DOC-03', 'Dr. Ayesha Raza', 'Pediatrics', 'Room 105 · OPD Wing', '08:30 AM – 01:30 PM', 2000, 'Mon–Fri', 18, '0302-3456789', 'Active'),
  ('DOC-04', 'Dr. Imran Malik', 'General Medicine', 'Room 301 · West Wing', '11:00 AM – 05:00 PM', 2000, 'Tue–Sat', 30, '0303-4567890', 'Active'),
  ('DOC-05', 'Dr. Hina Farooq', 'Gynecology', 'Room 218 · East Wing', '09:00 AM – 03:00 PM', 2500, 'Mon–Fri', 22, '0304-5678901', 'Active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- 2. SEED PATIENTS
INSERT INTO public.patients (id, name, dob, age, gender, phone, cnic, blood, allergy, doctor, last_visit, status, ward, bed, admission_diagnosis, admission_category, diet, fall_risk) VALUES
  ('PT-00109', 'Tariq Mehmood', '1968-01-14', 58, 'Male', '0300-8881234', '36302-1299901-1', 'B+', 'Penicillin', 'Dr. Sarah Khan', 'Today (ER)', 'Admitted', 'ICU & Critical Care Unit', 'ICU-01', 'Acute Inferior STEMI & Cardiogenic Shock', 'Emergency STAT', 'Liquid Cardiac Diet', 'High Fall Risk'),
  ('PT-00120', 'Khalid Mansoor', '1962-08-22', 64, 'Male', '0301-4449876', '36302-8812903-2', 'A+', 'None recorded', 'Dr. Imran Malik', 'Sep 04, 2026', 'Admitted', 'ICU & Critical Care Unit', 'ICU-04', 'Acute Respiratory Failure & Sepsis', 'Emergency STAT', 'Diabetic Renal Diet', 'High Fall Risk'),
  ('PT-00121', 'Zubair Hashmi', '1974-11-10', 51, 'Male', '0333-7711223', '36302-6677881-3', 'O+', 'Aspirin', 'Dr. Sarah Khan', 'Sep 03, 2026', 'Admitted', 'Cardiology Ward', 'C-01', 'Unstable Angina & Dyslipidemia', 'Clinical Observation', 'Low Sodium / Cardiac Diet', 'Moderate Fall Risk'),
  ('PT-00122', 'Rasheeda Begum', '1966-02-03', 60, 'Female', '0321-5544332', '36302-5544112-4', 'AB+', 'None recorded', 'Dr. Sarah Khan', 'Sep 02, 2026', 'Admitted', 'Cardiology Ward', 'C-02', 'Decompensated Heart Failure', 'Clinical Observation', 'Strict Fluid Restriction (1.2L)', 'High Fall Risk'),
  ('PT-00123', 'Usman Farooq', '1987-06-18', 39, 'Male', '0345-6677889', '36302-3322119-5', 'A-', 'Sulfa drugs', 'Dr. Bilal Ahmed', 'Sep 04, 2026', 'Admitted', 'Orthopedic Ward', 'O-07', 'Closed Comminuted Femur Fracture', 'Elective Surgical', 'High Protein Diet', 'High Fall Risk'),
  ('PT-00124', 'Javed Akhtar', '1979-05-09', 47, 'Male', '0302-9988112', '36302-7788992-6', 'B-', 'None recorded', 'Dr. Bilal Ahmed', 'Sep 01, 2026', 'Admitted', 'Orthopedic Ward', 'O-09', 'Lumbar Disc Herniation L4-L5', 'Elective Surgical', 'Standard Hospital Diet', 'Moderate Fall Risk'),
  ('PT-00125', 'Muhammad Ahmed', '1984-03-12', 42, 'Male', '0333-1122334', '36302-1234567-1', 'B+', 'Penicillin', 'Dr. Sarah Khan', 'Sep 03, 2026', 'Admitted', 'Cardiology Ward', 'C-04', 'Hypertensive Urgency & Ischemia', 'Clinical Observation', 'Salt-Restricted Diet', 'Standard Precaution'),
  ('PT-00126', 'Ayesha Bibi', '1997-07-19', 29, 'Female', '0321-9988776', '36302-7654321-2', 'O+', 'None recorded', 'Dr. Hina Farooq', 'Sep 05, 2026', 'OPD', '-', '-', NULL, NULL, 'Standard Hospital Diet', 'Standard Precaution'),
  ('PT-00127', 'Fahad Iqbal', '2018-02-02', 8, 'Male', '0345-2233445', 'Guardian: 36302-1112223-3', 'A+', 'Sulfa drugs', 'Dr. Ayesha Raza', 'Sep 05, 2026', 'Waiting', '-', '-', NULL, NULL, 'Pediatric Soft Diet', 'Standard Precaution'),
  ('PT-00128', 'Rukhsana Kausar', '1970-11-14', 55, 'Female', '0300-5566778', '36302-9998887-4', 'AB-', 'None recorded', 'Dr. Imran Malik', 'Aug 28, 2026', 'Discharged', '-', '-', NULL, NULL, 'Standard Hospital Diet', 'Standard Precaution'),
  ('PT-00129', 'Bilal Chaudhry', '1992-05-23', 34, 'Male', '0311-6677889', '36302-4445556-5', 'O-', 'None recorded', 'Dr. Bilal Ahmed', 'Sep 04, 2026', 'Admitted', 'Orthopedic Ward', 'O-11', 'Post-Op Arthroscopic ACL Reconstruction', 'Elective Surgical', 'Standard Hospital Diet', 'Moderate Fall Risk'),
  ('PT-00130', 'Sana Malik', '1965-01-08', 61, 'Female', '0322-7788990', '36302-2223334-6', 'B-', 'Aspirin', 'Dr. Sarah Khan', 'Sep 02, 2026', 'Follow-up Due', '-', '-', NULL, NULL, 'Diabetic Diet', 'Standard Precaution'),
  ('PT-00131', 'Hamza Sheikh', '2006-09-30', 19, 'Male', '0334-8899001', '36302-3334445-7', 'A-', 'None recorded', 'Dr. Imran Malik', 'Sep 05, 2026', 'OPD', '-', '-', NULL, NULL, 'Standard Hospital Diet', 'Standard Precaution'),
  ('PT-00132', 'Nimra Yousaf', '2000-04-11', 26, 'Female', '0300-1231231', '36302-5556667-8', 'O+', 'None recorded', 'Dr. Hina Farooq', 'Sep 01, 2026', 'OPD', '-', '-', NULL, NULL, 'Standard Hospital Diet', 'Standard Precaution'),
  ('PT-00133', 'Baby of Amina', '2025-08-15', 1, 'Female', '0312-3344556', 'Mother: 36302-9988123-7', 'O+', 'None recorded', 'Dr. Ayesha Raza', 'Sep 05, 2026', 'Admitted', 'Pediatric & Neonatal Ward', 'P-05', 'Neonatal Jaundice & Hyperbilirubinemia', 'Clinical Observation', 'Infant Formula / Breast Milk', 'High Fall Risk'),
  ('PT-00134', 'Abdul Rehman', '1955-12-12', 70, 'Male', '0305-1122334', '36302-4455667-8', 'B+', 'None recorded', 'Dr. Imran Malik', 'Sep 04, 2026', 'Admitted', 'General Medical Ward', 'G-15', 'Community Acquired Lobar Pneumonia', 'Clinical Observation', 'Standard Diabetic Diet', 'High Fall Risk'),
  ('PT-00136', 'Ghulam Mustafa', '1973-04-25', 53, 'Male', '0307-2233445', '36302-8877665-9', 'A+', 'None recorded', 'Dr. Imran Malik', 'Sep 03, 2026', 'Admitted', 'General Medical Ward', 'G-18', 'Acute Gastroenteritis & Dehydration', 'Clinical Observation', 'Oral Rehydration & Light Diet', 'Moderate Fall Risk'),
  ('PT-00137', 'Zain Ali', '2021-10-04', 4, 'Male', '0346-7788990', 'Guardian: 36302-5544332-1', 'AB+', 'Peanuts', 'Dr. Ayesha Raza', 'Sep 04, 2026', 'Admitted', 'Pediatric & Neonatal Ward', 'P-01', 'Severe Acute Bronchiolitis', 'Emergency STAT', 'Pediatric Soft Diet', 'Moderate Fall Risk')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, ward = EXCLUDED.ward, bed = EXCLUDED.bed;

-- 3. SEED WARDS
INSERT INTO public.wards (id, name, type, floor, nurse_head) VALUES
  ('icu', 'ICU & Critical Care Unit', 'Critical Care', 'Floor 3 · East Wing', 'Sister Rukhsana (ICU Specialist)'),
  ('cardio', 'Cardiology Ward', 'Step-Down & Inpatient', 'Floor 2 · East Wing', 'Nadia Yousaf (Charge Nurse)'),
  ('ortho', 'Orthopedic Ward', 'Post-Surgical Care', 'Floor 1 · West Wing', 'Kamran Sheikh (Staff Nurse)'),
  ('peds', 'Pediatric & Neonatal Ward', 'Pediatrics & NICU', 'Floor 2 · North Wing', 'Farhat Naz (Pediatric Nurse)'),
  ('general', 'General Medical Ward', 'General Medicine', 'Floor 1 · East Wing', 'Zahid Iqbal (Charge Nurse)')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, nurse_head = EXCLUDED.nurse_head;

-- 4. SEED BEDS
INSERT INTO public.beds (code, ward_id, room, status, patient_id, equipment) VALUES
  ('ICU-01', 'icu', 'ICU-A', 'occupied', 'PT-00109', 'Mechanical Ventilator + Arterial Line'),
  ('ICU-02', 'icu', 'ICU-A', 'available', NULL, 'Mechanical Ventilator + Central Telemetry'),
  ('ICU-03', 'icu', 'ICU-B', 'cleaning', NULL, 'Continuous BiPAP / CPAP'),
  ('ICU-04', 'icu', 'ICU-B', 'occupied', 'PT-00120', 'Mechanical Ventilator + Dialysis Port'),
  ('C-01', 'cardio', '101', 'occupied', 'PT-00121', 'Wall Oxygen + Telemetry'),
  ('C-02', 'cardio', '101', 'occupied', 'PT-00122', 'Wall Oxygen + Telemetry'),
  ('C-03', 'cardio', '101', 'available', NULL, 'Wall Oxygen'),
  ('C-04', 'cardio', '102', 'occupied', 'PT-00125', 'Telemetry Monitor'),
  ('C-05', 'cardio', '102', 'reserved', NULL, 'Wall Oxygen'),
  ('C-06', 'cardio', '102', 'available', NULL, 'Standard Medical Bed'),
  ('O-07', 'ortho', '201', 'occupied', 'PT-00123', 'Orthopedic Traction Frame'),
  ('O-08', 'ortho', '201', 'available', NULL, 'Low-Height Fall Risk Bed'),
  ('O-09', 'ortho', '201', 'occupied', 'PT-00124', 'Standard Medical Bed'),
  ('O-10', 'ortho', '202', 'maintenance', NULL, 'Under Electrical Repair'),
  ('O-11', 'ortho', '202', 'occupied', 'PT-00129', 'Trapeze Bar + Fall Sensor'),
  ('O-12', 'ortho', '202', 'cleaning', NULL, 'Standard Medical Bed'),
  ('P-01', 'peds', 'PED-1', 'occupied', 'PT-00137', 'Pediatric Crib + Phototherapy'),
  ('P-02', 'peds', 'PED-1', 'available', NULL, 'Pediatric Safety Bed'),
  ('P-03', 'peds', 'PED-1', 'available', NULL, 'Pediatric Safety Bed'),
  ('P-04', 'peds', 'PED-2', 'reserved', NULL, 'Infant Incubator Unit'),
  ('P-05', 'peds', 'PED-2', 'occupied', 'PT-00133', 'Pediatric Safety Bed'),
  ('P-06', 'peds', 'PED-2', 'available', NULL, 'Standard Child Bed'),
  ('G-13', 'general', '301', 'available', NULL, 'Standard Medical Bed'),
  ('G-14', 'general', '301', 'available', NULL, 'Wall Oxygen'),
  ('G-15', 'general', '301', 'occupied', 'PT-00134', 'Standard Medical Bed'),
  ('G-16', 'general', '302', 'reserved', NULL, 'Standard Medical Bed'),
  ('G-17', 'general', '302', 'cleaning', NULL, 'Standard Medical Bed'),
  ('G-18', 'general', '302', 'occupied', 'PT-00136', 'Wall Oxygen')
ON CONFLICT (code) DO UPDATE SET status = EXCLUDED.status, patient_id = EXCLUDED.patient_id, equipment = EXCLUDED.equipment;

-- 5. SEED APPOINTMENTS
INSERT INTO public.appointments (id, token, patient_id, patient, doctor_id, doctor, dept, room, date, time, type, status, priority, fee, notes) VALUES
  ('AP-3301', 'TK-01', 'PT-00125', 'Muhammad Ahmed', 'DOC-01', 'Dr. Sarah Khan', 'Cardiology', 'Room 204 · East Wing', '2026-09-14', '09:30 AM', 'Follow-up', 'Checked-in', 'Normal', 2500, 'Hypertension follow-up'),
  ('AP-3302', 'TK-02', 'PT-00126', 'Ayesha Bibi', 'DOC-05', 'Dr. Hina Farooq', 'Gynecology', 'Room 218 · East Wing', '2026-09-14', '10:00 AM', 'Consultation', 'Waiting', 'Normal', 2500, 'Prenatal checkup'),
  ('AP-3303', 'TK-03', 'PT-00127', 'Fahad Iqbal', 'DOC-03', 'Dr. Ayesha Raza', 'Pediatrics', 'Room 105 · OPD Wing', '2026-09-14', '10:15 AM', 'New Visit', 'Waiting', 'Urgent', 2000, 'High pyrexia'),
  ('AP-3304', 'TK-04', 'PT-00131', 'Hamza Sheikh', 'DOC-04', 'Dr. Imran Malik', 'General Medicine', 'Room 301 · West Wing', '2026-09-14', '11:00 AM', 'Consultation', 'Confirmed', 'Normal', 2000, 'Abdominal discomfort'),
  ('AP-3305', 'TK-05', 'PT-00132', 'Nimra Yousaf', 'DOC-05', 'Dr. Hina Farooq', 'Gynecology', 'Room 218 · East Wing', '2026-09-14', '11:30 AM', 'Follow-up', 'In Consultation', 'Normal', 2500, 'Post-treatment ultrasound review'),
  ('AP-3306', 'TK-06', 'PT-00130', 'Sana Malik', 'DOC-01', 'Dr. Sarah Khan', 'Cardiology', 'Room 204 · East Wing', '2026-09-14', '12:00 PM', 'Follow-up', 'Completed', 'High', 2500, 'ECG & Holter evaluation')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED PHARMACY INVENTORY
INSERT INTO public.medicines (id, name, generic, category, form, batch_no, stock, min_stock, unit, price, price_num, expiry, status, allergy_class) VALUES
  ('MED-101', 'Augmentin 625mg', 'Co-Amoxiclav', 'Antibiotic', 'Tablet', 'BT-9921', 0, 40, 'Tablets', 'Rs 45/unit', 45, 'Dec 2026', 'Out of Stock', 'Penicillin'),
  ('MED-102', 'Panadol 500mg', 'Paracetamol', 'Analgesic', 'Tablet', 'BT-8842', 18, 50, 'Tablets', 'Rs 4/unit', 4, 'Jan 2027', 'Low Stock', 'None'),
  ('MED-103', 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotic', 'Capsule', 'BT-7719', 320, 100, 'Capsules', 'Rs 8/unit', 8, 'Oct 2026', 'In Stock', 'Penicillin'),
  ('MED-104', 'Metformin 500mg', 'Metformin HCl', 'Antidiabetic', 'Tablet', 'BT-6631', 240, 80, 'Tablets', 'Rs 6/unit', 6, 'Sep 2026', 'In Stock', 'None'),
  ('MED-105', 'Losartan 50mg', 'Losartan Potassium', 'Antihypertensive', 'Tablet', 'BT-5520', 180, 60, 'Tablets', 'Rs 10/unit', 10, 'Nov 2027', 'In Stock', 'None'),
  ('MED-106', 'Ceftriaxone 1g IV', 'Ceftriaxone Sodium', 'Antibiotic', 'Injection / Vial', 'BT-4411', 65, 30, 'Vials', 'Rs 320/unit', 320, 'Aug 2027', 'In Stock', 'Cephalosporin'),
  ('MED-107', 'Omeprazole 40mg', 'Omeprazole', 'Gastrointestinal', 'Capsule', 'BT-3329', 190, 50, 'Capsules', 'Rs 15/unit', 15, 'Jun 2027', 'In Stock', 'None'),
  ('MED-108', 'Salbutamol Inhaler 100mcg', 'Salbutamol Sulfate', 'Respiratory', 'Inhaler', 'BT-2210', 12, 25, 'Canisters', 'Rs 380/unit', 380, 'Dec 2026', 'Low Stock', 'None')
ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock, status = EXCLUDED.status;

-- 7. SEED LAB ORDERS
INSERT INTO public.lab_orders (id, pid, patient, test, doctor, status, priority, ordered, verified_by, results) VALUES
  ('LAB-000892', 'PT-00125', 'Muhammad Ahmed', 'Lipid Profile', 'Dr. Sarah Khan', 'Processing', 'Normal', 'Sep 05, 09:10 AM', 'Dr. Usman Tariq', '[{"param":"Total Cholesterol","result":"185 mg/dL","normal":true},{"param":"Triglycerides","result":"162 mg/dL","normal":false}]'::jsonb),
  ('LAB-000893', 'PT-00127', 'Fahad Iqbal', 'Complete Blood Count', 'Dr. Ayesha Raza', 'Urgent', 'Urgent', 'Sep 05, 10:20 AM', 'Dr. Usman Tariq', '[{"param":"WBC Count","result":"14.8 x10^3/uL","normal":false},{"param":"Hemoglobin","result":"11.9 g/dL","normal":true}]'::jsonb),
  ('LAB-000894', 'PT-00129', 'Bilal Chaudhry', 'X-Ray (Left Knee)', 'Dr. Bilal Ahmed', 'Sample Collected', 'Normal', 'Sep 04, 04:40 PM', 'Dr. Usman Tariq', '[]'::jsonb),
  ('LAB-000895', 'PT-00130', 'Sana Malik', 'HbA1c', 'Dr. Sarah Khan', 'Result Ready', 'Normal', 'Sep 04, 11:00 AM', 'Dr. Usman Tariq', '[{"param":"HbA1c","result":"6.8%","normal":false}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED INVOICES
INSERT INTO public.invoices (id, pid, patient, doctor, dept, date, total, paid, status, payment_method, items) VALUES
  ('INV-5510', 'PT-00125', 'Muhammad Ahmed', 'Dr. Sarah Khan', 'Cardiology', 'Sep 03, 2026', 15000, 15000, 'Paid', 'Credit Card', '[{"desc":"Specialist Consultation","amount":2500},{"desc":"Echo Cardiogram (2D)","amount":8500},{"desc":"Cardiac Meds","amount":4000}]'::jsonb),
  ('INV-5511', 'PT-00129', 'Bilal Chaudhry', 'Dr. Bilal Ahmed', 'Orthopedics', 'Sep 04, 2026', 42000, 42000, 'Paid', 'Cash', '[{"desc":"Orthopedic Traction & Surgery Set","amount":35000},{"desc":"Post-op X-Ray","amount":3500},{"desc":"Ward Bed Charges (2 Days)","amount":3500}]'::jsonb),
  ('INV-5512', 'PT-00126', 'Ayesha Bibi', 'Dr. Hina Farooq', 'Gynecology', 'Sep 05, 2026', 4500, 0, 'Unpaid', 'Pending', '[{"desc":"Consultation","amount":2500},{"desc":"Ultrasound Pelvis","amount":2000}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
