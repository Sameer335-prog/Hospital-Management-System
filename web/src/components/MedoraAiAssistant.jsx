import React, { useState, useEffect, useRef } from 'react';
import { aiAgentService } from '../services/aiAgentService';
import { useAuth } from '../context/AuthContext.jsx';

const MedoraAiAssistant = ({ userRole = 'patient' }) => {
  const { user } = useAuth();
  const effectiveRole = user?.role?.toLowerCase() || userRole;
  const currentPatientName = user?.name || '';
  // Mode state: 'closed' | 'chat' | 'call'
  const [viewMode, setViewMode] = useState('closed');
  const [isLauncherMinimized, setIsLauncherMinimized] = useState(false);

  // Text Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Medora Clinical AI Assistant. How can I help you today? You can ask me to check doctor schedules, book an appointment, or explain hospital services.",
      time: 'Online'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatDictating, setIsChatDictating] = useState(false);
  const chatBottomRef = useRef(null);
  const chatInputRef = useRef(null);

  // Voice Call State
  const [callState, setCallState] = useState('idle'); // 'idle' | 'connecting' | 'listening' | 'speaking' | 'processing'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [currentCaption, setCurrentCaption] = useState({ speaker: 'ai', text: '' });
  const [latestAppointment, setLatestAppointment] = useState(null);

  // References for Speech Recognition & Voice Synthesis
  const callRecognitionRef = useRef(null);
  const chatDictationRef = useRef(null);
  const isCallActiveRef = useRef(false);
  const callTimerRef = useRef(null);

  // Format call duration MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Scroll chat to bottom whenever messages or typing state updates
  useEffect(() => {
    if (viewMode === 'chat') {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages, isTyping, viewMode]);

  // Keep isCallActiveRef in sync
  useEffect(() => {
    isCallActiveRef.current = viewMode === 'call';
  }, [viewMode]);

  // Handle Call Timer
  useEffect(() => {
    if (viewMode === 'call') {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [viewMode]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (callRecognitionRef.current) {
        try { callRecognitionRef.current.abort(); } catch { /* ignore */ }
      }
      if (chatDictationRef.current) {
        try { chatDictationRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Speech Synthesis (Speaking aloud)
  const speakText = (text, onFinished) => {
    if (!('speechSynthesis' in window)) {
      if (onFinished) onFinished();
      return;
    }

    window.speechSynthesis.cancel();

    if (!speakerEnabled) {
      if (onFinished) onFinished();
      return;
    }

    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava'))
    );
    if (friendlyVoice) utterance.voice = friendlyVoice;

    setCallState('speaking');
    setCurrentCaption({ speaker: 'ai', text: cleanText });

    utterance.onend = () => {
      if (isCallActiveRef.current) {
        setCallState('listening');
        if (onFinished) onFinished();
      } else {
        setCallState('idle');
      }
    };

    utterance.onerror = () => {
      if (isCallActiveRef.current) {
        setCallState('listening');
        if (onFinished) onFinished();
      } else {
        setCallState('idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // -------------------------------------------------------------
  // VOICE CALL LOOP (Continuous Two-Way Hands-Free Call)
  // -------------------------------------------------------------
  const startCallListeningLoop = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition is not supported in this browser.');
      return;
    }

    if (callRecognitionRef.current) {
      try { callRecognitionRef.current.abort(); } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognition();
    callRecognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      if (isCallActiveRef.current) {
        setCallState('listening');
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText) {
        setCurrentCaption({ speaker: 'user', text: activeText });
      }

      if (finalTranscript.trim()) {
        try { recognition.abort(); } catch { /* ignore */ }
        handleCallSpeechInput(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Call speech error:', event.error);
      if (event.error === 'not-allowed') {
        setIsMuted(true);
        setCurrentCaption({
          speaker: 'ai',
          text: 'Microphone access is needed for voice calling. Please allow microphone permissions in your browser or tap any quick prompt below.'
        });
        setCallState('idle');
        return;
      }
      if (isCallActiveRef.current && event.error === 'no-speech' && !isMuted) {
        setTimeout(() => {
          if (isCallActiveRef.current && callState !== 'speaking') {
            startCallListeningLoop();
          }
        }, 600);
      }
    };

    recognition.onend = () => {
      if (isCallActiveRef.current && callState === 'listening' && !isMuted) {
        setTimeout(() => {
          if (isCallActiveRef.current && callState !== 'speaking') {
            startCallListeningLoop();
          }
        }, 150);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('Recognition start caught:', err);
    }
  };

  const handleCallSpeechInput = async (spokenQuery) => {
    if (!spokenQuery || !spokenQuery.trim()) return;

    setCallState('processing');

    try {
      const result = await aiAgentService.processQuery(spokenQuery, {
        role: effectiveRole,
        patientName: currentPatientName,
        patientId: user?.patientId
      });

      if (result.appointment) {
        setLatestAppointment(result.appointment);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: spokenQuery,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          text: result.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appointment: result.appointment
        }
      ]);

      speakText(result.spokenText || result.text, () => {
        if (isCallActiveRef.current && !isMuted) {
          startCallListeningLoop();
        }
      });
    } catch (err) {
      console.error('Call processing error:', err);
      speakText("I had trouble catching that. Could you repeat please?", () => {
        if (isCallActiveRef.current) startCallListeningLoop();
      });
    }
  };

  const handleStartVoiceCall = () => {
    setViewMode('call');
    setCallState('connecting');
    setLatestAppointment(null);
    setIsMuted(false);

    const greeting = "Hello! Welcome to Medora Hospital Voice Assistant. How can I help you? You can ask about doctor availability, book an appointment, or ask how the hospital works.";

    setTimeout(() => {
      speakText(greeting, () => {
        startCallListeningLoop();
      });
    }, 500);
  };

  const handleEndCall = () => {
    isCallActiveRef.current = false;
    window.speechSynthesis?.cancel();
    if (callRecognitionRef.current) {
      try { callRecognitionRef.current.abort(); } catch { /* ignore */ }
    }
    setCallState('idle');
    setViewMode('closed');
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startCallListeningLoop();
    } else {
      setIsMuted(true);
      if (callRecognitionRef.current) {
        try { callRecognitionRef.current.abort(); } catch { /* ignore */ }
      }
      setCallState('idle');
    }
  };

  // -------------------------------------------------------------
  // TEXT CHAT LOGIC & DICTATION
  // -------------------------------------------------------------
  const handleSendMessage = async (explicitText) => {
    // Safely verify text whether passed explicitly or from state
    const textToSend = typeof explicitText === 'string' ? explicitText : inputText;
    if (!textToSend || !textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: textToSend.trim(), time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiAgentService.processQuery(textToSend, {
        role: effectiveRole,
        patientName: currentPatientName,
        patientId: user?.patientId
      });
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appointment: response.appointment
        }
      ]);
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I apologize, but I encountered an error processing your request. Please try asking again.",
          time: timeStr
        }
      ]);
    }
  };

  // Voice Dictation inside Text Chat input
  const toggleChatDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isChatDictating) {
      try { chatDictationRef.current?.abort(); } catch { /* ignore */ }
      setIsChatDictating(false);
      return;
    }

    try {
      const dictation = new SpeechRecognition();
      chatDictationRef.current = dictation;
      dictation.continuous = false;
      dictation.interimResults = false;
      dictation.lang = 'en-US';

      dictation.onstart = () => {
        setIsChatDictating(true);
      };

      dictation.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsChatDictating(false);
      };

      dictation.onerror = () => {
        setIsChatDictating(false);
      };

      dictation.onend = () => {
        setIsChatDictating(false);
      };

      dictation.start();
    } catch (err) {
      console.warn('Dictation failed:', err);
      setIsChatDictating(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER (Bottom Right) */}
      {viewMode === 'closed' && (
        <div
          className="medora-ai-launcher"
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 95, /* Below modal/drawer overlays (100) to prevent blocking form footers */
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            maxWidth: 'calc(100vw - 32px)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          {isLauncherMinimized ? (
            /* Minimized Sleek AI Floating Action Badge */
            <button
              type="button"
              onClick={() => setIsLauncherMinimized(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '9999px',
                border: 'none',
                boxShadow: '0 8px 24px -4px rgba(13, 148, 136, 0.55)',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              title="Open Medora Clinical Voice & Chat AI"
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
            >
              <span style={{ fontSize: '15px' }}>✨</span>
              <span>AI Copilot</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          ) : (
            <>
              {/* Direct Voice Call AI Button */}
              <button
                type="button"
                onClick={handleStartVoiceCall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.5), 0 4px 6px -2px rgba(16, 185, 129, 0.2)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: '50%'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                Voice Call AI
              </button>

              {/* AI Chat Assistant Button */}
              <button
                type="button"
                onClick={() => setViewMode('chat')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.45)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                AI Chat
              </button>

              {/* Minimize to compact badge button */}
              <button
                type="button"
                onClick={() => setIsLauncherMinimized(true)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--c-surface, #ffffff)',
                  color: 'var(--c-text-muted, #64748b)',
                  border: '1px solid var(--c-border, #e2e8f0)',
                  boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background 0.15s ease'
                }}
                title="Minimize AI Buttons"
                aria-label="Minimize AI Buttons"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. DEDICATED FULL VOICE CALL OVERLAY */}
      {viewMode === 'call' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            width: '92%',
            maxWidth: '480px',
            maxHeight: '94vh',
            overflowY: 'auto',
            backgroundColor: '#1e293b',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#f8fafc'
          }}>
            {/* Call Header */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', fontWeight: '700' }}>
                  MEDORA VOICE COPILOT
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>
                  Voice Consultation · {formatTime(callDuration)}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                {callState === 'speaking' ? 'Speaking...' : callState === 'listening' ? 'Listening...' : callState === 'processing' ? 'Thinking...' : 'Connected'}
              </div>
            </div>

            {/* Call Center Visuals */}
            <div style={{
              padding: '32px 24px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(13, 148, 136, 0.2) 0%, transparent 70%)'
            }}>
              <div style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  animation: (callState === 'speaking' || callState === 'listening') ? 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' : 'none'
                }} />

                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                  boxShadow: '0 0 35px rgba(16, 185, 129, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                    <path d="M12 12 2.1 7.1"/>
                    <path d="M12 12l9.9 4.9"/>
                  </svg>
                </div>
              </div>

              <div style={{ marginTop: '16px', fontSize: '17px', fontWeight: '600', color: '#f8fafc' }}>
                Medora Voice Assistant
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                {isMuted
                  ? 'Microphone is muted'
                  : callState === 'speaking'
                  ? 'Speaking out loud...'
                  : callState === 'listening'
                  ? 'Speak naturally, I am listening...'
                  : 'Processing response...'}
              </div>

              {/* Sound Wave Bars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', marginTop: '14px' }}>
                {[16, 24, 12, 28, 20, 26, 14, 22, 10].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: (callState === 'speaking' || callState === 'listening') && !isMuted ? `${height}px` : '4px',
                      backgroundColor: callState === 'speaking' ? '#10b981' : '#38bdf8',
                      borderRadius: '2px',
                      transition: 'height 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Live Subtitle Transcript */}
            <div style={{
              margin: '0 20px',
              padding: '12px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              minHeight: '60px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {currentCaption.text ? (
                <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#e2e8f0' }}>
                  <span style={{
                    color: currentCaption.speaker === 'user' ? '#38bdf8' : '#34d399',
                    fontWeight: '700',
                    marginRight: '6px'
                  }}>
                    {currentCaption.speaker === 'user' ? 'You:' : 'AI:'}
                  </span>
                  {currentCaption.text}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', fontStyle: 'italic', paddingTop: '6px' }}>
                  Voice transcript will appear here in real time...
                </div>
              )}
            </div>

            {/* Appointment Created Card (if booked during call) */}
            {latestAppointment && (
              <div style={{
                margin: '12px 20px 0',
                padding: '12px 14px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                    TOKEN CONFIRMED: {latestAppointment.token}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                    {latestAppointment.doctor} ({latestAppointment.dept})
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Time: {latestAppointment.time} · {latestAppointment.room}
                  </div>
                </div>
                <span style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                  Booked
                </span>
              </div>
            )}

            {/* Quick Prompts */}
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              padding: '12px 20px 4px',
              scrollbarWidth: 'none'
            }}>
              {['Book Dr. Sarah at 11 AM', 'Check Dr. Bilal timing', 'How does the hospital work?', 'Emergency hotline'].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCallSpeechInput(chip)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  "{chip}"
                </button>
              ))}
            </div>

            {/* Call Control Footer */}
            <div style={{
              padding: '20px 24px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}>
              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  </svg>
                )}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(220, 38, 38, 0.5)',
                  cursor: 'pointer'
                }}
                title="End Call"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(135deg)' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>

              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => setSpeakerEnabled(!speakerEnabled)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: speakerEnabled ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={speakerEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {speakerEnabled ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                )}
              </button>

              {/* Switch to Chat */}
              <button
                type="button"
                onClick={() => {
                  isCallActiveRef.current = false;
                  window.speechSynthesis?.cancel();
                  if (callRecognitionRef.current) {
                    try { callRecognitionRef.current.abort(); } catch { /* ignore */ }
                  }
                  setCallState('idle');
                  setViewMode('chat');
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Switch to Chat Mode"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEXT CHAT WINDOW */}
      {viewMode === 'chat' && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: 'min(390px, calc(100vw - 32px))',
          height: 'min(580px, calc(100vh - 70px))',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                  <path d="M12 12 2.1 7.1"/>
                  <path d="M12 12l9.9 4.9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Medora AI Assistant</div>
                <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} />
                  Online · Voice & Chat Ready
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Voice Call Button from header */}
              <button
                type="button"
                onClick={handleStartVoiceCall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Start Voice Call"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call
              </button>

              <button
                type="button"
                onClick={() => setViewMode('closed')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '22px',
                  padding: '0 4px',
                  lineHeight: '1'
                }}
                aria-label="Close Assistant"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  backgroundColor: msg.sender === 'user' ? '#0d9488' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(13, 148, 136, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>

                {/* Appointment Card preview */}
                {msg.appointment && (
                  <div style={{
                    marginTop: '6px',
                    padding: '10px 12px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#065f46',
                    width: '100%'
                  }}>
                    <div style={{ fontWeight: '700' }}>✓ Token Confirmed: {msg.appointment.token}</div>
                    <div>{msg.appointment.doctor} ({msg.appointment.dept})</div>
                    <div>Time: {msg.appointment.time} · {msg.appointment.room}</div>
                    <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>Consultation Fee: Rs. {msg.appointment.fee}</div>
                  </div>
                )}

                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', marginInline: '4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>AI is thinking</span>
                <span style={{ animation: 'blink 1s infinite' }}>...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Filter Chips */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {[
              { label: 'Book Dr. Sarah', prompt: 'Book an appointment with Dr. Sarah at 11 AM' },
              { label: 'Doctor Timings', prompt: 'Which doctors are available today?' },
              { label: 'Hospital Workflow', prompt: 'How does the hospital work?' },
              { label: 'Emergency ER', prompt: 'Where is the Emergency Room located?' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.prompt)}
                style={{
                  padding: '5px 11px',
                  fontSize: '11px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '500'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            {/* Dictate Voice into Chat text box */}
            <button
              type="button"
              onClick={toggleChatDictation}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isChatDictating ? '#ef4444' : '#f1f5f9',
                color: isChatDictating ? '#ffffff' : '#475569',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              title={isChatDictating ? 'Listening... click to stop' : 'Click to speak (Dictate message)'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>

            <input
              ref={chatInputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isChatDictating ? 'Listening to your voice...' : 'Type or click a prompt above...'}
              style={{
                flex: 1,
                padding: '9px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: isChatDictating ? '#fef2f2' : '#ffffff'
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                backgroundColor: inputText.trim() ? '#0d9488' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.2; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
};

export default MedoraAiAssistant;
