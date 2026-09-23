import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { getSpecialtyConfig } from '../../utils/specialtyConfig.js';
import { appointmentService } from '../../services/appointmentService.js';
import { audioAlert } from '../../utils/audioAlert.js';
import { usePlanGate } from '../../hooks/usePlanGate.js';

/**
 * LobbyDisplayPage.jsx
 * Interactive Public TV & LED Lobby Queue Display screen for waiting lounges.
 * Fully synchronized with reception desk via BroadcastChannel and appointmentService.
 */
export default function LobbyDisplayPage() {
  const clinic = useClinicProfile();
  const specialty = getSpecialtyConfig(clinic);
  const isDental = specialty?.id === 'dental';
  const isPediatric = specialty?.id === 'pediatric';
  const isEye = specialty?.id === 'ophthalmology';

  const { canAccess, plan } = usePlanGate();
  const [appointments, setAppointments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [announcementVoice, setAnnouncementVoice] = useState(true);
  const [isCallingFlash, setIsCallingFlash] = useState(false);

  // Digital clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync appointments queue
  const refreshQueue = useCallback(async () => {
    try {
      const data = await appointmentService.getAppointments();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshQueue();
    const unsubscribe = appointmentService.subscribe((updated) => {
      if (Array.isArray(updated)) {
        setAppointments(updated);
      } else {
        refreshQueue();
      }
    });

    // Listen for remote token call triggers from Reception
    const handleRemoteTokenCall = (e) => {
      const called = e.detail?.nextCalled;
      if (called) {
        announceToken(called);
      }
      refreshQueue();
    };

    window.addEventListener('medora-token-called', handleRemoteTokenCall);

    return () => {
      unsubscribe();
      window.removeEventListener('medora-token-called', handleRemoteTokenCall);
    };
  }, [refreshQueue]);

  // Derive Current Serving and Waiting List
  const inConsultationList = appointments.filter(
    (a) => a.status === 'In Consultation' || a.status === 'Checked-in'
  );
  const currentCalling = appointments.find((a) => a.status === 'In Consultation' || a.status === 'Calling') || inConsultationList[0] || appointments.find((a) => a.status === 'Waiting' || a.status === 'Confirmed') || null;
  const waitingQueue = appointments.filter(
    (a) => a.id !== currentCalling?.id && (a.status === 'Waiting' || a.status === 'Confirmed')
  );

  const announceToken = (targetToken) => {
    if (!targetToken) return;

    // Trigger visual pulse animation
    setIsCallingFlash(true);
    setTimeout(() => setIsCallingFlash(false), 2500);

    // Play clinical audio chime
    audioAlert.playChime('urgent');

    // Announce voice through speech synthesizer
    if (announcementVoice && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const docName = targetToken.doctor || (isDental ? 'attending dentist' : isPediatric ? 'attending pediatrician' : isEye ? 'attending eye surgeon' : 'attending specialist');
        const chamber = targetToken.room || (isDental ? 'Dental Chair 1' : isPediatric ? 'Pediatric Bay 1' : isEye ? 'Refraction Lane 1' : 'Examination Room 1');
        const msg = new SpeechSynthesisUtterance(
          `Token number ${targetToken.token}. Patient ${targetToken.patient}, please proceed to ${chamber} for ${docName}.`
        );
        msg.rate = 0.88;
        msg.pitch = 1.05;
        window.speechSynthesis.speak(msg);
      } catch {
        // safe fallback
      }
    }
  };

  /**
   * Advance to the next patient in queue
   */
  const handleAdvanceNextToken = async () => {
    const result = await appointmentService.callNextToken();
    const next = result.nextCalled;
    if (next) {
      announceToken(next);
    } else {
      audioAlert.playChime('default');
    }
    await refreshQueue();
  };

  /**
   * Repeat audio announcement for the current patient
   */
  const handleRepeatCall = () => {
    if (currentCalling) {
      announceToken(currentCalling);
    } else {
      audioAlert.playChime('default');
    }
  };

  /**
   * Skip current patient (mark absent / move to bottom) and call next
   */
  const handleSkipCurrent = async () => {
    if (!currentCalling) return;
    await appointmentService.skipToken(currentCalling.id);
    await refreshQueue();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Subscription Gate: Lobby TV requires Growth or Enterprise
  if (!canAccess('lobby_tv')) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070b14',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 580,
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '40px 32px',
            borderRadius: 24,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>📺</div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Requires Growth or Enterprise Tier
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '14px 0 10px', color: '#f8fafc' }}>
            Public Lobby TV Queue Display Locked
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            Your clinic is currently enrolled in <strong>{plan.name}</strong>. Real-time patient waiting room TV broadcasts, automated token speech synthesizer announcements, and high-definition lobby queues are included in the <strong>Growth</strong> and <strong>Enterprise</strong> tiers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link
              to="/subscription"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
              }}
            >
              <span>⚡</span>
              <span>Upgrade to Growth Tier (Rs. 12,000/mo)</span>
            </Link>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070b14',
        color: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Top TV Bar: Clinic Header & Live Digital Clock */}
      <header
        className="lobby-header"
        style={{
          padding: '24px 32px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.9) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 22,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
            }}
          >
            {clinic.name ? clinic.name.split(' ').slice(0, 2).map((w) => w[0]).join('') : 'M+'}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              {clinic.name}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              {clinic.tagline || 'Waiting Lounge & Outpatient Patient Routing System'}
            </div>
          </div>
        </div>

        {/* Center: Live Call Controls (Call Next, Repeat, Voice, Fullscreen) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* PRIMARY CALL NEXT TOKEN BUTTON */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleAdvanceNextToken}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              padding: '9px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.1s ease',
            }}
            title="Advance queue to the next waiting patient"
          >
            <span>▶️</span>
            <span>Call Next Token</span>
          </button>

          {/* REPEAT ANNOUNCEMENT BUTTON */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleRepeatCall}
            style={{
              background: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              color: '#38bdf8',
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Repeat voice announcement and chime for current token"
          >
            <span>🔔</span>
            <span>Repeat</span>
          </button>

          {/* SKIP CURRENT BUTTON */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleSkipCurrent}
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#facc15',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
            title="Patient absent: move to bottom and call next"
          >
            ⏭️ Skip
          </button>

          {/* VOICE TOGGLE */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setAnnouncementVoice(!announcementVoice)}
            style={{
              background: announcementVoice ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${announcementVoice ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: announcementVoice ? '#34d399' : '#94a3b8',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {announcementVoice ? '🎙️ Voice: ON' : '🔇 Voice: OFF'}
          </button>

          {/* FULLSCREEN */}
          <button
            type="button"
            className="btn btn-sm"
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>

          <Link
            to="/appointments"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Exit
          </Link>
        </div>

        {/* Right: Big Digital Clock */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 28,
              fontWeight: 900,
              color: '#38bdf8',
              letterSpacing: '1px',
            }}
          >
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* TV Main Body: 2 Columns (Current Calling + Upcoming Queue) */}
      <main className="lobby-main-grid" style={{ flex: 1, padding: 32, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
        {/* Left Column: Huge "NOW CALLING" Display */}
        <div
          style={{
            background: isCallingFlash
              ? 'linear-gradient(145deg, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: isCallingFlash
              ? '2px solid #38bdf8'
              : '2px solid rgba(2, 132, 199, 0.4)',
            borderRadius: 24,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: isCallingFlash
              ? '0 0 80px rgba(56, 189, 248, 0.5)'
              : '0 24px 64px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.35s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'inline-block',
                    boxShadow: '0 0 12px #ef4444',
                  }}
                />
                NOW SERVING IN {isDental ? 'DENTAL CHAIR' : isPediatric ? 'PEDIATRIC BAY' : isEye ? 'VISION LANE' : (specialty.terminology?.resourceUnit?.toUpperCase() || 'ROOM')}
              </div>

              <div style={{ fontSize: 13, color: '#64748b' }}>
                {isDental ? 'Live Dental Chair & Operatory Routing' : isPediatric ? 'Live Pediatric Bay & Vaccination Routing' : isEye ? 'Live Refraction & Slit-Lamp Routing' : 'Live Consultation Routing'}
              </div>
            </div>

            {currentCalling ? (
              <>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    PATIENT TOKEN NUMBER
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(76px, 11vw, 140px)',
                      fontWeight: 900,
                      fontFamily: "'Courier New', Courier, monospace",
                      color: isCallingFlash ? '#38bdf8' : '#ffffff',
                      textShadow: isCallingFlash
                        ? '0 0 60px rgba(56, 189, 248, 0.9)'
                        : '0 0 35px rgba(56, 189, 248, 0.5)',
                      lineHeight: 1.05,
                      margin: '10px 0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {currentCalling.token}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#38bdf8' }}>
                    {currentCalling.patient}
                  </div>
                </div>

                {/* Destination Room Box */}
                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    borderRadius: 16,
                    padding: '24px 32px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                    marginTop: 30,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      {specialty.terminology?.providerTitle || 'Consultant Doctor'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                      {currentCalling.doctor}
                    </div>
                    <div style={{ fontSize: 14, color: '#38bdf8', marginTop: 2 }}>
                      {currentCalling.dept || (isDental ? 'General Dentistry' : isPediatric ? 'Child Care' : isEye ? 'Comprehensive Ophthalmology' : 'General OPD')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isDental ? 'Assigned Dental Chair / Operatory' : isPediatric ? 'Assigned Pediatric Bay' : isEye ? 'Assigned Vision Lane' : (specialty.terminology?.resourceUnit || 'Consultation Chamber')}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginTop: 4 }}>
                      {currentCalling.room || (isDental ? 'Dental Chair 1' : isPediatric ? 'Bay 1' : 'Room 102')}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>All Tokens Completed</div>
                <div style={{ fontSize: 14, marginTop: 6 }}>No pending patients in the waiting lounge.</div>
              </div>
            )}
          </div>

          {/* Lobby Notice Bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 16,
              marginTop: 20,
              fontSize: 13,
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {isDental
                ? '🦷 Brush & floss daily. All handpieces and dental burs are Class-B vacuum autoclave sterilized for your safety.'
                : isPediatric
                ? '👶 Keep your immunization cards ready. WHO-compliant 2°C–8°C cold chain monitored vaccines.'
                : isEye
                ? '👁️ Protect your eyesight. Comprehensive dilated fundus exams prevent silent glaucoma and diabetic retinopathy.'
                : '📢 Please keep your thermal slip ready when your token is announced.'}
            </span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Helpline: {clinic.phone}</span>
          </div>
        </div>

        {/* Right Column: Upcoming Queue Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>Next In Queue</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {isDental ? 'Please wait in the dental lounge until your token is called' : isPediatric ? 'Please relax in the kids play & waiting zone' : 'Please wait in the lounge until your token is called'}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {waitingQueue.length} WAITING
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {waitingQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div>No more patients waiting in queue</div>
              </div>
            ) : (
              waitingQueue.slice(0, 7).map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: idx === 0 ? 'rgba(2, 132, 199, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: idx === 0 ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 22,
                        fontWeight: 900,
                        color: idx === 0 ? '#38bdf8' : '#ffffff',
                        minWidth: 70,
                      }}
                    >
                      {item.token}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>{item.patient}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {item.doctor} · {item.dept}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{item.room}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Slot: {item.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Emergency Notice */}
          <div
            style={{
              marginTop: 16,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 11.5,
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚠️</span>
            <span>
              {isDental
                ? 'Dental emergencies (acute facial abscess, severe toothache, dental trauma) receive priority chair allocation.'
                : isPediatric
                ? 'High unyielding fever (>103°F), febrile seizures, and infant respiratory distress are fast-tracked.'
                : isEye
                ? 'Sudden vision loss, chemical splash to the eyes, and acute ocular trauma are routed immediately.'
                : 'Emergency / Priority patients will be called ahead of routine tokens.'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
