# Medora HMS — Backend & Database Layer

Welcome to the **Medora HMS Backend**. This directory contains the complete database schemas, SQL migrations, seed records, and the Node.js/Express REST API service for Medora Hospital Management System.

---

## 📁 Directory Structure

```
backend/
├── database/                    # SQL Schemas, Migrations & Seed Data
│   ├── combined_setup.sql       # Complete 1-click database initialization
│   ├── schema.sql               # Relational table DDL, foreign keys & RLS policies
│   ├── seed.sql                 # Baseline clinical seed dataset (Doctors, Patients, Beds)
│   └── README.md                # Database documentation & architectural notes
│
├── server.js                    # Node.js + Express API Server
├── package.json                 # Backend dependencies (Express, CORS, Supabase)
├── .env.example                 # Environment configuration template
└── README.md                    # This backend guide
```

---

## 🗄️ Database Schemas (`backend/database/`)

The PostgreSQL database contains 14 clinical and administrative tables:
1. **`appointments`**: Outpatient booking records, token sequencing (`TK-xx`), status, and fees.
2. **`patients`**: Master Patient Index (MPI), allergies, blood group, vitals, and demographics.
3. **`beds`**: Inpatient ward telemetry (General, Semi-Private, ICU), occupancy, and cleaning states.
4. **`medicines`**: Central pharmacy formulary, inventory counts, safety buffer thresholds, and batch tracking.
5. **`consultations`**: Doctor encounter records, standardized SOAP notes, and ICD-10 diagnosis.
6. **`prescriptions`**: Digital e-prescriptions with dosage intervals and food instructions.
7. **`lab_orders`**: Specimen collection, analyzer diagnostic panels, and verification status.
8. **`billing`**: Itemized revenue statements, invoices, payment status, and insurance claims.
9. **`waiting_room`**: Real-time queue tracker with dynamic wait time estimation.
10. **`staff`**: Hospital personnel directory across medical, nursing, and administrative roles.
11. **`vitals`**: Longitudinal bedside vitals monitoring logs (BP, SpO2, Heart Rate, Temperature).
12. **`nurse_notes`**: Bedside nursing progress notes and shift handovers.
13. **`notifications`**: Automated hospital notification queue (SMS/WhatsApp/In-app).
14. **`profiles`**: User auth metadata linked to Supabase authentication UUIDs.

---

## 🚀 Running the Backend Server

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
# Starts Express server with live reload
npm run dev

# Or standard production start
npm start
```

The API will start on **`http://localhost:5000`**.

---

## 📡 Available API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Service health check, status, and database configuration |
| **GET** | `/api/appointments` | Fetch all scheduled outpatient appointments |
| **POST** | `/api/appointments` | Create or update an appointment record |
| **GET** | `/api/pharmacy/medicines` | Retrieve pharmacy formulary inventory & stock |
| **PATCH** | `/api/pharmacy/stock/:id` | Adjust medicine stock on hand and status |
| **GET** | `/api/beds` | Inpatient bed occupancy and ward telemetry |
| **POST** | `/api/automation/trigger` | Trigger background automation workflows |

---

## ☁️ Deployment

The backend can be deployed easily to:
* **Render / Railway / Fly.io**: Connect your Git repository and set the root directory to `backend/`.
* **Heroku**: Direct deploy using the `Procfile` (`web: node server.js`).
* **Docker / Cloud Run**: Can be containerized with a standard Node.js Alpine base image.
