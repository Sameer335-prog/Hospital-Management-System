import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { visibleRoutes } from '../../legacy/legacyEngine.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const clinic = useClinicProfile();
  const groups = visibleRoutes(user?.role);

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
        <div className="logo" aria-hidden="true">{logoText}</div>
        <div style={{ overflow: 'hidden' }}>
          <div className="name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {clinic.name || 'Medora HMS'}
          </div>
          <div className="sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {clinic.tagline || 'Hospital OS · v2.0'}
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
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

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
  };
  return map[routeId] || 'dash';
}
