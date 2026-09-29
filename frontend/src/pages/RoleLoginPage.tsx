import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Shield,
  Briefcase,
  User as UserIcon,
  LogIn,
  UserPlus,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Check,
  Info,
  UserCheck,
} from 'lucide-react';

interface RoleLoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
}

interface RoleOption {
  role: UserRole;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  color: string;
  bgLight: string;
  borderColor: string;
  icon: React.ElementType;
  demoEmail: string;
  demoPass: string;
  description: string;
  permissions: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'ROLE_ADMIN',
    title: 'Quản Trị Viên (Admin)',
    shortTitle: 'Admin',
    subtitle: 'Toàn quyền quản trị hệ thống',
    badge: 'ROLE_ADMIN',
    color: '#7c3aed',
    bgLight: '#faf5ff',
    borderColor: '#e9d5ff',
    icon: Shield,
    demoEmail: 'admin@kbase.com',
    demoPass: 'Admin@123',
    description: 'Quản trị hệ thống, quản lý tất cả tài khoản người dùng, giám sát dung lượng bộ nhớ và cấu hình toàn bộ dự án.',
    permissions: [
      'Quản lý tất cả tài khoản người dùng (Kích hoạt / Khóa tài khoản)',
      'Giám sát thống kê hệ thống (Users, Dự án, Files, Dung lượng)',
      'Toàn quyền quản lý mọi dự án tri thức',
      'Đầy đủ quyền gọi Admin API và Quản trị',
    ],
  },
  {
    role: 'ROLE_OWNER',
    title: 'Chủ Dự Án (Project Owner)',
    shortTitle: 'Owner',
    subtitle: 'Khởi tạo & Quản lý dự án',
    badge: 'ROLE_OWNER',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
    icon: Briefcase,
    demoEmail: 'owner@kbase.com',
    demoPass: 'Owner@123',
    description: 'Khởi tạo các không gian làm việc dự án, mời đồng nghiệp tham gia, tải lên và tổ chức tài liệu tri thức cho nhóm.',
    permissions: [
      'Khởi tạo và chỉnh sửa không gian dự án mới',
      'Mời cộng tác viên tham gia với vai trò Owner, Member, Viewer',
      'Tải lên và quản lý tài liệu đa định dạng (PDF, Word, Excel, Video)',
      'Hỏi đáp cùng Trợ lý Gemini AI trong phạm vi dự án',
    ],
  },
  {
    role: 'ROLE_USER',
    title: 'Thành Viên (Member / User)',
    shortTitle: 'User',
    subtitle: 'Tra cứu & Hỏi đáp cùng AI',
    badge: 'ROLE_USER',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    icon: UserIcon,
    demoEmail: 'user@kbase.com',
    demoPass: 'User@123',
    description: 'Thành viên nhóm, tham gia vào các dự án được mời, đọc tài liệu hướng dẫn và hỏi đáp thông minh với trợ lý AI.',
    permissions: [
      'Tham gia vào các dự án được cấp quyền truy cập',
      'Xem trước trực tuyến và tải về an toàn tài liệu',
      'Tìm kiếm tức thời theo từ khóa và nội dung file',
      'Hỏi đáp với Trợ lý AI Copilot kèm trích dẫn tài liệu gốc',
    ],
  },
];

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ROLE_ADMIN');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentRoleConfig = ROLE_OPTIONS.find((r) => r.role === selectedRole)!;

  // Handle Fill Demo Credentials into the Login Form (only fills inputs, DOES NOT bypass)
  const handleFillDemoToForm = (role: RoleOption) => {
    setSelectedRole(role.role);
    setLoginEmail(role.demoEmail);
    setLoginPassword(role.demoPass);
    setError(null);
    setSuccessMsg(`Đã điền thông tin tài khoản mẫu ${role.shortTitle}. Bạn hãy bấm "Đăng Nhập" để xác thực qua hệ thống.`);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regFullName.trim()) {
      setError('Vui lòng nhập Họ và tên của bạn.');
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
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(regEmail.trim(), regPassword, regFullName.trim(), selectedRole);
      // Upon successful registration, onRegister updates auth state in App.tsx
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Đăng ký tài khoản không thành công. Email này có thể đã được sử dụng.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>
      {/* 1. TOP HEADER BANNER */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            marginBottom: 14,
          }}
        >
          <Sparkles size={15} color="#7c3aed" />
          <span>Hệ Thống Phân Quyền Vai Trò (RBAC) • Bảo Mật Chuẩn Spring Security & JWT</span>
        </div>

        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          {activeTab === 'login' ? 'Đăng Nhập Hệ Thống KBase' : 'Đăng Ký Tài Khoản Cho Từng Vai Trò'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 640, margin: '8px auto 0', lineHeight: 1.5 }}>
          {activeTab === 'login'
            ? 'Vui lòng nhập đúng địa chỉ Email và Mật khẩu của bạn để truy cập không gian làm việc.'
            : 'Chọn một vai trò phù hợp (Admin, Owner, User) và nhập thông tin để tạo tài khoản riêng trong hệ thống.'}
        </p>

        {/* Tab Switcher: Đăng Nhập vs Đăng Ký */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 9999,
            marginTop: 20,
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              border: 'none',
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'login' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'login' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
            }}
          >
            <LogIn size={15} /> Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              border: 'none',
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'register' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'register' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
            }}
          >
            <UserPlus size={15} /> Đăng Ký Tài Khoản Mới
          </button>
        </div>
      </div>

      {/* 2. ROLE SELECTOR CARDS (Hiển thị 3 vai trò rõ ràng) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            {activeTab === 'register' ? '1. Chọn vai trò bạn muốn tạo tài khoản:' : 'Chọn vai trò để xem đặc quyền & thông tin:'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {activeTab === 'register' ? 'Tài khoản sẽ được phân cấp đúng quyền hạn tương ứng' : 'Phân quyền chuẩn RBAC'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ROLE_OPTIONS.map((r) => {
            const isSelected = r.role === selectedRole;
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '16px 18px',
                  border: isSelected ? `2px solid ${r.color}` : '1px solid #e2e8f0',
                  boxShadow: isSelected
                    ? `0 8px 20px -4px ${r.color}20, 0 2px 6px -1px ${r.color}10`
                    : '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: r.bgLight,
                      color: r.color,
                      border: `1px solid ${r.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background: r.bgLight,
                      color: r.color,
                      border: `1px solid ${r.borderColor}`,
                    }}
                  >
                    {r.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '3px 0 0', lineHeight: 1.4 }}>
                  {r.subtitle}
                </p>

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -9,
                      right: 14,
                      background: r.color,
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={11} /> Đang chọn
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN FORM & ROLE DETAIL CONTAINER */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #eaecf0',
          boxShadow: '0 8px 30px -10px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
        }}
      >
        {/* Left Column: Role Details & Responsibilities */}
        <div
          style={{
            background: '#f8fafc',
            borderRight: '1px solid #eaecf0',
            padding: '30px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: currentRoleConfig.bgLight,
                  color: currentRoleConfig.color,
                  border: `1px solid ${currentRoleConfig.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.createElement(currentRoleConfig.icon, { size: 20 })}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {currentRoleConfig.title}
                </h4>
                <span style={{ fontSize: '0.72rem', color: currentRoleConfig.color, fontWeight: 600 }}>
                  Mã định danh: {currentRoleConfig.badge}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {currentRoleConfig.description}
            </p>

            <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: 12 }}>
              Quyền hạn cụ thể trong hệ thống:
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentRoleConfig.permissions.map((perm, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#334155' }}>
                  <CheckCircle2 size={15} color={currentRoleConfig.color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Info Box: Gợi ý tài khoản mẫu (KHÔNG PHẢI NÚT BYPASS) */}
          <div
            style={{
              marginTop: 26,
              padding: '14px 16px',
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              <Info size={14} color="#6366f1" />
              <span>Gợi ý tài khoản mẫu có sẵn trong Database:</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
              <div>Email: <strong style={{ color: '#0f172a' }}>{currentRoleConfig.demoEmail}</strong></div>
              <div>Mật khẩu: <strong style={{ color: '#0f172a' }}>{currentRoleConfig.demoPass}</strong></div>
            </div>
            {activeTab === 'login' && (
              <button
                type="button"
                onClick={() => handleFillDemoToForm(currentRoleConfig)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
              >
                <span>Điền nhanh thông tin mẫu này vào form</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Actual Form (Login or Register) */}
        <div style={{ padding: '32px 34px' }}>
          {/* Notification Messages */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '11px 14px',
                color: '#dc2626',
                fontSize: '0.82rem',
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

          {successMsg && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 8,
                padding: '11px 14px',
                color: '#047857',
                fontSize: '0.82rem',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB A: FORM ĐĂNG NHẬP */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Đăng Nhập Tài Khoản
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
                  Xác thực thông tin tài khoản với máy chủ backend để vào hệ thống.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Địa Chỉ Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="Nhập email của bạn (ví dụ: your_name@kbase.com)"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
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
                    Mật Khẩu *
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu"
                    className="input-field"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
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
                  marginTop: 8,
                  fontSize: '0.875rem',
                  background: '#0f172a',
                  borderColor: '#0f172a',
                }}
              >
                {loading ? (
                  'Đang kiểm tra thông tin...'
                ) : (
                  <>
                    <LogIn size={16} /> Đăng Nhập Vào Không Gian
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                Chưa có tài khoản riêng?{' '}
                <span
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Bấm vào đây để đăng ký tài khoản mới
                </span>
              </div>
            </form>
          )}

          {/* TAB B: FORM ĐĂNG KÝ TÀI KHOẢN MỚI */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Đăng Ký Tài Khoản Mới
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
                  Tạo tài khoản riêng và gắn với vai trò{' '}
                  <strong style={{ color: currentRoleConfig.color }}>{currentRoleConfig.title}</strong>
                </p>
              </div>

              {/* Selected Role Reminder */}
              <div
                style={{
                  background: currentRoleConfig.bgLight,
                  border: `1px solid ${currentRoleConfig.borderColor}`,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: currentRoleConfig.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <UserCheck size={16} />
                <span>Vai trò đã chọn: {currentRoleConfig.title} ({currentRoleConfig.badge})</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  Họ và Tên Của Bạn *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="input-field"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  Địa Chỉ Email Riêng *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
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
                    placeholder="Tạo mật khẩu an toàn"
                    className="input-field"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
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
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
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
                  marginTop: 8,
                  fontSize: '0.875rem',
                  background: currentRoleConfig.color,
                  borderColor: currentRoleConfig.color,
                }}
              >
                {loading ? (
                  'Đang tạo tài khoản...'
                ) : (
                  <>
                    <UserPlus size={16} /> Tạo Tài Khoản {currentRoleConfig.shortTitle}
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 10, paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                Đã có tài khoản?{' '}
                <span
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Quay lại đăng nhập
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 4. RBAC COMPARISON MATRIX */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #eaecf0',
          padding: '24px 28px',
          boxShadow: '0 2px 8px -2px rgba(16, 24, 40, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              📊 Bảng So Sánh Quyền Hạn Chi Tiết Giữa 3 Vai Trò
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0' }}>
              Mô hình bảo mật phân quyền Role-Based Access Control (RBAC) được áp dụng tại các tầng Spring Security và UI.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#475569' }}>
                  Chức năng / Nghiệp vụ
                </th>
                <th style={{ textAlign: 'center', padding: '10px 14px', fontWeight: 700, color: '#7c3aed', background: '#faf5ff' }}>
                  Quản Trị Viên (Admin)
                </th>
                <th style={{ textAlign: 'center', padding: '10px 14px', fontWeight: 700, color: '#0284c7', background: '#f0f9ff' }}>
                  Chủ Dự Án (Owner)
                </th>
                <th style={{ textAlign: 'center', padding: '10px 14px', fontWeight: 700, color: '#059669', background: '#ecfdf5' }}>
                  Thành Viên (User)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Quản lý toàn bộ người dùng & phân quyền hệ thống', admin: true, owner: false, user: false },
                { name: 'Giám sát dung lượng lưu trữ & số liệu tổng quan', admin: true, owner: false, user: false },
                { name: 'Tạo lập & quản lý không gian dự án mới', admin: true, owner: true, user: false },
                { name: 'Mời thành viên tham gia dự án qua email', admin: true, owner: true, user: false },
                { name: 'Tải lên tài liệu (PDF, Word, Excel, Video, Ảnh)', admin: true, owner: true, user: true },
                { name: 'Xem trước tài liệu trực tuyến (Inline Preview) & Tải về', admin: true, owner: true, user: true },
                { name: 'Hỏi đáp với Trợ lý Gemini AI kèm trích dẫn nguồn gốc', admin: true, owner: true, user: true },
                { name: 'Tìm kiếm tức thời theo từ khóa và nội dung file', admin: true, owner: true, user: true },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>
                    {row.name}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', background: '#faf5ff' }}>
                    {row.admin ? (
                      <span style={{ color: '#7c3aed', fontWeight: 700 }}>✓ Toàn quyền</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', background: '#f0f9ff' }}>
                    {row.owner ? (
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>✓ Cho phép</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', background: '#ecfdf5' }}>
                    {row.user ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Cho phép</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
