import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LANDING } from '../../legacy/legacyEngine.js';
import Icon from '../../components/ui/Icon.jsx';

export default function LoginPage() {
  const { login, signup, resetPassword, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState('login');

  // Sign in form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [remember, setRemember] = useState(true);

  // Sign up form state
  const [accountType, setAccountType] = useState('Patient'); // 'Patient' | 'Staff'
  const [staffRole, setStaffRole] = useState('Doctor');
  const [department, setDepartment] = useState('Cardiology');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState('Male');
  const [signupDob, setSignupDob] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // UI helpers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || `/${ROLE_LANDING[user.role] || 'dashboard'}`;
    return <Navigate to={from} replace />;
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedIn = await login(loginEmail.trim(), loginPassword, remember);
      navigate(`/${ROLE_LANDING[loggedIn.role] || 'dashboard'}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setError('Please provide your legal full name, email address, and phone number.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!termsAgreed) {
      setError('You must accept the Hospital Health Records & HIPAA Compliance terms to register.');
      return;
    }

    setLoading(true);
    try {
      const targetRole = accountType === 'Patient' ? 'Patient' : staffRole;
      const newUser = await signup(
        {
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: targetRole,
          phone: signupPhone.trim(),
          department: accountType === 'Staff' ? department : '',
          gender: signupGender,
          dob: signupDob,
        },
        remember
      );
      navigate(`/${ROLE_LANDING[newUser.role] || 'dashboard'}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap" style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div className="login-card" style={{ width: 480, maxWidth: '100%' }}>
        {/* Brand Identity */}
        <div className="login-logo">
          <div className="logo" aria-hidden="true" style={{ fontSize: 24, fontWeight: 900 }}>
            M+
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, letterSpacing: '-0.02em', color: 'var(--c-text)', margin: 0, fontWeight: 800 }}>
              Medora HMS
            </h1>
            <div className="hint" style={{ marginTop: 4, fontSize: 13, color: 'var(--c-text-muted)' }}>
              Sign in to your clinical account
            </div>
          </div>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div
          style={{
            display: 'flex',
            background: 'var(--c-surface-hover, #f1f5f9)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            marginBottom: 22,
            border: '1px solid var(--c-border)',
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: authMode === 'login' ? 'var(--c-surface, #ffffff)' : 'transparent',
              boxShadow: authMode === 'login' ? 'var(--shadow-xs)' : 'none',
              fontWeight: authMode === 'login' ? 800 : 500,
              color: authMode === 'login' ? 'var(--c-primary)' : 'var(--c-text-muted)',
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              setAuthMode('login');
              setError('');
              setSuccessMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: authMode === 'signup' ? 'var(--c-surface, #ffffff)' : 'transparent',
              boxShadow: authMode === 'signup' ? 'var(--shadow-xs)' : 'none',
              fontWeight: authMode === 'signup' ? 800 : 500,
              color: authMode === 'signup' ? 'var(--c-primary)' : 'var(--c-text-muted)',
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              setAuthMode('signup');
              setError('');
              setSuccessMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Feedback Alert Banner */}
        {error && (
          <div className="alert-banner error" style={{ marginBottom: 18 }}>
            <Icon name="alert" />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner info" style={{ marginBottom: 18 }}>
            <Icon name="check" />
            <div style={{ flex: 1 }}>{successMsg}</div>
          </div>
        )}

        {/* =========================================================
            FORM A: AUTHENTIC SIGN IN
            ========================================================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="loginEmail" style={{ fontWeight: 600 }}>
                Email Address or Medical ID
              </label>
              <input
                id="loginEmail"
                className="input"
                type="email"
                required
                autoComplete="username"
                placeholder="name@medora.hospital"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="loginPassword" style={{ fontWeight: 600 }}>
                  Password
                </label>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: 0, color: 'var(--c-primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotSubmitted(false);
                    setForgotEmail(loginEmail);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="loginPassword"
                  className="input"
                  type={pwVisible ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-icon"
                  style={{ position: 'absolute', right: 6, top: 6 }}
                  onClick={() => setPwVisible((v) => !v)}
                  aria-label={pwVisible ? 'Hide password' : 'Show password'}
                >
                  <Icon name="eye" />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: 'var(--c-primary)' }}
                />
                Remember workstation session
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14.5, fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>

            {/* Quick Demo Credentials Bar */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Demo Role Accounts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  style={{ borderRadius: 14, fontWeight: 700, borderColor: 'rgba(147, 51, 234, 0.4)', background: 'rgba(147, 51, 234, 0.08)', color: '#c084fc' }}
                  onClick={() => {
                    setLoginEmail('superadmin@medora.hospital');
                    setLoginPassword('superadmin123');
                  }}
                  title="Sign in as SaaS Super Admin (Registered Clinics & Subscriptions ONLY)"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  style={{ borderRadius: 14, fontWeight: 600 }}
                  onClick={() => {
                    setLoginEmail('admin@medora.hospital');
                    setLoginPassword('admin123');
                  }}
                  title="Sign in as Hospital Administrator"
                >
                  🏥 Admin
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  style={{ borderRadius: 14, fontWeight: 600 }}
                  onClick={() => {
                    setLoginEmail('s.khan@medora.hospital');
                    setLoginPassword('doctor123');
                  }}
                  title="Sign in as Doctor"
                >
                  🩺 Doctor
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  style={{ borderRadius: 14, fontWeight: 600 }}
                  onClick={() => {
                    setLoginEmail('nurse@medora.hospital');
                    setLoginPassword('nurse123');
                  }}
                  title="Sign in as Nurse"
                >
                  👩‍⚕️ Nurse
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  style={{ borderRadius: 14, fontWeight: 600 }}
                  onClick={() => {
                    setLoginEmail('patient@medora.hospital');
                    setLoginPassword('patient123');
                  }}
                  title="Sign in as Patient"
                >
                  👤 Patient
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================
            FORM B: AUTHENTIC SIGN UP / REGISTER
            ========================================================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} noValidate>
            {/* Account Type Selector */}
            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, marginBottom: 6 }}>Account Type</label>
              <div className="grid grid-2" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: accountType === 'Patient' ? 'rgba(37,99,235,0.08)' : 'var(--c-surface)',
                    borderColor: accountType === 'Patient' ? 'var(--c-primary)' : 'var(--c-border)',
                    color: accountType === 'Patient' ? 'var(--c-primary)' : 'var(--c-text)',
                    fontWeight: 700,
                    padding: '8px 10px',
                    justifyContent: 'center',
                  }}
                  onClick={() => setAccountType('Patient')}
                >
                  <Icon name="patients" /> Patient Account
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: accountType === 'Staff' ? 'rgba(37,99,235,0.08)' : 'var(--c-surface)',
                    borderColor: accountType === 'Staff' ? 'var(--c-primary)' : 'var(--c-border)',
                    color: accountType === 'Staff' ? 'var(--c-primary)' : 'var(--c-text)',
                    fontWeight: 700,
                    padding: '8px 10px',
                    justifyContent: 'center',
                  }}
                  onClick={() => setAccountType('Staff')}
                >
                  <Icon name="staff" /> Medical Staff
                </button>
              </div>
            </div>

            {/* Legal Full Name */}
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="signupName" style={{ fontWeight: 600 }}>
                Full Legal Name *
              </label>
              <input
                id="signupName"
                className="input"
                type="text"
                required
                placeholder={accountType === 'Patient' ? 'e.g. Ayesha Siddiqui' : 'e.g. Dr. Haris Mahmood'}
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-2" style={{ gap: 10, marginBottom: 12 }}>
              <div className="field">
                <label htmlFor="signupEmail" style={{ fontWeight: 600 }}>
                  Email Address *
                </label>
                <input
                  id="signupEmail"
                  className="input"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="signupPhone" style={{ fontWeight: 600 }}>
                  Mobile Phone *
                </label>
                <input
                  id="signupPhone"
                  className="input"
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {accountType === 'Patient' ? (
              <div className="grid grid-2" style={{ gap: 10, marginBottom: 12 }}>
                <div className="field">
                  <label htmlFor="signupDob" style={{ fontWeight: 600 }}>
                    Date of Birth
                  </label>
                  <input
                    id="signupDob"
                    className="input"
                    type="date"
                    value={signupDob}
                    onChange={(e) => setSignupDob(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="signupGender" style={{ fontWeight: 600 }}>
                    Gender
                  </label>
                  <select
                    id="signupGender"
                    className="select"
                    value={signupGender}
                    onChange={(e) => setSignupGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-2" style={{ gap: 10, marginBottom: 12 }}>
                <div className="field">
                  <label htmlFor="staffRole" style={{ fontWeight: 600 }}>
                    Staff Role *
                  </label>
                  <select
                    id="staffRole"
                    className="select"
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="Doctor">Doctor / Physician</option>
                    <option value="Nurse">Charge Nurse</option>
                    <option value="Receptionist">Front-Desk Receptionist</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="department" style={{ fontWeight: 600 }}>
                    Department
                  </label>
                  <select
                    id="department"
                    className="select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Laboratory">Pathology Lab</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Credentials */}
            <div className="grid grid-2" style={{ gap: 10, marginBottom: 14 }}>
              <div className="field">
                <label htmlFor="signupPassword" style={{ fontWeight: 600 }}>
                  Password *
                </label>
                <input
                  id="signupPassword"
                  className="input"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="signupConfirmPassword" style={{ fontWeight: 600 }}>
                  Confirm Password *
                </label>
                <input
                  id="signupConfirmPassword"
                  className="input"
                  type="password"
                  required
                  placeholder="Re-type password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Agreement Terms */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--c-text-muted)', fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  style={{ accentColor: 'var(--c-primary)', marginTop: 2 }}
                />
                <span>
                  I agree to the Medora HMS Hospital Health Records & Electronic Data Privacy Policy under HIPAA / PMDC standards.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14.5, fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Creating Account…' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

        {/* Clean Minimalist Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--c-text-faint)', fontSize: 12 }}>
          © {new Date().getFullYear()} Medora Healthcare · All rights reserved
        </div>
      </div>

      {/* =========================================================
          MODAL: FORGOT PASSWORD RECOVERY
          ========================================================= */}
      {forgotModalOpen && (
        <div className="overlay center" onClick={() => setForgotModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 15 }}>Reset Hospital Password</div>
              <button className="btn-icon" onClick={() => setForgotModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>Check Your Inbox</h3>
                <p className="hint" style={{ fontSize: 13, marginBottom: 18 }}>
                  Password recovery instructions and a secure 6-digit OTP code have been dispatched to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className="hint" style={{ fontSize: 12.5, margin: 0 }}>
                    Enter the email address associated with your medical staff or patient portal account:
                  </p>
                  <div className="field">
                    <label htmlFor="forgotEmail" style={{ fontWeight: 600 }}>Registered Email</label>
                    <input
                      id="forgotEmail"
                      type="email"
                      required
                      className="input"
                      placeholder="e.g. s.khan@medora.hospital"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-secondary" onClick={() => setForgotModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Dispatching…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
