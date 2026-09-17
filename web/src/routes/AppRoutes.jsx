import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LANDING } from '../legacy/legacyEngine.js';

// Lazy-loaded routes for web and mobile performance
const LoginPage = lazy(() => import('../pages/Login/LoginPage.jsx'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage.jsx'));
const PatientsPage = lazy(() => import('../pages/Patients/PatientsPage.jsx'));
const PatientProfilePage = lazy(() => import('../pages/PatientProfile/PatientProfilePage.jsx'));
const AppointmentsPage = lazy(() => import('../pages/Appointments/AppointmentsPage.jsx'));
const ConsultationPage = lazy(() => import('../pages/Consultation/ConsultationPage.jsx'));
const NursingPage = lazy(() => import('../pages/Nursing/NursingPage.jsx'));
const AdmissionsPage = lazy(() => import('../pages/Admissions/AdmissionsPage.jsx'));
const PrescriptionsPage = lazy(() => import('../pages/Prescriptions/PrescriptionsPage.jsx'));
const LaboratoryPage = lazy(() => import('../pages/Laboratory/LaboratoryPage.jsx'));
const PharmacyPage = lazy(() => import('../pages/Pharmacy/PharmacyPage.jsx'));
const BillingPage = lazy(() => import('../pages/Billing/BillingPage.jsx'));
const StaffPage = lazy(() => import('../pages/Staff/StaffPage.jsx'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage.jsx'));
const PatientPortalPage = lazy(() => import('../pages/PatientPortal/PatientPortalPage.jsx'));
const LobbyDisplayPage = lazy(() => import('../pages/Display/LobbyDisplayPage.jsx'));
const SubscriptionPage = lazy(() => import('../pages/Subscription/SubscriptionPage.jsx'));
const SuperAdminPage = lazy(() => import('../pages/SuperAdmin/SuperAdminPage.jsx'));

function RouteLoadingFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(2, 132, 199, 0.15)',
          borderTopColor: '#0284c7',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <div style={{ fontSize: 13, color: 'var(--c-text-muted)', fontWeight: 600 }}>Loading Medora workspace…</div>
    </div>
  );
}

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
    <Suspense fallback={<RouteLoadingFallback />}>
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

        <Route element={<RoleRoute routeId="super-admin" />}>
          <Route path="/super-admin" element={<SuperAdminPage />} />
        </Route>

        <Route element={<RoleRoute routeId="subscription" />}>
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Route>

        <Route path="/" element={<IndexRedirect />} />
      </Route>

      <Route path="*" element={<IndexRedirect />} />
    </Routes>
    </Suspense>
  );
}

function IndexRedirect() {
  const { user } = useAuth();
  const landing = ROLE_LANDING[user?.role] || 'dashboard';
  return <Navigate to={`/${landing}`} replace />;
}
