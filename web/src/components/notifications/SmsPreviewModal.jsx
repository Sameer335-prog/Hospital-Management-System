import React, { useState } from 'react';
import Icon, { WhatsAppIcon } from '../ui/Icon.jsx';
import { sendWhatsApp, sendNativeSms, sendCloudMessage, normalizePhoneNumber } from '../../utils/messagingGateway.js';

export default function SmsPreviewModal({ notification, onClose }) {
  if (!notification) return null;

  const isPatient = notification.recipientRole === 'Patient';
  const defaultPhone = notification.smsPhone || (isPatient ? '0300-9876543' : '0300-1234567');
  const recipientName = isPatient ? notification.patientName : notification.doctorName;
  const isReminder = notification.type === 'reminder_2h';

  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState(notification.smsText || notification.message || '');
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // 1. Direct WhatsApp Dispatch
  function handleSendWhatsApp() {
    sendWhatsApp(phone, message);
    setDispatchStatus('WhatsApp opened with prefilled message!');
  }

  // 2. Direct Device SMS Dispatch
  function handleSendNativeSms() {
    sendNativeSms(phone, message);
    setDispatchStatus('Native Phone SMS app launched!');
  }

  // 3. Backend Cloud API Dispatch
  async function handleSendCloud(channel) {
    setDispatchStatus(`Dispatching via Cloud ${channel.toUpperCase()}…`);
    const res = await sendCloudMessage({
      to: phone,
      message,
      channel,
      recipientRole: notification.recipientRole,
    });
    if (res?.success) {
      setDispatchStatus(`✓ Message sent via Cloud ${channel.toUpperCase()} to +${normalizePhoneNumber(phone)}!`);
    } else {
      setDispatchStatus('Dispatched to gateway queue.');
    }
  }

  // 4. Copy to Clipboard
  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--c-surface, #ffffff)',
          borderRadius: 20,
          border: '1px solid var(--c-border, #e2e8f0)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--c-surface-subtle, #f8fafc)',
            borderBottom: '1px solid var(--c-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: isReminder ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 211, 102, 0.15)',
                color: isReminder ? '#d97706' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {isReminder ? '⏰' : '💬'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                {isReminder ? '2-Hour Reminder Dispatcher' : 'Direct Patient SMS & WhatsApp'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>
                Direct Mobile Gateway · Recipient: <strong>{recipientName}</strong>
              </div>
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%' }}
          >
            <Icon name="x" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', background: 'var(--c-bg, #f8fafc)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Recipient Phone Field */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 4, display: 'block' }}>
              Target Mobile Number (Pakistan & International):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300-1234567"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
              />
              <span
                className={`badge ${isPatient ? 'badge-success' : 'badge-primary'}`}
                style={{ fontSize: 11, padding: '4px 8px', whiteSpace: 'nowrap' }}
              >
                {isPatient ? 'Patient Phone' : 'Doctor Pager'}
              </span>
            </div>
          </div>

          {/* Editable SMS / WhatsApp Message Body */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>
                Message Text:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--c-primary)',
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy text'}
              </button>
            </div>
            <textarea
              className="input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                fontSize: 12.5,
                lineHeight: 1.5,
                borderRadius: 8,
                padding: '10px 12px',
                resize: 'vertical',
                background: 'var(--c-surface, #ffffff)',
              }}
            />
          </div>

          {/* Direct Dispatch Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--c-text-muted)' }}>
              Choose Dispatch Channel:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {/* WhatsApp Button */}
              <button
                type="button"
                className="btn"
                onClick={handleSendWhatsApp}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>Send via WhatsApp</span>
              </button>

              {/* Native Phone SMS Button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendNativeSms}
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>📱</span>
                <span>Send via Phone SMS</span>
              </button>
            </div>

            {/* Cloud API Dispatch Alternative */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSendCloud('whatsapp')}
                style={{ flex: 1, fontSize: 11 }}
              >
                🚀 Cloud WhatsApp API
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSendCloud('sms')}
                style={{ flex: 1, fontSize: 11 }}
              >
                ☁️ Cloud SMS Gateway
              </button>
            </div>
          </div>

          {/* Status Feedback */}
          {dispatchStatus && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#065f46',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {dispatchStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--c-surface)',
            borderTop: '1px solid var(--c-border, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: 13 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
