import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';
import Icon, { WhatsAppIcon } from '../../components/ui/Icon.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const clinic = useClinicProfile();

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)', color: '#0f172a', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Medora Cloud HMS
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Healthcare Intelligence Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14.5, fontWeight: 600 }}>
          <a href="#features" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
          <a href="#specialties" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Specialties</a>
          <a href="#pricing" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Pricing</a>
          <a href="#faq" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>FAQ</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/login?mode=signup')} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', transition: 'all 0.15s' }}>
            Start 14-Day Free Trial
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '80px 32px 100px', maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', padding: '6px 16px', borderRadius: 999, fontWeight: 800, fontSize: 13, marginBottom: 24, border: '1px solid rgba(2, 132, 199, 0.2)' }}>
          <span>✨ Next-Generation Multi-Tenant Healthcare OS</span>
        </div>
        
        <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.15, tracking: '-1px', color: '#0f172a', maxWidth: 960, margin: '0 auto 24px' }}>
          The Intelligent Operating System for Modern Clinics & Hospitals
        </h1>
        
        <p style={{ fontSize: 20, color: '#475569', maxWidth: 760, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Transform patient care with real-time OPD token queues, AI voice consultation dictation, automated WhatsApp slips, electronic prescriptions, and multi-tenant billing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login?mode=signup')} style={{ padding: '16px 36px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)' }}>
            🚀 Launch Your Digital Clinic Free
          </button>
          <button onClick={() => navigate('/display')} style={{ padding: '16px 32px', borderRadius: 14, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📺 Live TV Queue Display</span>
          </button>
        </div>

        {/* Feature Pill Grid */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48, flexWrap: 'wrap', color: '#64748b', fontSize: 14, fontWeight: 700 }}>
          <span>✓ 1-Click WhatsApp Token Slips</span>
          <span>✓ 100% HIPAA & RLS Isolation</span>
          <span>✓ Thermal Printer (80mm/58mm) Support</span>
          <span>✓ Pakistani Payment Gateways</span>
        </div>
      </header>

      {/* Feature Modules Grid */}
      <section id="features" style={{ backgroundColor: '#ffffff', padding: '100px 32px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
              Everything Your Practice Needs in One Unified Suite
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 640, margin: '0 auto' }}>
              Engineered specifically for outpatient clinics, dental surgeries, maternity homes, and multi-specialty polyclinics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Maya AI Voice Assistant</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Real-time voice dictation, conversational multi-turn appointment booking, and automatic ICD-10 diagnosis extraction.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📲</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>WhatsApp Messaging Gateway</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Send instant 1-click token slips, PDF prescriptions, and 30-day follow-up recall invitations directly to patient phones.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Clinical Drug Allergy Guard</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Automatic cross-referencing between patient allergies and prescribed medication with safe alternative suggestions.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🏥</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Inpatient Bed Telemetry</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Real-time ward telemetry monitoring ICU, HDU, Semi-Private, and General Ward beds with live occupancy indicators.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Automated Patient CRM</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Automated 30-day recall triggers, chronic disease checkup reminders, and post-consultation NPS satisfaction surveys.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🏢</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Multi-Tenant Architecture</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Hardware-isolated Row-Level Security (RLS) ensuring total data privacy between clinics with dynamic subdomain routing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" style={{ padding: '100px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            Transparent Plans Tailored for Every Practice
          </h2>
          <p style={{ fontSize: 17, color: '#64748b' }}>
            Choose a plan that scales with your doctors and patient volume. No hidden fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div key={key} style={{ backgroundColor: '#ffffff', padding: 36, borderRadius: 24, border: plan.recommended ? '2px solid #0284c7' : '1px solid #e2e8f0', boxShadow: plan.recommended ? '0 12px 36px rgba(2, 132, 199, 0.15)' : 'none', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {plan.recommended && (
                <span style={{ position: 'absolute', top: -14, right: 24, backgroundColor: '#0284c7', color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 999, textTransform: 'uppercase' }}>
                  {plan.badge}
                </span>
              )}
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>{plan.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0284c7', marginBottom: 12 }}>
                Rs. {plan.priceMonthlyPKR.toLocaleString()}<span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>/mo</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24, minHeight: 40 }}>{plan.tagline}</p>
              
              <div style={{ flex: 1, borderTop: '1px solid #f1f5f9', paddingTop: 20, marginBottom: 24 }}>
                {plan.features.slice(0, 6).map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, marginBottom: 10, color: feat.included ? '#334155' : '#94a3b8' }}>
                    <span>{feat.included ? '✓' : '✕'}</span>
                    <span>{feat.name}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/login?mode=signup')} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: plan.recommended ? '#0284c7' : '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '64px 32px 32px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderBottom: '1px solid #1e293b', paddingBottom: 40 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>Medora Cloud HMS</div>
            <div style={{ fontSize: 13 }}>Enterprise Healthcare Operations Platform · Pakistan</div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <a href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Portal Login</a>
            <a href="/display" style={{ color: '#cbd5e1', textDecoration: 'none' }}>TV Display</a>
            <a href="/super-admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>SuperAdmin Console</a>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '24px auto 0', textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} Medora Health Technologies. All rights reserved. Built for modern clinical precision.
        </div>
      </footer>
    </div>
  );
}
