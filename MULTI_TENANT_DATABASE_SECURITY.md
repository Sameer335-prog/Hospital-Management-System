# Multi-Tenant Healthcare Architecture & Database Security Guide

## 1. Overview & Security Mandate

In medical SaaS platforms (governed by HIPAA, GDPR, and PMDC standards), **data isolation between distinct clinics is a non-negotiable security requirement**. 

A Dental clinic (`tenant-002`) must **never** be able to see or access records belonging to a General Hospital (`tenant-001`) or a Pediatric Clinic (`tenant-003`).

Medora HMS implements a **Hybrid Multi-Tenant Isolation Model**:
1. **Cloud Layer (Supabase PostgreSQL)**: Enforced via **PostgreSQL Row-Level Security (RLS)** using JWT-authenticated `clinic_id` claims.
2. **Application Layer (Express / Node.js & React Client)**: Enforced via tenant-partitioned local storage keys (`medora_*_${clinicId}`) and API headers (`x-clinic-id`).
3. **Role & Specialty Layer**: Dynamic specialization detection ensuring dentists receive odontograms, toothache triage, and dental fees, while physicians receive relevant specialty tools.

---

## 2. Multi-Tenant Database Separation via Supabase RLS

Every clinical table in Supabase contains a foreign key to the `clinics` table:

```sql
clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE
```

### Row-Level Security (RLS) Policy Example

```sql
-- Helper function to extract tenant ID from authenticated Supabase JWT
CREATE OR REPLACE FUNCTION public.get_tenant_clinic_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'clinic_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograms ENABLE ROW LEVEL SECURITY;

-- Strict Isolation Policy: Clinic A can NEVER read or write Clinic B's records
CREATE POLICY "tenant_patients_isolation" ON public.patients
    FOR ALL
    USING (clinic_id = public.get_tenant_clinic_id())
    WITH CHECK (clinic_id = public.get_tenant_clinic_id());
```

> [!IMPORTANT]
> Because RLS executes at the database engine level inside PostgreSQL, even if an attacker attempts to inject a custom `SELECT * FROM patients WHERE id = '...'`, PostgreSQL will automatically filter out any rows that do not match the authenticated clinic's JWT claim.

---

## 3. Client-Side Partitioned Storage (Local Isolation)

On shared clinical workstations (e.g., reception tablets or doctor operatory laptops), local caching is partitioned strictly by `clinicId`:

| Data Entity | Storage Key Pattern | Isolation Guarantee |
| :--- | :--- | :--- |
| **Appointments Queue** | `medora_appointments_queue_${clinicId}` | Dental chairs do not mix with hospital ward queues. |
| **Electronic Prescriptions** | `medora_prescriptions_list_${clinicId}` | Dental amoxicillin/flagyl do not mix with cardiology meds. |
| **Patients Directory** | `medora_patients_${clinicId}` | Strictly isolates patient charts per tenant. |
| **Billing & Shift Archive**| `medora_shift_archive_${clinicId}` | Cash drawer balances never merge between separate clinics. |

---

## 4. Doctor Specialty & Clinic Mapping

When a doctor logs into Medora HMS, the authentication service immediately activates their clinic context:

| User Account | Doctor Name | Medical Specialty | Clinic Tenant | Isolated Views & Tools |
| :--- | :--- | :--- | :--- | :--- |
| `dentist@medora.dental` | Dr. Ali Raza (BDS, RDS) | Dental Surgery | `tenant-002` (Dr. Ali Dental Surgery) | 32-Tooth Odontogram, Dental Operatory Chairs 1–4, Autoclave Log, Toothache Triage |
| `peds@medora.health` | Dr. Ayesha Malik (FCPS) | Pediatrics | `tenant-003` (KidsCare Pediatric Center) | WHO Cold-Chain 4.2°C Fridge, Growth Charts, Pediatric Bays, Fast-Track Fever Triage |
| `eye@medora.vision` | Prof. Dr. Tariq Mehmood | Ophthalmology | `tenant-007` (Al-Noor Eye Hospital) | Snellen Visual Acuity OD/OS, Tonometry IOP, Refraction Lanes 1–4, Phaco Telemetry |
| `s.khan@medora.hospital` | Dr. Sarah Khan (FCPS) | Cardiology & Surgery | `tenant-001` (Al-Shifa Healthcare Complex) | Tertiary Hospital Command Center, Bed Wards, ER Resuscitation Bays, ICU |

---

## 5. Applying the Database Migration

To run the complete multi-tenant database migration in your Supabase SQL Editor:
1. Open your Supabase Dashboard: **SQL Editor**.
2. Open and run [`supabase_saas_schema.sql`](file:///home/faiq-ahmad/Desktop/medora-hms-complete-redesign%20%282%29/hms-repo/supabase_saas_schema.sql).
3. The script will create tenant tables, attach `clinic_id` columns, create composite indexes, and enforce Row-Level Security across all clinical modules.
