import React from 'react';
import { User } from '../types';
import {
  BookOpen,
  FolderGit2,
  Bot,
  Shield,
  ExternalLink,
  LogOut,
  User as UserIcon,
  Sparkles,
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
        width: 68,
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
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={22} color="#ffffff" />
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

          {/* Swagger API External Link */}
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            title="Tài Liệu Swagger API"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Group: User Profile / Logout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
        {user ? (
          <>
            {/* User Avatar Badge */}
            <div
              title={`${user.fullName} (${user.role === 'ROLE_ADMIN' ? 'Quản Trị' : user.role === 'ROLE_OWNER' ? 'Chủ Dự Án' : 'Thành Viên'})`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: user.role === 'ROLE_ADMIN' ? '#f3e8ff' : user.role === 'ROLE_OWNER' ? '#e0f2fe' : '#ecfdf5',
                color: user.role === 'ROLE_ADMIN' ? '#7e22ce' : user.role === 'ROLE_OWNER' ? '#0369a1' : '#047857',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              {user.fullName.substring(0, 1).toUpperCase()}
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
