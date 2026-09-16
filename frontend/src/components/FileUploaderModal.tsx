import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { documentApi } from '../services/api';
import { DocumentItem } from '../types';

interface FileUploaderModalProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (doc: DocumentItem) => void;
}

export const FileUploaderModal: React.FC<FileUploaderModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  onUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const uploadedDoc = await documentApi.upload(
        projectId,
        file,
        title.trim() ? title : file.name,
        summary,
        (p) => setProgress(p)
      );

      onUploaded(uploadedDoc);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'File upload failed');
    } finally {
      setUploading(false);
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: 540, padding: 32, position: 'relative' }}>
        <button
          onClick={onClose}
          disabled={uploading}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <UploadCloud size={24} color="#818cf8" /> Upload to {projectName}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 20 }}>
          Supported: PDF, Word (DOCX/DOC), Excel, PowerPoint, Markdown, Images, and Videos.
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
          {/* Dropzone */}
          <div
            className={`dropzone ${isDragOver ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi"
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={36} color="#34d399" />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drop another to replace
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <UploadCloud size={38} color="#818cf8" />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Drag & drop your files here, or <span style={{ color: '#818cf8' }}>browse</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Max file size: 100 MB per upload
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Document Title (optional)</label>
            <input
              type="text"
              placeholder="e.g. Sprint 14 Architecture Overview"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 5 }}>Description / Summary (optional)</label>
            <textarea
              rows={3}
              placeholder="Provide a quick summary or tags to help teammates and the AI search tool..."
              className="input-field"
              style={{ resize: 'vertical' }}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {uploading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#6366f1', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={onClose} disabled={uploading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={uploading || !file} className="btn btn-primary">
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
