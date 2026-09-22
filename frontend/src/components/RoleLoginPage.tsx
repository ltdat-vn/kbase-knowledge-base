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
  ExternalLink,
  AlertCircle,
  Zap,
  ArrowRight,
  Database,
  Server,
  FileText,
  Bot,
  Users,
} from 'lucide-react';

interface RoleLoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  onQuickLogin: (role: 'admin' | 'owner' | 'user') => void;
}

interface RoleConfig {
  key: 'admin' | 'owner' | 'user';
  roleEnum: UserRole;
  title: string;
  subtitle: string;
  badge: string;
  defaultEmail: string;
  defaultPass: string;
  primaryColor: string;
  lightBg: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
  permissions: string[];
}

const ROLES: RoleConfig[] = [
  {
    key: 'admin',
    roleEnum: 'ROLE_ADMIN',
    title: 'Quản Trị Viên (Admin)',
    subtitle: 'Toàn quyền quản trị hệ thống',
    badge: 'ROLE_ADMIN',
    defaultEmail: 'admin@kbase.com',
    defaultPass: 'Admin@123',
    primaryColor: '#7c3aed',
    lightBg: '#faf5ff',
    borderColor: '#e9d5ff',
    icon: Shield,
    description: 'Quản trị hệ thống, giám sát toàn bộ người dùng, dự án, theo dõi dung lượng lưu trữ và kiểm soát an toàn bảo mật.',
    permissions: [
      'Quản lý tất cả tài khoản người dùng & kích hoạt/khóa tài khoản',
      'Giám sát thống kê hệ thống (tổng user, dự án, file, storage)',
      'Toàn quyền quản lý mọi dự án và tài liệu tri thức',
      'Đầy đủ quyền gọi Admin API và cấu hình Swagger',
    ],
  },
  {
    key: 'owner',
    roleEnum: 'ROLE_OWNER',
    title: 'Chủ Dự Án (Project Owner)',
    subtitle: 'Khởi tạo & Quản lý dự án',
    badge: 'ROLE_OWNER',
    defaultEmail: 'owner@kbase.com',
    defaultPass: 'Owner@123',
    primaryColor: '#0284c7',
    lightBg: '#f0f9ff',
    borderColor: '#bae6fd',
    icon: Briefcase,
    description: 'Khởi tạo các không gian tri thức dự án, mời đồng nghiệp tham gia, tải lên tài liệu và phân phối tri thức cho nhóm kỹ thuật.',
    permissions: [
      'Khởi tạo và chỉnh sửa không gian dự án mới',
      'Mời cộng tác viên tham gia với vai trò Owner, Member, Viewer',
      'Tải lên và phân loại tài liệu đa định dạng (PDF, Office, Media)',
      'Tra cứu và hỏi đáp AI Copilot trên phạm vi dự án sở hữu',
    ],
  },
  {
    key: 'user',
    roleEnum: 'ROLE_USER',
    title: 'Thành Viên (Member / User)',
    subtitle: 'Tra cứu & Hỏi đáp cùng AI',
    badge: 'ROLE_USER',
    defaultEmail: 'user@kbase.com',
    defaultPass: 'User@123',
    primaryColor: '#059669',
    lightBg: '#ecfdf5',
    borderColor: '#a7f3d0',
    icon: UserIcon,
    description: 'Thành viên nhóm kỹ thuật, tham gia các dự án được mời, đọc tài liệu hướng dẫn và hỏi đáp thông minh với trợ lý AI.',
    permissions: [
      'Tham gia vào các dự án được cấp quyền truy cập',
      'Xem trước trực tuyến và tải về an toàn các tài liệu nội bộ',
      'Tìm kiếm tức thời theo từ khóa và nội dung tài liệu',
      'Đặt câu hỏi cho Trợ lý Gemini AI kèm trích dẫn nguồn gốc',
    ],
  },
];

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
  onLogin,
  onRegister,
  onQuickLogin,
}) => {
  const [selectedRoleKey, setSelectedRoleKey] = useState<'admin' | 'owner' | 'user'>('admin');
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRole = ROLES.find((r) => r.key === selectedRoleKey)!;

  const [email, setEmail] = useState(currentRole.defaultEmail);
  const [password, setPassword] = useState(currentRole.defaultPass);
  const [fullName, setFullName] = useState('');

  // When switching role, update credentials preset
  const handleSelectRole = (roleKey: 'admin' | 'owner' | 'user') => {
    setSelectedRoleKey(roleKey);
    const target = ROLES.find((r) => r.key === roleKey)!;
    setEmail(target.defaultEmail);
    setPassword(target.defaultPass);
    setError(null);
  };

  const handleFillDemo = () => {
    setEmail(currentRole.defaultEmail);
    setPassword(currentRole.defaultPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName || `${currentRole.title}`, currentRole.roleEnum);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Đăng nhập không thành công. Hãy kiểm tra lại thông tin tài khoản hoặc kết nối server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>
      {/* Top Banner Header */}
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
          <span>Hệ Thống Phân Quyền Vai Trò (RBAC) • KBase Knowledge Base</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Cổng Đăng Nhập Dành Cho 3 Vai Trò
        </h1>
        <p style={{ fontSize: '0.98rem', color: '#64748b', maxWidth: 640, margin: '10px auto 0', lineHeight: 1.5 }}>
          Lựa chọn vai trò phù hợp bên dưới để đăng nhập hoặc trải nghiệm ngay các tính năng phân quyền chuyên biệt.
        </p>
      </div>

      {/* 1. THREE ROLE SELECTOR CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {ROLES.map((r) => {
          const isSelected = r.key === selectedRoleKey;
          const Icon = r.icon;
          return (
            <div
              key={r.key}
              onClick={() => handleSelectRole(r.key)}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '20px 20px',
                border: isSelected ? `2px solid ${r.primaryColor}` : '1px solid #e2e8f0',
                boxShadow: isSelected
                  ? `0 10px 25px -5px ${r.primaryColor}25, 0 4px 10px -2px ${r.primaryColor}15`
                  : '0 2px 6px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* Window Dots Style Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: r.lightBg,
                    color: r.primaryColor,
                    border: `1px solid ${r.borderColor}`,
                  }}
                >
                  {r.badge}
                </span>
              </div>

              {/* Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: r.lightBg,
                    border: `1px solid ${r.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: r.primaryColor,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
                    {r.subtitle}
                  </p>
                </div>
              </div>

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 18,
                    background: r.primaryColor,
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <CheckCircle2 size={12} /> Đang Chọn
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. MAIN LOGIN FORM & ROLE OVERVIEW SPLIT CONTAINER */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #eaecf0',
          boxShadow: '0 8px 30px -10px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.25fr',
        }}
      >
        {/* Left Side: Role Description & Responsibilities */}
        <div
          style={{
            background: '#f8fafc',
            borderRight: '1px solid #eaecf0',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: currentRole.lightBg,
                  color: currentRole.primaryColor,
                  border: `1px solid ${currentRole.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.createElement(currentRole.icon, { size: 18 })}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {currentRole.title}
                </h4>
                <span style={{ fontSize: '0.72rem', color: currentRole.primaryColor, fontWeight: 600 }}>
                  Quyền hạn chuẩn xác: {currentRole.badge}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {currentRole.description}
            </p>

            <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: 12 }}>
              Đặc quyền của vai trò này:
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentRole.permissions.map((perm, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#334155' }}>
                  <CheckCircle2 size={15} color={currentRole.primaryColor} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Demo Instant Entry Button */}
          <div
            style={{
              marginTop: 28,
              padding: '14px 16px',
              borderRadius: 12,
              background: currentRole.lightBg,
              border: `1px solid ${currentRole.borderColor}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: currentRole.primaryColor, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={14} /> Chế độ Đăng nhập 1-Click
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Không cần gõ phím</span>
            </div>
            <button
              onClick={() => onQuickLogin(currentRole.key)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: 8,
                border: 'none',
                background: currentRole.primaryColor,
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>Vào ngay với vai trò {currentRole.title.split(' ')[0]}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side: Form (Login / Register) */}
        <div style={{ padding: '32px 36px' }}>
          {/* Tabs: Đăng Nhập vs Đăng Ký */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eaecf0', paddingBottom: 14, marginBottom: 22 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: tab === 'login' ? 700 : 500,
                  color: tab === 'login' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingBottom: 6,
                  borderBottom: tab === 'login' ? `2px solid ${currentRole.primaryColor}` : '2px solid transparent',
                  marginBottom: -15,
                }}
              >
                <LogIn size={16} /> Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: tab === 'register' ? 700 : 500,
                  color: tab === 'register' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingBottom: 6,
                  borderBottom: tab === 'register' ? `2px solid ${currentRole.primaryColor}` : '2px solid transparent',
                  marginBottom: -15,
                }}
              >
                <UserPlus size={16} /> Đăng Ký Tài Khoản Mới
              </button>
            </div>

            {/* Quick Fill Button */}
            {tab === 'login' && (
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Điền tài khoản mẫu
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '0.8rem',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Vai Trò Khởi Tạo *
                  </label>
                  <div
                    style={{
                      background: currentRole.lightBg,
                      border: `1px solid ${currentRole.borderColor}`,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: currentRole.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {React.createElement(currentRole.icon, { size: 16 })}
                    <span>{currentRole.title} ({currentRole.badge})</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Địa Chỉ Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="user@kbase.com"
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Mật Khẩu *
                </label>
                {tab === 'login' && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Mẫu: <code style={{ color: currentRole.primaryColor, fontWeight: 600 }}>{currentRole.defaultPass}</code>
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: 36, paddingRight: 36 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                background: currentRole.primaryColor,
                borderColor: currentRole.primaryColor,
              }}
            >
              {loading ? (
                'Đang xác thực hệ thống...'
              ) : tab === 'login' ? (
                <>
                  <LogIn size={16} /> Đăng Nhập Với Vai Trò {currentRole.title.split(' ')[0]}
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Hoàn Tất Đăng Ký Tài Khoản
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Footnote */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Chuyển nhanh sang vai trò khác:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleSelectRole(r.key)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: `1px solid ${r.borderColor}`,
                    background: r.lightBg,
                    color: r.primaryColor,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {r.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILED RBAC PERMISSION COMPARISON MATRIX */}
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
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4338ca', borderRadius: 9999 }}
          >
            <ExternalLink size={13} /> Xem Chi Tiết Swagger API
          </a>
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
