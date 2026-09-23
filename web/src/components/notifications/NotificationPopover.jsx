import React, { useState, useRef, useEffect } from 'react';
import Icon, { WhatsAppIcon } from '../ui/Icon.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import SmsPreviewModal from './SmsPreviewModal.jsx';
import { sendWhatsApp } from '../../utils/messagingGateway.js';

export default function NotificationPopover() {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    clearAll,
    dispatchTwoHourReminder,
    requestPushPermission,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'reminders' | 'bookings'
  const [smsModalNotification, setSmsModalNotification] = useState(null);
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered list based on active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'reminders') return n.type === 'reminder_2h';
    if (activeTab === 'bookings') return n.type === 'booking_confirmed';
    return true;
  });

  // Fast demo simulator: Triggers a 2-hour pre-appointment reminder on demand
  function handleSimulateDemoReminder() {
    dispatchTwoHourReminder({
      id: `AP-DEMO-${Math.floor(100 + Math.random() * 900)}`,
      patient: 'Muhammad Ahmed',
      pid: 'PT-00125',
      doctor: 'Dr. Sarah Khan',
      doctorId: 'DOC-01',
      dept: 'Cardiology',
      room: 'Room 204 · East Wing',
      time: '11:30 AM',
      date: 'Today',
      token: `TK-${Math.floor(10 + Math.random() * 89)}`,
    });
  }

  // Format relative timestamp
  function formatRelativeTime(isoStr) {
    if (!isoStr) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        className="btn-icon"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications & 2-Hour Appointment Reminders"
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: isOpen ? 'var(--c-surface-hover)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <Icon name="bell" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--c-error, #ef4444)',
              color: '#ffffff',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.7)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 390,
            maxWidth: '92vw',
            background: 'var(--c-surface, #ffffff)',
            borderRadius: 16,
            border: '1px solid var(--c-border, #e2e8f0)',
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.22)',
            zIndex: 900,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 560,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--c-border, #e2e8f0)',
              background: 'var(--c-surface-subtle, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="badge badge-primary"
                  style={{ fontSize: 11, padding: '2px 8px', fontWeight: 700 }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Sound Mute Toggle */}
              <button
                className="btn-icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Alert Chimes' : 'Unmute Alert Chimes'}
                style={{ width: 28, height: 28, fontSize: 12 }}
              >
                <Icon name={soundEnabled ? 'volume' : 'volumeX'} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-primary)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Quick Demo Simulator Banner */}
          <div
            style={{
              padding: '8px 14px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.08))',
              borderBottom: '1px solid var(--c-border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
            }}
          >
            <span style={{ color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" style={{ fontSize: 12, color: 'var(--c-primary)' }} />
              2-Hour Auto-Reminder Engine
            </span>
            <button
              onClick={handleSimulateDemoReminder}
              className="btn btn-xs btn-primary"
              style={{ padding: '2px 8px', fontSize: 11, borderRadius: 6 }}
              title="Trigger a simulated 2-hour pre-appointment reminder immediately"
            >
              ⚡ Test 2h Alert
            </button>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '6px 12px',
              gap: 4,
              borderBottom: '1px solid var(--c-border, #e2e8f0)',
              background: 'var(--c-surface)',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'reminders', label: '⏰ 2h Reminders' },
              { id: 'bookings', label: '📅 Bookings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'var(--c-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--c-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  padding: '4px 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0',
              maxHeight: 360,
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: 'var(--c-text-muted)',
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
                <div>No notifications in this category.</div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isReminder = notif.type === 'reminder_2h';
                const isPatientAlert = notif.recipientRole === 'Patient';

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--c-border, #f1f5f9)',
                      background: notif.read
                        ? 'transparent'
                        : isReminder
                        ? 'rgba(245, 158, 11, 0.04)'
                        : 'rgba(14, 165, 233, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Leading Icon */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isReminder
                            ? 'rgba(245, 158, 11, 0.12)'
                            : isPatientAlert
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(99, 102, 241, 0.12)',
                          color: isReminder
                            ? '#d97706'
                            : isPatientAlert
                            ? '#059669'
                            : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 14,
                        }}
                      >
                        <Icon name={isReminder ? 'clock' : isPatientAlert ? 'user' : 'clipboard'} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--c-text)' }}>
                            {notif.title}
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--c-text-faint)' }}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--c-text-muted)',
                            lineHeight: 1.45,
                            marginBottom: 6,
                          }}
                        >
                          {notif.message}
                        </div>

                        {/* Badges & Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 4,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              className={`badge ${isPatientAlert ? 'badge-success' : 'badge-primary'}`}
                              style={{ fontSize: 9.5, padding: '1px 6px' }}
                            >
                              {isPatientAlert ? 'Patient Alert' : 'Doctor Alert'}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: 'var(--c-text-faint)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              📱 SMS Dispatched
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const phone = notif.smsPhone || (isPatientAlert ? '0300-9876543' : '0300-1234567');
                                sendWhatsApp(phone, notif.smsText || notif.message);
                              }}
                              className="btn btn-xs"
                              style={{
                                width: 24,
                                height: 24,
                                padding: 0,
                                background: '#25D366',
                                color: '#ffffff',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                boxShadow: '0 1px 4px rgba(37, 211, 102, 0.25)',
                                cursor: 'pointer',
                              }}
                              title="Send directly to WhatsApp"
                              aria-label="Send to WhatsApp"
                            >
                              <WhatsAppIcon size={14} color="#ffffff" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSmsModalNotification(notif);
                              }}
                              className="btn btn-xs btn-secondary"
                              style={{ padding: '2px 7px', fontSize: 10.5 }}
                              title="Open Phone SMS / Dispatch Terminal"
                            >
                              📱 SMS
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notif.read && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--c-primary)',
                            marginTop: 6,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              background: 'var(--c-surface-subtle, #f8fafc)',
              borderTop: '1px solid var(--c-border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
            }}
          >
            <button
              onClick={() => requestPushPermission()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--c-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
              }}
            >
              <Icon name="bell" style={{ fontSize: 11 }} /> Enable Push Alerts
            </button>
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--c-error, #ef4444)',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Dispatched SMS Simulator Modal */}
      {smsModalNotification && (
        <SmsPreviewModal
          notification={smsModalNotification}
          onClose={() => setSmsModalNotification(null)}
        />
      )}
    </div>
  );
}
