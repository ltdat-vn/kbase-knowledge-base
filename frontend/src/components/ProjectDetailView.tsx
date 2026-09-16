import React, { useState, useEffect } from 'react';
import { Project, DocumentItem, ProjectMember, FileCategory, User } from '../types';
import { documentApi, projectApi } from '../services/api';
import { FileUploaderModal } from './FileUploaderModal';
import { InviteMemberModal } from './InviteMemberModal';
import {
  ArrowLeft,
  Plus,
  UserPlus,
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  Users,
  Film,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  File,
  X,
  Clock,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  currentUser: User | null;
  onBack: () => void;
  allProjects: Project[];
  onOpenAiChat?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  currentUser,
  onBack,
  allProjects,
  onOpenAiChat,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'members'>('docs');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'ALL'>('ALL');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [docsData, membersData] = await Promise.all([
        documentApi.getByProject(project.id),
        projectApi.getMembers(project.id),
      ]);
      setDocuments(docsData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const results = await documentApi.search(project.id, searchQuery);
      setDocuments(results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;
    try {
      await documentApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert('Xóa tài liệu thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này khỏi dự án?')) return;
    try {
      await projectApi.removeMember(project.id, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } catch (err: any) {
      alert('Xóa thành viên thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredDocuments = documents.filter((d) => {
    if (selectedCategory === 'ALL') return true;
    return d.fileCategory === selectedCategory;
  });

  // Recent documents (up to 4)
  const recentDocs = [...documents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const getFileIcon = (cat: FileCategory) => {
    switch (cat) {
      case 'DOCUMENT':
        return <FileText size={18} color="#2563eb" />;
      case 'SPREADSHEET':
        return <FileSpreadsheet size={18} color="#059669" />;
      case 'PRESENTATION':
        return <File size={18} color="#d97706" />;
      case 'IMAGE':
        return <ImageIcon size={18} color="#db2777" />;
      case 'VIDEO':
        return <Film size={18} color="#7c3aed" />;
      case 'TEXT':
        return <FileCode size={18} color="#0284c7" />;
      default:
        return <File size={18} color="#64748b" />;
    }
  };

  const categoryLabels: Record<string, string> = {
    ALL: 'Tất Cả',
    DOCUMENT: 'Tài Liệu',
    SPREADSHEET: 'Bảng Tính',
    PRESENTATION: 'Thuyết Trình',
    IMAGE: 'Hình Ảnh',
    VIDEO: 'Video',
    TEXT: 'Văn Bản / Code',
  };

  // Mock status distribution for realistic SaaS look like reference image
  const getDocStatus = (docId: number) => {
    if (docId % 3 === 0) {
      return { label: 'Bản nháp', className: 'badge-status-draft', dotColor: '#f59e0b' };
    }
    if (docId % 3 === 1) {
      return { label: 'Hoạt động', className: 'badge-status-active', dotColor: '#10b981' };
    }
    return { label: 'Đang duyệt', className: 'badge-status-review', dotColor: '#3b82f6' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Header Row matching Reference Image */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 8,
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Quay lại danh sách dự án
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              {project.name}
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 9999,
                background: '#e0f2fe',
                color: '#0369a1',
                fontWeight: 600,
              }}
            >
              {project.currentUserRole === 'OWNER' ? 'Chủ Dự Án' : project.currentUserRole === 'ADMIN' ? 'Quản Trị' : 'Thành Viên'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            {project.description || 'Quản lý tài liệu kỹ thuật, hướng dẫn và tích hợp trợ lý AI cho dự án.'}
          </p>
        </div>

        {/* Action Buttons: Black Pill Button matching Reference */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ height: 38, borderRadius: 9999, padding: '0 16px' }}
          >
            <UserPlus size={15} /> Mời Thành Viên
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-black-pill"
            style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Tải Tệp Mới
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eaecf0', paddingBottom: 10 }}>
        <button
          onClick={() => setActiveSubTab('docs')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: activeSubTab === 'docs' ? 600 : 500,
            color: activeSubTab === 'docs' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeSubTab === 'docs' ? '2px solid #0f172a' : '2px solid transparent',
            marginBottom: -11,
          }}
        >
          Tài Liệu Dự Án ({documents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('members')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: activeSubTab === 'members' ? 600 : 500,
            color: activeSubTab === 'members' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeSubTab === 'members' ? '2px solid #0f172a' : '2px solid transparent',
            marginBottom: -11,
          }}
        >
          Thành Viên ({members.length})
        </button>
      </div>

      {activeSubTab === 'docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* SECTION 1: RECENT DOCUMENTS (macOS Folder Preview Cards like Reference Image) */}
          <div>
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                Tài liệu gần đây
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {recentDocs.length} tài liệu cập nhật mới nhất
              </span>
            </div>

            {recentDocs.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: '32px 20px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Chưa có tài liệu nào gần đây. Hãy tải lên tệp tin tài liệu đầu tiên!
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="btn btn-black-pill"
                  style={{ marginTop: 12 }}
                >
                  <Plus size={15} /> Tải Tệp Ngay
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className="folder-preview-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 145,
                    }}
                  >
                    <div>
                      {/* macOS 3 Window Dots */}
                      <div className="window-dots">
                        <span className="window-dot" style={{ background: '#ef4444' }} />
                        <span className="window-dot" style={{ background: '#f59e0b' }} />
                        <span className="window-dot" style={{ background: '#10b981' }} />
                      </div>

                      {/* Content Icon & Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getFileIcon(doc.fileCategory)}
                        </div>
                        <h4
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={doc.title}
                        >
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 16 }}>
                      Cập nhật: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: ALL DOCUMENTS (Table matching Reference Image) */}
          <div>
            <div
              style={{
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                Tất cả tài liệu
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Search in project */}
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Lọc tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{
                      height: 32,
                      paddingLeft: 30,
                      paddingRight: 10,
                      fontSize: '0.78rem',
                      borderRadius: 6,
                    }}
                  />
                </div>

                {/* View switcher */}
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: 6,
                    padding: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    onClick={() => setViewMode('table')}
                    style={{
                      border: 'none',
                      background: viewMode === 'table' ? '#ffffff' : 'transparent',
                      color: viewMode === 'table' ? '#0f172a' : '#64748b',
                      borderRadius: 4,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                    title="Dạng bảng"
                  >
                    <List size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      border: 'none',
                      background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                      color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                      borderRadius: 4,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                    title="Dạng lưới"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {(['ALL', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'IMAGE', 'VIDEO', 'TEXT'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    borderRadius: 9999,
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#0f172a' : '#e2e8f0',
                    background: selectedCategory === cat ? '#0f172a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>

            {filteredDocuments.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #eaecf0',
                  borderRadius: 12,
                  padding: '48px 20px',
                  textAlign: 'center',
                }}
              >
                <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                  Không tìm thấy tài liệu phù hợp
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                  Thử thay đổi bộ lọc thể loại hoặc từ khóa tìm kiếm.
                </p>
              </div>
            ) : viewMode === 'table' ? (
              /* MODERN TABLE MATCHING REFERENCE IMAGE */
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #eaecf0',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Tên Tài Liệu</th>
                      <th>Phân Loại</th>
                      <th>Ngày Tải Lên</th>
                      <th>Dung Lượng</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => {
                      const status = getDocStatus(doc.id);
                      return (
                        <tr key={doc.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {getFileIcon(doc.fileCategory)}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 280,
                                  }}
                                  title={doc.title}
                                >
                                  {doc.title}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                  {doc.originalFilename}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="category-badge">
                              {categoryLabels[doc.fileCategory] || doc.fileCategory}
                            </span>
                          </td>

                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                          </td>

                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {doc.formattedSize}
                          </td>

                          <td>
                            <span className={`badge-status ${status.className}`}>
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: status.dotColor,
                                }}
                              />
                              {status.label}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="btn btn-secondary btn-sm"
                                title="Xem trước tài liệu"
                                style={{ padding: '4px 8px', borderRadius: 6 }}
                              >
                                <Eye size={13} />
                              </button>
                              <a
                                href={documentApi.getDownloadUrl(doc.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                title="Tải về máy"
                                style={{ padding: '4px 8px', borderRadius: 6 }}
                              >
                                <Download size={13} />
                              </a>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="btn btn-danger btn-sm"
                                title="Xóa tài liệu"
                                style={{ padding: '4px 8px', borderRadius: 6 }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* GRID VIEW */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredDocuments.map((doc) => {
                  const status = getDocStatus(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className="white-card"
                      style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
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
                                flexShrink: 0,
                              }}
                            >
                              {getFileIcon(doc.fileCategory)}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <h4
                                style={{
                                  fontSize: '0.88rem',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={doc.title}
                              >
                                {doc.title}
                              </h4>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {doc.originalFilename}
                              </span>
                            </div>
                          </div>
                          <span className={`badge-status ${status.className}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                            {status.label}
                          </span>
                        </div>

                        {doc.summary && (
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: '#64748b',
                              marginTop: 10,
                              lineHeight: 1.45,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {doc.summary}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 10,
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {doc.formattedSize}
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="btn btn-secondary btn-sm"
                            title="Xem trước"
                            style={{ padding: '4px 8px', borderRadius: 6 }}
                          >
                            <Eye size={13} />
                          </button>
                          <a
                            href={documentApi.getDownloadUrl(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Tải về"
                            style={{ padding: '4px 8px', borderRadius: 6 }}
                          >
                            <Download size={13} />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="btn btn-danger btn-sm"
                            title="Xóa"
                            style={{ padding: '4px 8px', borderRadius: 6 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MEMBERS */}
      {activeSubTab === 'members' && (
        <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                Thành viên trong dự án
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Danh sách những người có quyền truy cập và cộng tác trên tài liệu của dự án.
              </p>
            </div>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="btn btn-black-pill"
            >
              <UserPlus size={15} /> Mời Thành Viên Mới
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.85rem',
                    }}
                  >
                    {m.user.fullName.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      {m.user.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {m.user.email}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: m.role === 'OWNER' ? '#e0f2fe' : '#f1f5f9',
                          color: m.role === 'OWNER' ? '#0369a1' : '#475569',
                        }}
                      >
                        {m.role === 'OWNER' ? 'Chủ dự án' : m.role === 'VIEWER' ? 'Người xem' : 'Thành viên'}
                      </span>
                    </div>
                  </div>
                </div>

                {project.owner.id !== m.user.id && (
                  <button
                    onClick={() => handleRemoveMember(m.user.id)}
                    className="btn btn-danger btn-sm"
                    title="Xóa thành viên khỏi dự án"
                    style={{ padding: '4px 8px', borderRadius: 6 }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 700,
              width: '100%',
              padding: 24,
              boxShadow: 'var(--shadow-elevated)',
              position: 'relative',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setPreviewDoc(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getFileIcon(previewDoc.fileCategory)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {previewDoc.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {previewDoc.originalFilename} • {previewDoc.formattedSize}
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                Tóm Tắt Nội Dung (RAG Index):
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {previewDoc.summary || 'Chưa có bản tóm tắt nội dung tự động.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPreviewDoc(null)}
                className="btn btn-secondary btn-sm"
              >
                Đóng
              </button>
              <a
                href={documentApi.getDownloadUrl(previewDoc.id)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-black-pill"
                style={{ fontSize: '0.8rem' }}
              >
                <Download size={14} /> Tải Xuống Bản Gốc
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploaderModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() => {
          loadProjectData();
          setIsUploadOpen(false);
        }}
      />

      {/* Invite Modal */}
      <InviteMemberModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onMemberAdded={() => {
          loadProjectData();
          setIsInviteOpen(false);
        }}
      />
    </div>
  );
};
