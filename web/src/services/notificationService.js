/**
 * notificationService.js
 * Central notification and automated reminder engine for Medora HMS.
 * Handles appointment confirmations, 2-hour pre-appointment reminders,
 * simulated SMS dispatch, and desktop push alerts.
 */

import { audioAlert } from '../utils/audioAlert.js';

const STORAGE_KEY = 'medora_notifications_v1';
const SENT_REMINDERS_KEY = 'medora_sent_reminders_v1';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-101',
    type: 'reminder_2h',
    title: '⏰ 2-Hour Pre-Appointment Reminder',
    message: 'Your consultation with Dr. Sarah Khan (Cardiology) is scheduled in 2 hours at 09:30 AM. Room 204 · East Wing. OPD Token: TK-01.',
    recipientRole: 'Patient',
    recipientId: 'PT-00125',
    patientName: 'Muhammad Ahmed',
    doctorName: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    token: 'TK-01',
    date: 'Today · Sep 14, 2026',
    time: '09:30 AM',
    smsText: 'Medora Hospital: Dear Muhammad Ahmed, your appointment with Dr. Sarah Khan is in 2 hours at 09:30 AM. Token: TK-01, Room 204. Please arrive 10 min early.',
    smsPhone: '0300-9876543',
    channels: ['in_app', 'sms', 'browser'],
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    appointmentId: 'AP-3301',
  },
  {
    id: 'NOTIF-102',
    type: 'reminder_2h',
    title: '👨‍⚕️ Upcoming Patient in 2 Hours',
    message: 'Patient Muhammad Ahmed (Token TK-01) is scheduled for Cardiology consultation in 2 hours at 09:30 AM.',
    recipientRole: 'Doctor',
    doctorId: 'DOC-01',
    patientName: 'Muhammad Ahmed',
    doctorName: 'Dr. Sarah Khan',
    dept: 'Cardiology',
    room: 'Room 204 · East Wing',
    token: 'TK-01',
    date: 'Today · Sep 14, 2026',
    time: '09:30 AM',
    smsText: 'Medora Clinic Alert: Dr. Sarah Khan, patient Muhammad Ahmed (TK-01) is arriving for consultation in 2 hours at 09:30 AM.',
    smsPhone: '0300-1234567',
    channels: ['in_app', 'sms'],
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    appointmentId: 'AP-3301',
  },
  {
    id: 'NOTIF-103',
    type: 'booking_confirmed',
    title: '✅ Appointment Confirmed',
    message: 'Appointment successfully confirmed with Dr. Hina Farooq for Ayesha Bibi at 10:00 AM. Token: TK-02.',
    recipientRole: 'Patient',
    recipientId: 'PT-00126',
    patientName: 'Ayesha Bibi',
    doctorName: 'Dr. Hina Farooq',
    dept: 'Gynecology',
    room: 'Room 218 · East Wing',
    token: 'TK-02',
    date: '2026-09-14',
    time: '10:00 AM',
    smsText: 'Medora Hospital: Dear Ayesha Bibi, your appointment with Dr. Hina Farooq is confirmed for 10:00 AM. Token: TK-02.',
    smsPhone: '0301-4455667',
    channels: ['in_app', 'sms'],
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    appointmentId: 'AP-3302',
  },
];

class NotificationService {
  constructor() {
    this.listeners = new Set();
  }

  getNotifications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  }

  saveNotifications(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
    this.emitChange(list);
  }

  getSentReminders() {
    try {
      const raw = localStorage.getItem(SENT_REMINDERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  markReminderSent(appointmentId) {
    const sent = this.getSentReminders();
    sent[appointmentId] = { sentAt: new Date().toISOString() };
    try {
      localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(sent));
    } catch {
      // ignore
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emitChange(list) {
    this.listeners.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  /**
   * Request native browser notification permission
   */
  async requestPushPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission;
    }
    return 'unsupported';
  }

  /**
   * Fire a native desktop push notification if allowed
   */
  fireNativePush(title, body) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Trigger notifications when an appointment is booked
   */
  notifyAppointmentBooked(appointment) {
    const current = this.getNotifications();
    const now = new Date().toISOString();
    const apptId = appointment.id || `AP-${Math.floor(1000 + Math.random() * 9000)}`;
    const patientName = appointment.patient || appointment.patientName || 'Patient';
    const doctorName = appointment.doctor || appointment.doctorName || 'Doctor';
    const time = appointment.time || 'Scheduled Time';
    const date = appointment.date || 'Today';
    const room = appointment.room || 'Consultation Room';
    const token = appointment.token || 'TK-01';
    const dept = appointment.dept || 'General';

    // 1. Patient Booking Confirmation
    const patientNotif = {
      id: `NOTIF-${Date.now()}-P`,
      type: 'booking_confirmed',
      title: '✅ Appointment Confirmed',
      message: `Your appointment with ${doctorName} (${dept}) is confirmed for ${date} at ${time}. Room: ${room}. Token: ${token}.`,
      recipientRole: 'Patient',
      recipientId: appointment.pid || 'PT-00125',
      patientName,
      doctorName,
      dept,
      room,
      token,
      date,
      time,
      smsText: `Medora Hospital: Dear ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. Token: ${token}, ${room}. Please arrive 10 min early.`,
      smsPhone: '0300-9876543',
      channels: ['in_app', 'sms', 'browser'],
      read: false,
      createdAt: now,
      appointmentId: apptId,
    };

    // 2. Doctor Alert Notification
    const doctorNotif = {
      id: `NOTIF-${Date.now()}-D`,
      type: 'booking_confirmed',
      title: '📋 New Patient Booked',
      message: `New consultation booked: ${patientName} (${token}) is scheduled with you on ${date} at ${time} (${dept}).`,
      recipientRole: 'Doctor',
      doctorId: appointment.doctorId || 'DOC-01',
      patientName,
      doctorName,
      dept,
      room,
      token,
      date,
      time,
      smsText: `Medora Clinic Alert: New consultation booked with Dr. ${doctorName}. Patient: ${patientName} (Token ${token}) at ${time}. Room: ${room}.`,
      smsPhone: '0300-1234567',
      channels: ['in_app', 'sms'],
      read: false,
      createdAt: now,
      appointmentId: apptId,
    };

    const updated = [patientNotif, doctorNotif, ...current];
    this.saveNotifications(updated);

    // Play clinical chime & native push
    audioAlert.playChime('default');
    this.fireNativePush(patientNotif.title, patientNotif.message);

    return { patientNotif, doctorNotif };
  }

  /**
   * Trigger 2-Hour Pre-Appointment Reminder for Patient and Doctor
   */
  dispatchTwoHourReminder(appointment) {
    const current = this.getNotifications();
    const now = new Date().toISOString();
    const apptId = appointment.id || `AP-${Math.floor(1000 + Math.random() * 9000)}`;
    const patientName = appointment.patient || appointment.patientName || 'Patient';
    const doctorName = appointment.doctor || appointment.doctorName || 'Doctor';
    const time = appointment.time || '10:00 AM';
    const room = appointment.room || 'Consultation Suite';
    const token = appointment.token || 'TK-01';
    const dept = appointment.dept || 'OPD';
    const date = appointment.date || 'Today';

    // 1. Patient 2-Hour Reminder
    const patientReminder = {
      id: `NOTIF-${Date.now()}-REM-P`,
      type: 'reminder_2h',
      title: '⏰ 2-Hour Pre-Appointment Reminder',
      message: `Reminder: Your appointment with ${doctorName} (${dept}) is in 2 hours at ${time}. Room: ${room}. Token: ${token}.`,
      recipientRole: 'Patient',
      recipientId: appointment.pid || 'PT-00125',
      patientName,
      doctorName,
      dept,
      room,
      token,
      date,
      time,
      smsText: `Medora Hospital: Dear ${patientName}, reminder: your appointment with ${doctorName} is in 2 hours at ${time}. Token: ${token}, ${room}. Please arrive 10 min early.`,
      smsPhone: '0300-9876543',
      channels: ['in_app', 'sms', 'browser'],
      read: false,
      createdAt: now,
      appointmentId: apptId,
    };

    // 2. Doctor 2-Hour Reminder
    const doctorReminder = {
      id: `NOTIF-${Date.now()}-REM-D`,
      type: 'reminder_2h',
      title: '👨‍⚕️ Upcoming Patient in 2 Hours',
      message: `Upcoming consultation: Patient ${patientName} (${token}) is scheduled to see you in 2 hours at ${time} (${room}).`,
      recipientRole: 'Doctor',
      doctorId: appointment.doctorId || 'DOC-01',
      patientName,
      doctorName,
      dept,
      room,
      token,
      date,
      time,
      smsText: `Medora Clinic Alert: Dr. ${doctorName}, patient ${patientName} (${token}) is scheduled for consultation in 2 hours at ${time}.`,
      smsPhone: '0300-1234567',
      channels: ['in_app', 'sms'],
      read: false,
      createdAt: now,
      appointmentId: apptId,
    };

    const updated = [patientReminder, doctorReminder, ...current];
    this.saveNotifications(updated);
    this.markReminderSent(apptId);

    // Audio chime & native push alert
    audioAlert.playChime('reminder');
    this.fireNativePush(patientReminder.title, patientReminder.message);

    return { patientReminder, doctorReminder };
  }

  /**
   * Helper to parse time string like "09:30 AM" into minutes from midnight
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  /**
   * Automated scan: Checks upcoming appointments and automatically dispatches
   * 2-hour reminders if the appointment falls in the window [0 min, 120 min].
   */
  checkAutomatedReminders(appointments = []) {
    if (!Array.isArray(appointments) || appointments.length === 0) return [];
    const sentReminders = this.getSentReminders();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const triggered = [];

    appointments.forEach((appt) => {
      // Only process confirmed/waiting appointments
      if (appt.status === 'Completed' || appt.status === 'Cancelled') return;
      if (sentReminders[appt.id]) return; // Already reminded

      // Only check appointments scheduled for today
      const todayStr = now.toISOString().split('T')[0];
      const isToday = !appt.date ||
        appt.date.toLowerCase().includes('today') ||
        appt.date === todayStr ||
        appt.date.includes(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      if (!isToday) return;

      const apptMinutes = this.parseTimeToMinutes(appt.time);
      if (apptMinutes === null) return;

      const diffMinutes = apptMinutes - currentMinutes;

      // If scheduled time is between 0 and 120 minutes away
      if (diffMinutes >= 0 && diffMinutes <= 120) {
        const result = this.dispatchTwoHourReminder(appt);
        triggered.push(result);
      }
    });

    return triggered;
  }

  markAsRead(id) {
    const list = this.getNotifications().map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    this.saveNotifications(list);
  }

  markAllAsRead(recipientRole = null) {
    const list = this.getNotifications().map((item) => {
      if (!recipientRole || item.recipientRole === recipientRole || item.recipientRole === 'All') {
        return { ...item, read: true };
      }
      return item;
    });
    this.saveNotifications(list);
  }

  clearAll() {
    this.saveNotifications([]);
  }
}

export const notificationService = new NotificationService();
