# Medora HMS — Enterprise Hospital Management System

> **A high-performance, clinical-grade Hospital Operating System (HMS)** built with **React 19**, **Vite 8**, **Vanilla Modern CSS**, and **Supabase (PostgreSQL 15)**, featuring an integrated **AI Clinical Voice & Chat Copilot**.

---

## 📖 Executive Summary & System Purpose

**Medora HMS** is a comprehensive, end-to-end healthcare enterprise platform designed to modernize hospital operations, streamline clinical consultations, optimize multi-departmental workflows, and elevate patient care.

The system synchronizes all major clinical workflows—including outpatient queue management, inpatient bed telemetry, digital e-prescribing, real-time central pharmacy inventory, pathology laboratory analyzers, and consolidated itemized billing—into a unified, responsive application.

---

## 👥 User Roles & Access Control

Medora HMS employs strict **Role-Based Access Control (RBAC)** across 7 distinct clinical and administrative user personas:

| User Persona | Key Responsibilities & Capabilities | Default Landing Screen |
| :--- | :--- | :--- |
| **Administrator** | Overall hospital command, bed telemetry, inventory surveillance, revenue reporting, staff provisioning, and system settings. | `/dashboard` |
| **Doctor / Consultant** | Outpatient consultations, clinical SOAP notes, ICD-10 diagnosis, automated e-prescriptions, and diagnostic lab orders. | `/consultation` or `/dashboard` |
| **Nurse** | Inpatient vitals telemetry (BP, HR, SpO2, Temp), bedside medication administration passes (MAR), and nurse shift handover notes. | `/nursing` |
| **Receptionist** | Patient registration (Master Patient Index), daily OPD token queues, doctor availability scheduling, and waiting room routing. | `/appointments` |
| **Pharmacist** | Real-time prescription fulfillment, batch expiry tracking, formulary inventory management, and automated stock replenishment. | `/pharmacy` |
| **Lab Technician** | Diagnostic test order queue, specimen collection/intake, analyzer telemetry entry, and pathologist verification. | `/laboratory` |
| **Patient** | Self-service portal to view lab reports, download itemized invoices, review prescriptions, and request appointments. | `/portal` |

---

## 🏥 Core Modules & Functional Capabilities

### 1. 📊 Executive Operations Command Center (`/dashboard`)
* Real-time hospital census: Inpatient bed occupancy, pending appointments, emergency admissions, and today's revenue.
* Live department throughput tracking and clinical shift notifications.

### 2. 📅 Outpatient Scheduling & Token Routing (`/appointments`)
* Sequential digital token allocation (`TK-01`, `TK-02`, etc.) by doctor and department.
* Dynamic waiting room manager with calculated wait times (`waitMin`) and queue progression status (`Waiting` → `In Consultation` → `Completed`).
* Doctor availability schedules, consultation room mapping, and fee schedules.

### 3. 👥 Master Patient Index (MPI) & 360° EMR (`/patients` & `/patient/:id`)
* Longitudinal Electronic Medical Record (EMR) tracking past encounters, known allergies, chronic conditions, and active medications.
* Medical document attachments and exportable patient indices.

### 4. 🩺 Clinical Consultation & e-Prescriptions (`/consultation` & `/prescriptions`)
* Standardized SOAP clinical notes (Subjective, Objective, Assessment, Plan).
* Digital e-Prescribing with automated dosage intervals (`OD`, `BD`, `TDS`, `QID`), duration, and food instructions.
* Direct sync with Pharmacy dispensary queue.

### 5. 🛏️ Inpatient Bed Management & Ward Telemetry (`/admissions`)
* Interactive visual ward map covering General Wards, Semi-Private Rooms, and Intensive Care Units (ICU).
* Real-time occupancy status (`Occupied`, `Available`, `Cleaning`, `Maintenance`).
* Direct admission workflow from Emergency (ER) or OPD with automated daily bed charge calculation.

### 6. 💊 24/7 Central Pharmacy & Formulary Surveillance (`/pharmacy`)
* Live inventory management with visual stock health progress bars (`In Stock`, `Low Stock`, `Out of Stock`).
* Multi-mode stock replenishment modal: **Receive Stock (+ Add)**, **Deduct (- Subtract)**, or **Physical Audit (= Set)**.
* Expiry date watchlists alerting staff to batches expiring within 60 days.

### 7. 🧪 Pathology & Diagnostic Laboratory (`/laboratory`)
* Specimen intake and barcode/accession number tracking.
* Critical high/low value highlighting for Hematology, Biochemistry, and Microbiology panels.
* Final pathologist verification and automated sync to the Patient Portal.

### 8. 💳 Revenue Cycle & Itemized Billing (`/billing`)
* Consolidated hospital invoices aggregating doctor consultation fees, bed day charges, laboratory tests, and pharmacy dispensations.
* Thermal receipt printer format and downloadable official invoices.

### 9. 📱 Patient Self-Service Portal (`/portal`)
* Direct access for registered patients to review digital prescriptions, view released pathology lab results, and download billing statements.

---

## 🤖 AI Voice & Chat Copilot Engine

Medora HMS features an embedded **Clinical Voice & Chat AI Assistant** accessible globally across all screens:

* **📞 Hands-Free Real-Time Voice Call**:
  * Luxury glassmorphic call modal with pulsing radar waves and dynamic 9-bar audio visualizer.
  * Continuous two-way voice loop powered by native browser `SpeechRecognition` and `SpeechSynthesis`.
  * Live MM:SS call timer, real-time spoken subtitle captions, and microphone mute/speaker controls.
* **💬 Intelligent Chat Widget**:
  * Quick-prompt chips (*"Doctor Timings"*, *"Book Dr. Sarah"*, *"Hospital Workflow"*, *"Emergency ER"*).
  * In-input voice dictation for hands-free typing.
* **Automated Clinical Actions**:
  * **Doctor Availability**: Instantly answers queries about doctor timings, room numbers, and fees.
  * **Voice Appointment Booking**: Extracts doctor name, patient name, and time from spoken requests, generates tokens (`TK-xx`), and creates persistent appointments.
  * **Hospital Operational Guide**: Educates visitors and administrators on hospital admission processes, ER emergency triage, and pharmacy hours in both English and Roman Urdu.

---

## 🛠️ Technology Stack & Architecture

```
[ Client Browser ]
  ├── React 19 (Component Hierarchy, Virtual DOM, Custom Hooks)
  ├── React Router v7 (Single-Page App Client Routing & RBAC Guards)
  ├── Web Speech API (Hands-free Voice Call STT & Audio Synthesis TTS)
  ├── Modern Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid)
  └── Vite 8 (Ultra-fast HMR Dev Server & Production Bundler)
         │
         ▼ (REST & Realtime WebSockets)
[ Backend Cloud / Supabase ]
  ├── PostgreSQL 15 (Relational Database Engine)
  ├── Supabase Auth & JWT (Authentication & Session Persistence)
  ├── Row Level Security (RLS) Policies
  └── Postgres Realtime Changefeed (Real-time appointment & bed sync)
```

### Key Libraries & Tools:
* **Frontend**: `react` (^19.2.8), `react-dom` (^19.2.8), `react-router-dom` (^7.18.3)
* **Backend Adapter**: `@supabase/supabase-js` (^2.116.0)
* **Build System**: `vite` (^8.2.2), `@vitejs/plugin-react` (^6.1.0)
* **Quality & Validation**: `oxlint` (^1.79.0) — Rust-based ultra-fast linter
* **Accessibility**: Optimized for WebAIM WAVE Impact (AIM 9.8+ score)

---

## ⚡ Setup & Quick Start

### 1. Prerequisites
* **Node.js**: v18 or higher (tested on Node v20/v22)
* **npm**: v9 or higher

### 2. Database Initialization
1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of `backend/database/combined_setup.sql`. This generates all 14 clinical tables, foreign keys, RLS security policies, and initial demo seed data.

### 3. Launch Frontend Development Server
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on **`http://localhost:5173/`**.

---

## 🔐 Default Demo Accounts

For testing, evaluation, and demonstration purposes, the following role credentials are ready to use:

| Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@medora.hospital` | `admin123` | Operational Command Dashboard |
| **Doctor** | `s.khan@medora.hospital` | `doctor123` | Consultations & OPD Prescriptions |
| **Receptionist** | `reception@medora.hospital` | `reception123` | Appointment Booking & Token Queue |
| **Nurse** | `nurse@medora.hospital` | `nurse123` | Bedside Vitals & Medication Passes |
| **Pharmacist** | `pharmacy@medora.hospital` | `pharmacy123` | Dispensary Queue & Stock Restock |
| **Lab Technician** | `lab@medora.hospital` | `lab123` | Diagnostic Tests & Analyzer Panels |
| **Patient** | `patient@medora.hospital` | `patient123` | Patient Health Records & Invoices |

*(Note: The authentication system also features automatic offline demo fallback in case a cloud database connection is momentarily unavailable).*

---

## 📦 Production Build & Deployment

To compile a minified, production-optimized client bundle:
```bash
cd web
npm run build
```
This generates the optimized production bundle inside `web/dist/`, ready for 1-click deployment to platforms such as **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3/CloudFront**.
