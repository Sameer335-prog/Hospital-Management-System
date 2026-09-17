# MEDORA HMS — Master System Specification & Technical Documentation

> **Hospital Operating System & Clinical Enterprise Platform**  
> Built with **React 19**, **Vite 8**, **Vanilla Modern CSS**, **Supabase (PostgreSQL 15)**, and an integrated **Hands-Free AI Voice Call & Chat Assistant**.

---

## 📋 Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Hospital User Personas & Role-Based Access Control (RBAC)](#2-hospital-user-personas--role-based-access-control-rbac)
3. [Core Functional Modules & Workflows](#3-core-functional-modules--workflows)
4. [AI Voice Call & Chat Copilot Engine](#4-ai-voice-call--chat-copilot-engine)
5. [Complete Technology Stack](#5-complete-technology-stack)
6. [System Architecture & Data Flow](#6-system-architecture--data-flow)
7. [Setup, Quick Start & Deployment Guide](#7-setup-quick-start--deployment-guide)
8. [Built-in Demo Test Accounts](#8-built-in-demo-test-accounts)

---

## 1. Executive Summary & Purpose

**Medora HMS** is an enterprise-grade Hospital Management System designed to modernize, centralize, and automate hospital workflows across inpatient and outpatient care. 

The application synchronizes hospital departments—including front desk reception, consultation suites, nursing wards, central dispensary pharmacy, diagnostic laboratories, and hospital finance—into a unified, reactive interface.

### Key Objectives:
* **Eliminate Physical Queue Congestion**: Through digital outpatient token sequencing (`TK-01`, `TK-02`) and dynamic wait time estimation.
* **Paperless Clinical Workflows**: Standardized SOAP notes, ICD-10 coding, and e-Prescribing with automated pharmacy routing.
* **Bed Telemetry & Ward Management**: Real-time occupancy tracking for General Wards, Semi-Private Rooms, and Intensive Care Units (ICU).
* **Inventory Control & Expiry Tracking**: Central pharmacy formulary surveillance with automated stock alerts and batch quarantine.
* **Bilingual AI Voice Assistant**: 24/7 patient voice call copilot capable of checking doctor schedules and booking appointments via speech.

---

## 2. Hospital User Personas & Role-Based Access Control (RBAC)

Medora HMS provides 7 specialized role interfaces secured by client-side route guards and database Row-Level Security (RLS):

| User Persona | Key Responsibilities | Primary Interface |
| :--- | :--- | :--- |
| **Administrator** | Executive command, bed occupancy, hospital revenue reporting, staff provisioning, and system configuration. | `/dashboard` |
| **Doctor / Consultant** | Outpatient clinic queue, clinical SOAP documentation, ICD-10 diagnosis, automated e-prescriptions, and lab test orders. | `/consultation` or `/dashboard` |
| **Nurse** | Bedside inpatient vitals telemetry (BP, Pulse, SpO2, Temp), Medication Administration Records (MAR), and nurse shift handovers. | `/nursing` |
| **Receptionist** | Patient intake (Master Patient Index), daily OPD token queue allocation, doctor availability matrix, and waiting room routing. | `/appointments` |
| **Pharmacist** | Real-time prescription fulfillment queue, formulary stock surveillance, batch expiry tracking, and stock replenishment (+ Add, - Deduct, = Set). | `/pharmacy` |
| **Lab Technician** | Diagnostic test order queue, specimen collection/intake, analyzer result entry, and pathologist report release. | `/laboratory` |
| **Patient** | Self-service portal to view lab reports, download itemized invoices, review prescriptions, and request appointments. | `/portal` |

---

## 3. Core Functional Modules & Workflows

### 3.1 Executive Command Dashboard (`/dashboard`)
* **Real-time Hospital Census**: Displays total admissions, available beds, today’s appointments, and live revenue totals.
* **Department Activity Gauges**: Visual metrics tracking patient velocity across Emergency, OPD, and Inpatient units.

### 3.2 Outpatient Appointment & Token Routing (`/appointments`)
* **Digital Queue Tokening**: Sequential token generation (`TK-xx`) tied to specific doctors and consultation rooms.
* **Waiting Room Engine**: Real-time queue tracker calculating estimated wait times (`waitMin`) and queue progression status (`Waiting` → `In Consultation` → `Completed`).
* **Consultant Schedule Directory**: Real-time view of doctor hours, consultation rooms, and fees.

### 3.3 Master Patient Index & 360° EMR (`/patients` & `/patient/:id`)
* **Longitudinal Medical History**: Central record showing visit logs, documented allergies, chronic conditions, and past lab investigations.
* **Exportable Health Index**: Searchable database supporting CSV data export for hospital records.

### 3.4 Clinical Consultation & Digital e-Prescriptions (`/consultation`)
* Standardized clinical SOAP format (Subjective, Objective, Assessment, Plan).
* Digital prescribing with automated dosage intervals (`OD`, `BD`, `TDS`, `QID`), duration, and meal guidance.
* Instant dispatch to the pharmacy dispensing queue.

### 3.5 Inpatient Bed Management & Ward Telemetry (`/admissions`)
* **Interactive Floor Map**: Visual telemetry covering General Ward, Semi-Private, and ICU beds.
* **Occupancy Lifecycle**: Tracks states (`Occupied`, `Available`, `Cleaning`, `Maintenance`).
* **Admission Flow**: Instant admission from Emergency (ER) with automatic daily bed charge computation.

### 3.6 24/7 Central Pharmacy & Formulary Surveillance (`/pharmacy`)
* **Stock Health Progress Bars**: Color-coded stock levels (`In Stock`, `Low Stock`, `Out of Stock`).
* **Dedicated Stock Update Modal**:
  * 🟢 **Receive Stock (+ Add)**: Incoming vendor shipments.
  * 🔴 **Deduct Stock (- Subtract)**: Damaged, broken, or expired write-offs.
  * 🔵 **Exact Count (= Set)**: Periodic shelf audit reconciliation.
* **Expiry Surveillance**: Watchlist flagging medicines expiring within 60 days.

### 3.7 Pathology & Diagnostic Laboratory (`/laboratory`)
* Specimen collection, barcode accessioning, and multi-analyzer panels (CBC, LFT, RFT, Lipid Profile).
* High/Low critical alert indicators and pathologist verification.

### 3.8 Revenue Cycle & Consolidated Invoicing (`/billing`)
* Single itemized invoice consolidating doctor fees, bed days, laboratory tests, and pharmacy dispensations.
* Thermal receipt printing and official PDF-ready statements.

---

## 4. AI Voice Call & Chat Copilot Engine

Medora HMS features an embedded **Clinical Voice & Chat AI Copilot** accessible from any screen:

### 4.1 Hands-Free Real-Time Voice Call
* **Floating Trigger**: Glowing green **"📞 Voice Call AI"** pill button at the bottom-right corner.
* **Call Modal Overlay**:
  * Dark glassmorphic backdrop (`backdrop-filter: blur(16px)`).
  * Animated pulsing concentric rings and a 9-bar dynamic audio visualizer.
  * Live call timer (`00:15`, `00:30`, etc.).
  * Real-time live subtitle captions transcribing speech in real-time.
* **Hands-Free Conversation Loop**:
  * Greets the user with voice audio when connected.
  * Automatically listens when the user speaks without needing repeated clicks.
  * Processes speech and responds out loud via `SpeechSynthesis`.
  * Resumes listening immediately after speaking finishes.
* **Controls**: Microphone Mute/Unmute, Audio Speaker On/Off, and Red Hangup Button.

### 4.2 Text Chat Assistant
* Clean slide-out chat window with quick prompt chips (*"Book Dr. Sarah"*, *"Doctor Timings"*, *"Hospital Workflow"*, *"Emergency ER"*).
* Built-in voice dictation microphone directly in the input bar.

### 4.3 Clinical Intelligence Capabilities
* **Doctor Availability**: Instantly provides schedules for Dr. Sarah Khan (Cardiology), Dr. Bilal Ahmed (Orthopedics), Dr. Ayesha Raza (Pediatrics), Dr. Imran Malik (General Medicine), and Dr. Hina Farooq (Gynecology).
* **Voice Appointment Booking**: Extracts doctor name, patient name, and time from spoken requests, generates an official token (e.g., `TK-48`), and creates a persistent database appointment record.
* **Hospital Guide**: Answers operational questions regarding triage, emergency admissions, and pharmacy hours in English and Roman Urdu.

---

## 5. Complete Technology Stack

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                      MEDORA HMS                        │
                                  │           Full Technology Stack Breakdown              │
                                  └────────────────────────────────────────────────────────┘
                                                              │
          ┌───────────────────────────┬───────────────────────┼───────────────────────────┬───────────────────────────┐
          ▼                           ▼                       ▼                           ▼                           ▼
    [ FRONTEND LAYER ]        [ BACKEND & DB ]       [ AI & SPEECH ]             [ STYLING & UI ]           [ TOOLING & DEPLOY ]
    • React 19.2              • Supabase Cloud       • Web Speech API (STT)      • Vanilla CSS3 Tokens      • Vite 8.2 (Bundler)
    • React DOM 19.2          • PostgreSQL 15        • SpeechSynthesis (TTS)     • Glassmorphism FX         • Oxlint (Rust Linter)
    • React Router v7.18      • Realtime WebSockets  • Intent Parser Engine      • Responsive Flex/Grid     • Vercel / Netlify / Node
    • Context API State       • Row-Level Security   • Voice Visualizer Bars     • WebAIM WCAG 2.1 AA       • LocalStorage Caching
```

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language** | JavaScript (ES6+ / JSX) | Modern ES | Application logic, components, and service layers |
| **Frontend Framework** | React | `^19.2.8` | Component lifecycle, hooks (`useState`, `useEffect`, etc.) |
| **DOM Renderer** | React DOM | `^19.2.8` | Virtual DOM rendering |
| **Routing** | React Router | `^7.18.3` | Single Page Application (SPA) routing & auth guards |
| **Database** | PostgreSQL | 15.x | Relational database hosted on Supabase Cloud |
| **Backend SDK** | `@supabase/supabase-js` | `^2.116.0` | Client-side database queries, Auth, and WebSockets |
| **Realtime Engine** | Supabase Realtime | `^2.116.0` | WebSocket push notifications for appointments & beds |
| **Speech-to-Text** | Web Speech API | Native | In-browser speech recognition for voice calls |
| **Text-to-Speech** | SpeechSynthesis | Native | Natural audio voice generation for AI answers |
| **Styling** | Modern Vanilla CSS3 | Standard | CSS Custom Properties (Design Tokens), Glassmorphism |
| **Build Tool** | Vite | `^8.2.2` | Lightning-fast development server & production bundler |
| **Code Linter** | Oxlint | `^1.79.0` | High-speed Rust-based JavaScript linter |

---

## 6. System Architecture & Data Flow

```
[ Web Browser Client (React 19) ]
   ├── UI Components & Pages (Appointments, Pharmacy, Beds, EMR)
   ├── AI Voice Call & Chat Assistant (Web Speech STT/TTS)
   └── AuthContext & ThemeContext
            │
            ▼ (HTTPS REST & WebSockets)
[ Supabase Cloud Infrastructure ]
   ├── Supabase Auth (JWT Session Tokens)
   ├── PostgreSQL 15 Database (14 Relational Schemas)
   ├── Postgres Realtime Listeners (Broadcasts bed & appointment updates)
   └── Row Level Security (RLS Policies per User Role)
```

* **Offline-Resilient Architecture**: If the cloud database connection is temporarily interrupted, Medora HMS automatically switches to local memory and `localStorage` caching so medical staff can continue working without disruption.

---

## 7. Setup, Quick Start & Deployment Guide

### 7.1 Prerequisites
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### 7.2 Local Setup
```bash
# 1. Clone repository and navigate to web directory
cd medora-hms-complete-redesign/web

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
The application will launch on **`http://localhost:5173/`**.

### 7.3 Database Setup (Supabase)
1. Log into your [Supabase Console](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Paste and run the script located at `backend/database/combined_setup.sql`.
4. This automatically creates all 14 clinical tables, foreign keys, RLS security policies, and initial demo seed data.

### 7.4 Production Build
```bash
cd web
npm run build
```
Generates a minified, production-ready bundle in `web/dist/`, ready for deployment to **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3/CloudFront**.

---

## 8. Built-in Demo Test Accounts

For demonstration, system testing, and auditing, the following accounts are pre-configured:

| Role | Email | Password | Primary Screen |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@medora.hospital` | `admin123` | Operational Command Dashboard |
| **Doctor** | `s.khan@medora.hospital` | `doctor123` | Clinical Consultation & e-Prescribing |
| **Receptionist** | `reception@medora.hospital` | `reception123` | Outpatient Appointment & Token Queue |
| **Nurse** | `nurse@medora.hospital` | `nurse123` | Inpatient Vitals & Medication Schedule |
| **Pharmacist** | `pharmacy@medora.hospital` | `pharmacy123` | Dispensary Queue & Stock Restock |
| **Lab Technician** | `lab@medora.hospital` | `lab123` | Laboratory Analyzers & Test Reports |
| **Patient** | `patient@medora.hospital` | `patient123` | Patient Portal & Itemized Statements |
