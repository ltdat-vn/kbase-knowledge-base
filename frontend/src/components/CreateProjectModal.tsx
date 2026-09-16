import React, { useState } from 'react';
import { FolderPlus, X, AlertCircle } from 'lucide-react';
import { projectApi } from '../services/api';
import { Project } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const proj = await projectApi.create(name, description);
      onCreated(proj);
      onClose();
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: 30, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderPlus size={22} color="#818cf8" /> Create New Project
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>
          Create a workspace to organize team documents, tutorials, videos, and specifications.
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mobile App Redesign 2026"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Project Description</label>
            <textarea
              rows={3}
              placeholder="Describe the project objectives, scope, and key deliverables..."
              className="input-field"
              style={{ resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
