import React, { useState, useEffect } from 'react';
import { Project, DocumentItem, ProjectMember, FileCategory, User } from '../types';
import { documentApi, projectApi } from '../services/api';
import { FileUploaderModal } from './FileUploaderModal';
import { InviteMemberModal } from './InviteMemberModal';
import { AiChatPanel } from './AiChatPanel';
import {
  ArrowLeft,
  UploadCloud,
  UserPlus,
  Bot,
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
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  currentUser: User | null;
  onBack: () => void;
  allProjects: Project[];
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  currentUser,
  onBack,
  allProjects,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'members' | 'chat'>('docs');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await documentApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert('Failed to delete file: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Remove this member from project?')) return;
    try {
      await projectApi.removeMember(project.id, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } catch (err: any) {
      alert('Failed to remove member: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredDocuments = documents.filter((d) => {
    if (selectedCategory === 'ALL') return true;
    return d.fileCategory === selectedCategory;
  });

  const getFileIcon = (cat: FileCategory) => {
    switch (cat) {
      case 'DOCUMENT': return <FileText size={20} color="#60a5fa" />;
      case 'SPREADSHEET': return <FileSpreadsheet size={20} color="#34d399" />;
      case 'PRESENTATION': return <File size={20} color="#fbbf24" />;
      case 'IMAGE': return <ImageIcon size={20} color="#f472b6" />;
      case 'VIDEO': return <Film size={20} color="#c084fc" />;
      case 'TEXT': return <FileCode size={20} color="#38bdf8" />;
      default: return <File size={20} color="#9ca3af" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back Button & Project Header */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{project.name}</h2>
              <span className="badge badge-owner">
                {project.currentUserRole || 'MEMBER'}
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: 4, maxWidth: 800 }}>
              {project.description || 'No description provided.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12, fontSize: '0.8rem', color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> Owner: <strong style={{ color: '#e2e8f0' }}>{project.owner?.fullName}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Created: {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> Files: {documents.length}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setIsUploadOpen(true)} className="btn btn-primary btn-sm">
              <UploadCloud size={16} /> Upload Files
            </button>
            <button onClick={() => setIsInviteOpen(true)} className="btn btn-secondary btn-sm">
              <UserPlus size={16} /> Invite Member
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <button
            onClick={() => setActiveSubTab('docs')}
            className="btn btn-sm"
            style={{
              background: activeSubTab === 'docs' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeSubTab === 'docs' ? '#818cf8' : '#9ca3af',
              border: activeSubTab === 'docs' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            <FileText size={16} /> Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('members')}
            className="btn btn-sm"
            style={{
              background: activeSubTab === 'members' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeSubTab === 'members' ? '#22d3ee' : '#9ca3af',
              border: activeSubTab === 'members' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
            }}
          >
            <Users size={16} /> Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className="btn btn-sm"
            style={{
              background: activeSubTab === 'chat' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeSubTab === 'chat' ? '#c084fc' : '#9ca3af',
              border: activeSubTab === 'chat' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none',
            }}
          >
            <Bot size={16} /> Project AI Chat
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DOCUMENTS */}
      {activeSubTab === 'docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search & Category Filter Bar */}
          <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="Search files by title, filename, or document content..."
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['ALL', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'IMAGE', 'VIDEO', 'TEXT'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="btn btn-sm"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: selectedCategory === cat ? '#a5b4fc' : '#9ca3af',
                    border: selectedCategory === cat ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Document Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
              <UploadCloud size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Documents Found</h3>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 4, maxWidth: 420, margin: '4px auto 16px' }}>
                {searchQuery
                  ? 'No documents matched your query. Try different keywords.'
                  : 'Start by uploading specifications, recordings, or spreadsheets to this project.'}
              </p>
              <button onClick={() => setIsUploadOpen(true)} className="btn btn-primary btn-sm">
                <UploadCloud size={16} /> Upload First Document
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                          {getFileIcon(doc.fileCategory)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }} title={doc.title}>
                            {doc.title}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {doc.originalFilename}
                          </span>
                        </div>
                      </div>
                      <span className={`category-badge category-${doc.fileCategory}`}>
                        {doc.fileCategory}
                      </span>
                    </div>

                    {doc.summary && (
                      <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.summary}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {doc.formattedSize} • {new Date(doc.createdAt).toLocaleDateString()}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="btn btn-secondary btn-sm"
                        title="Preview File"
                        style={{ padding: '6px 8px' }}
                      >
                        <Eye size={14} />
                      </button>
                      <a
                        href={documentApi.getDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="Download File"
                        style={{ padding: '6px 8px' }}
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete File"
                        style={{ padding: '6px 8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TEAM MEMBERS */}
      {activeSubTab === 'members' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Collaborators</h3>
            <button onClick={() => setIsInviteOpen(true)} className="btn btn-primary btn-sm">
              <UserPlus size={16} /> Invite Teammate
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {members.map((m) => (
              <div key={m.id} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.user.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>{m.user.email}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                      {m.role}
                    </span>
                  </div>
                </div>

                {project.owner.id !== m.user.id && (
                  <button
                    onClick={() => handleRemoveMember(m.user.id)}
                    className="btn btn-danger btn-sm"
                    title="Remove from project"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EMBEDDED AI CHAT */}
      {activeSubTab === 'chat' && (
        <AiChatPanel projects={allProjects} selectedProjectId={project.id} />
      )}

      {/* Modals */}
      <FileUploaderModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(newDoc) => {
          setDocuments((prev) => [newDoc, ...prev]);
        }}
      />

      <InviteMemberModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onMemberAdded={(newMem) => {
          setMembers((prev) => [...prev, newMem]);
        }}
      />

      {/* Inline Document Preview Modal */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 24,
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{previewDoc.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{previewDoc.originalFilename} ({previewDoc.formattedSize})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href={documentApi.getDownloadUrl(previewDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download
                </a>
                <button onClick={() => setPreviewDoc(null)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 20, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
              {previewDoc.fileCategory === 'IMAGE' ? (
                <img
                  src={documentApi.getPreviewUrl(previewDoc.id)}
                  alt={previewDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, objectFit: 'contain' }}
                />
              ) : previewDoc.fileCategory === 'VIDEO' ? (
                <video controls style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}>
                  <source src={documentApi.getPreviewUrl(previewDoc.id)} type={previewDoc.contentType} />
                  Your browser does not support HTML video.
                </video>
              ) : (
                <iframe
                  src={documentApi.getPreviewUrl(previewDoc.id)}
                  title={previewDoc.title}
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8, background: '#fff' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
