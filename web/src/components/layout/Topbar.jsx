import { useNavigate, Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import NotificationPopover from '../notifications/NotificationPopover.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';

export default function Topbar({ onOpenCommand, onOpenMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const clinic = useClinicProfile();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">
      {/* Mobile Hamburger Menu Toggle */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onOpenMenu}
        aria-label="Open clinical navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Global Command Center Trigger */}
      <div
        className="global-search"
        onClick={onOpenCommand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenCommand();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open Command Center (Press Command K)"
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-pill)',
          padding: '7px 14px',
          width: '100%',
          maxWidth: 440,
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.15s ease',
        }}
      >
        <Icon name="search" style={{ color: 'var(--c-primary)', flexShrink: 0 }} />
        <span
          style={{
            fontSize: 13,
            color: 'var(--c-text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            userSelect: 'none',
          }}
        >
          {user?.role === 'Super Admin'
            ? <>Search registered clinics, subscriptions, or press <kbd className="kbd-inline">⌘K</kbd>…</>
            : user?.role === 'Patient'
            ? <>Search prescriptions, lab results, tokens, or press <kbd className="kbd-inline">⌘K</kbd>…</>
            : <>Search patients, MRN, orders, or press <kbd className="kbd-inline">⌘K</kbd>…</>}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--c-text-faint)',
            background: 'var(--c-surface-hover)',
            border: '1px solid var(--c-border)',
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        >
          ⌘K
        </span>
      </div>

      <div className="topbar-right">
        {/* Active Clinic / Platform Owner Badge */}
        {user?.role === 'Super Admin' ? (
          <span
            className="badge badge-purple"
            style={{
              padding: '5px 10px',
              fontSize: 11.5,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '0.02em',
            }}
          >
            <span>👑</span>
            <span>Super Admin Only</span>
          </span>
        ) : (
          <Link
            to="/settings"
            className="btn btn-ghost btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              maxWidth: 190,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface)',
            }}
            title={`Active Facility: ${clinic?.name || 'Clinic'}. Click to configure.`}
          >
            <span>🏢</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {clinic?.name?.split(' ')[0] || 'Clinic'}
            </span>
          </Link>
        )}

        {/* Waiting Lounge TV Display Launch Button (Not applicable to SaaS Super Admin) */}
        {user?.role !== 'Super Admin' && (
          <Link
            to="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12 }}
            title="Open Public Waiting Room TV Display in full-screen window"
          >
            <span>📺</span>
            <span>Lobby TV</span>
          </Link>
        )}

        {/* Night Shift / Dark Theme Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Night Shift (Dark Mode)' : 'Switch to Day Shift (Light Mode)'}
          aria-label={theme === 'light' ? 'Switch to Night Shift (Dark Mode)' : 'Switch to Day Shift (Light Mode)'}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>

        {/* Notifications & 2-Hour Reminders */}
        <NotificationPopover />

        {/* User Account Chip */}
        <div
          className="user-chip"
          onClick={handleLogout}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogout();
            }
          }}
          title="Click to log out"
          aria-label={`User profile for ${user?.name || 'User'} (${user?.role || 'Staff'}). Click to log out.`}
          role="button"
          tabIndex={0}
        >
          <Avatar name={user?.name || ''} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--c-text)' }}>{user?.name}</div>
            <div className="hint" style={{ fontSize: 11 }}>{user?.role}</div>
          </div>
          <Icon name="chevDown" />
        </div>
      </div>
    </header>
  );
}
