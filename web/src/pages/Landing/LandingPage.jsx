import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const clinic = useClinicProfile();

  const DEMO_WORKSPACES = [
    {
      role: 'Reception Desk',
      badge: '15-Sec Walk-In Intake',
      icon: '⚡',
      path: '/appointments',
      desc: 'Issue sequential OPD tokens (TK-01, TK-02), print 80mm thermal receipts, and reconcile cash shift revenue in real time.',
      color: '#0284c7',
      bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(3, 105, 161, 0.03) 100%)',
    },
    {
      role: 'Doctor Desk & Gemini AI',
      badge: 'SOAP Auto-Summarizer',
      icon: '🤖',
      path: '/consultation',
      desc: 'Click 1-button AI Clinical Summarizer to transform raw doctor notes into structured SOAP diagnosis and Rx plans instantly.',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(109, 40, 217, 0.03) 100%)',
    },
    {
      role: 'Patient Portal',
      badge: 'WhatsApp Reminders',
      icon: '📲',
      path: '/patient-portal',
      desc: 'View medical records, download thermal receipt slips, and trigger 1-click WhatsApp appointment reminders.',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(4, 120, 87, 0.03) 100%)',
    },
    {
      role: 'Public TV Lobby Screen',
      badge: 'Speech Synthesis & Chimes',
      icon: '📺',
      path: '/display',
      desc: 'Wall-mounted queue calling screen with dual-column telemetry, audio chimes, TTS voice speech, and cross-tab sync.',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(180, 83, 9, 0.03) 100%)',
    },
    {
      role: 'SuperAdmin SaaS Console',
      badge: 'Multi-Clinic Control',
      icon: '🏢',
      path: '/super-admin',
      desc: 'Provision white-label polyclinics, switch active tenant subdomains, edit clinic profiles, and copy instant portal links.',
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(190, 24, 93, 0.03) 100%)',
    },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)', color: '#0f172a', backgroundColor: '#f8fafc', minHeight: '100vh', scrollBehavior: 'smooth' }}>
      {/* Top Navigation Bar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 900, boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)' }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 900, background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px' }}>
              Medora Cloud HMS
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Multi-Tenant Healthcare Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14.5, fontWeight: 700, color: '#475569' }}>
          <a href="#workspaces" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Live Workspaces</a>
          <a href="#features" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>AI & Features</a>
          <a href="#pricing" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>SaaS Pricing</a>
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
      <header style={{ padding: '90px 32px 80px', maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', padding: '6px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13.5, marginBottom: 24, border: '1px solid rgba(2, 132, 199, 0.25)' }}>
          <span>✨ Enterprise Healthcare ERP · Powered by Gemini AI & Supabase</span>
        </div>
        
        <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.12, letterSpacing: '-1.5px', color: '#0f172a', maxWidth: 980, margin: '0 auto 24px' }}>
          The Modern Multi-Tenant Clinical Operating System
        </h1>
        
        <p style={{ fontSize: 20, color: '#475569', maxWidth: 780, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 500 }}>
          Manage your hospital or polyclinic chain with real-time OPD token queues, Gemini AI SOAP note summarization, 80mm thermal receipts, 30-day WhatsApp patient recall, and dynamic subdomain white-labeling.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => navigate('/login?mode=signup')} style={{ padding: '16px 36px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)', transition: 'transform 0.15s, boxShadow 0.15s' }}>
            🚀 Provision Digital Clinic Free
          </button>
          <button onClick={() => navigate('/display')} style={{ padding: '16px 32px', borderRadius: 14, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📺 Open TV Lounge Display</span>
          </button>
        </div>

        {/* Feature Pill Grid */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', color: '#64748b', fontSize: 13.5, fontWeight: 700 }}>
          <span>✓ Multi-Tenant Subdomain Routing</span>
          <span>✓ Gemini AI Doctor SOAP Summarizer</span>
          <span>✓ 1-Click WhatsApp 30-Day Patient Recall</span>
          <span>✓ 80mm ESC/POS Thermal Printing</span>
        </div>
      </header>

      {/* Interactive Demo Workspaces Launcher */}
      <section id="workspaces" style={{ padding: '60px 32px 90px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Instant Interactive Demos</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            Test Live Operational Workspaces
          </h2>
          <p style={{ fontSize: 16.5, color: '#64748b', maxWidth: 640, margin: '0 auto' }}>
            Experience Medora HMS directly in your browser with zero login friction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {DEMO_WORKSPACES.map((ws, idx) => (
            <div
              key={idx}
              onClick={() => navigate(ws.path)}
              style={{
                backgroundColor: '#ffffff',
                padding: 30,
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                background: ws.bgGradient,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: 36 }}>{ws.icon}</span>
                  <span style={{ backgroundColor: `${ws.color}15`, color: ws.color, fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 999, border: `1px solid ${ws.color}30` }}>
                    {ws.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{ws.role}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.55, marginBottom: 24 }}>{ws.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: ws.color }}>
                <span>Launch Workspace</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Modules Section */}
      <section id="features" style={{ backgroundColor: '#ffffff', padding: '90px 32px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
              Everything Your Polyclinic Needs in One Suite
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 640, margin: '0 auto' }}>
              Engineered specifically for outpatient clinics, polyclinics, dental surgeries, and hospital chains.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Gemini AI Doctor Auto-Summarizer</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                1-Click button transforming doctor dictation into structured SOAP notes, complaints, physical findings, diagnosis, and prescription plans.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📲</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>WhatsApp Patient Recall CRM</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Automated 30-day post-consultation WhatsApp recall invitations, appointment reminders, and digital receipt dispatching.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🏢</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Multi-Tenant Subdomain SaaS</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Dynamic subdomain (`cityclinic.medorahms.com`) and query parameter tenant resolution with hardware-isolated Row-Level Security.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🖨️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>80mm ESC/POS Thermal Printing</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Scoped continuous thermal paper slip generator producing instant token receipts without distorting A4 diagnostic reports.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📺</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Public TV Lounge Display</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Wall-mounted lounge screen with airline chimes, vocal speech announcements, and sub-millisecond BroadcastChannel sync.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📱</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Mobile-First Responsive Layout</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 14.5 }}>
                Fixed bottom navigation bar, frosted slide-over drawer, and mobile bottom-sheet modals for doctors on hospital rounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '90px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            SaaS Subscription Tiers
          </h2>
          <p style={{ fontSize: 17, color: '#64748b' }}>
            Scale effortlessly from single-doctor private clinics to multi-branch polyclinic chains.
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
