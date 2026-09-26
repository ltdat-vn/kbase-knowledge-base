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
  Pin,
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

  // Pinned projects state (persisted per user or default)
  const [pinnedProjectIds, setPinnedProjectIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('kbase_pinned_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Sync pinned projects with current user
  useEffect(() => {
    try {
      const key = currentUser ? `kbase_pinned_projects_${currentUser.id}` : 'kbase_pinned_projects';
      const saved = localStorage.getItem(key);
      if (saved) {
        setPinnedProjectIds(JSON.parse(saved));
      } else {
        const shared = localStorage.getItem('kbase_pinned_projects');
        setPinnedProjectIds(shared ? JSON.parse(shared) : []);
      }
    } catch {
      setPinnedProjectIds([]);
    }
  }, [currentUser]);

  const togglePinProject = (projectId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const proj = projects.find((p) => p.id === projectId);
    const projName = proj ? proj.name : 'Dự án';

    setPinnedProjectIds((prev) => {
      const isCurrentlyPinned = prev.includes(projectId);
      const next = isCurrentlyPinned
        ? prev.filter((id) => id !== projectId)
        : [projectId, ...prev]; // newly pinned project placed first

      try {
        const key = currentUser ? `kbase_pinned_projects_${currentUser.id}` : 'kbase_pinned_projects';
        localStorage.setItem(key, JSON.stringify(next));
        localStorage.setItem('kbase_pinned_projects', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save pinned projects', err);
      }

      setToastMessage(
        isCurrentlyPinned
          ? `Đã bỏ ghim dự án "${projName}"`
          : `Đã ghim dự án "${projName}" lên đầu`
      );
      setTimeout(() => setToastMessage(null), 3000);

      return next;
    });
  };

  // Helper to sort list with pinned items first (preserving pin order)
  const sortProjectsWithPinned = (list: Project[]) => {
    return [...list].sort((a, b) => {
      const isPinnedA = pinnedProjectIds.includes(a.id);
      const isPinnedB = pinnedProjectIds.includes(b.id);
      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;
      if (isPinnedA && isPinnedB) {
        return pinnedProjectIds.indexOf(a.id) - pinnedProjectIds.indexOf(b.id);
      }
      return 0;
    });
  };

  const sortedAllProjects = sortProjectsWithPinned(projects);

  // Filtered projects based on search query, pinned first
  const filteredProjects = sortProjectsWithPinned(
    projects.filter((p) => {
      if (!searchQuery.trim()) return true;
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
  );

  // Full-screen immersive login page when logged out
  if (!currentUser && !loading) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

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
          onOpenCreateProject={!selectedProject && currentUser && (currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_OWNER') ? () => setIsCreateProjectOpen(true) : undefined}
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
          {/* LOGGED IN WORKSPACE */}
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
                      isPinned={pinnedProjectIds.includes(selectedProject.id)}
                      onTogglePin={() => togglePinProject(selectedProject.id)}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                              Không gian làm việc gần đây
                            </h3>
                            {pinnedProjectIds.length > 0 && (
                              <span className="badge-pinned" title={`${pinnedProjectIds.length} dự án đã ghim lên đầu`}>
                                <Pin size={10} style={{ fill: '#2563eb' }} /> {pinnedProjectIds.length} đã ghim
                              </span>
                            )}
                          </div>
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
                            {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_OWNER') ? (
                              <>
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
                              </>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                                Bạn chưa tham gia dự án nào. Vui lòng liên hệ Chủ sở hữu (Owner) hoặc Admin để được thêm vào dự án.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                              gap: 16,
                            }}
                          >
                            {sortedAllProjects.slice(0, 4).map((p) => {
                              const isPinned = pinnedProjectIds.includes(p.id);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => setSelectedProject(p)}
                                  className={`folder-preview-card ${isPinned ? 'pinned-card' : ''}`}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: 145,
                                  }}
                                >
                                  <div>
                                    {/* macOS Window Dots & Pin Button */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                      <div className="window-dots" style={{ margin: 0 }}>
                                        <span className="window-dot" style={{ background: '#ef4444' }} />
                                        <span className="window-dot" style={{ background: '#f59e0b' }} />
                                        <span className="window-dot" style={{ background: '#10b981' }} />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={(e) => togglePinProject(p.id, e)}
                                        className={`btn-pin-toggle ${isPinned ? 'is-pinned' : ''}`}
                                        title={isPinned ? 'Bỏ ghim dự án' : 'Ghim dự án lên đầu'}
                                        style={{
                                          width: 24,
                                          height: 24,
                                        }}
                                      >
                                        <Pin
                                          size={13}
                                          style={{
                                            transform: isPinned ? 'rotate(45deg)' : 'none',
                                            fill: isPinned ? '#2563eb' : 'none',
                                          }}
                                        />
                                      </button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                      <div
                                        style={{
                                          width: 34,
                                          height: 34,
                                          borderRadius: 8,
                                          background: isPinned ? '#eff6ff' : '#f8fafc',
                                          border: isPinned ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: isPinned ? '#2563eb' : '#0284c7',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <FolderGit2 size={18} />
                                      </div>
                                      <div style={{ overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                                        </div>
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
                              );
                            })}
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
                                {filteredProjects.map((p) => {
                                  const isPinned = pinnedProjectIds.includes(p.id);
                                  return (
                                    <tr
                                      key={p.id}
                                      onClick={() => setSelectedProject(p)}
                                      className={isPinned ? 'pinned-row' : ''}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => togglePinProject(p.id, e)}
                                            className={`btn-pin-toggle ${isPinned ? 'is-pinned' : ''}`}
                                            title={isPinned ? 'Bỏ ghim dự án' : 'Ghim dự án lên đầu'}
                                          >
                                            <Pin
                                              size={14}
                                              style={{
                                                transform: isPinned ? 'rotate(45deg)' : 'none',
                                                fill: isPinned ? '#2563eb' : 'none',
                                              }}
                                            />
                                          </button>
                                          <div
                                            style={{
                                              width: 30,
                                              height: 30,
                                              borderRadius: 6,
                                              background: isPinned ? '#eff6ff' : '#f8fafc',
                                              border: isPinned ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: isPinned ? '#2563eb' : '#0f172a',
                                              flexShrink: 0,
                                            }}
                                          >
                                            <FolderGit2 size={16} />
                                          </div>
                                          <div>
                                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                              {p.name}
                                              {isPinned && (
                                                <span className="badge-pinned">
                                                  <Pin size={10} style={{ fill: '#2563eb' }} /> Đã ghim
                                                </span>
                                              )}
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
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => togglePinProject(p.id, e)}
                                            className="btn btn-secondary btn-sm"
                                            style={{
                                              padding: '4px 8px',
                                              borderRadius: 6,
                                              fontSize: '0.75rem',
                                              borderColor: isPinned ? '#bfdbfe' : '#e2e8f0',
                                              background: isPinned ? '#eff6ff' : '#ffffff',
                                              color: isPinned ? '#2563eb' : '#64748b',
                                            }}
                                            title={isPinned ? 'Bỏ ghim dự án' : 'Ghim dự án lên đầu'}
                                          >
                                            <Pin size={12} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', fill: isPinned ? '#2563eb' : 'none' }} />
                                          </button>
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
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="toast-notification"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Pin size={15} style={{ color: '#60a5fa', transform: 'rotate(45deg)', fill: '#60a5fa' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
