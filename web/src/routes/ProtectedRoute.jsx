import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#5C6E71' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
