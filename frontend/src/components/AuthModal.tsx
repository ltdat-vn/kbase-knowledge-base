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
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 20 }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: tab === 'login' ? '#818cf8' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => { setTab('login'); setError(null); }}
          >
            <LogIn size={18} /> Sign In
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: tab === 'register' ? '#818cf8' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={() => { setTab('register'); setError(null); }}
          >
            <UserPlus size={18} /> Create Account
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Account Role</label>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="ROLE_USER">User (Uploads docs, asks AI questions)</option>
                  <option value="ROLE_OWNER">Owner (Creates projects, invites team)</option>
                  <option value="ROLE_ADMIN">Admin (Manages all users & projects)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Email Address</label>
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
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginBottom: 10 }}>
            Or instantly log in with pre-seeded test accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              onClick={() => { onQuickLogin('admin'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: 4, padding: '10px 4px' }}
            >
              <Shield size={16} color="#c084fc" />
              <span style={{ fontSize: '0.75rem' }}>Admin</span>
            </button>
            <button
              onClick={() => { onQuickLogin('owner'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: 4, padding: '10px 4px' }}
            >
              <Briefcase size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.75rem' }}>Owner</span>
            </button>
            <button
              onClick={() => { onQuickLogin('user'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: 4, padding: '10px 4px' }}
            >
              <UserIcon size={16} color="#34d399" />
              <span style={{ fontSize: '0.75rem' }}>User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
