import React, { useState } from 'react';
import { UserRole } from '../types';
import { LogIn, UserPlus, X, Shield, Briefcase, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  onQuickLogin: (role: 'admin' | 'owner' | 'user') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onQuickLogin,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName, role);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 440,
          padding: 30,
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #eaecf0', paddingBottom: 12, marginBottom: 20 }}>
          <button
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
              paddingBottom: 4,
              borderBottom: tab === 'login' ? '2px solid #0f172a' : '2px solid transparent',
              marginBottom: -13,
            }}
            onClick={() => { setTab('login'); setError(null); }}
          >
            <LogIn size={16} /> Đăng Nhập
          </button>
          <button
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
              paddingBottom: 4,
              borderBottom: tab === 'register' ? '2px solid #0f172a' : '2px solid transparent',
              marginBottom: -13,
            }}
            onClick={() => { setTab('register'); setError(null); }}
          >
            <UserPlus size={16} /> Đăng Ký Tài Khoản
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: '0.82rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
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
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                  Vai Trò Tài Khoản *
                </label>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="ROLE_USER">Người Dùng (User - Tải tài liệu, hỏi đáp AI)</option>
                  <option value="ROLE_OWNER">Chủ Dự Án (Owner - Tạo dự án, mời thành viên)</option>
                  <option value="ROLE_ADMIN">Quản Trị Viên (Admin - Toàn quyền quản trị)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Địa Chỉ Email *
            </label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Mật Khẩu *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-black-pill"
            style={{ width: '100%', height: 40, marginTop: 6, fontSize: '0.875rem' }}
          >
            {loading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginBottom: 10 }}>
            Hoặc đăng nhập nhanh bằng các tài khoản mẫu:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              onClick={() => { onQuickLogin('admin'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                gap: 4,
                padding: '8px 4px',
                background: '#faf5ff',
                borderColor: '#e9d5ff',
                color: '#7e22ce',
              }}
            >
              <Shield size={16} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Admin</span>
            </button>
            <button
              onClick={() => { onQuickLogin('owner'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                gap: 4,
                padding: '8px 4px',
                background: '#f0f9ff',
                borderColor: '#bae6fd',
                color: '#0369a1',
              }}
            >
              <Briefcase size={16} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Owner</span>
            </button>
            <button
              onClick={() => { onQuickLogin('user'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                gap: 4,
                padding: '8px 4px',
                background: '#ecfdf5',
                borderColor: '#a7f3d0',
                color: '#047857',
              }}
            >
              <UserIcon size={16} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
