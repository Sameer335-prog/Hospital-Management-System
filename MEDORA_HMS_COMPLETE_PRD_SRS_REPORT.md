# MEDORA HMS 2.0 — Comprehensive Product Requirements Document (PRD), Software Requirements Specification (SRS) & Architecture Report

> **Document Type:** Master Product Requirements Document (PRD) & Software Requirements Specification (SRS)  
> **System Name:** Medora HMS 2.0 (Hospital Operating System & Multi-Tenant Clinic Cloud)  
> **Target Market:** Pakistan & Emerging Markets (Private Clinics, Polyclinics, Diagnostic Centers, Maternity Homes, Secondary & Tertiary Hospitals)  
> **Author & Tech Lead:** Senior Full-Stack Healthcare Architect & CRM Lead  
> **Version:** 2.5.0-Enterprise  
> **Release Date:** September 2026  
> **Git Repository:** [Sameer335-prog/Hospital-Management-System](https://github.com/Sameer335-prog/Hospital-Management-System.git)  

---

## 📑 Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Market Analysis & Problem Statement (Pakistani Healthcare Context)](#2-market-analysis--problem-statement-pakistani-healthcare-context)
3. [Commercial SaaS Model & Monetization Strategy](#3-commercial-saas-model--monetization-strategy)
4. [User Personas & Role-Based Access Control (RBAC)](#4-user-personas--role-based-access-control-rbac)
5. [Complete Functional Requirements (Module-by-Module SRS & PRD)](#5-complete-functional-requirements-module-by-module-srs--prd)
   - 5.1 Multi-Tenant White-Labeling & Clinic Governance Engine
   - 5.2 Super Admin Platform Management & Privacy Shield
   - 5.3 Outpatient Department (OPD) & Smart Queue Routing
   - 5.4 Master Patient Index (MPI) & Electronic Health Records (EHR)
   - 5.5 Clinical Consultation Desk, Allergy Guard & Urdu Prescriptions (Rx)
   - 5.6 24/7 Central Pharmacy Formulary & Inventory Control
   - 5.7 Pathology & Diagnostic Laboratory Information System (LIS)
   - 5.8 Inpatient Bed Telemetry & Ward Management
   - 5.9 Revenue Cycle, Itemized Billing & Counter POS
   - 5.10 Self-Service Patient Portal & WhatsApp Ecosystem
   - 5.11 Medora AI Copilot (Hands-Free Voice Call & Chat Engine)
6. [External Communication & Local Payment Gateways](#6-external-communication--local-payment-gateways)
7. [System Architecture & Technology Stack](#7-system-architecture--technology-stack)
8. [Data Models & Database Schema (PostgreSQL / Supabase)](#8-data-models--database-schema-postgresql--supabase)
9. [Non-Functional Requirements (NFRs)](#9-non-functional-requirements-nfrs)
10. [Compliance, Legal & Healthcare Commission Standards](#10-compliance-legal--healthcare-commission-standards)
11. [Prompting Guide for Generating Sub-Reports with LLMs / GPT](#11-prompting-guide-for-generating-sub-reports-with-llms--gpt)

---

## 1. Executive Summary & Product Vision

**Medora HMS 2.0** is an enterprise-grade, multi-tenant Cloud Hospital Management System (HMS), Electronic Health Record (EHR), and Clinical CRM platform. It is engineered from the ground up to digitize, unify, and streamline the operational, clinical, and financial lifecycle of modern healthcare facilities—from solo private consultant clinics and polyclinics to 200+ bed tertiary hospitals.

### Product Mission
To eliminate paper-based clinical clutter, stop revenue leakage, end chaotic waiting room crowds, and prevent medication errors in developing healthcare ecosystems by providing an affordable, blazingly fast, multi-tenant SaaS operating system with localized Pakistani payment workflows, WhatsApp patient engagement, and voice-assisted AI automation.

### Core Value Propositions
* **Multi-Tenant SaaS Architecture:** One unified software engine powers hundreds of independent clinics and hospitals with strict data sandboxing, custom whitelabeling (clinic branding, thermal headers, NTN), and automated tier upgrades.
* **Clinical Safety Shield:** Built-in intelligent drug-allergy contraindication checks that immediately catch potentially fatal drug conflicts and suggest safe alternative medications.
* **Pakistani Market Localization:** 1-click Urdu dosage presets (`صبح شام کھانے کے بعد`), PMDC/PMC compliance, National CNIC tracking, and local payment integration (JazzCash, EasyPaisa, Raast Instant Pay).
* **Zero-Hardware Omnichannel Alerts:** Automated WhatsApp Rx slips, SMS appointment confirmations, 2-hour pre-visit notifications, and ESC/POS thermal printing (58mm/80mm) without proprietary hardware locks.
* **Embedded AI Voice Copilot:** Real-time Web Speech API voice assistant that answers patient queries, checks doctor rosters, and books appointments autonomously.

---

## 2. Market Analysis & Problem Statement (Pakistani Healthcare Context)

### The Existing Dilemma in Pakistan
1. **Paper Slips & Lost Histories:** Over 85% of private clinics in cities like Lahore, Karachi, Rawalpindi, Islamabad, and Faisalabad rely on handwritten paper prescription slips. Patients lose prior medical records, leading to dangerous polypharmacy and diagnostic redundancy.
2. **Waiting Room Chaos & No-Shows:** Reception desks issue manual paper tokens or verbal calls. Overcrowded waiting halls cause patient dissatisfaction, while no-shows exceed 25% due to a lack of automated appointment reminders.
3. **Severe Revenue Leakage:** Standalone pharmacies and pathology labs operate in silos. Medicines are dispensed and lab tests are completed without being billed at the central cash counter, leading to a 10% to 18% loss in clinic gross revenues.
4. **Prescription Misinterpretations:** Patients frequently misinterpret handwritten Latin medical abbreviations (`1 tab TDS PC`), leading to inappropriate dosing. Clinic staff are bombarded with telephone calls asking *"Doctor sahab dawai kab khani hai?"*.
5. **Costly & Outdated Legacy Software:** Available legacy desktop systems (often built on cracked FoxPro or VB.NET) cost upwards of Rs. 300,000 upfront, lack cloud backups, provide zero mobile accessibility, and break whenever Windows updates.

### Medora HMS Competitive Advantage
Medora HMS enters this gap as a modern, web-native, offline-resilient SaaS platform priced at an accessible monthly subscription starting at Rs. 4,500/month, allowing any clinic to become fully digital in under 5 minutes.

---

## 3. Commercial SaaS Model & Monetization Strategy

Medora HMS employs a predictable, recurring B2B SaaS subscription model tiered according to facility size, active doctor seats, and bed capacity:

| Plan Tier | Monthly Price (PKR) | Target Segment | Doctor Seats | Inpatient Beds | Key Features Included |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter** | **Rs. 4,500 / mo** | Solo Doctor & Private Clinics | Up to 2 Doctors | OPD Only (0 Beds) | Digital Token Queue, Electronic Rx, WhatsApp Prescriptions, Thermal Slips, Patient History |
| **Growth** | **Rs. 9,500 / mo** | Polyclinics & Family Care Centers | Up to 8 Doctors | 10 Daycare Beds | All Starter + Central Pharmacy Formulary, Lab Requisitions, 2-Hour Pre-Appointment SMS Alerts |
| **Hospital** | **Rs. 18,500 / mo** | Maternity Homes & Surgical Hospitals | Up to 25 Doctors | Up to 50 Beds | All Growth + Inpatient Bed Telemetry, Nurse MAR Vitals Charting, Multi-Department Billing, Staff Shifts |
| **Enterprise** | **Rs. 35,000 / mo** | Tertiary Healthcare Networks | Unlimited | Unlimited Beds | All Hospital + AI Voice Copilot, Custom Domain Whitelabeling, Dedicated Database Instance, 24/7 SLA |

### Localized Payment Gateways Supported
* **JazzCash Business Till:** Instant merchant till payments (`Till # 00291482`) with direct USSD string (`*786#`) instructions.
* **EasyPaisa Merchant Wallet:** Direct mobile wallet QR code and account transfer (`0345-9876543`).
* **Raast Instant Pay / Meezan Bank:** State Bank of Pakistan’s 0% fee Raast instant inter-bank settlement (`PK82MEZN0001040105892188`).
* **PayPak & Local 1Link Cards:** Automated checkout for debit cards issued by Pakistani commercial banks.

---

## 4. User Personas & Role-Based Access Control (RBAC)

Medora HMS enforces strict Role-Based Access Control with 7 distinct authenticated personas:

```
                          ┌─────────────────────────┐
                          │   SaaS Platform Owner   │
                          │      (Super Admin)      │
                          └────────────┬────────────┘
                                       │ (Tenant Governance & Telemetry Only)
     ┌─────────────────────────────────┴─────────────────────────────────┐
     │                     CLINIC TENANT ENVIRONMENT                     │
     │                                                                   │
┌────┴────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌───┴─────────────┐
│  Hospital Admin │    │ Medical Doctor  │    │  Inpatient RN   │    │ Reception / Cash│
│  (Operational)  │    │  (Consultant)   │    │  (Staff Nurse)  │    │   (Front Desk)  │
└────┬────────────┘    └────┬────────────┘    └────┬────────────┘    └───┬─────────────┘
     │                      │                      │                     │
     │                 ┌────┴────────────┐    ┌────┴────────────┐        │
     │                 │   Pharmacist    │    │ Lab Pathologist │        │
     │                 │   (Dispensary)  │    │  (Diagnostics)  │        │
     │                 └─────────────────┘    └─────────────────┘        │
     │                                                                   │
     └─────────────────────────┬─────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    Self-Service     │
                    │   Patient Portal    │
                    └─────────────────────┘
```

1. **Super Admin (SaaS Platform Owner):** Manages clinic subscriptions, MRR revenue metrics, license activations, and system health. *Strictly blocked from inspecting patient health charts to protect medical privacy.*
2. **Hospital / Clinic Administrator:** Configures clinic branding, adds doctor rosters, manages user accounts, monitors overall facility revenue, bed occupancy, and departmental KPIs.
3. **Doctor / Consultant:** Views waiting queue, conducts clinical examinations, checks drug allergy conflicts, selects Urdu dosage presets, issues digital prescriptions, orders lab tests, and schedules follow-ups.
4. **Staff Nurse:** Conducts inpatient triage, charts vitals (BP, Pulse, Temp, SpO2, Resp Rate, Weight), updates Medication Administration Records (MAR), and logs shift handover summaries.
5. **Receptionist / Front Desk Officer:** Registers incoming patients (MPI), issues sequential queue tokens (`TK-01`), verifies doctor availability, checks in arriving patients, and prints thermal token slips.
6. **Pharmacist / Dispensary Manager:** Fulfills e-prescriptions, logs shelf stock additions/deductions, monitors batch expiry dates, and alerts prescribers on low inventory.
7. **Laboratory Technician / Pathologist:** Accessions diagnostic specimens, inputs test findings against biological reference intervals, flags critical anomalies, and releases verified reports.
8. **Patient (Portal User):** Accesses digital queue tokens, downloads laboratory PDF reports, reviews prescribed medicines, and requests appointments.

---

## 5. Complete Functional Requirements (Module-by-Module SRS & PRD)

### 5.1 Multi-Tenant White-Labeling & Clinic Governance Engine
* **Dynamic Clinic Profiles:** Each subscribing clinic can customize its legal clinic name, tagline, doctor-in-charge, phone numbers, emergency hotline, street address, official email, and NTN tax registration.
* **Dynamic Document Letterheads:** Clinical prescriptions, thermal token slips, lab reports, and billing receipts dynamically print the active tenant clinic's branding.
* **Thermal Paper Adaptation:** Configurable printer standard supporting both `80mm` standard thermal receipts and `58mm` compact till roll widths.
* **Custom Receipts:** Customizable header and footer legal disclaimers (e.g., *"Valid for today only. Retain for token call announcement."*).

### 5.2 Super Admin Platform Management & Privacy Shield
* **Tenant Directory:** Comprehensive table of all registered healthcare facilities across Pakistan showing clinic name, doctor in charge, city, current plan, status (`active`, `trialing`, `suspended`), and MRR.
* **Financial Telemetry:** Live calculation of Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), and plan distribution charts.
* **One-Click Plan Upgrades / Overrides:** Instant tier upgrading (`Starter` → `Enterprise`) with license key activation.
* **Clinical EHR Privacy Shield:** Architectural firewall preventing platform super administrators from querying individual patient charts, medical notes, or lab results.

### 5.3 Outpatient Department (OPD) & Smart Queue Routing
* **Sequential Queue Tokens:** Generates structured token IDs (`TK-01`, `TK-02`, etc.) tied to specific doctor clinics, consulting rooms, and visit dates.
* **Live Waiting Lounge Display Board (`/display`):** Fullscreen TV display interface showing currently called tokens (`Serving Now`), upcoming waiting tokens, doctor names, and consultation chambers. Includes audio chimes for token calls.
* **Dynamic Wait Time Estimation:** Automatically calculates wait times based on preceding patients in queue and average doctor consultation duration (e.g., 15 minutes/patient).
* **Automated 2-Hour Pre-Appointment Reminders:** Dispatches automated simulated SMS and in-app alerts to both patient and doctor 2 hours prior to the scheduled consultation.
* **Thermal Token Slip Printing:** Direct thermal receipt generation including clinic name, token number, doctor name, room number, date/time, and QR code for live mobile tracking.

### 5.4 Master Patient Index (MPI) & Electronic Health Records (EHR)
* **Demographic Registry:** Captures full patient name, Pakistani Computerized National Identity Card (CNIC `XXXXX-XXXXXXX-X`), Date of Birth, Age, Biological Sex, Phone Number, Blood Group (`A+`, `O+`, `B+`, `AB+`, `A-`, `O-`, `B-`, `AB-`), and Home Address.
* **Allergy Flagging:** Prominently tracks documented drug and environmental allergies (e.g., Penicillin, NSAIDs, Sulfa, Cephalosporins, Aspirin) across all screens with color-coded safety badges.
* **Longitudinal Patient Chart:** Historical audit timeline containing previous visits, previous prescriptions, historical vitals charts, lab reports, and admission records under a unique Patient ID (`PT-XXXXX`).

### 5.5 Clinical Consultation Desk, Allergy Guard & Urdu Prescriptions (Rx)
* **Structured Clinical Examination:** Standardized clinical fields for Chief Complaints, General Physical Examination, Clinical Notes, and Vitals Capture (BP, Temp, Pulse, SpO2, Respiratory Rate, Body Weight).
* **Intelligent Drug Allergy Contraindication Guard:**
  * Real-time matching against active prescription entries.
  * Detects cross-class contraindications (e.g., prescribing *Augmentin* to a *Penicillin-allergic* patient, or *Brufen/Voltral* to an *NSAID-allergic* patient).
  * Blocks prescription completion until resolved and provides a 1-click **"Substitute with Safe Alternative"** button (e.g., recommending *Azithromycin* or *Panadol*).
* **1-Click Pakistani Urdu Dosage Instructions (ہدایات برائے خوراک):**
  * Quick-select buttons for local patient understanding:
    * `☀️ صبح شام کھانے کے بعد` *(Twice daily after meals)*
    * `🕒 دن میں 3 بار کھانے کے بعد` *(3 times daily after meals)*
    * `🌙 رات کو سوتے وقت` *(1 tablet at bedtime)*
    * `💧 نہار منہ ناشتے سے 30 منٹ پہلے` *(Before breakfast)*
    * `⚡ ضرورت کے وقت (درد/بخار)` *(SOS - pain/fever)*
    * `🥄 ایک چمچ دن میں تین بار` *(1 tsp TDS)*
* **Official A4 Prescription Slip Generator:** Official printable prescription sheet featuring clinic letterhead, doctor PMDC registration number, qualifications (`MBBS, FCPS`), patient details, diagnosis tags, Rx table, lab requisitions, follow-up date, and digital verification QR code.
* **Direct WhatsApp Prescription Dispatch:** One-click dispatch of the complete digital prescription text directly to the patient's WhatsApp mobile number.

### 5.6 24/7 Central Pharmacy Formulary & Inventory Control
* **Formulary Management:** Drug catalog with brand name, generic formula, strength, dosage form (Tablet, Syrup, Injection, Capsule, Drops), retail unit price, and cost price.
* **Dynamic Stock Level Visualizer:** Real-time stock status tags (`In Stock`, `Low Stock`, `Out of Stock`) with progress bars.
* **Stock Movement Auditing Modal:**
  * `🟢 Receive Stock (+ Add)`: Logs incoming vendor shipments.
  * `🔴 Deduct Stock (- Subtract)`: Logs damaged, expired, or write-off stock.
  * `🔵 Exact Shelf Count (= Set)`: Physical shelf reconciliation.
* **Batch & Expiry Surveillance:** Dedicated 60-day expiry watchlist flagging batches nearing expiration to prevent dispensing compromised drugs.

### 5.7 Pathology & Diagnostic Laboratory Information System (LIS)
* **Diagnostic Requisitions:** Doctors order diagnostic investigations (CBC, Lipid Profile, LFT, RFT, HbA1c, Urine R/E, Dengue Serology) directly from consultation.
* **Accessioning & Specimen Workflow:** Status lifecycle: `Ordered` → `Sample Collected` → `Processing` → `Completed`.
* **Pathological Result Entry:** Parameter-level result charting against biological reference ranges (e.g., Hemoglobin 13.5-17.5 g/dL) with automated `HIGH` / `LOW` / `NORMAL` visual flags.
* **Verified Diagnostic Reports:** Pathologist verification and electronic release with QR-encoded patient portal verification link.

### 5.8 Inpatient Bed Telemetry & Ward Management
* **Interactive Floor Grid:** Telemetry visualizer covering General Wards, Semi-Private Rooms, and Intensive Care Units (ICU).
* **Bed Occupancy Lifecycle:** Tracks 4 physical states: `Available` (Green), `Occupied` (Red), `Cleaning / Sanitizing` (Yellow), and `Maintenance` (Grey).
* **Admission Workflow:** Direct admission from Emergency (ER) or OPD with admitting diagnosis, attending physician, and automated daily bed tariff accrual.
* **Nursing MAR & Vitals:** Inpatient bedside telemetry logging patient blood pressure, heart rate, oxygen saturation, temperature, IV fluid rates, and nursing shift handovers.

### 5.9 Revenue Cycle, Itemized Billing & Counter POS
* **Consolidated Point-of-Sale Invoicing:** Real-time aggregation of OPD consultation fees, diagnostic lab investigations, dispensed pharmacy medications, and daily inpatient bed charges onto a single invoice.
* **Pakistani Tax & FBR Alignment:** Configurable sales tax / PRA / SRB percentage calculation and itemized discount approvals.
* **Multi-Mode Payment Settlement:** Counter payments processed via Cash, JazzCash Business Till, EasyPaisa Merchant, Raast Instant Pay, and Debit/Credit Cards.
* **Dual-Format Printing:** Instant thermal receipt slip generation (80mm/58mm) for walk-in patients alongside formal A4 hospital invoices for corporate insurance claims.

### 5.10 Self-Service Patient Portal & WhatsApp Ecosystem
* **Live Token Radar:** Patients monitor their current token position and estimated waiting time in real time on their mobile browser without installing an app.
* **Prescription Archive:** Permanent digital access to past prescriptions and instructions.
* **Instant Diagnostic Reports:** Download verified laboratory pathology reports in PDF format.
* **WhatsApp Dispatch Engine:** Pre-formatted visit summary and token slips sent directly to the patient's phone with a single click.

### 5.11 Medora AI Copilot (Hands-Free Voice Call & Chat Engine)
* **Real-Time Web Speech API Integration:** Speech-to-Text (STT) and Text-to-Speech (TTS) engine enabling voice phone conversations with the hospital system.
* **Doctor Roster Intelligence:** Answers spoken questions like *"When is Dr. Sarah Khan available?"* or *"Who is the cardiologist on duty?"*.
* **Autonomous Appointment Booking:** Parses natural spoken intent (e.g., *"Book an appointment with Dr. Bilal at 11 AM"*) and automatically schedules the consultation and allocates a queue token.
* **Hospital Navigation Copilot:** Explains hospital services, ICU bed availability, ER location, and laboratory procedures.

---

## 6. External Communication & Local Payment Gateways

### 6.1 WhatsApp Web & Native Mobile Dispatch Engine
Medora HMS implements a zero-cost, high-reliability messaging gateway that avoids expensive proprietary SMS aggregators by leveraging WhatsApp's universal web protocol (`wa.me` deep-linking):
* **Phone Normalization:** Converts Pakistani phone inputs (e.g., `03001234567`, `0300-1234567`, `+92 300 1234567`) into clean E.164 digits (`923001234567`).
* **Instant Cross-Platform Launch:** Seamlessly triggers WhatsApp Desktop on Windows/Mac or native WhatsApp Mobile on iOS/Android with pre-filled message text.
* **SMS Fallback:** If WhatsApp is unavailable, triggers native device SMS protocols (`sms:+923001234567?body=...`).

### 6.2 Pakistani Local Payment QR Engine
* Integrates dynamic SVG QR code generation using high-contrast QR matrix algorithms.
* Renders scannable Raast IBAN payment codes, JazzCash Till barcodes, and EasyPaisa merchant QR codes directly on the screen and billing slips for immediate cashier counter reconciliation.

---

## 7. System Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / PRESENTATION                         │
│  React 19 (Hooks, Suspense) · Vite 8 · Vanilla Modern CSS Token Engine  │
│  Web Speech API (STT/TTS) · Responsive PWA Viewport (Mobile & Desktop) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ RESTful JSON / HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND MICROSERVICE                          │
│  Node.js (v20+ LTS) · Express · CORS Multi-Tenant Header Extraction     │
│  Tenant Sandboxing (x-clinic-id) · Super Admin Governance Shield       │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     (Primary Cloud Storage)               (Offline-First Fallback)
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│     SUPABASE (POSTGRESQL 15+)        │  │       IN-MEMORY CACHING       │
│  Row Level Security (RLS) Policies   │  │   Partitioned Multi-Tenant    │
│  JSONB Field Storage · ACID Compliant│  │   Memory Engine (Zero-Downtime)│
└──────────────────────────────────────┘  └───────────────────────────────┘
```

### Technology Specification Table

| Layer | Technology Selected | Rationale & Architectural Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 & Vite 8** | Near-instant hot module reloading (HMR), sub-1.8s production builds, and reactive state synchronization across tabs. |
| **Styling & Design System** | **Vanilla CSS (Design Tokens)** | Zero bloated CSS frameworks (Tailwind/Bootstrap removed). Uses CSS custom variables (`--c-primary`, `--radius-md`), sleek dark/light mode, and custom glassmorphism. |
| **Backend Runtime** | **Node.js Express** | Lightweight, event-driven I/O ideal for high-concurrency clinic queue updates and RESTful multi-tenant routing. |
| **Primary Cloud Database** | **Supabase (PostgreSQL 15)** | Relational integrity, native JSONB support for clinical vitals, Row Level Security (RLS), and scalable connection pooling. |
| **Multi-Tenant Isolation** | **HTTP Header Sandboxing** | All API requests inspect `x-clinic-id` or `x-tenant-id` to strictly isolate clinic records. |
| **Speech Processing** | **Web Speech API** | Client-side speech synthesis and recognition; zero latency, hands-free operation without external API billing. |
| **Printing Protocol** | **CSS `@media print` & Thermal Hooks** | Native browser print driver integration formatted for 80mm/58mm thermal receipts and A4 letterheads without external print servers. |

---

## 8. Data Models & Database Schema (PostgreSQL / Supabase)

The database schema is partitioned by `clinic_id` with foreign key cascades and Row-Level Security:

```sql
-- 1. SaaS CLINICS / TENANTS DIRECTORY
CREATE TABLE clinics (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    doctor_in_charge VARCHAR(255),
    phone VARCHAR(50),
    hotline VARCHAR(50),
    address TEXT,
    ntn VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'hospital', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'suspended')),
    mrr_pkr INTEGER DEFAULT 4500,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS MASTER INDEX (MPI)
CREATE TABLE patients (
    id VARCHAR(64) PRIMARY KEY,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dob DATE,
    age INTEGER,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(50) NOT NULL,
    cnic VARCHAR(30),
    blood VARCHAR(10),
    allergy TEXT DEFAULT 'None recorded',
    doctor VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Outpatient',
    ward VARCHAR(100),
    bed VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OUTPATIENT APPOINTMENTS & QUEUE TOKENS
CREATE TABLE appointments (
    id VARCHAR(64) PRIMARY KEY,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    token VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    room VARCHAR(100),
    fee INTEGER DEFAULT 2000,
    status VARCHAR(50) DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Checked-in', 'In Consultation', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLINICAL PRESCRIPTIONS (Rx)
CREATE TABLE prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    vitals JSONB DEFAULT '{}',
    chief_complaint TEXT,
    examination TEXT,
    diagnoses TEXT[],
    medicines JSONB DEFAULT '[]',
    lab_orders JSONB DEFAULT '[]',
    follow_up_date VARCHAR(50),
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PHARMACY FORMULARY & INVENTORY
CREATE TABLE pharmacy_inventory (
    id SERIAL PRIMARY KEY,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    generic_formula VARCHAR(255),
    category VARCHAR(100),
    form VARCHAR(50),
    stock_boxes INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 15,
    unit_price_pkr NUMERIC(10, 2) NOT NULL,
    cost_price_pkr NUMERIC(10, 2) NOT NULL,
    batch_no VARCHAR(100),
    expiry_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVOICES & REVENUE POINT OF SALE
CREATE TABLE invoices (
    id VARCHAR(64) PRIMARY KEY,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    items JSONB DEFAULT '[]',
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_pkr NUMERIC(12, 2) DEFAULT 0,
    discount_pkr NUMERIC(12, 2) DEFAULT 0,
    total_pkr NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'JazzCash', 'EasyPaisa', 'Raast', 'Card')),
    status VARCHAR(50) DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Partially Paid', 'Refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Non-Functional Requirements (NFRs)

* **Performance & Speed:** Initial page load under 1.2 seconds on standard 3G/4G mobile broadband. Database query execution under 85ms for queue retrieval.
* **Offline Resilience:** If the cloud database is momentarily unreachable, the application falls back seamlessly to partitioned in-memory and `localStorage` caching so OPD ticket issuing never halts.
* **Security & Encryption:** HTTPS transmission, cryptographic authentication tokens, sanitized input fields guarding against SQL Injection and XSS attacks.
* **Responsiveness & Cross-Browser Compatibility:** 100% responsive across mobile viewports (iPhone, Android phones), tablet triage desks (iPad, Galaxy Tab), and desktop reception counters (Chrome, Firefox, Edge, Safari).
* **High Availability:** 99.9% uptime target suitable for 24/7 hospital emergency facilities.

---

## 10. Compliance, Legal & Healthcare Commission Standards

1. **Punjab Healthcare Commission (PHC) & Sindh Healthcare Commission (SHCC):**
   * Official prescription prints include valid PMDC / PMC registration numbers and authorized physician qualifications.
   * Standardized patient identifiers (MRN) and National Identity Card (CNIC) fields align with legal provincial medical audit standards.
2. **Medical Privacy & Tenant Confidentiality:**
   * SaaS multi-tenant isolation guarantees that Patient Health Information (PHI) is strictly compartmentalized; Clinic A cannot view Clinic B’s clinical charts.
   * Super Administrator platform accounts are architecturally restricted from inspecting individual patient charts.
3. **Federal Board of Revenue (FBR) & Sales Tax Alignment:**
   * Billing receipts provide itemized documentation of consultation, procedural, and medication fees with transparent tax and NTN reporting.

---

## 11. Prompting Guide for Generating Sub-Reports with LLMs / GPT

If you wish to provide this document to ChatGPT or another LLM to generate specialized sub-reports (e.g., an academic software engineering report, an investor pitch deck, or an API swagger specification), use the following ready-to-use prompts:

### Prompt 1: Generate an Academic Software Requirements Specification (IEEE 830 Standard)
> *"Based on the Medora HMS 2.0 master specification provided above, generate a formal, academic IEEE 830-compliant Software Requirements Specification (SRS). Include Section 1 (Introduction), Section 2 (Overall Description with Use Case Diagram descriptions), Section 3 (Specific Functional Requirements with detailed inputs, outputs, preconditions, and postconditions), and Section 4 (Non-Functional Requirements). Ensure professional academic technical phrasing."*

### Prompt 2: Generate an Investor Pitch Deck & Commercial Business Plan
> *"Using the Medora HMS documentation above, generate an 11-slide Investor Pitch Deck and Financial Pro-Forma for the Pakistani healthcare market. Detail the problem, market size (TAM/SAM/SOM of 40,000+ clinics in Pakistan), the 4-tier SaaS pricing model, unit economics, customer acquisition strategy (via medical rep networks and PHC compliance), and 3-year projected ARR in PKR and USD."*

### Prompt 3: Generate an API Architecture & OpenAPI / Swagger Specification
> *"Review the database schema and functional modules of Medora HMS 2.0. Generate a complete RESTful OpenAPI 3.0 specification in YAML format for the `/api/appointments`, `/api/consultation/prescriptions`, and `/api/billing/invoices` endpoints. Include tenant headers (`x-clinic-id`), request body schemas, and response error handling codes."*

### Prompt 4: Generate a Doctor & Receptionist Training Manual
> *"Act as a clinical hospital trainer. Using the Medora HMS specification, write a step-by-step user training guide for: 1) Receptionists issuing tokens and sending WhatsApp slips, and 2) Doctors conducting consultations, checking the allergy guard, and selecting Urdu dosage presets. Make it easy to read with bullet points and practical clinical tips."*

---

**© 2026 Medora HMS Engineering Group · All Rights Reserved.**  
*Official Release Document — Verified & Up-to-Date.*
