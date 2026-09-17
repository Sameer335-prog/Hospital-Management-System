import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SHORTCUTS = [
    {
      category: 'Global Navigation',
      items: [
        { keys: ['⌘', 'K'], desc: 'Open Clinical Command Center & Search' },
        { keys: ['?'], desc: 'Show Keyboard Shortcuts Cheat Sheet' },
        { keys: ['ESC'], desc: 'Close any active modal or drawer' },
      ],
    },
    {
      category: 'Quick Workflows',
      items: [
        { keys: ['Alt', 'P'], desc: 'Open Patients Directory' },
        { keys: ['Alt', 'A'], desc: 'Open OPD Appointments' },
        { keys: ['Alt', 'B'], desc: 'Open Billing & Invoicing' },
        { keys: ['Alt', 'L'], desc: 'Open Central Pathology Lab' },
        { keys: ['Alt', 'M'], desc: 'Open Pharmacy & Formulary' },
      ],
    },
    {
      category: 'Clinical Environment',
      items: [
        { keys: ['Alt', 'T'], desc: 'Toggle Night Shift / Dark Mode' },
        { keys: ['Ctrl', 'P'], desc: 'Print active prescription or invoice' },
      ],
    },
  ];

  return (
    <div className="overlay center" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="keyboard" style={{ color: 'var(--c-primary)' }} />
            <div style={{ fontWeight: 700, fontSize: 16 }}>Keyboard Shortcuts</div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px 20px' }}>
          {SHORTCUTS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: gi === SHORTCUTS.length - 1 ? 0 : 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--c-text-muted)',
                  marginBottom: 8,
                }}
              >
                {group.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((it, ii) => (
                  <div
                    key={ii}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--c-surface-hover)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--c-text)' }}>{it.desc}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {it.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 22,
                            padding: '2px 6px',
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--c-text)',
                            background: 'var(--c-surface)',
                            border: '1px solid var(--c-border-strong)',
                            borderRadius: 4,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
          <span className="hint" style={{ fontSize: 12 }}>
            Press <kbd style={{ padding: '1px 5px', fontSize: 11, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 3 }}>ESC</kbd> to return to clinical workspace
          </span>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
