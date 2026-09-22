import React, { useState, useEffect } from 'react';
import { Project, User, UserRole } from './types';
import { authApi, projectApi } from './services/api';
import { SidebarRail } from './components/SidebarRail';
import { TopHeader } from './components/TopHeader';
import { AuthModal } from './components/AuthModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectDetailView } from './components/ProjectDetailView';
import { AiChatPanel } from './components/AiChatPanel';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import {
  FolderGit2,
  Plus,
  Bot,
  Users,
  FileText,
  ArrowRight,
  Shield,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'chat' | 'admin'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kbase_token');
      if (token) {
        try {
          const user = await authApi.getCurrentUser();
          setCurrentUser(user);
        } catch {
          localStorage.removeItem('kbase_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Load accessible projects when user is logged in
  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const projs = await projectApi.getAll();
      setProjects(projs);
      setSelectedProject((curr) => {
        if (!curr) return null;
        return projs.find((p) => p.id === curr.id) || null;
      });
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    } else {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [currentUser]);

  const handleLogin = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    localStorage.setItem('kbase_token', res.token);
    const user = await authApi.getCurrentUser();
    setCurrentUser(user);
  };

  const handleRegister = async (email: string, pass: string, name: string, role: UserRole) => {
    const res = await authApi.register(email, pass, name, role);
    localStorage.setItem('kbase_token', res.token);
    const user = await authApi.getCurrentUser();
    setCurrentUser(user);
  };


  const handleLogout = () => {
    localStorage.removeItem('kbase_token');
    setCurrentUser(null);
    setActiveTab('projects');
    setSelectedProject(null);
  };

  const formatRoleName = (r?: string) => {
    if (r === 'OWNER') return 'Chủ Dự Án';
    if (r === 'ADMIN') return 'Quản Trị';
    if (r === 'VIEWER') return 'Người Xem';
    return 'Thành Viên';
  };

  // Breadcrumb path computation
  const getBreadcrumbs = () => {
    if (!currentUser) return ['KBase', 'Đăng Nhập'];
    if (selectedProject) return ['Cơ Sở Tri Thức', 'Không Gian Dự Án', selectedProject.name];
    if (activeTab === 'admin') return ['Hệ Thống', 'Quản Trị Viên'];
    if (activeTab === 'chat') return ['Cơ Sở Tri Thức', 'Trợ Lý AI'];
    return ['Cơ Sở Tri Thức', 'Tất Cả Dự Án'];
  };

  // Filtered projects based on search query
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="saas-layout">
      {/* 1. LEFT ICON RAIL (68px) */}
      <SidebarRail
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProject(null);
        }}
        isAiDrawerOpen={isAiDrawerOpen}
        setIsAiDrawerOpen={setIsAiDrawerOpen}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. CENTER MAIN COLUMN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header Bar */}
        <TopHeader
          user={currentUser}
          breadcrumbPath={getBreadcrumbs()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAiDrawerOpen={isAiDrawerOpen}
          setIsAiDrawerOpen={setIsAiDrawerOpen}
          onOpenCreateProject={!selectedProject && currentUser ? () => setIsCreateProjectOpen(true) : undefined}
          onOpenAuth={() => setIsAuthOpen(true)}
          onBreadcrumbClick={(idx) => {
            if (idx <= 1) {
              setSelectedProject(null);
              setActiveTab('projects');
            }
          }}
        />

        {/* Scrollable Main Body */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* A. LOGGED OUT LOGIN VIEW */}
          {!currentUser && !loading && (
            <LoginPage
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          )}

          {/* B. LOGGED IN WORKSPACE */}
          {currentUser && (
            <>
              {/* TAB 1: PROJECTS */}
              {activeTab === 'projects' && (
                <>
                  {selectedProject ? (
                    <ProjectDetailView
                      project={selectedProject}
                      currentUser={currentUser}
                      onBack={() => {
                        setSelectedProject(null);
                        loadProjects();
                      }}
                      allProjects={projects}
                      onOpenAiChat={() => setIsAiDrawerOpen(true)}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {/* Section Title Header matching Reference Image */}
                      <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>
                          Cơ Sở Tri Thức (Knowledge Base)
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
                          Quản lý các không gian dự án và các nguồn tài liệu kỹ thuật được kết nối.
                        </p>
                      </div>

                      {/* SECTION 1: RECENT PROJECTS (macOS Folder Preview Cards like Reference Image) */}
                      <div>
                        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                            Không gian làm việc gần đây
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {projects.length} không gian dự án
                          </span>
                        </div>

                        {projects.length === 0 ? (
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px dashed #cbd5e1',
                              borderRadius: 12,
                              padding: '40px 20px',
                              textAlign: 'center',
                            }}
                          >
                            <FolderGit2 size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                              Chưa có không gian dự án nào
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                              Hãy tạo dự án đầu tiên để bắt đầu lưu trữ tài liệu đặc tả và kích hoạt trợ lý AI.
                            </p>
                            <button
                              onClick={() => setIsCreateProjectOpen(true)}
                              className="btn btn-black-pill"
                              style={{ marginTop: 14 }}
                            >
                              <Plus size={15} /> Tạo Dự Án Đầu Tiên
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                              gap: 16,
                            }}
                          >
                            {projects.slice(0, 4).map((p) => (
                              <div
                                key={p.id}
                                onClick={() => setSelectedProject(p)}
                                className="folder-preview-card"
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  minHeight: 145,
                                }}
                              >
                                <div>
                                  {/* macOS Window Dots */}
                                  <div className="window-dots">
                                    <span className="window-dot" style={{ background: '#ef4444' }} />
                                    <span className="window-dot" style={{ background: '#f59e0b' }} />
                                    <span className="window-dot" style={{ background: '#10b981' }} />
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                                    <div
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0284c7',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <FolderGit2 size={18} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                      <h4
                                        style={{
                                          fontSize: '0.875rem',
                                          fontWeight: 600,
                                          color: '#0f172a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                        title={p.name}
                                      >
                                        {p.name}
                                      </h4>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                        {p.documentCount} tài liệu • {p.memberCount} thành viên
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Tạo ngày: {new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                                  <span style={{ color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    Mở <ArrowRight size={12} />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SECTION 2: ALL PROJECTS (Table matching Reference Image) */}
                      <div>
                        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                            Tất cả không gian dự án
                          </h3>
                        </div>

                        {filteredProjects.length === 0 ? (
                          <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 12, padding: 32, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Không tìm thấy dự án nào phù hợp với từ khóa.</p>
                          </div>
                        ) : (
                          <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                            <table className="modern-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '40%' }}>Tên Dự Án</th>
                                  <th>Vai Trò Của Bạn</th>
                                  <th>Số Tài Liệu</th>
                                  <th>Thành Viên</th>
                                  <th>Trạng Thái</th>
                                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredProjects.map((p) => (
                                  <tr
                                    key={p.id}
                                    onClick={() => setSelectedProject(p)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div
                                          style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 6,
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#0f172a',
                                            flexShrink: 0,
                                          }}
                                        >
                                          <FolderGit2 size={16} />
                                        </div>
                                        <div>
                                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                            {p.name}
                                          </div>
                                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.description || 'Chưa có mô tả'}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td>
                                      <span
                                        style={{
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          padding: '2px 8px',
                                          borderRadius: 4,
                                          background: p.currentUserRole === 'OWNER' ? '#e0f2fe' : '#f1f5f9',
                                          color: p.currentUserRole === 'OWNER' ? '#0369a1' : '#475569',
                                        }}
                                      >
                                        {formatRoleName(p.currentUserRole)}
                                      </span>
                                    </td>

                                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                      {p.documentCount} tệp
                                    </td>

                                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                      {p.memberCount} người
                                    </td>

                                     <td style={{ whiteSpace: 'nowrap' }}>
                                       <span className="badge-status badge-status-active" style={{ whiteSpace: 'nowrap' }}>
                                         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                                         Hoạt động
                                       </span>
                                     </td>

                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProject(p);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}
                                      >
                                        Mở Không Gian <ArrowRight size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: STANDALONE AI CHAT */}
              {activeTab === 'chat' && (
                <div style={{ height: 'calc(100vh - 120px)', background: '#ffffff', borderRadius: 12, border: '1px solid #eaecf0', overflow: 'hidden' }}>
                  <AiChatPanel projects={projects} selectedProjectId={selectedProject?.id} />
                </div>
              )}

              {/* TAB 3: ADMIN OVERSIGHT */}
              {activeTab === 'admin' && currentUser.role === 'ROLE_ADMIN' && (
                <AdminPanel />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. RIGHT COLLAPSIBLE AI COPILOT SIDEBAR (matching reference image) */}
      {isAiDrawerOpen && (
        <aside
          style={{
            width: 420,
            height: '100vh',
            borderLeft: '1px solid #eaecf0',
            background: '#ffffff',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sidebar)',
            zIndex: 40,
          }}
        >
          <AiChatPanel
            projects={projects}
            selectedProjectId={selectedProject?.id}
            isDrawer={true}
            onCloseDrawer={() => setIsAiDrawerOpen(false)}
          />
        </aside>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
          setSelectedProject(newProj);
        }}
      />
    </div>
  );
};

export default App;
