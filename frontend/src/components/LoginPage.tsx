import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Menu,
  Shield,
  Briefcase,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ROLE_USER');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await onLogin(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName.trim()) {
      setError('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Vui lòng nhập địa chỉ Email.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(regEmail.trim(), regPassword, regFullName.trim(), regRole);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Đăng ký không thành công. Email này có thể đã được sử dụng.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError(null);
    setIsRegister(false);
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Segoe UI', 'Be Vietnam Pro', -apple-system, sans-serif",
        color: '#ffffff',
        /* Pastel Pink to Mint-Turquoise Gradient Background matching user's reference image */
        background: 'linear-gradient(180deg, #e6a3cf 0%, #dfaed5 18%, #d3bce3 38%, #c2cdee 60%, #aee0f0 80%, #9de7e2 100%)',
      }}
    >
      {/* Global CSS to prevent browser autofill from breaking capsule input style */}
      <style>{`
        .login-capsule-input {
          background: rgba(255, 255, 255, 0.22) !important;
          color: #ffffff !important;
        }
        .login-capsule-input::placeholder {
          color: rgba(255, 255, 255, 0.85) !important;
        }
        .login-capsule-input:-webkit-autofill,
        .login-capsule-input:-webkit-autofill:hover,
        .login-capsule-input:-webkit-autofill:focus,
        .login-capsule-input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(180, 140, 200, 0.85) inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #ffffff;
        }
      `}</style>

      {/* 1. SOFT LUMINOUS AMBIENT GLOW OVERLAY FOR PASTEL GRADIENT */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.25) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(157, 231, 226, 0.3) 0%, transparent 60%)',
        }}
      />

      {/* 2. TOP HEADER NAVIGATION BAR */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
        }}
      >
        {/* Left: Brand Logo matching Template DSGN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* Geometric Overlapping Circles Logo */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '3px solid #ffffff',
                marginRight: -10,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.08em', color: '#ffffff' }}>
              KBASE
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.75)', marginTop: 2 }}>
              HỆ THỐNG TRI THỨC
            </span>
          </div>
        </div>

        {/* Center: Navigation Links in Vietnamese */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span
            onClick={() => setIsRegister(false)}
            style={{ color: 'rgba(255, 255, 255, 0.9)', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
          >
            GIỚI THIỆU
          </span>
          <span
            onClick={() => setIsRegister(true)}
            style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
          >
            TÍNH NĂNG
          </span>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
          >
            <span>TÀI LIỆU API</span>
            <ExternalLink size={12} />
          </a>
        </nav>

        {/* Right: Sign In Button & Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            ĐĂNG NHẬP
          </button>

          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* 3. CENTER HERO MAIN CONTENT (SPLIT COMPOSITION) */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: '20px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          alignItems: 'center',
          gap: 60,
        }}
      >
        {/* LEFT COLUMN: CRISP CAPSULE LOGIN FORM */}
        <div
          style={{
            maxWidth: 380,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Circular Avatar Icon (Crisp - No Blur) */}
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              background: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 26,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            }}
          >
            {isRegister ? <UserPlus size={36} color="#ffffff" /> : <UserIcon size={38} color="#ffffff" strokeWidth={1.75} />}
          </div>

          {/* Error Message Box */}
          {error && (
            <div
              style={{
                width: '100%',
                background: 'rgba(220, 38, 38, 0.45)',
                border: '1px solid rgba(254, 202, 202, 0.6)',
                borderRadius: 9999,
                padding: '8px 18px',
                color: '#ffffff',
                fontSize: '0.78rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* A. LOGIN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Input 1: Username / Email */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <UserIcon size={17} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="TÊN ĐĂNG NHẬP / EMAIL"
                  value={loginEmail}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 20px 0 48px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid #ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(255, 255, 255, 0.38)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  }}
                />
              </div>

              {/* Input 2: Password */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="MẬT KHẨU"
                  value={loginPassword}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 46,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 44px 0 48px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid #ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(255, 255, 255, 0.38)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* White Pill Primary CTA Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 9999,
                  border: 'none',
                  background: '#ffffff',
                  color: '#a824d6',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginTop: 6,
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 14px 30px -4px rgba(0, 0, 0, 0.38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 25px -4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
              </button>

              {/* Sub-row: Ghi nhớ đăng nhập & Quên mật khẩu */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#ffffff', cursor: 'pointer' }}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <span
                  style={{
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    opacity: 0.9,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
                >
                  Quên mật khẩu?
                </span>
              </div>
            </form>
          ) : (
            /* B. REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {/* Họ và tên */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="HỌ VÀ TÊN"
                  value={regFullName}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 20px 0 46px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Địa chỉ Email */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="ĐỊA CHỈ EMAIL"
                  value={regEmail}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 20px 0 46px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Chọn vai trò */}
              <div style={{ position: 'relative' }}>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(30, 27, 75, 0.75)',
                    padding: '0 20px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ROLE_USER" style={{ color: '#0f172a', background: '#ffffff' }}>👤 Thành viên (Hỏi đáp & Tra cứu tài liệu)</option>
                  <option value="ROLE_OWNER" style={{ color: '#0f172a', background: '#ffffff' }}>📁 Chủ dự án (Tạo dự án & Tải lên tài liệu)</option>
                  <option value="ROLE_ADMIN" style={{ color: '#0f172a', background: '#ffffff' }}>🛡️ Quản trị viên (Toàn quyền quản trị)</option>
                </select>
              </div>

              {/* Mật khẩu */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={15} />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="MẬT KHẨU (TỐI THIỂU 6 KÝ TỰ)"
                  value={regPassword}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 40px 0 46px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Xác nhận mật khẩu */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={15} />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="XÁC NHẬN MẬT KHẨU"
                  value={regConfirmPassword}
                  className="login-capsule-input"
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(255, 255, 255, 0.38)',
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '0 20px 0 46px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Nút Tạo tài khoản */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 9999,
                  border: 'none',
                  background: '#ffffff',
                  color: '#a824d6',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginTop: 6,
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                Đã có tài khoản?{' '}
                <span
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  style={{ fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', color: '#ffffff' }}
                >
                  Đăng nhập ngay
                </span>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: GIANT "XIN CHÀO." HEADLINE & ACTION LINK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h1
            style={{
              fontSize: '4.8rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              lineHeight: 0.95,
              margin: 0,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            {isRegister ? 'Tham gia ngay.' : 'Xin chào.'}
          </h1>

          <p
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 440,
              margin: 0,
            }}
          >
            {isRegister
              ? 'Tạo tài khoản KBase để khám phá không gian làm việc chuyên nghiệp, chia sẻ tài liệu bảo mật và cùng làm việc với các thành viên trong nhóm.'
              : 'Hệ thống quản lý cơ sở tri thức dự án & trợ lý AI Copilot thông minh. Tải lên tài liệu đa định dạng, phân quyền 3 vai trò và hỏi đáp trích dẫn nguồn gốc chính xác.'}
          </p>

          <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>
            {!isRegister ? (
              <>
                Chưa có tài khoản?{' '}
                <span
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Đăng ký ngay
                </span>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <span
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Đăng nhập tại đây
                </span>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 4. BOTTOM PAGINATION DOTS & DEMO PRESET BAR */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '16px 48px 24px',
        }}
      >
        {/* 3 Pagination Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            onClick={() => setActiveSlide(0)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: activeSlide === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              boxShadow: activeSlide === 0 ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          />
          <span
            onClick={() => setActiveSlide(1)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: activeSlide === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              boxShadow: activeSlide === 1 ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          />
          <span
            onClick={() => setActiveSlide(2)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: activeSlide === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              boxShadow: activeSlide === 2 ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          />
        </div>

        {/* Demo Accounts Pill in Vietnamese (No Blur) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 9999,
            padding: '4px 14px',
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <span style={{ fontWeight: 600 }}>Tài khoản mẫu:</span>
          <button
            type="button"
            onClick={() => handleFillDemo('admin@kbase.com', 'Admin@123')}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              borderRadius: 9999,
              padding: '2px 8px',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Quản trị viên (Admin)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('owner@kbase.com', 'Owner@123')}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              borderRadius: 9999,
              padding: '2px 8px',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Chủ dự án (Owner)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('user@kbase.com', 'User@123')}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              borderRadius: 9999,
              padding: '2px 8px',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Thành viên (User)
          </button>
        </div>
      </footer>
    </div>
  );
};
