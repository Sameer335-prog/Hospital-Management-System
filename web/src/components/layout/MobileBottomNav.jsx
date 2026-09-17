import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function MobileBottomNav({ onOpenMenu }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'dash', path: '/dashboard' },
    { id: 'appointments', label: 'Tokens', icon: 'calendar', path: '/appointments' },
    { id: 'patients', label: 'Patients', icon: 'patients', path: '/patients' },
    { id: 'billing', label: 'Billing', icon: 'billing', path: '/billing' },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Application Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.35)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#38bdf8' : '#94a3b8',
            height: '100%',
            position: 'relative',
            transition: 'all 0.15s ease',
            padding: '4px 0',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '32px',
                    height: '3px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '0 0 3px 3px',
                    boxShadow: '0 2px 8px #38bdf8',
                  }}
                />
              )}
              <div
                style={{
                  transform: isActive ? 'translateY(-1px) scale(1.08)' : 'none',
                  transition: 'transform 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={item.icon} style={{ width: 22, height: 22 }} />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  marginTop: '3px',
                  letterSpacing: '0.2px',
                }}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* Menu / More Trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="mobile-nav-tab"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          height: '100%',
          cursor: 'pointer',
          padding: '4px 0',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 500, marginTop: '3px', letterSpacing: '0.2px' }}>
          Menu
        </span>
      </button>
    </nav>
  );
}
