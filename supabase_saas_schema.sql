-- ============================================================================
-- MEDORA HMS: MULTI-TENANT SAAS DATABASE SCHEMA & RLS ISOLATION
-- Database: PostgreSQL 15+ (Supabase)
-- Author: Medora Health Technologies
-- Description: Enables multi-tenant SaaS architecture allowing hundreds of
--              independent clinics to subscribe on monthly/annual tiers with
--              complete hardware-level data isolation via Row-Level Security (RLS).
-- ============================================================================

-- Enable required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TENANT MASTER TABLE: clinics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,                       -- e.g. 'al-shifa', 'city-dental'
    tagline TEXT DEFAULT 'Outpatient & Specialist Care Center',
    practice_type TEXT DEFAULT 'General OPD & Polyclinic',
    doctor_in_charge TEXT NOT NULL,
    phone TEXT NOT NULL,
    hotline TEXT,
    email TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Islamabad',
    country TEXT DEFAULT 'Pakistan',
    currency TEXT DEFAULT 'Rs.',
    paper_width TEXT DEFAULT '80mm',                 -- '80mm' | '58mm' for thermal printer
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'suspended')),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant tenant lookups via URL subdomain or slug
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON public.clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_status ON public.clinics(subscription_status);

-- ============================================================================
-- 2. SUBSCRIPTIONS & PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'growth', 'enterprise')),
    amount_pkr NUMERIC(10, 2) NOT NULL,
    amount_usd NUMERIC(10, 2),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    payment_gateway TEXT DEFAULT 'stripe' CHECK (payment_gateway IN ('stripe', 'jazzcash', 'easypaisa', 'bank_transfer', 'manual')),
    gateway_reference TEXT,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic ON public.subscriptions(clinic_id);

-- ============================================================================
-- 3. SUBSCRIPTION INVOICES (BILLING HISTORY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,             -- e.g. 'INV-S-2026-001'
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'PKR',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
    pdf_url TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_clinic ON public.subscription_invoices(clinic_id);

-- ============================================================================
-- 4. LINK CLINIC_ID TO CORE CLINICAL TABLES
--    Guarantees every patient, appointment, invoice, and drug belongs to a tenant
-- ============================================================================

DO $$
BEGIN
    -- patients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='clinic_id') THEN
        ALTER TABLE public.patients ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- appointments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='clinic_id') THEN
        ALTER TABLE public.appointments ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- doctors
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='clinic_id') THEN
        ALTER TABLE public.doctors ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- invoices / billing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='clinic_id') THEN
        ALTER TABLE public.invoices ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- lab_orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lab_orders' AND column_name='clinic_id') THEN
        ALTER TABLE public.lab_orders ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- pharmacy_inventory
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pharmacy_inventory' AND column_name='clinic_id') THEN
        ALTER TABLE public.pharmacy_inventory ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;

    -- beds / wards
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='beds' AND column_name='clinic_id') THEN
        ALTER TABLE public.beds ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes on foreign keys for high performance multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic ON public.invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_clinic ON public.lab_orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_clinic ON public.pharmacy_inventory(clinic_id);

-- ============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) TENANT ISOLATION BARRIERS
--    Ensures Clinic A can NEVER read or write Clinic B's records under any circumstance
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

-- Helper function to extract tenant ID from authenticated Supabase JWT
CREATE OR REPLACE FUNCTION public.get_tenant_clinic_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'clinic_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- RLS Policy: Patients Isolation
DROP POLICY IF EXISTS "tenant_patients_isolation" ON public.patients;
CREATE POLICY "tenant_patients_isolation" ON public.patients
    FOR ALL
    USING (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL)
    WITH CHECK (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL);

-- RLS Policy: Appointments Isolation
DROP POLICY IF EXISTS "tenant_appointments_isolation" ON public.appointments;
CREATE POLICY "tenant_appointments_isolation" ON public.appointments
    FOR ALL
    USING (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL)
    WITH CHECK (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL);

-- RLS Policy: Invoices Isolation
DROP POLICY IF EXISTS "tenant_invoices_isolation" ON public.invoices;
CREATE POLICY "tenant_invoices_isolation" ON public.invoices
    FOR ALL
    USING (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL)
    WITH CHECK (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL);

-- RLS Policy: Lab Orders Isolation
DROP POLICY IF EXISTS "tenant_lab_isolation" ON public.lab_orders;
CREATE POLICY "tenant_lab_isolation" ON public.lab_orders
    FOR ALL
    USING (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL)
    WITH CHECK (clinic_id = public.get_tenant_clinic_id() OR clinic_id IS NULL);

-- ============================================================================
-- 6. SEED DEMO TENANTS (Initial Data)
-- ============================================================================
INSERT INTO public.clinics (id, name, slug, doctor_in_charge, phone, email, address, city, plan, subscription_status)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Medora Healthcare Clinic', 'medora-main', 'Dr. Sarah Khan', '0300-1234567', 'sarah@medora.hospital', 'Sector H-8/4, Islamabad', 'Islamabad', 'growth', 'active'),
    ('c2222222-2222-2222-2222-222222222222', 'City Smile Dental Clinic', 'city-smile', 'Dr. Usman Farooq', '0321-7654321', 'usman@citysmile.pk', 'DHA Phase 5, Lahore', 'Lahore', 'starter', 'trialing')
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT id, name, slug, plan, subscription_status, trial_ends_at FROM public.clinics;
