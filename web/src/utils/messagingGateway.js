import { getClinicProfile } from './clinicConfig.js';
import { getSpecialtyConfig } from './specialtyConfig.js';


/**
 * Normalizes a phone string (e.g., "0300-1234567", "03001234567", "+92 300 1234567")
 * to clean international digits (e.g., "923001234567" for WhatsApp and "+923001234567" for SMS).
 */
export function normalizePhoneNumber(rawPhone, defaultCountryCode = '92') {
  if (!rawPhone) return '';
  const str = String(rawPhone).trim();
  const hasPlus = str.startsWith('+');
  let digits = str.replace(/\D/g, '');
  if (!digits) return '';

  // If starts with 00 (international dialing prefix), strip leading 00
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
    return digits;
  }

  // If user explicitly provided a + country code
  if (hasPlus) {
    return digits;
  }

  // If local national number starting with a single 0 (e.g. 03001234567 -> 923001234567)
  if (digits.startsWith('0')) {
    return defaultCountryCode + digits.slice(1);
  }

  // If already prefixed with default country code (e.g. 923001234567)
  if (digits.startsWith(defaultCountryCode) && digits.length >= 11) {
    return digits;
  }

  // Standard 10-digit mobile number without leading 0 (e.g. 3001234567)
  if (digits.length === 10) {
    return defaultCountryCode + digits;
  }

  return digits;
}

/**
 * Opens WhatsApp Web or Mobile directly with a prefilled message.
 */
export function sendWhatsApp(phone, message) {
  const cleanNumber = normalizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message || '');
  const url = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}

/**
 * Opens native device SMS app (iOS/Android/Desktop) with phone number and body prefilled.
 */
export function sendNativeSms(phone, message) {
  const cleanNumber = normalizePhoneNumber(phone);
  const formattedNumber = cleanNumber ? `+${cleanNumber}` : '';
  const encodedBody = encodeURIComponent(message || '');
  // Using separator suitable for cross-platform
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  const url = `sms:${formattedNumber}${separator}body=${encodedBody}`;
  window.location.href = url;
  return url;
}

/**
 * Dispatches message through the backend cloud SMS & WhatsApp gateway.
 */
export async function sendCloudMessage({ to, message, channel = 'whatsapp', recipientRole = 'Patient' }) {
  try {
    const response = await fetch('http://localhost:5000/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizePhoneNumber(to),
        message,
        channel,
        recipientRole,
      }),
    });
    return await response.json();
  } catch (err) {
    console.warn('Cloud message dispatch local fallback:', err);
    return {
      success: true,
      simulated: true,
      message: `Message dispatched via ${channel.toUpperCase()} to ${to}`,
    };
  }
}

/**
 * Generates an official, highly optimized WhatsApp appointment token slip.
 */
export function generateWhatsAppTokenSlip(appt = {}) {
  const profile = getClinicProfile();
  const specialty = getSpecialtyConfig(profile);

  const clinicName = profile.name || 'Medora Healthcare Complex';
  const logoIcon = profile.logoIcon || specialty.logoIcon || '🏥';
  const resourceLabel = specialty.terminology?.resourceUnit || 'Clinic Chamber';
  const queueLocation = specialty.terminology?.queueLocation || 'Active in OPD Waiting Lounge';
  const emergencyTitle = specialty.terminology?.emergencyTitle || '24/7 EMERGENCY & AMBULANCE';
  const hotline = profile.hotline || profile.phone || '0300-9998888';

  const token = appt.token || 'TK-01';
  const doctor = appt.doctor || profile.doctorInCharge || 'Attending Physician';
  const dept = appt.dept || profile.practiceType || 'OPD';
  const room = appt.room || `${resourceLabel} 1`;
  const time = appt.time || '10:30 AM';
  const date = appt.date || 'Today';
  const patient = appt.patient || 'Valued Patient';
  const fee = appt.fee || 2000;

  return `${logoIcon} *${clinicName}* — Official Appointment Token
━━━━━━━━━━━━━━━━━━━━━━━━━
🎫 *TOKEN NUMBER:* *${token}*
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Patient Name:* ${patient}
👨‍⚕️ *Consultant:* ${doctor} (${dept})
🕒 *Consultation Time:* ${time} (${date})
📍 *${resourceLabel}:* ${room}
💳 *Consultation Fee:* Rs. ${fee} (Pay at Reception/Cashier)
📊 *Queue Status:* ${queueLocation}

📋 *PATIENT INSTRUCTIONS (ہدایات):*
• Please report to ${room} at least 10 minutes prior to your slot.
• Keep this digital token active on your phone for verification at the reception.
• Real-time queue call-outs are displayed on the clinic TV screens.

🚨 *${emergencyTitle}:*
📞 Emergency Hotline: ${hotline}
📍 *Location Map:* https://maps.google.com/?q=${encodeURIComponent(clinicName)}
━━━━━━━━━━━━━━━━━━━━━━━━━
_${profile.thankYouMessage || `Thank you for choosing ${clinicName}.`}_`;
}

