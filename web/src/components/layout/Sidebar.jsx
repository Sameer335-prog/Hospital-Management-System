import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { visibleRoutes } from '../../legacy/legacyEngine.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { useSubscription } from '../../utils/subscriptionConfig.js';
import { getSpecialtyConfig } from '../../utils/specialtyConfig.js';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const clinic = useClinicProfile();
  const specialty = getSpecialtyConfig(clinic);
  const { plan, isTrial, daysLeftInTrial, isExpired } = useSubscription();
  const rawGroups = visibleRoutes(user?.role);

  // Filter out specialty-disabled routes (e.g. Wards/Beds for Dental Clinics)
  const disabledRoutes = specialty?.disabledRoutes || [];
  const customNavLabels = specialty?.customNavLabels || {};

  const groups = rawGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !disabledRoutes.includes(item.id)),
    }))
    .filter((g) => g.items.length > 0);

  const logoText = clinic.name
    ? clinic.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'M+';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="logo" aria-hidden="true">
          {user?.role === 'Super Admin' ? (
            '⚡'
          ) : clinic.logoImage ? (
            <img src={clinic.logoImage} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
          ) : clinic.logoIcon ? (
            <span>{clinic.logoIcon}</span>
          ) : (
            logoText
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.role === 'Super Admin' ? 'Medora SaaS Cloud' : (clinic.name || 'Medora HMS')}
          </div>
          <div className="sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.role === 'Super Admin' ? 'Super Admin Console' : (clinic.tagline || 'Hospital OS · v2.0')}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 8 }}>
            {group.group && <div className="nav-group-label">{group.group}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon name={iconKeyFor(item.id)} />
                <span className="label" style={{ flex: 1 }}>
                  {customNavLabels[item.id] || item.label}
                </span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* SaaS Subscription & Plan Badge */}
      {user?.role === 'Super Admin' ? (
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.14) 0%, rgba(15, 23, 42, 0.5) 100%)',
              border: '1px solid rgba(147, 51, 234, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                👑 Platform Owner
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>
                Online
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Multi-Tenant Cloud Control
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <NavLink
            to="/subscription"
            style={{
              display: 'block',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ {plan.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isExpired ? '#ef4444' : isTrial ? '#f59e0b' : '#10b981',
                }}
              >
                {isExpired ? 'Expired' : isTrial ? `${daysLeftInTrial}d Trial` : 'Active'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Plan & Seats</span>
              <span>→</span>
            </div>
          </NavLink>
        </div>
      )}

      <div className="sidebar-foot">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '4px 6px' }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={user?.name || 'User'} />
            <span
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--c-success)',
                border: '2px solid #070e1a',
                boxShadow: '0 0 6px var(--c-success)',
              }}
              title="Online"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ width: '100%', cursor: 'pointer', justifyContent: 'flex-start', color: '#94a3b8' }}
        >
          <Icon name="logout" />
          <span className="label">Log out</span>
        </button>
      </div>
    </aside>
  );
}

function iconKeyFor(routeId) {
  const map = {
    dashboard: 'dash', patients: 'patients', appointments: 'calendar', nursing: 'nurse',
    admissions: 'bed', laboratory: 'lab', pharmacy: 'pharmacy', billing: 'billing',
    staff: 'staff', reports: 'reports', automation: 'automation', settings: 'settings',
    consultation: 'stetho', prescriptions: 'rx', portal: 'patients',
    'super-admin': 'patients', subscription: 'billing',
  };
  return map[routeId] || 'dash';
}
