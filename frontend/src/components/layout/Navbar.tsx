import React from 'react';
import { User } from '../../types';
import {
  BookOpen,
  LogOut,
  Shield,
  FolderGit2,
  Bot,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'projects' | 'chat' | 'admin';
  setActiveTab: (tab: 'projects' | 'chat' | 'admin') => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onQuickLogin: (role: 'admin' | 'owner' | 'user') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
  onQuickLogin,
}) => {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 28px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KBase
            </h1>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginTop: -4 }}>
              Cơ Sở Tri Thức Dự Án & AI
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav style={{ display: 'flex', gap: 6, background: 'rgba(15, 23, 42, 0.6)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'projects' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'projects' ? '#818cf8' : '#9ca3af',
                border: activeTab === 'projects' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
              }}
              onClick={() => setActiveTab('projects')}
            >
              <FolderGit2 size={16} /> Dự Án
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'chat' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeTab === 'chat' ? '#22d3ee' : '#9ca3af',
                border: activeTab === 'chat' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
              }}
              onClick={() => setActiveTab('chat')}
            >
              <Bot size={16} /> Trợ Lý AI
            </button>
            {user.role === 'ROLE_ADMIN' && (
              <button
                className="btn btn-sm"
                style={{
                  background: activeTab === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  color: activeTab === 'admin' ? '#c084fc' : '#9ca3af',
                  border: activeTab === 'admin' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none',
                }}
                onClick={() => setActiveTab('admin')}
              >
                <Shield size={16} /> Quản Trị Hệ Thống
              </button>
            )}
          </nav>
        )}

        {/* Right side: Links & User session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                  <span className={`badge ${user.role === 'ROLE_ADMIN' ? 'badge-admin' : user.role === 'ROLE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                    {user.role === 'ROLE_ADMIN' ? 'QUẢN TRỊ' : user.role === 'ROLE_OWNER' ? 'CHỦ DỰ ÁN' : 'NGƯỜI DÙNG'}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Đăng xuất"
                style={{ padding: 8 }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Quick Login selector for demo */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: 8 }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', alignSelf: 'center', marginRight: 4 }}>Demo:</span>
                <button onClick={() => onQuickLogin('admin')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#9333ea', color: '#fff' }}>Admin</button>
                <button onClick={() => onQuickLogin('owner')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#0284c7', color: '#fff' }}>Owner</button>
                <button onClick={() => onQuickLogin('user')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#059669', color: '#fff' }}>User</button>
              </div>
              <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
                <UserIcon size={15} /> Đăng Nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
