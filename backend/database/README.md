# Medora HMS — Backend & Database Layer (Supabase PostgreSQL)

This folder contains the complete PostgreSQL database schema, initial seed data, and migration scripts for **Medora Hospital Management System (HMS)** powered by Supabase.

---

## 📁 File Structure

```
supabase/
├── schema.sql           # Database schema DDL (14 tables, RLS policies, Realtime publications)
├── seed.sql             # Initial realistic seed dataset (18 patients, 5 doctors, 28 beds, etc.)
├── combined_setup.sql   # Concatenated 1-click execution script (Schema + Seed)
└── README.md            # Database architecture & documentation
```

---

## 🏛 Database Schema Overview

| Table | Description | Primary Key | Key Relationships |
| :--- | :--- | :--- | :--- |
| **`profiles`** | User account profiles linked to Supabase Auth | `id` (UUID) | References `auth.users(id)` |
| **`patients`** | Master Patient Index and Electronic Health Records | `id` (TEXT, MRN) | e.g. `PT-00109`, `PT-00125` |
| **`doctors`** | Attending doctors, departments, fees, and schedules | `id` (TEXT) | e.g. `DOC-01`, `DOC-02` |
| **`wards`** | Hospital inpatient wards and units | `id` (TEXT) | e.g. `icu`, `cardio`, `ortho` |
| **`beds`** | Inpatient bed inventory and real-time occupancy status | `code` (TEXT) | References `wards(id)`, `patients(id)` |
| **`appointments`** | OPD consultations, booking slots, and status | `id` (TEXT) | References `patients(id)`, `doctors(id)` |
| **`waiting_room`** | Live waiting lounge queue tokens | `id` (SERIAL) | References `patients(id)` |
| **`prescriptions`** | Electronic clinical prescriptions (Rx) | `id` (TEXT) | References `patients(id)` |
| **`prescription_items`** | Individual prescribed medications and dosages | `id` (SERIAL) | References `prescriptions(id)` |
| **`lab_orders`** | Clinical laboratory test orders and results | `id` (TEXT) | References `patients(id)` |
| **`medicines`** | Pharmacy formulary, batch numbers, and inventory stock | `id` (TEXT) | e.g. `MED-101`, `MED-102` |
| **`invoices`** | Patient billing invoices, totals, and balances | `id` (TEXT) | References `patients(id)` |
| **`emergency_codes`** | Hospital emergency broadcast alerts (Code Blue/Red) | `id` (SERIAL) | Standalone |
| **`nursing_tasks`** | Inpatient nursing medication passes and vitals | `id` (TEXT) | References `patients(id)` |

---

## 🚀 How to Apply Migrations or Reset the Database

1. Open your **[Supabase SQL Editor](https://supabase.com/dashboard/project/nsqyldvgzsxggnlprwhp/sql)**.
2. Open or copy **`combined_setup.sql`**.
3. Paste into the SQL editor and click **Run** (Ctrl + Enter).

The script safely performs a cascading drop of older conflict tables, creates all tables with compatible alphanumeric keys, applies permissive Row Level Security (RLS) policies, enables WebSocket Realtime replication, and seeds the initial dataset.
