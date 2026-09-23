import { useEffect } from 'react';
import Icon, { WhatsAppIcon } from '../ui/Icon.jsx';
import QrCode from '../ui/QrCode.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { sendWhatsApp } from '../../utils/messagingGateway.js';

/**
 * ThermalReceiptModal.jsx
 * Simulates and prints standard 80mm ESC/POS thermal counter rolls.
 * Compatible with Epson TM-T88, Star Micronics, Xprinter, Rongta, and POS thermal printers.
 */
export default function ThermalReceiptModal({ isOpen, onClose, data, type = 'token' }) {
  const clinic = useClinicProfile();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const now = new Date();
  const printTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  const handlePrint = () => {
    document.body.classList.add('thermal-printing-active');
    const cleanup = () => {
      document.body.classList.remove('thermal-printing-active');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Safety timeout in case browser does not fire afterprint event
    setTimeout(cleanup, 2000);
  };

  const handleSendWhatsApp = () => {
    const phone = data.patientPhone || data.phone || '0300-1234567';
    let text = `🧾 *${clinic.name}* — Official Counter Receipt\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    if (data.token) text += `🎫 *Token Number:* #${data.token}\n`;
    if (data.invoiceNo) text += `🔢 *Receipt / Invoice:* ${data.invoiceNo}\n`;
    if (data.patientName || data.name) text += `👤 *Patient:* ${data.patientName || data.name} (${data.mrn || data.patientId || 'OPD'})\n`;
    if (data.doctorName || data.doctor) text += `👨‍⚕️ *Doctor:* ${data.doctorName || data.doctor} (${data.dept || clinic.specialty || 'General'})\n`;
    if (data.date || data.time) text += `📅 *Date:* ${data.date || 'Today'} ${data.time || ''}\n`;
    if (data.total || data.fee) text += `💳 *Amount Paid:* Rs. ${Number(data.total || data.fee || 0).toLocaleString()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📞 *Helpline:* ${clinic.hotline || clinic.phone}\n`;
    text += `📍 *Address:* ${clinic.address}`;
    sendWhatsApp(phone, text);
  };

  return (
    <div className="overlay" style={{ zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="modal modal-compact"
        style={{
          maxWidth: 420,
          width: '100%',
          background: 'var(--c-surface)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--c-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--c-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🖨️</span>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {clinic.paperWidth || '80mm'} ESC/POS Thermal Printer Preview
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        {/* Thermal Roll Preview Box */}
        <div
          style={{
            padding: '20px 16px',
            overflowY: 'auto',
            background: '#2b2f38',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Authentic 80mm Roll Container (300px approx 72-80mm width) */}
          <div
            id="thermal-slip-print-area"
            className="thermal-receipt-printable"
            style={{
              width: clinic.paperWidth === '58mm' ? 240 : 300,
              background: '#ffffff',
              color: '#000000',
              padding: '16px 14px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: clinic.paperWidth === '58mm' ? '10px' : '11px',
              lineHeight: 1.35,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              borderRadius: 2,
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {/* Top Zig-zag / Tear Simulation */}
            <div
              style={{
                textAlign: 'center',
                letterSpacing: '2px',
                fontSize: 9,
                color: '#666666',
                marginBottom: 6,
                borderBottom: '1px dashed #000000',
                paddingBottom: 4,
              }}
            >
              ✂ - - - - - - - - - - - - - - - - - - -
            </div>

            {/* Hospital / Clinic Dynamic Header */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 900, fontSize: clinic.paperWidth === '58mm' ? 13 : 15, letterSpacing: '0.04em' }}>
                {clinic.name || 'MEDORA CLINICAL CARE'}
              </div>
              {clinic.tagline && (
                <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2 }}>
                  {clinic.tagline}
                </div>
              )}
              {clinic.doctorInCharge && (
                <div style={{ fontSize: 8.5, fontWeight: 700, color: '#222' }}>
                  {clinic.doctorInCharge}
                </div>
              )}
              <div style={{ fontSize: 8.5, color: '#333333', marginTop: 2 }}>
                {clinic.address} · Ph: {clinic.phone}
              </div>
              <div style={{ fontSize: 8, color: '#555555' }}>
                NTN: {clinic.ntn || '—'} · Reg: {clinic.accreditation || 'PBMC'}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

            {/* Slip Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5 }}>
              <span>ISSUED: {printTimestamp}</span>
            </div>
            <div style={{ fontSize: 9.5, marginTop: 2 }}>
              <span>CASHIER/DESK: RECEPTION-02 (OPD)</span>
            </div>

            <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

            {/* Content Switch by Type */}
            {type === 'token' && (
              <>
                <div style={{ textAlign: 'center', margin: '8px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                    CONSULTATION TOKEN SLIP
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      letterSpacing: '-1px',
                      padding: '4px 0',
                      border: '2px solid #000000',
                      margin: '6px auto',
                      width: '80%',
                    }}
                  >
                    {data.token || 'T-001'}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>PLEASE PROCEED TO QUEUE WAITING LOUNGE</div>
                </div>

                <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

                <div style={{ fontSize: 10.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>PATIENT:</span>
                    <span>{data.patient || data.patientName || 'Walk-in Patient'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>MRN / PID:</span>
                    <span>{data.pid || data.patientId || 'MED-2026'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>CONSULTANT:</span>
                    <span>{data.doctor || 'Dr. On Duty'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>DEPARTMENT:</span>
                    <span>{data.dept || 'General OPD'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>ROOM NO:</span>
                    <span style={{ fontWeight: 900 }}>{data.room || 'Room 102'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>SLOT TIME:</span>
                    <span>{data.time || '10:30 AM'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ fontWeight: 700 }}>FEE STATUS:</span>
                    <span style={{ fontWeight: 800 }}>PAID ({clinic.currency || 'Rs.'} 2,000)</span>
                  </div>
                </div>
              </>
            )}

            {type === 'billing' && (
              <>
                <div style={{ textAlign: 'center', margin: '6px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                    OFFICIAL CASH RECEIPT
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, margin: '2px 0' }}>
                    INVOICE #{data.invoiceNo || data.id || 'INV-2026-001'}
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

                <div style={{ fontSize: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PATIENT:</span>
                    <span style={{ fontWeight: 700 }}>{data.patientName || data.patient || 'Patient'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MRN:</span>
                    <span>{data.patientId || data.pid || 'MED-001'}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #000000', margin: '6px 0' }} />

                <div style={{ fontSize: 9.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderBottom: '1px dashed #000', paddingBottom: 2 }}>
                    <span>ITEM DESCRIPTION</span>
                    <span>AMOUNT</span>
                  </div>
                  {(data.items || [
                    { name: 'OPD Consultation Fee', cost: 2000 },
                    { name: 'Vital Signs & Triage', cost: 500 },
                  ]).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
                      <span style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name || item.description}
                      </span>
                      <span>{clinic.currency || 'Rs.'} {(item.cost || item.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

                <div style={{ fontSize: 11, fontWeight: 700 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SUBTOTAL:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.subtotal || data.total || 2500).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>TAX / GST (0%):</span>
                    <span>{clinic.currency || 'Rs.'} 0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900, borderTop: '1px solid #000', paddingTop: 3, marginTop: 3 }}>
                    <span>TOTAL PAID:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.total || data.amountPaid || 2500).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, marginTop: 2 }}>
                    <span>PAYMENT METHOD:</span>
                    <span>{data.paymentMethod || 'CASH AT COUNTER'}</span>
                  </div>
                </div>
              </>
            )}

            {/* Shift Close Reconciliation Receipt */}
            {type === 'shift' && (
              <>
                <div style={{ textAlign: 'center', margin: '6px 0 10px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    DAILY CASH SHIFT CLOSE & RECONCILE
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2 }}>
                    SHIFT ID: {data.shiftId || 'SHIFT-01'}
                  </div>
                </div>

                <div style={{ fontSize: 9.5, margin: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CASHIER ON DUTY:</span>
                    <strong>{data.cashier || 'Receptionist'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SUPERVISOR:</span>
                    <strong>{data.supervisor || clinic.doctorInCharge || 'Clinic Manager'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SHIFT HOURS:</span>
                    <span>{data.shiftHours || '09:00 AM – 08:30 PM'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PATIENTS BILLED:</span>
                    <strong>{data.invoicesCount || 0} visits</strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

                {/* Financial Summary */}
                <div style={{ fontSize: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>EXPECTED SYSTEM CASH:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.cashTotal || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span>CARD / JAZZCASH / ONLINE:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.digitalTotal || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, borderTop: '1px solid #000', paddingTop: 3, marginTop: 3 }}>
                    <span>TOTAL SHIFT REVENUE:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.totalCollected || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />

                {/* Physical Cash Count & Denominations */}
                <div style={{ fontSize: 9 }}>
                  <div style={{ fontWeight: 800, marginBottom: 3, textTransform: 'uppercase' }}>
                    DRAWER PHYSICAL CURRENCY COUNT:
                  </div>
                  {data.denominations && Object.keys(data.denominations).length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
                      {Object.entries(data.denominations).map(([note, count]) => (
                        <div key={note} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Rs. {note} × {count}:</span>
                          <span>{clinic.currency || 'Rs.'} {(Number(note) * Number(count)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>Physical drawer verified without note count breakdown.</div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: 4, borderTop: '1px dashed #000', paddingTop: 2 }}>
                    <span>COUNTED PHYSICAL CASH:</span>
                    <span>{clinic.currency || 'Rs.'} {(data.countedCash || data.cashTotal || 0).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: 2 }}>
                    <span>RECONCILE VARIANCE:</span>
                    <span style={{ color: (data.variance || 0) === 0 ? '#000' : (data.variance || 0) < 0 ? '#b91c1c' : '#047857' }}>
                      {(data.variance || 0) === 0
                        ? 'EXACT MATCH (0)'
                        : `${(data.variance || 0) > 0 ? '+' : ''}${clinic.currency || 'Rs.'} ${(data.variance || 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Doctor Split Breakdown */}
                {data.doctorBreakdown && data.doctorBreakdown.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px dashed #000000', margin: '6px 0' }} />
                    <div style={{ fontSize: 9 }}>
                      <div style={{ fontWeight: 800, marginBottom: 3 }}>CONSULTANT REVENUE SHARE:</div>
                      {data.doctorBreakdown.map((doc, di) => (
                        <div key={di} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                          <span style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.doctor} ({doc.count})
                          </span>
                          <strong>{clinic.currency || 'Rs.'} {(doc.amount || 0).toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ borderTop: '1px dashed #000000', margin: '10px 0 6px 0' }} />

                {/* Dual Signature Lines */}
                <div style={{ fontSize: 8.5, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div>_____________________</div>
                      <div style={{ fontWeight: 700, marginTop: 2 }}>CASHIER SIGNATURE</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>_____________________</div>
                      <div style={{ fontWeight: 700, marginTop: 2 }}>MANAGER SIGNATURE</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ borderTop: '1px dashed #000000', margin: '8px 0 6px 0' }} />

            {/* Realistic Barcode & QR Code Section */}
            <div style={{ textAlign: 'center', margin: '8px 0 6px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <QrCode
                  value={`https://hospital-management-system-five-amber.vercel.app/patient-portal?ref=${data.token || data.invoiceNo || 'MED-98124501'}`}
                  size={clinic.paperWidth === '58mm' ? 80 : 96}
                />
                <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.5px', marginTop: 2 }}>
                  SCAN FOR LIVE QUEUE & DIGITAL RECORD
                </div>
              </div>

              {/* CSS Barcode Simulation */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  height: 24,
                  gap: '2px',
                  margin: '8px auto 0 auto',
                  width: '80%',
                }}
              >
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}px`,
                      background: i % 2 === 0 ? '#000000' : 'transparent',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 8.5, letterSpacing: '2.5px', marginTop: 2 }}>
                *{data.token || data.invoiceNo || 'MED-98124501'}*
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div style={{ textAlign: 'center', fontSize: 8, color: '#333333', marginTop: 6 }}>
              <div>{clinic.receiptFooter || 'Notice: Valid for today only. Retain for token announcement.'}</div>
              <div style={{ marginTop: 3, fontWeight: 700 }}>*** {clinic.thankYouMessage || 'THANK YOU FOR CHOOSING OUR CLINIC'} ***</div>
            </div>

            {/* Bottom Tear Line */}
            <div
              style={{
                textAlign: 'center',
                letterSpacing: '2px',
                fontSize: 9,
                color: '#666666',
                marginTop: 6,
                borderTop: '1px dashed #000000',
                paddingTop: 4,
              }}
            >
              ✂ - - - - - - - - - - - - - - - - - - -
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--c-surface)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
            Preset for <strong>80mm / 3.15"</strong> continuous roll
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                width: 32,
                height: 32,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm, 6px)',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                cursor: 'pointer',
              }}
              onClick={handleSendWhatsApp}
              title="Send via WhatsApp"
              aria-label="Send via WhatsApp"
            >
              <WhatsAppIcon size={18} color="#ffffff" />
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700 }}
              onClick={handlePrint}
            >
              <Icon name="print" /> Print Thermal (80mm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
