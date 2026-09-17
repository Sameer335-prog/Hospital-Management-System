import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_ROUTES, ROLE_LANDING } from '../legacy/legacyEngine.js';

/**
 * @param {string} routeId  the legacy route id this path corresponds to, e.g. 'billing'
 *
 * IMPORTANT: this is a UX convenience (don't show a nav item / page a role
 * shouldn't use), NOT a security boundary — hiding a page is not access
 * control. Once a real backend exists, every API call behind this page must
 * independently re-check the user's permissions server-side.
 */
export default function RoleRoute({ routeId }) {
  const { user } = useAuth();
  const allowed = ROLE_ROUTES[user?.role] || [];

  if (!allowed.includes(routeId)) {
    const fallback = ROLE_LANDING[user?.role] || 'dashboard';
    return <Navigate to={`/${fallback}`} replace />;
  }

  return <Outlet />;
}
