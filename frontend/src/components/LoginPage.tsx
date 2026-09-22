import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Shield,
  Briefcase,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
        'Đăng ký không thành công. Email này có thể đã được đăng ký trước đó.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 40px',
      }}
    >
      {/* Centered Login/Register Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 450,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #eaecf0',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
          padding: '36px 32px',
          position: 'relative',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 6px 16px -3px rgba(15, 23, 42, 0.25)',
            }}
          >
            <Layers size={24} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6 }}>
            {tab === 'login'
              ? 'Chào mừng quay trở lại với hệ thống KBase'
              : 'Đăng ký tài khoản để bắt đầu sử dụng không gian làm việc'}
          </p>

          {/* Tab Pill Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 10,
              marginTop: 18,
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 8,
                border: 'none',
                background: tab === 'login' ? '#ffffff' : 'transparent',
                color: tab === 'login' ? '#0f172a' : '#64748b',
                fontWeight: tab === 'login' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: tab === 'login' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <LogIn size={14} /> Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 8,
                border: 'none',
                background: tab === 'register' ? '#ffffff' : 'transparent',
                color: tab === 'register' ? '#0f172a' : '#64748b',
                fontWeight: tab === 'register' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: tab === 'register' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <UserPlus size={14} /> Đăng Ký
            </button>
          </div>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: '0.8rem',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Địa Chỉ Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input-field"
                  style={{ paddingLeft: 36, height: 40 }}
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Mật Khẩu
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: 36, paddingRight: 36, height: 40 }}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-black-pill"
              style={{
                width: '100%',
                height: 42,
                marginTop: 6,
                fontSize: '0.875rem',
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.78rem', color: '#64748b' }}>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        ) : (
          /* 2. REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Họ và Tên *
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="input-field"
                  style={{ paddingLeft: 36, height: 38 }}
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Địa Chỉ Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input-field"
                  style={{ paddingLeft: 36, height: 38 }}
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            {/* Role Selection Dropdown / Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Vai Trò Tài Khoản (Role) *
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="input-field"
                style={{ height: 38, fontSize: '0.82rem', background: '#ffffff', cursor: 'pointer' }}
              >
                <option value="ROLE_USER">👤 Thành Viên (User) - Tra cứu & Hỏi đáp AI</option>
                <option value="ROLE_OWNER">📁 Chủ Dự Án (Owner) - Tạo dự án & Quản lý file</option>
                <option value="ROLE_ADMIN">🛡️ Quản Trị Viên (Admin) - Quản trị toàn hệ thống</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Mật Khẩu * (Tối thiểu 6 ký tự)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Tạo mật khẩu"
                  className="input-field"
                  style={{ paddingLeft: 36, paddingRight: 36, height: 38 }}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Xác Nhận Lại Mật Khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Nhập lại mật khẩu"
                  className="input-field"
                  style={{ paddingLeft: 36, height: 38 }}
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-black-pill"
              style={{
                width: '100%',
                height: 42,
                marginTop: 6,
                fontSize: '0.875rem',
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem', color: '#64748b' }}>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Subtle Sample Accounts Reference Bar at the Bottom */}
      <div
        style={{
          marginTop: 20,
          background: '#ffffff',
          borderRadius: 12,
          padding: '10px 18px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: '0.75rem',
          color: '#64748b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <span style={{ fontWeight: 600, color: '#334155' }}>Tài khoản mẫu:</span>
        <button
          type="button"
          onClick={() => handleFillDemo('admin@kbase.com', 'Admin@123')}
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 6,
            padding: '3px 8px',
            color: '#7e22ce',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Admin (Điền mẫu)
        </button>
        <button
          type="button"
          onClick={() => handleFillDemo('owner@kbase.com', 'Owner@123')}
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 6,
            padding: '3px 8px',
            color: '#0369a1',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Owner (Điền mẫu)
        </button>
        <button
          type="button"
          onClick={() => handleFillDemo('user@kbase.com', 'User@123')}
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 6,
            padding: '3px 8px',
            color: '#047857',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          User (Điền mẫu)
        </button>
      </div>
    </div>
  );
};
