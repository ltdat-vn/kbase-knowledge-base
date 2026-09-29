import React from 'react';
import { User } from '../../types';
import {
  FolderGit2,
  Bot,
  Shield,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface SidebarRailProps {
  user: User | null;
  activeTab: 'projects' | 'chat' | 'admin';
  setActiveTab: (tab: 'projects' | 'chat' | 'admin') => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  user,
  activeTab,
  setActiveTab,
  isAiDrawerOpen,
  setIsAiDrawerOpen,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <aside
      style={{
        width: 72,
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #eaecf0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Top Group: Brand Logo & Main Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
        {/* Brand Logo Icon */}
        <div
          onClick={() => setActiveTab('projects')}
          title="KBase - Cơ Sở Tri Thức"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            width: 42,
            height: 42,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: '3px solid #1e1b4b',
                marginRight: -8,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#1e1b4b',
                boxShadow: '0 2px 8px rgba(30, 27, 75, 0.15)',
              }}
            />
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: 32, height: 1, background: '#f1f5f9' }} />

        {/* Nav Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
          {/* Projects Workspace Icon */}
          <button
            onClick={() => setActiveTab('projects')}
            title="Không Gian Dự Án"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'projects' ? '#0f172a' : 'transparent',
              color: activeTab === 'projects' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FolderGit2 size={20} />
          </button>

          {/* AI Copilot Toggle Icon */}
          <button
            onClick={() => {
              setActiveTab('chat');
              setIsAiDrawerOpen(true);
            }}
            title="Trợ Lý Trí Tuệ Nhân Tạo (Gemini 3.6 Flash)"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'chat' ? '#0f172a' : 'transparent',
              color: activeTab === 'chat' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={20} />
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
          </button>

          {/* Admin Oversight Icon (if Role Admin) */}
          {user?.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              title="Quản Trị Hệ Thống"
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                border: 'none',
                background: activeTab === 'admin' ? '#0f172a' : 'transparent',
                color: activeTab === 'admin' ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Shield size={20} />
            </button>
          )}

        </div>
      </div>

      {/* Bottom Group: User Profile / Logout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', padding: '0 4px' }}>
        {user ? (
          <>
            {/* User Avatar Badge & Full Name */}
            <div
              title={`${user.fullName} (${user.role === 'ROLE_ADMIN' ? 'Quản Trị' : user.role === 'ROLE_OWNER' ? 'Chủ Dự Án' : 'Thành Viên'}) - ${user.email}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: user.role === 'ROLE_ADMIN' ? '#f3e8ff' : user.role === 'ROLE_OWNER' ? '#e0f2fe' : '#ecfdf5',
                  color: user.role === 'ROLE_ADMIN' ? '#7e22ce' : user.role === 'ROLE_OWNER' ? '#0369a1' : '#047857',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {user.fullName.substring(0, 1).toUpperCase()}
              </div>

              {/* Tên người đang đăng nhập */}
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#334155',
                  textAlign: 'center',
                  width: '100%',
                  padding: '0 2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {user.fullName}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Đăng xuất"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <LogOut size={17} />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            title="Đăng nhập tài khoản"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <UserIcon size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
