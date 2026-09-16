import React, { useState, useEffect } from 'react';
import { Project, User, UserRole } from './types';
import { authApi, projectApi } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectDetailView } from './components/ProjectDetailView';
import { AiChatPanel } from './components/AiChatPanel';
import { AdminPanel } from './components/AdminPanel';
import {
  FolderGit2,
  FolderPlus,
  Bot,
  Users,
  FileText,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'chat' | 'admin'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      if (selectedProject) {
        const refreshed = projs.find((p) => p.id === selectedProject.id);
        if (refreshed) setSelectedProject(refreshed);
      }
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

  const handleQuickLogin = async (role: 'admin' | 'owner' | 'user') => {
    const creds = {
      admin: { email: 'admin@kbase.com', pass: 'Admin@123' },
      owner: { email: 'owner@kbase.com', pass: 'Owner@123' },
      user: { email: 'user@kbase.com', pass: 'User@123' },
    }[role];

    try {
      await handleLogin(creds.email, creds.pass);
    } catch (err) {
      alert('Đăng nhập nhanh thất bại. Hãy đảm bảo backend Spring Boot và PostgreSQL đang hoạt động.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kbase_token');
    setCurrentUser(null);
    setActiveTab('projects');
    setSelectedProject(null);
  };

  const formatRoleName = (r?: string) => {
    if (r === 'OWNER') return 'CHỦ DỰ ÁN';
    if (r === 'ADMIN') return 'QUẢN TRỊ';
    if (r === 'VIEWER') return 'NGƯỜI XEM';
    return 'THÀNH VIÊN';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProject(null);
        }}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onQuickLogin={handleQuickLogin}
      />

      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '28px 24px', flex: 1 }}>
        {/* If user is NOT logged in: Show rich Landing / Demo banner */}
        {!currentUser && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center', marginTop: 40 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              <Sparkles size={15} /> Nền Tảng Quản Trị Tri Thức KBase - Spring Boot 3, PostgreSQL & Trợ Lý AI
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 850 }}>
              Hệ Thống Cơ Sở Tri Thức Dành Cho{' '}
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Đội Ngũ Kỹ Thuật
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#9ca3af', maxWidth: 680, lineHeight: 1.6 }}>
              Lưu trữ, tổ chức và tìm kiếm tài liệu dự án, video hướng dẫn, kiến trúc hệ thống. Đặt câu hỏi và nhận câu trả lời tổng hợp thông minh kèm nguồn trích dẫn chứng cứ cụ thể.
            </p>

            {/* Quick Access Roles */}
            <div className="glass-panel" style={{ padding: 24, width: '100%', maxWidth: 700 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>
                🚀 Trải nghiệm nhanh hệ thống với các tài khoản mẫu sẵn có:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div
                  className="glass-card"
                  onClick={() => handleQuickLogin('admin')}
                  style={{ padding: 18, cursor: 'pointer', textAlign: 'center' }}
                >
                  <Shield size={26} color="#c084fc" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Quản Trị (Admin)</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>Giám sát hệ thống & tài khoản</div>
                </div>

                <div
                  className="glass-card"
                  onClick={() => handleQuickLogin('owner')}
                  style={{ padding: 18, cursor: 'pointer', textAlign: 'center' }}
                >
                  <FolderGit2 size={26} color="#38bdf8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Chủ Dự Án (Owner)</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>Tạo dự án & mời thành viên</div>
                </div>

                <div
                  className="glass-card"
                  onClick={() => handleQuickLogin('user')}
                  style={{ padding: 18, cursor: 'pointer', textAlign: 'center' }}
                >
                  <Bot size={26} color="#34d399" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Thành Viên (User)</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>Tải tài liệu & hỏi đáp AI</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button onClick={() => setIsAuthOpen(true)} className="btn btn-primary">
                  Đăng Nhập Hoặc Đăng Ký Tài Khoản Riêng <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* If user is logged in: Main App Workflows */}
        {currentUser && (
          <>
            {/* VIEW 1: PROJECTS TAB */}
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
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Projects Header & Create Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Không Gian Dự Án</h2>
                        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 2 }}>
                          Chọn một không gian dự án để quản lý tài liệu, tệp video hoặc cộng tác cùng đồng đội.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsCreateProjectOpen(true)}
                        className="btn btn-primary"
                      >
                        <FolderPlus size={18} /> Tạo Không Gian Dự Án Mới
                      </button>
                    </div>

                    {/* Projects Grid */}
                    {projects.length === 0 ? (
                      <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
                        <FolderGit2 size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Chưa Có Dự Án Nào</h3>
                        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 4, maxWidth: 420, margin: '4px auto 16px' }}>
                          Hãy tạo không gian dự án đầu tiên của bạn để bắt đầu lưu trữ tài liệu đặc tả và video hướng dẫn.
                        </p>
                        <button onClick={() => setIsCreateProjectOpen(true)} className="btn btn-primary btn-sm">
                          <FolderPlus size={16} /> Tạo Dự Án Mới
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="glass-card"
                            style={{ padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            onClick={() => setSelectedProject(p)}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 10,
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <FolderGit2 size={22} color="#818cf8" />
                                </div>
                                <span className="badge badge-owner">
                                  {formatRoleName(p.currentUserRole)}
                                </span>
                              </div>

                              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
                                {p.name}
                              </h3>
                              <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {p.description || 'Chưa có thông tin mô tả dự án.'}
                              </p>
                            </div>

                            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9ca3af' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FileText size={14} color="#60a5fa" /> {p.documentCount} tài liệu
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Users size={14} color="#34d399" /> {p.memberCount} thành viên
                                </span>
                              </div>

                              <span style={{ color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                Mở Dự Án <ArrowRight size={14} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* VIEW 2: FULL AI CHATBOT TAB */}
            {activeTab === 'chat' && (
              <AiChatPanel projects={projects} />
            )}

            {/* VIEW 3: ADMIN OVERSIGHT TAB */}
            {activeTab === 'admin' && currentUser.role === 'ROLE_ADMIN' && (
              <AdminPanel />
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickLogin={handleQuickLogin}
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
