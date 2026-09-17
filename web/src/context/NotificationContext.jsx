import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { notificationService } from '../services/notificationService.js';
import { audioAlert } from '../utils/audioAlert.js';
import { useAuth } from './AuthContext.jsx';
import { appointmentService } from '../services/appointmentService.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synchronize state with notificationService emitter
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications([...updated]);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize audio alert setting
  useEffect(() => {
    audioAlert.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Compute unread count based on active user context
  const userRole = user?.role || 'Staff';

  const relevantNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (userRole === 'Admin' || userRole === 'Receptionist') {
        return true; // Reception & Admin oversee all operational alerts
      }
      if (userRole === 'Doctor') {
        return notif.recipientRole === 'Doctor' || notif.recipientRole === 'All';
      }
      if (userRole === 'Patient') {
        return notif.recipientRole === 'Patient' || notif.recipientRole === 'All';
      }
      return true;
    });
  }, [notifications, userRole]);

  const unreadCount = useMemo(() => {
    return relevantNotifications.filter((n) => !n.read).length;
  }, [relevantNotifications]);

  // Action methods
  const dispatchBookingNotification = useCallback((appointment) => {
    return notificationService.notifyAppointmentBooked(appointment);
  }, []);

  const dispatchTwoHourReminder = useCallback((appointment) => {
    return notificationService.dispatchTwoHourReminder(appointment);
  }, []);

  const markAsRead = useCallback((id) => {
    notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const requestPushPermission = useCallback(async () => {
    return await notificationService.requestPushPermission();
  }, []);

  // Background automated scheduler: checks upcoming appointments every 30 seconds
  useEffect(() => {
    const runCheck = async () => {
      try {
        const appts = await appointmentService.getAppointments();
        notificationService.checkAutomatedReminders(appts);
      } catch {
        // ignore
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications: relevantNotifications,
    allNotifications: notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    dispatchBookingNotification,
    dispatchTwoHourReminder,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPushPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
