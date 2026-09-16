import React from 'react';
import { User } from '../types';
import {
  Search,
  Bell,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  ExternalLink,
  ChevronRight,
  FolderGit2,
  FolderPlus,
} from 'lucide-react';

interface TopHeaderProps {
  user: User | null;
  breadcrumbPath?: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  onOpenCreateProject?: () => void;
  onOpenUpload?: () => void;
  onQuickLogin: (role: 'admin' | 'owner' | 'user') => void;
  onOpenAuth: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  breadcrumbPath = ['KBase', 'Cơ Sở Tri Thức'],
  searchQuery,
  setSearchQuery,
  isAiDrawerOpen,
  setIsAiDrawerOpen,
  onOpenCreateProject,
  onOpenUpload,
  onQuickLogin,
  onOpenAuth,
}) => {
  return (
    <header
      style={{
        height: 60,
        background: '#ffffff',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
        {breadcrumbPath.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} color="#94a3b8" />}
            <span
              style={{
                fontWeight: idx === breadcrumbPath.length - 1 ? 600 : 400,
                color: idx === breadcrumbPath.length - 1 ? '#0f172a' : '#64748b',
              }}
            >
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center: Search Bar with Ctrl+K shortcut */}
      <div style={{ position: 'relative', width: 340 }}>
        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu, dự án..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{
            height: 36,
            paddingLeft: 34,
            paddingRight: 48,
            fontSize: '0.82rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 9999,
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.7rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#94a3b8',
            padding: '1px 6px',
            borderRadius: 4,
            fontWeight: 500,
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Swagger Link */}
        <a
          href="http://localhost:8080/swagger-ui/index.html"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ height: 34, borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, color: '#4338ca' }}
        >
          <ExternalLink size={13} /> Swagger API
        </a>

        {/* AI Copilot Drawer Toggle Button */}
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          title={isAiDrawerOpen ? 'Thu gọn cột Trợ lý AI' : 'Mở cột Trợ lý AI'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            border: '1px solid #e2e8f0',
            background: isAiDrawerOpen ? '#f1f5f9' : '#ffffff',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isAiDrawerOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </button>

        {/* If not logged in: Demo Switchers & Sign In */}
        {!user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: '2px 4px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center', margin: '0 4px' }}>Demo:</span>
              <button onClick={() => onQuickLogin('admin')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#9333ea', color: '#fff', borderRadius: 6 }}>Admin</button>
              <button onClick={() => onQuickLogin('owner')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#0284c7', color: '#fff', borderRadius: 6 }}>Owner</button>
              <button onClick={() => onQuickLogin('user')} className="btn btn-sm" style={{ padding: '3px 7px', fontSize: '0.72rem', background: '#059669', color: '#fff', borderRadius: 6 }}>User</button>
            </div>
            <button onClick={onOpenAuth} className="btn btn-black-pill" style={{ height: 34, padding: '0 14px' }}>
              Đăng Nhập
            </button>
          </div>
        ) : (
          /* If logged in: Action button */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onOpenCreateProject && (
              <button onClick={onOpenCreateProject} className="btn btn-black-pill" style={{ height: 36 }}>
                <Plus size={15} /> Tạo Dự Án Mới
              </button>
            )}
            {onOpenUpload && (
              <button onClick={onOpenUpload} className="btn btn-black-pill" style={{ height: 36 }}>
                <Plus size={15} /> Tải Tệp Mới
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
