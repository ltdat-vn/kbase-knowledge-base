import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { documentApi } from '../../services/api';
import { DocumentItem } from '../../types';

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
      setError('Vui lòng chọn hoặc kéo thả tệp tài liệu cần tải lên');
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
        (p: number) => setProgress(p)
      );

      onUploaded(uploadedDoc);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Tải tệp lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          padding: 28,
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          onClick={onClose}
          disabled={uploading}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
            }}
          >
            <UploadCloud size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Tải Tài Liệu Lên {projectName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Hỗ trợ PDF, Word (DOCX), Excel, PowerPoint, Markdown, Video & Hình ảnh.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: '0.82rem',
              margin: '14px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          {/* Dropzone */}
          <div
            className={`dropzone ${isDragOver ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '28px 16px' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi"
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={32} color="#10b981" />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Nhấp hoặc thả tệp khác để thay thế
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <UploadCloud size={32} color="#64748b" />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  Kéo thả tệp vào đây, hoặc <span style={{ color: '#6366f1' }}>chọn từ máy tính</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Dung lượng tối đa: 100 MB mỗi tệp
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Tiêu Đề Tài Liệu (không bắt buộc)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Tài liệu Tổng Quan Kiến Trúc KBase"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 5 }}>
              Mô Tả / Tóm Tắt Nội Dung (không bắt buộc)
            </label>
            <textarea
              rows={2}
              placeholder="Tóm tắt ngắn gọn để hỗ trợ công cụ tìm kiếm và trợ lý AI..."
              className="input-field"
              style={{ resize: 'vertical' }}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {uploading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>
                <span>Đang tải lên và lập chỉ mục nội dung...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#0f172a', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn btn-black-pill"
              style={{ height: 38 }}
            >
              {uploading ? 'Đang tải lên...' : 'Tải Lên Tài Liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
