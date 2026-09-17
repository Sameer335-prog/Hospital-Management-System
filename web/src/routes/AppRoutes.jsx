import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LANDING } from '../legacy/legacyEngine.js';

import LoginPage from '../pages/Login/LoginPage.jsx';
import DashboardPage from '../pages/Dashboard/DashboardPage.jsx';
import PatientsPage from '../pages/Patients/PatientsPage.jsx';
import PatientProfilePage from '../pages/PatientProfile/PatientProfilePage.jsx';
import AppointmentsPage from '../pages/Appointments/AppointmentsPage.jsx';
import ConsultationPage from '../pages/Consultation/ConsultationPage.jsx';
import NursingPage from '../pages/Nursing/NursingPage.jsx';
import AdmissionsPage from '../pages/Admissions/AdmissionsPage.jsx';
import PrescriptionsPage from '../pages/Prescriptions/PrescriptionsPage.jsx';
import LaboratoryPage from '../pages/Laboratory/LaboratoryPage.jsx';
import PharmacyPage from '../pages/Pharmacy/PharmacyPage.jsx';
import BillingPage from '../pages/Billing/BillingPage.jsx';
import StaffPage from '../pages/Staff/StaffPage.jsx';
import ReportsPage from '../pages/Reports/ReportsPage.jsx';
import SettingsPage from '../pages/Settings/SettingsPage.jsx';
import PatientPortalPage from '../pages/PatientPortal/PatientPortalPage.jsx';
import LobbyDisplayPage from '../pages/Display/LobbyDisplayPage.jsx';
import SubscriptionPage from '../pages/Subscription/SubscriptionPage.jsx';
import SuperAdminPage from '../pages/SuperAdmin/SuperAdminPage.jsx';

/**
 * Every business route below is wrapped twice:
 *   1. <ProtectedRoute />  — must be authenticated at all (real session, not a UI flag)
 *   2. <RoleRoute />       — the authenticated user's role must be allowed to see this page
 *
 * This mirrors ROLE_ROUTES from the ported legacy engine so page access and
 * sidebar visibility never disagree with each other.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/display" element={<LobbyDisplayPage />} />
      <Route path="/lobby" element={<LobbyDisplayPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute routeId="dashboard" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route element={<RoleRoute routeId="patients" />}>
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientProfilePage />} />
        </Route>

        <Route element={<RoleRoute routeId="appointments" />}>
          <Route path="/appointments" element={<AppointmentsPage />} />
        </Route>

        <Route element={<RoleRoute routeId="consultation" />}>
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/consultation/:patientId" element={<ConsultationPage />} />
        </Route>

        <Route element={<RoleRoute routeId="nursing" />}>
          <Route path="/nursing" element={<NursingPage />} />
        </Route>

        <Route element={<RoleRoute routeId="admissions" />}>
          <Route path="/admissions" element={<AdmissionsPage />} />
        </Route>

        <Route element={<RoleRoute routeId="prescriptions" />}>
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
        </Route>

        <Route element={<RoleRoute routeId="laboratory" />}>
          <Route path="/laboratory" element={<LaboratoryPage />} />
        </Route>

        <Route element={<RoleRoute routeId="pharmacy" />}>
          <Route path="/pharmacy" element={<PharmacyPage />} />
        </Route>

        <Route element={<RoleRoute routeId="billing" />}>
          <Route path="/billing" element={<BillingPage />} />
        </Route>

        <Route element={<RoleRoute routeId="staff" />}>
          <Route path="/staff" element={<StaffPage />} />
        </Route>

        <Route element={<RoleRoute routeId="reports" />}>
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<RoleRoute routeId="settings" />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<RoleRoute routeId="portal" />}>
          <Route path="/portal" element={<PatientPortalPage />} />
        </Route>

        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/super-admin" element={<SuperAdminPage />} />

        <Route path="/" element={<IndexRedirect />} />
      </Route>

      <Route path="*" element={<IndexRedirect />} />
    </Routes>
  );
}

function IndexRedirect() {
  const { user } = useAuth();
  const landing = ROLE_LANDING[user?.role] || 'dashboard';
  return <Navigate to={`/${landing}`} replace />;
}
