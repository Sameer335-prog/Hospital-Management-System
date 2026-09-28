import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { normalizePhoneNumber, sendWhatsApp } from './messagingGateway.js';

/**
 * tokenPdfGenerator.js
 * Generates official, high-resolution vector PDF appointment token slips
 * and handles WhatsApp PDF delivery (via Web Share API with attached .pdf file
 * or automatic PDF download + WhatsApp chat link).
 */

/**
 * Builds the jsPDF instance for a given appointment and clinic profile.
 */
export async function generateTokenPDFDoc(appt = {}, clinic = {}) {
  // Page dimensions: 100mm width x 165mm height (optimal for mobile screens & standard 80-100mm thermal/POS slips)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 165],
    compress: true,
  });

  const clinicName = (clinic.name || 'MEDORA HEALTHCARE COMPLEX').toUpperCase();
  const tagline = clinic.tagline || clinic.specialty || 'Excellence in Comprehensive Medical Care';
  const phone = clinic.hotline || clinic.phone || '0300-9998888';
  const address = clinic.address || 'Medical Enclave, Central Wing';

  const token = appt.token || 'TK-01';
  const patient = appt.patient || appt.patientName || appt.name || 'Valued Patient';
  const mrn = appt.pid || appt.mrn || appt.patientId || 'OPD-REG';
  const patientPhone = appt.phone || appt.patientPhone || '0300-1234567';
  const doctor = appt.doctor || appt.doctorName || clinic.doctorInCharge || 'Attending Consultant';
  const dept = appt.dept || clinic.specialty || 'General OPD';
  const room = appt.room || 'OPD Chamber 1';
  const time = appt.time || '10:30 AM';
  const date = appt.date || new Date().toISOString().split('T')[0];
  const fee = Number(appt.fee || appt.total || 2000).toLocaleString();
  const status = appt.status || 'Confirmed';

  // 1. TOP HEADER BANNER (Dark Navy / Medical Brand)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 100, 28, 'F');

  // Decorative top accent line (Emerald / Cyan)
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 0, 100, 1.5, 'F');

  // Clinic Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(clinicName.length > 24 ? 11 : 13);
  doc.text(clinicName, 50, 9, { align: 'center' });

  // Tagline & Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(tagline, 50, 14, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Helpline: ${phone}  |  ${address.slice(0, 45)}`, 50, 19, { align: 'center' });

  // Sub-banner: OPD TOKEN SLIP
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(0, 23, 100, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(0, 23, 100, 23);
  doc.line(0, 29, 100, 29);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('OFFICIAL OUTPATIENT CONSULTATION TOKEN', 50, 27.2, { align: 'center' });

  // 2. TOKEN NUMBER HIGHLIGHT BOX
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.6);
  doc.roundedRect(12, 33, 76, 25, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('YOUR TOKEN NUMBER', 50, 38.5, { align: 'center' });

  // Large Token
  doc.setTextColor(14, 165, 233); // Brand Cyan/Sky
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(token, 50, 49.5, { align: 'center' });

  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(7);
  doc.text(`• Status: ${status.toUpperCase()} • Live in OPD Queue •`, 50, 54.5, { align: 'center' });

  // 3. PATIENT & CLINICAL DETAILS TABLE
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(6, 61, 88, 51, 2, 2, 'FD');

  const startY = 66;
  const rowH = 6;
  const leftX = 10;
  const valX = 38;

  const rows = [
    { label: 'Patient Name:', val: patient, isBold: true },
    { label: 'Patient MRN / ID:', val: mrn },
    { label: 'Contact Phone:', val: patientPhone },
    { label: 'Consulting Doctor:', val: doctor, isBold: true },
    { label: 'Department / Unit:', val: dept },
    { label: 'Clinic Chamber / Room:', val: room, isAccent: true },
    { label: 'Slot Date & Time:', val: `${date} at ${time}`, isBold: true },
    { label: 'Consultation Fee:', val: `Rs. ${fee} (Cashier Verified)`, isGreen: true },
  ];

  rows.forEach((r, idx) => {
    const y = startY + idx * rowH;

    // Label
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.text(r.label, leftX, y);

    // Value
    if (r.isAccent) {
      doc.setTextColor(2, 132, 199);
      doc.setFont('helvetica', 'bold');
    } else if (r.isGreen) {
      doc.setTextColor(13, 148, 136);
      doc.setFont('helvetica', 'bold');
    } else if (r.isBold) {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(7.5);

    const valStr = String(r.val || '-');
    doc.text(valStr.length > 32 ? valStr.slice(0, 31) + '…' : valStr, valX, y);

    // Subtle divider line
    if (idx < rows.length - 1) {
      doc.setDrawColor(241, 245, 249);
      doc.line(leftX, y + 1.8, 90, y + 1.8);
    }
  });

  // 4. VERIFICATION QR CODE & INSTRUCTIONS
  const qrString = `MEDORA:TOKEN=${token};MRN=${mrn};PATIENT=${encodeURIComponent(patient)};DOC=${encodeURIComponent(doctor)};ROOM=${encodeURIComponent(room)};TIME=${time};DATE=${date}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrString, {
      margin: 0,
      width: 200,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    doc.addImage(qrDataUrl, 'PNG', 8, 115, 22, 22);
  } catch (err) {
    console.warn('QR Code generation for PDF skipped:', err);
  }

  // Verification text next to QR Code
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DIGITAL VERIFICATION QR', 34, 118);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.text('• Scan at OPD reception or chamber entrance.', 34, 122);
  doc.text('• Arrive 10 minutes prior to your time slot.', 34, 126);
  doc.text('• Calling announcements broadcast on lobby TVs.', 34, 130);
  doc.text('• Retain this PDF slip until completion of visit.', 34, 134);

  // 5. TEAR-OFF LINE SIMULATION
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(6, 140, 94, 140);
  doc.setLineDashPattern([], 0); // reset

  // 6. BOTTOM SECURITY FOOTER
  const now = new Date();
  const printTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 142, 100, 23, 'F');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`Generated: ${printTimestamp}  •  Auth Ref: #${appt.id || mrn}`, 50, 146, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(clinic.thankYouMessage || `Thank you for choosing ${clinic.name || 'Medora Hospital'}.`, 50, 150.5, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('Medora Cloud HMS  •  Valid on Date of Issue Only  •  ISO 27001 Certified', 50, 154.5, { align: 'center' });

  return doc;
}

/**
 * Generates and returns the PDF Blob, BlobURL, and standardized filename.
 */
export async function generateTokenPDFBlob(appt = {}, clinic = {}) {
  const doc = await generateTokenPDFDoc(appt, clinic);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const cleanPatient = (appt.patient || appt.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanToken = (appt.token || 'TOKEN').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Token_${cleanToken}_${cleanPatient}.pdf`;

  return { doc, blob, blobUrl, fileName };
}

/**
 * Directly downloads the token PDF to the user's computer or device.
 */
export async function downloadTokenPDF(appt = {}, clinic = {}) {
  const { blobUrl, fileName } = await generateTokenPDFBlob(appt, clinic);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 1000);
  return fileName;
}

/**
 * Sends the official Token PDF via WhatsApp:
 * 1. If Web Share API is available (Mobile Chrome/Safari/Edge), shares the actual PDF file directly to WhatsApp.
 * 2. On Desktop or unsupported environments, automatically downloads the PDF file for immediate attachment
 *    and opens WhatsApp chat with the patient with a clear token summary.
 */
export async function sendTokenPdfViaWhatsApp(appt = {}, clinic = {}, customPhone = null) {
  const clinicName = clinic.name || 'Medora Healthcare Complex';
  const { blob, fileName } = await generateTokenPDFBlob(appt, clinic);
  const targetPhone = customPhone || appt.patientPhone || appt.phone || '0300-1234567';

  const token = appt.token || 'TK-01';
  const patient = appt.patient || appt.name || 'Valued Patient';
  const doctor = appt.doctor || 'Attending Physician';
  const dept = appt.dept || 'OPD';
  const time = appt.time || '10:30 AM';
  const date = appt.date || 'Today';
  const room = appt.room || 'OPD Chamber';

  const captionText = `🏥 *${clinicName}* — Official Appointment Token Slip\n\nDear *${patient}*,\nYour official consultation token PDF slip has been issued:\n\n🎫 *TOKEN NUMBER:* *${token}*\n👨‍⚕️ *Consultant:* ${doctor} (${dept})\n🕒 *Time:* ${time} (${date})\n📍 *Chamber / Room:* ${room}\n\n📎 *Official PDF Slip is attached (${fileName}). Please present this slip at reception.*`;

  // 1. Check if device supports sharing files directly (e.g. Android Chrome, iOS Safari)
  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${clinicName} Token Slip #${token}`,
          text: captionText,
          files: [file],
        });
        return { success: true, mode: 'share_api', fileName };
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      console.warn('Web Share API file share failed, switching to download + WhatsApp:', err);
    }
  }

  // 2. Desktop Fallback: Download the PDF slip & open WhatsApp with patient
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 1200);

  // Open WhatsApp chat
  const chatMessage = `🏥 *${clinicName}* — Official Appointment Token\n\nDear *${patient}*,\nYour official consultation token slip (*${token}*) has been generated in PDF format.\n\n• *Token:* *${token}*\n• *Doctor:* ${doctor} (${dept})\n• *Time:* ${time} (${date})\n• *Room:* ${room}\n\n📎 *The official PDF document (${fileName}) has been downloaded to your device. Please attach it or present it at the reception counter.*`;
  
  sendWhatsApp(targetPhone, chatMessage);

  return { success: true, mode: 'download_and_whatsapp', fileName };
}

/**
 * Text message used for appointment reminders and general notifications (as per requirement).
 */
export function generateAppointmentReminderText(appt = {}, clinic = {}) {
  const clinicName = clinic.name || 'Medora Healthcare Complex';
  const patient = appt.patient || appt.name || 'Valued Patient';
  const doctor = appt.doctor || 'Attending Physician';
  const time = appt.time || '10:30 AM';
  const date = appt.date || 'Today';
  const token = appt.token || 'N/A';
  const room = appt.room || 'OPD Chamber';
  const hotline = clinic.hotline || clinic.phone || '0300-9998888';

  return `⏰ *APPOINTMENT REMINDER* — ${clinicName}\n\nDear *${patient}*,\nThis is a friendly reminder for your upcoming appointment:\n\n• *Consultant:* ${doctor}\n• *Scheduled Time:* ${time} (${date})\n• *Token Number:* ${token}\n• *Clinic Room:* ${room}\n\nPlease arrive 10 minutes prior to your consultation slot.\n📞 Helpline: ${hotline}`;
}
