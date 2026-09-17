import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import Avatar from './Avatar.jsx';
import StatusBadge from './StatusBadge.jsx';
import { PATIENTS } from '../../legacy/legacyEngine.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTenantClinics } from '../../utils/subscriptionConfig.js';

const NAVIGATION_ITEMS = [
  { id: 'nav-dash', title: 'Dashboard', section: 'Navigation', icon: 'dash', path: '/dashboard', hint: 'Overview & Hospital Metrics' },
  { id: 'nav-patients', title: 'Patients Directory', section: 'Navigation', icon: 'patients', path: '/patients', hint: 'Registered EHR Charts' },
  { id: 'nav-appointments', title: 'Appointments & Schedule', section: 'Navigation', icon: 'calendar', path: '/appointments', hint: 'OPD clinic queues' },
  { id: 'nav-consultation', title: 'Consultation & OPD', section: 'Navigation', icon: 'stetho', path: '/consultation', hint: 'Doctor clinical notes' },
  { id: 'nav-admissions', title: 'Inpatient Admissions & Beds', section: 'Navigation', icon: 'bed', path: '/admissions', hint: 'Ward bed allocations' },
  { id: 'nav-prescriptions', title: 'Electronic Prescriptions', section: 'Navigation', icon: 'rx', path: '/prescriptions', hint: 'Active medication orders' },
  { id: 'nav-lab', title: 'Central Pathology Laboratory', section: 'Navigation', icon: 'lab', path: '/laboratory', hint: 'Diagnostic test orders' },
  { id: 'nav-pharmacy', title: 'Pharmacy & Formulary', section: 'Navigation', icon: 'pharmacy', path: '/pharmacy', hint: 'Stock & dispensation' },
  { id: 'nav-billing', title: 'Billing & Financial Ledger', section: 'Navigation', icon: 'billing', path: '/billing', hint: 'Invoices & payments' },
  { id: 'nav-staff', title: 'Staff & Medical HR', section: 'Navigation', icon: 'staff', path: '/staff', hint: 'Physicians & duty roster' },
  { id: 'nav-reports', title: 'Reports & Audit Logs', section: 'Navigation', icon: 'reports', path: '/reports', hint: 'Hospital intelligence' },
  { id: 'nav-settings', title: 'System Settings', section: 'Navigation', icon: 'settings', path: '/settings', hint: 'Hospital configuration' },
];

const PATIENT_PORTAL_ITEMS = [
  { id: 'pat-token', title: 'Live OPD Token & Queue', section: 'My Health Portal', icon: 'patients', path: '/portal', hint: 'Check active clinic queue token' },
  { id: 'pat-rx', title: 'My Prescriptions (Rx)', section: 'My Health Portal', icon: 'rx', path: '/portal', hint: 'View medications and print Rx' },
  { id: 'pat-lab', title: 'Diagnostic Lab Reports', section: 'My Health Portal', icon: 'lab', path: '/portal', hint: 'Blood chemistry & verified results' },
  { id: 'pat-billing', title: 'Hospital Invoices & Receipts', section: 'My Health Portal', icon: 'billing', path: '/portal', hint: 'Outpatient consultation bills' },
  { id: 'pat-book', title: 'Book Doctor Appointment', section: 'My Health Portal', icon: 'calendar', path: '/portal', hint: 'Schedule new OPD visit' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isPatient = user?.role === 'Patient';
  const isSuperAdmin = user?.role === 'Super Admin';

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Memoized search results
  const allResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Super Admin Sandboxing: strictly show registered clinics & their subscriptions
    if (isSuperAdmin) {
      const saNav = [
        { id: 'sa-clinics', title: 'Registered Clinics Directory', section: 'SaaS Platform', icon: 'patients', path: '/super-admin', hint: 'View and manage all tenant clinics' },
        { id: 'sa-subscriptions', title: 'Clinic Subscriptions & MRR', section: 'SaaS Platform', icon: 'billing', path: '/subscription', hint: 'Tier plans, renewals, and revenue telemetry' },
      ];

      const navMatches = saNav.filter(
        (item) => item.title.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
      ).map((item) => ({
        ...item,
        type: 'nav',
        action: () => navigate(item.path),
      }));

      const clinics = getTenantClinics();
      const clinicMatches = clinics.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.doctorInCharge.toLowerCase().includes(q)
      ).slice(0, 6).map((c) => ({
        id: `tenant-${c.id}`,
        title: c.name,
        subtitle: `${c.city} · In Charge: ${c.doctorInCharge} · Plan: ${c.plan.toUpperCase()} (${c.status})`,
        section: 'Registered Clinics',
        type: 'clinic',
        icon: 'patients',
        action: () => navigate('/super-admin'),
      }));

      const saActions = [
        {
          id: 'act-new-clinic',
          title: 'Register & Onboard New Clinic',
          subtitle: 'Launch tenant with 14-day free trial',
          section: 'Quick Actions',
          icon: 'plus',
          action: () => navigate('/super-admin'),
        },
        {
          id: 'act-theme',
          title: `Switch to ${theme === 'light' ? 'Night Shift (Dark Mode)' : 'Day Shift (Light Mode)'}`,
          subtitle: `Currently using ${theme} theme`,
          section: 'Quick Actions',
          icon: theme === 'light' ? 'moon' : 'sun',
          action: () => toggleTheme(),
        },
      ].filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

      return [...navMatches, ...clinicMatches, ...saActions];
    }

    // Patient Role Sandboxing: strictly prevent patients from viewing other hospital patients
    if (isPatient) {
      const portalMatches = PATIENT_PORTAL_ITEMS.filter(
        (item) => item.title.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
      ).map((item) => ({
        ...item,
        type: 'nav',
        action: () => navigate(item.path),
      }));

      const patientActions = [
        {
          id: 'act-helpline',
          title: '24/7 Emergency Ambulance Helpline (1122)',
          subtitle: 'Instant dispatch & trauma triage',
          section: 'Quick Actions',
          icon: 'alert',
          action: () => window.open('tel:1122'),
        },
        {
          id: 'act-theme',
          title: `Switch to ${theme === 'light' ? 'Night Shift (Dark Mode)' : 'Day Shift (Light Mode)'}`,
          subtitle: `Currently using ${theme} theme`,
          section: 'Quick Actions',
          icon: theme === 'light' ? 'moon' : 'sun',
          action: () => toggleTheme(),
        },
      ].filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

      return [...portalMatches, ...patientActions];
    }

    // Staff / Clinical Role Search: Full hospital EHR and commands
    const matchedPatients = PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.cnic && p.cnic.toLowerCase().includes(q))
    ).slice(0, 6).map((p) => ({
      id: `patient-${p.id}`,
      title: p.name,
      subtitle: `${p.id} · ${p.age} yrs · ${p.gender} · ${p.phone}`,
      section: 'Patients',
      type: 'patient',
      data: p,
      action: () => navigate(`/patients/${p.id}`),
    }));

    const matchedNav = NAVIGATION_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    ).map((item) => ({
      ...item,
      type: 'nav',
      action: () => navigate(item.path),
    }));

    const quickActions = [
      {
        id: 'act-new-patient',
        title: 'Register New Patient',
        subtitle: 'Create a new medical record (MRN)',
        section: 'Quick Actions',
        icon: 'plus',
        action: () => navigate('/patients'),
      },
      {
        id: 'act-new-appointment',
        title: 'Schedule New Appointment',
        subtitle: 'Book physician consultation slot',
        section: 'Quick Actions',
        icon: 'calendar',
        action: () => navigate('/appointments'),
      },
      {
        id: 'act-new-invoice',
        title: 'Create Hospital Invoice',
        subtitle: 'Generate inpatient or outpatient bill',
        section: 'Quick Actions',
        icon: 'billing',
        action: () => navigate('/billing'),
      },
      {
        id: 'act-admit',
        title: 'Admit Patient to Ward',
        subtitle: 'Allocate inpatient bed',
        section: 'Quick Actions',
        icon: 'bed',
        action: () => navigate('/admissions'),
      },
      {
        id: 'act-theme',
        title: `Switch to ${theme === 'light' ? 'Night Shift (Dark Mode)' : 'Day Shift (Light Mode)'}`,
        subtitle: `Currently using ${theme} theme`,
        section: 'Quick Actions',
        icon: theme === 'light' ? 'moon' : 'sun',
        action: () => toggleTheme(),
      },
    ].filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

    const combined = [];
    if (matchedPatients.length > 0) combined.push(...matchedPatients);
    if (matchedNav.length > 0) combined.push(...matchedNav);
    if (quickActions.length > 0) combined.push(...quickActions);
    return combined;
  }, [query, theme, toggleTheme, navigate, isPatient]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const safeIdx = selectedIndex < allResults.length ? selectedIndex : 0;
        if (allResults[safeIdx]) {
          allResults[safeIdx].action();
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.cmd-item-active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Palette">
      <div className="cmd-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-header">
          <Icon name="search" style={{ color: 'var(--c-primary)', width: 18, height: 18 }} />
          <input
            ref={inputRef}
            type="search"
            aria-label="Search patients, medical records, departments, or quick clinical actions"
            className="cmd-input"
            placeholder="Type a command or search patients (e.g. Fatima, MRN-001, Pharmacy, Admit)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button
            className="cmd-esc-badge"
            onClick={onClose}
            title="Press Escape to close"
            aria-label="Close command palette"
          >
            ESC
          </button>
        </div>

        <div className="cmd-body" ref={listRef}>
          {allResults.length === 0 ? (
            <div className="cmd-empty">
              <Icon name="search" />
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>No matching results found</div>
              <div className="hint" style={{ marginTop: 4 }}>
                Try searching for a patient name, MRN, department, or quick clinical action.
              </div>
            </div>
          ) : (
            <div className="cmd-list" role="listbox" aria-label="Search suggestions">
              {allResults.map((item, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    className={`cmd-item ${isActive ? 'cmd-item-active' : ''}`}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {item.type === 'patient' ? (
                      <Avatar name={item.title} />
                    ) : (
                      <div className="cmd-icon-box">
                        <Icon name={item.icon || 'zap'} />
                      </div>
                    )}

                    <div className="cmd-item-details">
                      <div className="cmd-item-title-row">
                        <span className="cmd-item-title">{item.title}</span>
                        {item.type === 'patient' && (
                          <StatusBadge status={item.data.status} />
                        )}
                        <span className="cmd-item-tag">{item.section}</span>
                      </div>
                      <div className="cmd-item-sub">
                        {item.type === 'patient' ? item.subtitle : item.hint || item.subtitle}
                      </div>
                    </div>

                    {isActive && (
                      <div className="cmd-item-enter">
                        <span>↵</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-footer-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <div className="cmd-footer-branding">
            Medora HMS · Clinical Command
          </div>
        </div>
      </div>
    </div>
  );
}
