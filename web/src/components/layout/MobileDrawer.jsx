import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { visibleRoutes } from '../../legacy/legacyEngine.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const clinic = useClinicProfile();
  const groups = visibleRoutes(user?.role);

  const logoText = clinic.name
    ? clinic.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'M+';

  // Prevent background body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  async function handleLogout() {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '84%',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 35px rgba(0, 0, 0, 0.5)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
              }}
            >
              {logoText}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {clinic.name || 'Medora HMS'}
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '1px' }}>
                {clinic.tagline || 'Mobile Clinical OS'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            margin: '12px 14px',
            padding: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Avatar name={user?.name || 'User'} />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Practitioner'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {user?.role || 'Staff'} · Online
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Quick Launch TV Display */}
        <div style={{ padding: '0 14px 8px' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/display');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              color: '#38bdf8',
              fontWeight: '600',
              fontSize: '12.5px',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📺</span>
              <span>Lobby TV Queue Screen</span>
            </span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Launch →</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.group && (
                <div
                  style={{
                    fontSize: '10.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#64748b',
                    fontWeight: '700',
                    marginBottom: '6px',
                    paddingLeft: '8px',
                  }}
                >
                  {group.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={`/${item.id}`}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                      borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <Icon name={iconKeyFor(item.id)} style={{ width: 18, height: 18 }} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Footer with Logout */}
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Icon name="logout" style={{ width: 16, height: 16 }} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function iconKeyFor(routeId) {
  const map = {
    dashboard: 'dash',
    patients: 'patients',
    appointments: 'calendar',
    nursing: 'nurse',
    admissions: 'bed',
    consultation: 'consult',
    pharmacy: 'rx',
    laboratory: 'lab',
    billing: 'billing',
    reports: 'chart',
    staff: 'staff',
    settings: 'cog',
    portal: 'user',
  };
  return map[routeId] || 'dash';
}
