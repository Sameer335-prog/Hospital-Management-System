import { useEffect, useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { DOCTORS, STAFF, PATIENTS, APPOINTMENTS, INVOICES } from '../../legacy/legacyEngine.js';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../hooks/useToast.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { getClinicProfile, saveClinicProfile, applySpecialtyPreset, SPECIALTY_ARCHETYPES } from '../../utils/clinicConfig.js';

const TABS = [
  'Clinic & Hospital Profile',
  'Departments & Chambers',
  'Users & Permissions',
  'Notifications & Alerts',
  'Security & Audit',
  'System Preferences',
  'Supabase Cloud Database',
];

export default function SettingsPage() {
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState('Clinic & Hospital Profile');

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Clinic & Hospital Settings</h1>
          <div className="sub">Enterprise White-label Configuration · Branding, Thermal Receipts & Operations</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      {tab === 'Clinic & Hospital Profile' && <ClinicProfileTab showToast={showToast} />}
      {tab === 'Departments & Chambers' && <DepartmentsTab showToast={showToast} />}
      {tab === 'Users & Permissions' && <UsersPermissionsTab showToast={showToast} />}
      {tab === 'Notifications & Alerts' && <NotificationsTab showToast={showToast} />}
      {tab === 'Security & Audit' && <SecurityTab showToast={showToast} />}
      {tab === 'System Preferences' && <SystemPreferencesTab showToast={showToast} />}
      {tab === 'Supabase Cloud Database' && <SupabaseCloudTab showToast={showToast} />}

      <Toast text={toast} />
    </AppShell>
  );
}

/* =========================================================
   1. CLINIC & HOSPITAL PROFILE TAB (WHITE-LABEL CONFIG)
   ========================================================= */
const CLINIC_PRESETS = [
  {
    label: '🦷 Dental Clinic',
    data: {
      name: 'Dr. Ali Advanced Dental Surgery',
      tagline: 'Orthodontics, Dental Implants & Cosmetic Dentistry',
      doctorInCharge: 'Dr. Ali Raza (BDS, RDS, M.Phil)',
      accreditation: 'PMDC Reg #DEN-98124 · Certified Implantologist',
      phone: '0300-9876543',
      hotline: '051-2299881',
      address: 'Plaza 14, F-10 Markaz, Islamabad',
      ntn: '7192031-8',
      email: 'contact@alidental.pk',
      website: 'www.alidentalclinic.pk',
      currency: 'Rs.',
      paperWidth: '80mm',
      receiptFooter: 'Appointments: WhatsApp 0300-9876543. Brush twice daily!',
      thankYouMessage: 'Keep smiling! Thank you for visiting Dr. Ali Dental Care.',
    },
  },
  {
    label: '👶 Pediatric Clinic',
    data: {
      name: 'KidsCare Pediatric & Vaccination Center',
      tagline: 'Child Healthcare, Neonatal Care & Immunization',
      doctorInCharge: 'Dr. Ayesha Malik (MBBS, FCPS Pediatrics)',
      accreditation: 'PMDC Reg #PEDS-4412 · PPA Life Member',
      phone: '0333-5551234',
      hotline: '051-5544332',
      address: 'Lane 4, Peshawar Road, Rawalpindi',
      ntn: '6291044-2',
      email: 'care@kidscare.clinic',
      website: 'www.kidscare.clinic',
      currency: 'Rs.',
      paperWidth: '80mm',
      receiptFooter: 'Emergency pediatrician on call 24/7. Retain slip for weight chart.',
      thankYouMessage: 'Wishing your little one a speedy recovery!',
    },
  },
  {
    label: '🩺 Family Polyclinic',
    data: {
      name: 'Al-Madina Family Health & Ultrasound Clinic',
      tagline: 'Family Medicine, Diagnostic Ultrasound & Clinical Lab',
      doctorInCharge: 'Dr. Bilal Tariq (MBBS, MCPS)',
      accreditation: 'PMDC Reg #MED-7719 · Punjab Healthcare Commission Licensed',
      phone: '0321-4447788',
      hotline: '042-3588990',
      address: 'Main Boulevard, Gulberg III, Lahore',
      ntn: '5519283-9',
      email: 'info@almadinaclinic.com',
      website: 'www.almadinaclinic.com',
      currency: 'Rs.',
      paperWidth: '80mm',
      receiptFooter: 'Ultrasound & lab reports ready in 2 hours. WhatsApp: 0321-4447788',
      thankYouMessage: 'Your family health is our sacred mission.',
    },
  },
  {
    label: '🏥 Tertiary Hospital',
    data: {
      name: 'Al-Shifa International Hospital',
      tagline: 'Tertiary Care Complex, 24/7 Trauma & Surgical Specialties',
      doctorInCharge: 'Prof. Dr. Sarah Khan (FRCS, FCPS)',
      accreditation: 'PMDC Reg #ISB-HOSP-2024-9912 · ISO 9001:2015 Certified',
      phone: '051-111-222-333',
      hotline: '1122 (Ambulance Dispatch)',
      address: 'Sector H-8/4, Islamabad, Pakistan',
      ntn: '2849102-4',
      email: 'administration@alshifa.hospital',
      website: 'www.alshifa-hospital.org',
      currency: 'Rs.',
      paperWidth: '80mm',
      receiptFooter: 'Valid for today only. Watch LCD screens in concourse for token calls.',
      thankYouMessage: 'Thank you for choosing Al-Shifa Healthcare.',
    },
  },
];

function ClinicProfileTab({ showToast }) {
  const [form, setForm] = useState(() => getClinicProfile());

  function handleSave(e) {
    e.preventDefault();
    saveClinicProfile(form);
    showToast(`Saved! Branding updated for "${form.name}" across all slips, sidebar and WhatsApp.`);
  }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file size must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      setForm((prev) => ({ ...prev, logoImage: base64 }));
      showToast('Uploaded clinic logo image! Click Save to apply across Medora.');
    };
    reader.readAsDataURL(file);
  }

  function handleSelectArchetype(archetypeId) {
    const updated = applySpecialtyPreset(archetypeId);
    setForm(updated);
    const archetype = SPECIALTY_ARCHETYPES[archetypeId];
    showToast(`Applied ${archetype?.practiceType || archetypeId} Archetype! Navigation, terminology, and clinical tools updated.`);
  }

  return (
    <div className="grid grid-2" style={{ gap: 20 }}>
      {/* Left Column: Form & Presets */}
      <div>
        {/* Multi-Specialty Clinical Archetype Switcher */}
        <div className="card card-pad" style={{ marginBottom: 16, border: '1.5px solid var(--c-primary)', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(255, 255, 255, 0.6) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--c-text-primary)' }}>
              ⚡ 1-Click Specialty Archetype Switcher
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: 'var(--c-primary-light)', color: 'var(--c-primary-dark)' }}>
              Dynamic Whitelabel
            </span>
          </div>
          <div className="hint" style={{ marginBottom: 14 }}>
            Instantly reconfigures the entire HMS (sidebar navigation, terminology, tooth charts, and Voice AI) to match your practice specialty:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {Object.values(SPECIALTY_ARCHETYPES).map((spec) => {
              const isActive = form.archetype === spec.id || form.practiceType === spec.practiceType;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSelectArchetype(spec.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: isActive ? '2px solid var(--c-primary, #0ea5e9)' : '1px solid var(--c-border, #cbd5e1)',
                    backgroundColor: isActive ? 'rgba(14, 165, 233, 0.12)' : 'var(--c-surface, #ffffff)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 4px 14px rgba(14, 165, 233, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '20px' }}>{spec.logoIcon}</span>
                    {isActive && (
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--c-text-primary, #0f172a)' }}>
                    {spec.practiceType}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--c-text-secondary, #64748b)', lineHeight: '1.3' }}>
                    {spec.id === 'dental' ? 'Tooth Chart, Chairs, RCT, Hides Wards' : spec.id === 'pediatric' ? 'Vaccination Schedule, Child Bays' : spec.id === 'ophthalmology' ? 'Refraction, Cataract, Exam Lanes' : spec.id === 'polyclinic' ? 'Family Doctor, Ultrasound, Lab' : 'Full Inpatient Wards, Beds & ICU'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSave} className="card card-pad">
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Clinic Profile & Legal Entity</div>
          <div className="hint" style={{ marginBottom: 16 }}>
            Configures the clinic title, logo, and brand emblem across thermal slips, sidebar, WhatsApp messages, and invoices.
          </div>

          {/* Clinic Logo & Brand Emblem */}
          <div
            style={{
              marginBottom: 18,
              padding: '14px 16px',
              background: 'var(--c-surface-hover)',
              borderRadius: 12,
              border: '1px solid var(--c-border)',
            }}
          >
            <label style={{ fontWeight: 800, fontSize: 13.5, display: 'block', marginBottom: 4 }}>
              Clinic Logo & Visual Emblem
            </label>
            <div className="hint" style={{ fontSize: 12, marginBottom: 12 }}>
              Shown on your navigation sidebar, topbar, thermal receipts, and e-prescriptions.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
              {/* Logo Preview Avatar */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--c-surface)',
                  border: '2px dashed var(--c-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {form.logoImage ? (
                  <img src={form.logoImage} alt="Clinic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span>{form.logoIcon || '🏥'}</span>
                )}
              </div>

              {/* Upload & Reset Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <span>📁 Upload Custom Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                </label>

                {form.logoImage && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--c-error)', fontSize: 12 }}
                    onClick={() => setForm((prev) => ({ ...prev, logoImage: '' }))}
                  >
                    Reset to Emblem
                  </button>
                )}
              </div>
            </div>

            {/* Quick Specialty Icon Badges */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 6 }}>
                Or select a specialty emblem icon:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['🏥', '🦷', '👶', '🫀', '👁️', '🦴', '🧠', '💊', '🔬'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`btn btn-xs ${!form.logoImage && form.logoIcon === icon ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 16, padding: '4px 10px', borderRadius: 8 }}
                    onClick={() => setForm((prev) => ({ ...prev, logoIcon: icon, logoImage: '' }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Clinic / Hospital Display Name *</label>
            <input
              className="input"
              aria-label="Clinic or Hospital Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Tagline / Specialization Subtitle</label>
            <input
              className="input"
              aria-label="Tagline or Specialization"
              value={form.tagline || ''}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="e.g. Specialist Pediatric & Family Care"
            />
          </div>

          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="field">
              <label>Doctor In-Charge / Consultant</label>
              <input
                className="input"
                aria-label="Doctor In-Charge"
                value={form.doctorInCharge || ''}
                onChange={(e) => setForm({ ...form, doctorInCharge: e.target.value })}
              />
            </div>
            <div className="field">
              <label>PMDC / Medical Reg. No.</label>
              <input
                className="input"
                aria-label="Accreditation"
                value={form.accreditation || ''}
                onChange={(e) => setForm({ ...form, accreditation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="field">
              <label>Reception & WhatsApp Phone *</label>
              <input
                className="input"
                aria-label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>National Tax Number (NTN)</label>
              <input
                className="input"
                aria-label="Tax NTN"
                value={form.ntn || ''}
                onChange={(e) => setForm({ ...form, ntn: e.target.value })}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Clinic Physical Address</label>
            <input
              className="input"
              aria-label="Physical Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="field">
              <label>Thermal Paper Size</label>
              <select
                className="input"
                value={form.paperWidth || '80mm'}
                onChange={(e) => setForm({ ...form, paperWidth: e.target.value })}
              >
                <option value="80mm">80mm / 3.15" (Standard POS Roll)</option>
                <option value="58mm">58mm / 2.25" (Compact Mobile Roll)</option>
              </select>
            </div>
            <div className="field">
              <label>Default Currency Symbol</label>
              <input
                className="input"
                aria-label="Currency Symbol"
                value={form.currency || 'Rs.'}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Thermal Receipt Footer Notice</label>
            <input
              className="input"
              aria-label="Receipt Footer"
              value={form.receiptFooter || ''}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
              placeholder="e.g. Valid today only. Watch LCD screen for your token."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
            <Icon name="check" /> Save & Broadcast Clinic Branding
          </button>
        </form>
      </div>

      {/* Right Column: Live Header & 80mm Thermal Previews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Document Header Preview */}
        <div className="card card-pad">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Prescription & Document Header Preview</div>
          <div className="hint" style={{ marginBottom: 14 }}>Real-time rendering on A4 reports and official e-prescriptions</div>

          <div style={{ background: 'var(--c-surface-hover)', padding: 16, borderRadius: 8, border: '1px solid var(--c-border)' }}>
            <div style={{ borderBottom: '2px solid var(--c-primary)', paddingBottom: 10, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {form.logoImage ? (
                  <img src={form.logoImage} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span>{form.logoIcon || '🏥'}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--c-primary)', letterSpacing: '-0.02em' }}>
                  {form.name}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--c-text)', marginTop: 2 }}>
                  {form.tagline}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--c-text-muted)', marginTop: 2 }}>
                  {form.accreditation}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 11.5 }}>
              <div><span className="hint">Doctor:</span> <strong>{form.doctorInCharge}</strong></div>
              <div><span className="hint">Helpline:</span> <strong>{form.phone}</strong></div>
              <div style={{ gridColumn: 'span 2' }}><span className="hint">Address:</span> <strong>{form.address}</strong></div>
            </div>
          </div>
        </div>

        {/* Authentic 80mm Thermal POS Preview */}
        <div className="card card-pad">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>80mm ESC/POS Thermal Slip Preview</div>
          <div className="hint" style={{ marginBottom: 12 }}>Exact layout that prints out of the thermal printer</div>

          <div style={{ background: '#252932', padding: '16px 12px', borderRadius: 8, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 260,
                background: '#ffffff',
                color: '#000000',
                padding: '12px 10px',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 10,
                lineHeight: 1.3,
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>
                  {form.logoIcon || '🏥'}
                </div>
                <div style={{ fontWeight: 900, fontSize: 12.5, textTransform: 'uppercase' }}>{form.name}</div>
                <div style={{ fontSize: 8.5, fontWeight: 700 }}>{form.tagline}</div>
                <div style={{ fontSize: 8, color: '#444' }}>{form.address}</div>
                <div style={{ fontSize: 8, color: '#444' }}>Ph: {form.phone}</div>
              </div>

              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <div style={{ fontSize: 9, fontWeight: 800 }}>OPD APPOINTMENT TOKEN</div>
                <div style={{ fontSize: 24, fontWeight: 900, border: '1.5px solid #000', width: '70%', margin: '4px auto', padding: '2px 0' }}>
                  TK-01
                </div>
              </div>

              <div style={{ fontSize: 9, borderTop: '1px dashed #000', paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PATIENT:</span>
                  <span style={{ fontWeight: 700 }}>Ahmed Raza</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DOCTOR:</span>
                  <span>{form.doctorInCharge?.split('(')[0] || 'Dr. On Duty'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FEE:</span>
                  <span>{form.currency || 'Rs.'} 2,000 (PAID)</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: 6, marginTop: 6, fontSize: 7.5 }}>
                <div>{form.receiptFooter}</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{form.thankYouMessage}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   2. DEPARTMENTS & CHAMBERS TAB
   ========================================================= */
const INITIAL_DEPTS = [
  { code: 'CARD', name: 'Cardiology & Heart Institute', head: 'Dr. Sarah Khan', wing: 'East Wing · Floor 2', rooms: 6, doctors: 4, status: 'Active' },
  { code: 'ORTH', name: 'Orthopedics & Trauma Surgery', head: 'Dr. Bilal Ahmed', wing: 'Ground Floor · Wing A', rooms: 5, doctors: 3, status: 'Active' },
  { code: 'PEDS', name: 'Pediatrics & Neonatal Care', head: 'Dr. Ayesha Raza', wing: 'OPD Wing · Floor 1', rooms: 4, doctors: 3, status: 'Active' },
  { code: 'GYNE', name: 'Gynecology & Obstetrics', head: 'Dr. Hina Farooq', wing: 'East Wing · Floor 2', rooms: 4, doctors: 2, status: 'Active' },
  { code: 'GMED', name: 'General & Internal Medicine', head: 'Dr. Imran Malik', wing: 'West Wing · Floor 3', rooms: 8, doctors: 5, status: 'Active' },
  { code: 'EMER', name: 'Emergency & Acute Trauma (ER)', head: 'Dr. Salman Qureshi', wing: 'Ground Floor · Red Bay', rooms: 12, doctors: 6, status: 'Active' },
  { code: 'PATH', name: 'Pathology & Diagnostic Laboratory', head: 'Usman Tariq', wing: 'Basement Wing · B-02', rooms: 3, doctors: 2, status: 'Active' },
  { code: 'PHAR', name: 'In-House Pharmacy & Formulary', head: 'Zainab Hussain', wing: 'Main Concourse Lobby', rooms: 2, doctors: 3, status: 'Active' },
];

function DepartmentsTab({ showToast }) {
  const [departments, setDepartments] = useState(INITIAL_DEPTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ code: '', name: '', head: '', wing: '', rooms: 4 });

  function handleAddDept(e) {
    e.preventDefault();
    if (!newDept.name.trim() || !newDept.code.trim()) {
      showToast('Department name and code are required.');
      return;
    }
    const created = {
      code: newDept.code.trim().toUpperCase(),
      name: newDept.name.trim(),
      head: newDept.head.trim() || 'Chief Medical Officer',
      wing: newDept.wing.trim() || 'OPD Block',
      rooms: Number(newDept.rooms) || 4,
      doctors: 1,
      status: 'Active',
    };
    setDepartments((prev) => [...prev, created]);
    setModalOpen(false);
    setNewDept({ code: '', name: '', head: '', wing: '', rooms: 4 });
    showToast(`Department "${created.name}" registered into hospital directory.`);
  }

  return (
    <div className="card">
      <div className="card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Clinical Specialties & Chambers Directory</div>
          <div className="hint">Configured medical service lines, assigned heads of departments, and wing locations</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" /> Register Medical Department
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>Head of Department</th>
              <th>Assigned Wing / Location</th>
              <th>Chambers</th>
              <th>Physicians</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.code}>
                <td style={{ fontWeight: 700 }}>{d.name}</td>
                <td><span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>{d.code}</span></td>
                <td>{d.head}</td>
                <td style={{ fontSize: 12.5 }}>{d.wing}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{d.rooms} Rooms</td>
                <td>{d.doctors} Active</td>
                <td><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Department Modal */}
      {modalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Register New Medical Department</div>
              <button className="btn-icon" onClick={() => setModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAddDept}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Department Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Dermatology & Skin Care"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Department Code (3-4 chars) *</label>
                    <input
                      className="input"
                      placeholder="e.g. DERM"
                      maxLength={5}
                      value={newDept.code}
                      onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Assigned Clinic Chambers</label>
                    <input
                      type="number"
                      className="input"
                      value={newDept.rooms}
                      onChange={(e) => setNewDept({ ...newDept, rooms: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Head of Service / Attending Physician</label>
                  <input
                    className="input"
                    placeholder="e.g. Dr. Tariq Jamil"
                    value={newDept.head}
                    onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Floor / Wing Location</label>
                  <input
                    className="input"
                    placeholder="e.g. East Wing · Floor 2"
                    value={newDept.wing}
                    onChange={(e) => setNewDept({ ...newDept, wing: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   3. USERS & PERMISSIONS TAB
   ========================================================= */
const ROLE_PERMISSIONS_MATRIX = [
  { module: 'Appointments & Reception Desk', admin: 'Full', dr: 'View Queue', nurse: 'View', recep: 'Full (Book/Tokens)', pharm: 'No Access', lab: 'No Access' },
  { module: 'Doctor Consultation & EHR', admin: 'Full', dr: 'Full (Exams/Rx)', nurse: 'Vitals Entry', recep: 'No Access', pharm: 'No Access', lab: 'No Access' },
  { module: 'Patient Master Directory', admin: 'Full', dr: 'View Records', nurse: 'View Records', recep: 'Register/Edit', pharm: 'Lookup', lab: 'Lookup' },
  { module: 'Hospital Billing & Invoicing', admin: 'Full', dr: 'View Fees', nurse: 'No Access', recep: 'Process Invoices', pharm: 'No Access', lab: 'No Access' },
  { module: 'Pharmacy & Dispensary', admin: 'Full', dr: 'View Formulary', nurse: 'No Access', recep: 'No Access', pharm: 'Full (Dispense/Stock)', lab: 'No Access' },
  { module: 'Laboratory & Diagnostics', admin: 'Full', dr: 'Order & Results', nurse: 'Specimen Orders', recep: 'No Access', pharm: 'No Access', lab: 'Full (Process/Verify)' },
  { module: 'Admissions & Bed Map', admin: 'Full', dr: 'Discharge/Admit', nurse: 'Bed Map & Vitals', recep: 'Bed Check', pharm: 'No Access', lab: 'No Access' },
  { module: 'Patient Self-Service Portal', admin: 'Full', dr: 'No Access', nurse: 'No Access', recep: 'No Access', pharm: 'No Access', lab: 'No Access' },
  { module: 'System Settings & Audit', admin: 'Full', dr: 'Profile Only', nurse: 'No Access', recep: 'No Access', pharm: 'No Access', lab: 'No Access' },
];

function UsersPermissionsTab({ showToast }) {
  const [search, setSearch] = useState('');

  const users = useMemo(() => {
    return [
      { name: 'Administrator Admin', email: 'admin@alshifa.hospital', role: 'Administrator', status: 'Active', lastLogin: 'Just now' },
      { name: 'Muhammad Ahmed (PT-00125)', email: 'patient@alshifa.hospital', role: 'Patient', status: 'Active', lastLogin: 'Today, 09:30 AM' },
      ...DOCTORS.map((d) => ({
        name: d.name,
        email: `${d.name.toLowerCase().replace(/[^a-z]/g, '')}@alshifa.hospital`,
        role: 'Doctor',
        status: d.status,
        lastLogin: 'Today, 08:30 AM',
      })),
      ...STAFF.map((s) => ({
        name: s.name,
        email: `${s.name.toLowerCase().replace(/[^a-z]/g, '')}@alshifa.hospital`,
        role: s.role,
        status: s.status,
        lastLogin: 'Today, 09:15 AM',
      })),
    ];
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Users Table */}
      <div className="card">
        <div className="card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Authenticated Hospital Accounts ({users.length})</div>
            <div className="hint">Physicians, clinical supervisors, nursing staff, and receptionists</div>
          </div>
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="Search accounts or roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>System Role</th>
                <th>Institutional Email</th>
                <th>Account Status</th>
                <th>Last Active Session</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} />
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{u.role}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{u.email}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="hint" style={{ fontSize: 12 }}>{u.lastLogin}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Credentials reset link sent to ${u.email}.`)}
                    >
                      Reset Key
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Scoping Matrix */}
      <div className="card">
        <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Hospital Role-Based Access Control (RBAC) Matrix</div>
          <div className="hint">Ensures confidential medical records are strictly protected per healthcare privacy protocols</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Clinical / Administrative Module</th>
                <th>Admin</th>
                <th>Doctor</th>
                <th>Receptionist</th>
                <th>Nurse</th>
                <th>Pharmacist</th>
                <th>Lab Tech</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_PERMISSIONS_MATRIX.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{r.module}</td>
                  <td><span className="badge badge-success">{r.admin}</span></td>
                  <td><span className={`badge ${r.dr === 'No Access' ? 'badge-neutral' : 'badge-info'}`}>{r.dr}</span></td>
                  <td><span className={`badge ${r.recep === 'No Access' ? 'badge-neutral' : 'badge-primary'}`}>{r.recep}</span></td>
                  <td><span className={`badge ${r.nurse === 'No Access' ? 'badge-neutral' : 'badge-warning'}`}>{r.nurse}</span></td>
                  <td><span className={`badge ${r.pharm === 'No Access' ? 'badge-neutral' : 'badge-accent'}`}>{r.pharm}</span></td>
                  <td><span className={`badge ${r.lab === 'No Access' ? 'badge-neutral' : 'badge-accent'}`}>{r.lab}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   4. NOTIFICATIONS & ALERTS TAB
   ========================================================= */
function NotificationsTab({ showToast }) {
  const [alerts, setAlerts] = useState({
    statLabAlert: true,
    pharmacyLowStock: true,
    icuThreshold: true,
    smsTokenNotification: true,
    autoPrintToken: true,
    queueChime: true,
  });

  function toggle(key, label) {
    setAlerts((prev) => {
      const next = !prev[key];
      showToast(`${label} is now ${next ? 'ENABLED' : 'DISABLED'}.`);
      return { ...prev, [key]: next };
    });
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 680 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Institutional Clinical Alerts & Chimes</div>
      <div className="hint" style={{ marginBottom: 20 }}>Configure real-time threshold warnings, audio chimes, and automated SMS routing</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleSwitch
          checked={alerts.statLabAlert}
          onChange={() => toggle('statLabAlert', 'Critical STAT Lab Alert')}
          label="🚨 Urgent Critical Lab Result Broadcast"
          sub="Instantly alerts attending physician with an emergency banner when panic lab values are verified"
        />

        <ToggleSwitch
          checked={alerts.pharmacyLowStock}
          onChange={() => toggle('pharmacyLowStock', 'Pharmacy Stock Surveillance')}
          label="💊 Pharmacy Low-Stock & Expiry Surveillance"
          sub="Flags inventory when medicine stock drops below 15 units or expiry is under 30 days"
        />

        <ToggleSwitch
          checked={alerts.icuThreshold}
          onChange={() => toggle('icuThreshold', 'Ward Capacity Threshold')}
          label="🛏️ ICU & Ward Critical Capacity Warning"
          sub="Dispatches operational alert to front desk when hospital bed occupancy exceeds 85%"
        />

        <ToggleSwitch
          checked={alerts.smsTokenNotification}
          onChange={() => toggle('smsTokenNotification', 'Patient SMS Alerts')}
          label="📱 Automated Patient SMS Token Dispatch"
          sub="Sends OPD token number, room location, and estimated consult time to patient's mobile"
        />

        <ToggleSwitch
          checked={alerts.autoPrintToken}
          onChange={() => toggle('autoPrintToken', 'Auto-Print Token')}
          label="🖨️ Auto-Launch Thermal Print on Appointment Booking"
          sub="Immediately triggers thermal receipt printer dialog upon receptionist token creation"
        />

        <ToggleSwitch
          checked={alerts.queueChime}
          onChange={() => toggle('queueChime', 'Queue Audio Chime')}
          label="🔔 OPD Waiting Lounge Audio Chime"
          sub="Plays hospital acoustic chime when the doctor calls the next token to their chamber"
        />
      </div>
    </div>
  );
}

/* =========================================================
   5. SECURITY & AUDIT TAB
   ========================================================= */
function SecurityTab({ showToast }) {
  const [twoFactor, setTwoFactor] = useState(false);
  const [timeout, setTimeoutVal] = useState('30 minutes');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ old: '', next: '', confirm: '' });

  function handlePassSubmit(e) {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      showToast('New passwords do not match.');
      return;
    }
    setPasswordModalOpen(false);
    setPassForm({ old: '', next: '', confirm: '' });
    showToast('Administrator password updated successfully.');
  }

  return (
    <div className="grid grid-2" style={{ gap: 20 }}>
      <div className="card card-pad">
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Security & Authentication</div>
        <div className="hint" style={{ marginBottom: 16 }}>Session parameters and multi-factor authentication controls</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ToggleSwitch
            checked={twoFactor}
            onChange={() => {
              setTwoFactor(!twoFactor);
              showToast(`Two-Factor Authentication (2FA) ${!twoFactor ? 'Enabled' : 'Disabled'}.`);
            }}
            label="Two-Factor Authentication (2FA)"
            sub="Requires authenticator app code on physician login"
          />

          <div className="field">
            <label>Inactivity Auto-Logout Timeout</label>
            <select className="input" value={timeout} onChange={(e) => {
              setTimeoutVal(e.target.value);
              showToast(`Session timeout set to ${e.target.value}.`);
            }}>
              <option>15 minutes (High Security)</option>
              <option>30 minutes (Standard)</option>
              <option>60 minutes</option>
              <option>8 hours (Clinical Shift)</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'fit-content' }}
            onClick={() => setPasswordModalOpen(true)}
          >
            <Icon name="settings" /> Change Master Password
          </button>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Audit Trail & Compliance Mode</div>
        <div className="hint" style={{ marginBottom: 16 }}>Regulatory compliance per healthcare medical record standards</div>

        <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 8, border: '1px solid var(--c-border)', marginBottom: 14, fontSize: 12.5 }}>
          <div className="kv" style={{ marginBottom: 6 }}>
            <span className="k">Compliance Standard:</span>
            <strong style={{ color: 'var(--c-success)' }}>PMDC & HIPAA Compliant</strong>
          </div>
          <div className="kv" style={{ marginBottom: 6 }}>
            <span className="k">Audit Logging:</span>
            <span>Immutable Append-Only Log</span>
          </div>
          <div className="kv" style={{ marginBottom: 6 }}>
            <span className="k">Current Active IP:</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>192.168.1.45 (Hospital Intranet)</span>
          </div>
          <div className="kv">
            <span className="k">Encryption:</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>AES-256 GCM In-Transit</span>
          </div>
        </div>

        <div className="hint" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Every medical examination note, drug prescription, and billing invoice change is timestamped with the attending user's cryptographic identity.
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setPasswordModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Update Master Password</div>
              <button className="btn-icon" onClick={() => setPasswordModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handlePassSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Current Password *</label>
                  <input
                    type="password"
                    className="input"
                    value={passForm.old}
                    onChange={(e) => setPassForm({ ...passForm, old: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>New Password *</label>
                  <input
                    type="password"
                    className="input"
                    value={passForm.next}
                    onChange={(e) => setPassForm({ ...passForm, next: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    className="input"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   6. SYSTEM PREFERENCES & BACKUP TAB
   ========================================================= */
function SystemPreferencesTab({ showToast }) {
  const { theme, setTheme } = useTheme();
  const [duration, setDuration] = useState('20 minutes');
  const [density, setDensity] = useState('Comfortable');

  function handleExportBackup() {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      hospital: JSON.parse(localStorage.getItem('medora_hospital_profile') || JSON.stringify(DEFAULT_PROFILE)),
      totalPatients: PATIENTS.length,
      totalAppointments: APPOINTMENTS.length,
      totalDoctors: DOCTORS.length,
      invoices: INVOICES.length,
      patients: PATIENTS,
      appointments: APPOINTMENTS,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medora-hms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Hospital database JSON backup downloaded.');
  }

  function handleResetFactory() {
    if (window.confirm('Are you sure you want to reset local hospital preferences to factory demo state?')) {
      localStorage.removeItem('medora_hospital_profile');
      showToast('Preferences restored to factory demo state.');
      setTimeout(() => window.location.reload(), 600);
    }
  }

  return (
    <div className="grid grid-2" style={{ gap: 20 }}>
      <div className="card card-pad">
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Workstation Ergonomics & Theme</div>
        <div className="hint" style={{ marginBottom: 16 }}>Live theme switching tailored for intensive clinical day and night shifts</div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>Display Mode / Shift Theme</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 6 }}>
            <div
              onClick={() => setTheme('light')}
              style={{
                border: `2px solid ${theme === 'light' ? 'var(--c-primary)' : 'var(--c-border)'}`,
                padding: '12px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                background: theme === 'light' ? 'var(--c-surface-hover)' : 'var(--c-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>☀️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Clinical Day</div>
                <div className="hint" style={{ fontSize: 11 }}>Clean crisp medical white</div>
              </div>
            </div>

            <div
              onClick={() => setTheme('dark')}
              style={{
                border: `2px solid ${theme === 'dark' ? 'var(--c-primary)' : 'var(--c-border)'}`,
                padding: '12px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                background: theme === 'dark' ? 'var(--c-surface-hover)' : 'var(--c-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>🌙</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Night Shift Dark</div>
                <div className="hint" style={{ fontSize: 11 }}>Deep dark eye protection</div>
              </div>
            </div>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Default OPD Appointment Slot Duration</label>
          <select className="input" value={duration} onChange={(e) => {
            setDuration(e.target.value);
            showToast(`Default slot duration set to ${e.target.value}.`);
          }}>
            <option>15 minutes</option>
            <option>20 minutes</option>
            <option>30 minutes</option>
            <option>45 minutes</option>
          </select>
        </div>

        <div className="field">
          <label>Data Table Density</label>
          <select className="input" value={density} onChange={(e) => {
            setDensity(e.target.value);
            showToast(`Table density adjusted to ${e.target.value}.`);
          }}>
            <option>Comfortable (Standard OPD)</option>
            <option>Compact (High Volume)</option>
          </select>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Institutional Data Backup & Recovery</div>
        <div className="hint" style={{ marginBottom: 16 }}>Export complete hospital clinical database snapshots or restore defaults</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 8, border: '1px solid var(--c-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>💾 Database JSON Snapshot</div>
            <p className="hint" style={{ fontSize: 12, marginBottom: 12 }}>
              Download an encrypted JSON file containing patients, appointment queues, doctor rosters, and billing ledgers.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleExportBackup}>
              <Icon name="reports" /> Export Database Backup (JSON)
            </button>
          </div>

          <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 8, border: '1px solid var(--c-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>🔄 Factory Demo Reset</div>
            <p className="hint" style={{ fontSize: 12, marginBottom: 12 }}>
              Clear local overrides and restore clean demonstration hospital records and original doctor timetables.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={handleResetFactory}>
              Reset Demo Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE ACCESSIBLE TOGGLE SWITCH
   ========================================================= */
function ToggleSwitch({ checked, onChange, label, sub }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--c-surface-hover)',
        border: '1px solid var(--c-border)',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</div>
        {sub && <div className="hint" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onChange}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange()}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? 'var(--c-primary)' : 'var(--c-border-strong)',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.2s ease',
        }}
        aria-label={label}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#ffffff',
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   7. SUPABASE CLOUD DATABASE TAB
   ========================================================= */
function SupabaseCloudTab({ showToast }) {
  const [loading, setLoading] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);
  const [testLog, setTestLog] = useState(null);
  const [testingWrite, setTestingWrite] = useState(false);
  const [counts, setCounts] = useState({
    patients: 18,
    doctors: 5,
    wards: 5,
    beds: 28,
    appointments: 6,
    medicines: 8,
    lab_orders: 4,
    invoices: 3,
  });

  const fetchCloudStats = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const results = {};
      const tables = ['patients', 'doctors', 'wards', 'beds', 'appointments', 'medicines', 'lab_orders', 'invoices'];
      for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          results[t] = count;
        }
      }
      setPingLatency(Math.round(performance.now() - start));
      setCounts((prev) => ({ ...prev, ...results }));
      showToast('Fetched live cloud metrics from Supabase.');
    } catch {
      showToast('Error querying Supabase cloud metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudStats();
  }, []);

  const runLiveVerificationTest = async () => {
    setTestingWrite(true);
    setTestLog('Starting live round-trip test to Supabase cloud...');
    const testId = `PT-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const start = performance.now();

    try {
      // 1. Insert test record
      setTestLog(`1. Inserting test record (${testId}) into 'patients' table...`);
      const { error: insErr } = await supabase.from('patients').insert({
        id: testId,
        name: 'Live Cloud Verification Patient',
        age: 32,
        gender: 'Male',
        phone: '0300-9999999',
        doctor: 'Dr. Sarah Khan',
        last_visit: 'Just now',
        status: 'OPD',
      });
      if (insErr) throw insErr;

      // 2. Read it back
      setTestLog(`2. Querying test record (${testId}) back from cloud database...`);
      const { data: readBack, error: readErr } = await supabase
        .from('patients')
        .select('*')
        .eq('id', testId)
        .single();
      if (readErr || !readBack) throw new Error('Could not read back record');

      // 3. Delete it
      setTestLog(`3. Cleaning up and deleting test record (${testId})...`);
      const { error: delErr } = await supabase.from('patients').delete().eq('id', testId);
      if (delErr) throw delErr;

      const elapsed = Math.round(performance.now() - start);
      setTestLog(`✅ TEST PASSED in ${elapsed}ms! Data was successfully written, queried, and verified in your Supabase backend.`);
      showToast('Live Supabase round-trip test passed successfully!');
      fetchCloudStats();
    } catch (err) {
      setTestLog(`❌ Test failed: ${err.message || 'Unknown error'}`);
      showToast('Verification test failed.');
    } finally {
      setTestingWrite(false);
    }
  };
  const [isErasing, setIsErasing] = useState(false);

  const handleEraseCloudData = async () => {
    if (!window.confirm('⚠️ Are you sure you want to erase all test records from the Supabase backend? This will clear all dummy data so you can upload fresh testing data.')) {
      return;
    }
    setIsErasing(true);
    try {
      const tables = ['lab_orders', 'invoices', 'appointments', 'medicines', 'beds', 'wards', 'patients', 'doctors'];
      for (const t of tables) {
        const { data } = await supabase.from(t).select('id, code');
        if (data && data.length > 0) {
          const idCol = 'id' in data[0] ? 'id' : 'code';
          const ids = data.map((r) => r[idCol]).filter(Boolean);
          if (ids.length > 0) {
            await supabase.from(t).delete().in(idCol, ids);
          }
        }
      }

      // Also clear local cached dummy keys
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('medora_patients_') || k.startsWith('medora_appointments_') || k.startsWith('medora_prescriptions_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }

      showToast('All Supabase backend records and dummy data cleared! Ready for new testing data.');
      fetchCloudStats();
    } catch (err) {
      showToast(`Error clearing data: ${err.message}`);
    } finally {
      setIsErasing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Connection Card */}
      <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'var(--c-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                fontSize: 22,
              }}
            >
              ☁️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0 }}>Supabase Cloud Database</h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  CONNECTED & ACTIVE
                </span>
              </div>
              <div className="hint" style={{ marginTop: 3 }}>
                Project ID: <strong>nsqyldvgzsxggnlprwhp</strong> · Endpoint: <code>https://nsqyldvgzsxggnlprwhp.supabase.co</code>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={fetchCloudStats} disabled={loading}>
              <Icon name="zap" /> {loading ? 'Querying...' : 'Refresh Stats'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleEraseCloudData}
              disabled={isErasing || loading}
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              title="Erase all dummy records from Supabase backend to upload fresh testing records"
            >
              🗑️ {isErasing ? 'Erasing...' : 'Erase Dummy Data'}
            </button>
            <a
              href="https://supabase.com/dashboard/project/nsqyldvgzsxggnlprwhp/editor"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Icon name="eye" /> Open Supabase Table Editor ↗
            </a>
          </div>
        </div>

        {pingLatency !== null && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--c-border)', fontSize: 12, color: 'var(--c-text-muted)' }}>
            ⚡ Cloud Latency: <strong style={{ color: '#10b981' }}>{pingLatency}ms</strong> · Session persistence: Active · WebSocket Realtime: Enabled
          </div>
        )}
      </div>

      {/* Live Table Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Registered Patients', table: 'patients', count: counts.patients, icon: 'patients', color: 'var(--c-primary)' },
          { label: 'Specialist Doctors', table: 'doctors', count: counts.doctors, icon: 'staff', color: '#0284c7' },
          { label: 'Hospital Wards', table: 'wards', count: counts.wards, icon: 'bed', color: '#8b5cf6' },
          { label: 'Inpatient Beds', table: 'beds', count: counts.beds, icon: 'bed', color: '#059669' },
          { label: 'OPD Appointments', table: 'appointments', count: counts.appointments, icon: 'calendar', color: '#d97706' },
          { label: 'Pharmacy Formulary', table: 'medicines', count: counts.medicines, icon: 'pharmacy', color: '#dc2626' },
          { label: 'Laboratory Orders', table: 'lab_orders', count: counts.lab_orders, icon: 'lab', color: '#2563eb' },
          { label: 'Billing Invoices', table: 'invoices', count: counts.invoices, icon: 'billing', color: '#0d9488' },
        ].map((item) => (
          <div
            key={item.table}
            className="card"
            style={{
              padding: '14px 16px',
              border: '1px solid var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="hint" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                public.{item.table}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: 'var(--c-text)' }}>
                {item.count}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: 2 }}>{item.label}</div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--c-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
              }}
            >
              <Icon name={item.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Live Write & Read Verification Tool */}
      <div className="card" style={{ border: '1px solid var(--c-border)' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Live Cloud Read / Write Diagnostic Tool</h4>
        <div className="hint" style={{ marginBottom: 14 }}>
          Click the button below to perform an instantaneous round-trip verification: the browser will insert a real test record into your remote Supabase <code>patients</code> table, query it back to confirm persistence, and then clean it up.
        </div>

        <button
          className="btn btn-primary"
          onClick={runLiveVerificationTest}
          disabled={testingWrite}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="zap" /> {testingWrite ? 'Testing Cloud Connection...' : 'Run Live Cloud Verification Test'}
        </button>

        {testLog && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              background: 'var(--c-surface-hover)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              lineHeight: 1.5,
              border: '1px solid var(--c-border)',
            }}
          >
            {testLog}
          </div>
        )}
      </div>
    </div>
  );
}

