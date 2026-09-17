import { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import MobileDrawer from './MobileDrawer.jsx';
import CommandPalette from '../ui/CommandPalette.jsx';
import ShortcutsModal from '../ui/ShortcutsModal.jsx';

export default function AppShell({ children }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      // Cmd + K or Ctrl + K for Command Center
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // ? for shortcuts (when not in an input)
      else if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="app">
      <a href="#main-content" className="skip-link">
        Skip to main clinical workspace
      </a>
      <Sidebar />
      <div className="main-col">
        <Topbar
          onOpenCommand={() => setIsCommandOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenMenu={() => setIsDrawerOpen(true)}
        />
        <main id="main-content" className="content" tabIndex="-1" role="main">
          {children}
        </main>
      </div>

      {/* Native Mobile App Navigation System */}
      <MobileBottomNav onOpenMenu={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
