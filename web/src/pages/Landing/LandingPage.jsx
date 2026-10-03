import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicProfile, switchActiveClinic } from '../../utils/clinicConfig.js';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig.js';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const clinic = useClinicProfile();

  useEffect(() => {
    // If the user is on a mobile device, skip the landing page and go straight to login
    if (window.innerWidth <= 768) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Gemini AI Clinic Website Generator State
  const [promptInput, setPromptInput] = useState('Al-Shifa Heart & Vascular Center, Lahore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedClinic, setGeneratedClinic] = useState(null);
  const [activeThemeOverride, setActiveThemeOverride] = useState(null);

  const CLINIC_PROMPT_PRESETS = [
    { title: '🫀 Cardiology Center', prompt: 'Al-Razi Heart & Vascular Institute, Lahore' },
    { title: '🦷 Aesthetic Dental Studio', prompt: 'SmileCare Dental & Orthodontic Studio, Karachi' },
    { title: '👶 Pediatric Clinic', prompt: 'Little Stars Pediatric & Childcare Clinic, Islamabad' },
    { title: '🦴 Orthopedic Complex', prompt: 'Khyber Bone & Joint Specialty Complex, Peshawar' },
  ];

  const handleGenerateClinicWithAI = () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setGenerationStep(1);
    setGeneratedClinic(null);

    // AI Generation Pipeline Simulation
    setTimeout(() => setGenerationStep(2), 400);
    setTimeout(() => setGenerationStep(3), 800);
    setTimeout(() => {
      setGenerationStep(4);
      const isDental = promptInput.toLowerCase().includes('dental') || promptInput.toLowerCase().includes('smile');
      const isPeds = promptInput.toLowerCase().includes('pediatric') || promptInput.toLowerCase().includes('child') || promptInput.toLowerCase().includes('stars');
      const isCardio = promptInput.toLowerCase().includes('heart') || promptInput.toLowerCase().includes('cardio');

      const primaryColor = isDental ? '#0d9488' : isPeds ? '#ec4899' : isCardio ? '#e11d48' : '#0284c7';
      const specialty = isDental ? 'Dental & Orthodontics' : isPeds ? 'Pediatrics & Child Care' : isCardio ? 'Cardiology & Vascular Care' : 'General & Multi-Specialty';

      const created = {
        name: promptInput.trim(),
        specialty,
        primaryColor,
        city: promptInput.includes('Lahore') ? 'Lahore' : promptInput.includes('Karachi') ? 'Karachi' : promptInput.includes('Islamabad') ? 'Islamabad' : 'Peshawar',
        tagline: `Premier ${specialty} Care with Real-Time OPD Tokens & Gemini AI Documentation`,
        doctors: [
          { name: 'Dr. Sarah Ahmed', role: `Senior ${specialty} Specialist`, fee: 'Rs. 2,500', slot: '1-Hour Fixed Slots' },
          { name: 'Dr. Bilal Chaudhry', role: `Consultant ${specialty}`, fee: 'Rs. 3,000', slot: '1-Hour Fixed Slots' },
        ],
        phone: '0300-9988776',
        address: 'Main Health Boulevard, Sector G-9, Pakistan',
      };

      setGeneratedClinic(created);
      setIsGenerating(false);
    }, 1400);
  };

  const handleApplyThemeToPage = (generated) => {
    setActiveThemeOverride(generated);
    switchActiveClinic({
      name: generated.name,
      city: generated.city,
      phone: generated.phone,
      address: generated.address,
      brandColor: generated.primaryColor,
      slug: generated.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });
  };

  const handleLaunchGeneratedWorkspace = (generated) => {
    handleApplyThemeToPage(generated);
    navigate('/appointments');
  };

  // Active Display Info (derived from dynamic clinic profile or AI theme override)
  const currentBrandColor = activeThemeOverride?.primaryColor || clinic?.brandColor || '#0284c7';
  const currentClinicName = activeThemeOverride?.name || clinic?.name || 'Medora Cloud HMS';
  const currentCity = activeThemeOverride?.city || clinic?.city || 'Pakistan';
  const currentPhone = activeThemeOverride?.phone || clinic?.phone || '+92 300 1234567';

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
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${currentBrandColor} 0%, #0369a1 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 900, boxShadow: `0 6px 16px ${currentBrandColor}40` }}>
            {currentClinicName.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
              {currentClinicName}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: currentBrandColor, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              {currentCity} · {currentPhone}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14.5, fontWeight: 700, color: '#475569' }}>
          <a href="#ai-builder" style={{ color: currentBrandColor, textDecoration: 'none', transition: 'color 0.15s' }}>✨ Gemini AI Builder</a>
          <a href="#workspaces" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Workspaces</a>
          <a href="#features" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
          <a href="#pricing" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>SaaS Plans</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/login?mode=signup')} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${currentBrandColor} 0%, #0369a1 100%)`, color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 14px ${currentBrandColor}40` }}>
            Free 14-Day Trial
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '80px 32px 60px', maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: `${currentBrandColor}15`, color: currentBrandColor, padding: '6px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13.5, marginBottom: 24, border: `1px solid ${currentBrandColor}30` }}>
          <span>✨ Modern Healthcare OS · Powered by Gemini AI & Supabase PostgreSQL</span>
        </div>
        
        <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1.5px', color: '#0f172a', maxWidth: 960, margin: '0 auto 24px' }}>
          {activeThemeOverride ? activeThemeOverride.tagline : 'The Intelligent Operating System for Modern Clinics & Hospitals'}
        </h1>
        
        <p style={{ fontSize: 19.5, color: '#475569', maxWidth: 780, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 500 }}>
          Manage your outpatient clinic or healthcare network with automated OPD queues, Gemini AI clinical SOAP summaries, continuous 80mm thermal receipts, 30-day WhatsApp recall CRM, and dynamic subdomain multi-tenancy.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <a href="#ai-builder" style={{ padding: '16px 36px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', fontWeight: 800, fontSize: 17, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)' }}>
            ✨ Build Clinic Website with Gemini AI
          </a>
          <button onClick={() => navigate('/appointments')} style={{ padding: '16px 32px', borderRadius: 14, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏥 Open Reception Desk</span>
          </button>
        </div>

        {/* Feature Pill Grid */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', color: '#64748b', fontSize: 13.5, fontWeight: 700 }}>
          <span>✓ Subdomain & Multi-Tenant Routing</span>
          <span>✓ Gemini AI Doctor SOAP Summarizer</span>
          <span>✓ 1-Click WhatsApp 30-Day Patient Recall</span>
          <span>✓ 80mm/58mm ESC/POS Thermal Printing</span>
        </div>
      </header>

      {/* GEMINI AI INSTANT CLINIC WEBSITE BUILDER SECTION */}
      <section id="ai-builder" style={{ padding: '70px 32px 90px', backgroundColor: '#0f172a', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient Glow */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0) 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '6px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13, border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: 16 }}>
              <span>🤖 Gemini AI Live Website Generator</span>
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              Build & Customize Your Clinic Web Portal in Seconds
            </h2>
            <p style={{ fontSize: 16.5, color: '#94a3b8', maxWidth: 680, margin: '0 auto' }}>
              Type your clinic name or specialty below. Gemini AI will instantly generate your custom branding, appointment slots, doctor directory, and live portal configuration!
            </p>
          </div>

          {/* AI Generator Input Bar */}
          <div style={{ backgroundColor: '#1e293b', padding: 24, borderRadius: 24, border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)', marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Al-Razi Heart & Vascular Clinic, Lahore"
                style={{ flex: 1, minWidth: 280, backgroundColor: '#0f172a', border: '1px solid #475569', color: '#ffffff', borderRadius: 14, padding: '16px 20px', fontSize: 16, outline: 'none', fontWeight: 600 }}
              />
              <button
                onClick={handleGenerateClinicWithAI}
                disabled={isGenerating}
                style={{
                  padding: '16px 32px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                <span>{isGenerating ? '⚡ Generating...' : '✨ Generate Portal with Gemini AI'}</span>
              </button>
            </div>

            {/* Quick Prompt Presets */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>Quick Presets:</span>
              {CLINIC_PROMPT_PRESETS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(item.prompt)}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* AI Progress Simulation */}
          {isGenerating && (
            <div style={{ backgroundColor: '#1e293b', padding: 28, borderRadius: 20, border: '1px solid rgba(139, 92, 246, 0.4)', textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#c084fc', marginBottom: 8 }}>
                {generationStep === 1 && '🔮 Gemini AI is analyzing clinical specialty & OPD triage requirements...'}
                {generationStep === 2 && '🎨 Synthesizing custom theme palette, logo & portal branding...'}
                {generationStep === 3 && '👨‍⚕️ Generating 1-hour appointment slot schedule & doctor directory...'}
                {generationStep === 4 && '📲 Configuring WhatsApp 30-day recall engine & thermal slip headers...'}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Please wait while Gemini AI builds your custom hospital workspace...</div>
            </div>
          )}

          {/* Generated Clinic Preview Card */}
          {generatedClinic && !isGenerating && (
            <div style={{ backgroundColor: '#1e293b', padding: 36, borderRadius: 24, border: `2px solid ${generatedClinic.primaryColor}`, boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24, borderBottom: '1px solid #334155', paddingBottom: 20 }}>
                <div>
                  <div style={{ display: 'inline-block', backgroundColor: `${generatedClinic.primaryColor}25`, color: generatedClinic.primaryColor, fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 999, border: `1px solid ${generatedClinic.primaryColor}50`, marginBottom: 8 }}>
                    ✨ AI GENERATED CLINIC PORTAL
                  </div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', margin: 0 }}>{generatedClinic.name}</h3>
                  <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>📍 {generatedClinic.city} · {generatedClinic.address} · 📞 {generatedClinic.phone}</div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleApplyThemeToPage(generatedClinic)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 12,
                      border: `1px solid ${generatedClinic.primaryColor}`,
                      backgroundColor: '#0f172a',
                      color: generatedClinic.primaryColor,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    🎨 Apply Theme to This Page
                  </button>
                  <button
                    onClick={() => handleLaunchGeneratedWorkspace(generatedClinic)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      backgroundColor: generatedClinic.primaryColor,
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: `0 6px 20px ${generatedClinic.primaryColor}50`,
                    }}
                  >
                    🚀 Launch Live Portal →
                  </button>
                </div>
              </div>

              {/* Doctors & Slots Generated */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {generatedClinic.doctors.map((doc, idx) => (
                  <div key={idx} style={{ backgroundColor: '#0f172a', padding: 20, borderRadius: 16, border: '1px solid #334155' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>{doc.name}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{doc.role}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: generatedClinic.primaryColor }}>
                      <span>Fee: {doc.fee}</span>
                      <span>⏰ {doc.slot}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Demo Workspaces Launcher */}
      <section id="workspaces" style={{ padding: '80px 32px 90px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: currentBrandColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Instant Interactive Demos</div>
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
                justifyContent: 'space-between',
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
            <div key={key} style={{ backgroundColor: '#ffffff', padding: 36, borderRadius: 24, border: plan.recommended ? `2px solid ${currentBrandColor}` : '1px solid #e2e8f0', boxShadow: plan.recommended ? `0 12px 36px ${currentBrandColor}25` : 'none', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {plan.recommended && (
                <span style={{ position: 'absolute', top: -14, right: 24, backgroundColor: currentBrandColor, color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 999, textTransform: 'uppercase' }}>
                  {plan.badge}
                </span>
              )}
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>{plan.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 900, color: currentBrandColor, marginBottom: 12 }}>
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

              <button onClick={() => navigate('/login?mode=signup')} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: plan.recommended ? currentBrandColor : '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
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
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>{currentClinicName}</div>
            <div style={{ fontSize: 13 }}>Enterprise Healthcare Operations Platform · {currentCity}</div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <a href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Portal Login</a>
            <a href="/display" style={{ color: '#cbd5e1', textDecoration: 'none' }}>TV Display</a>
            <a href="/super-admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>SuperAdmin Console</a>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '24px auto 0', textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} {currentClinicName}. All rights reserved. Built for modern clinical precision.
        </div>
      </footer>
    </div>
  );
}
