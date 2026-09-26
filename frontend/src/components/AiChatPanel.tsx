import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatResponse, SourceReference } from '../types';
import { chatApi, documentApi } from '../services/api';
import {
  Send,
  Sparkles,
  FileText,
  Download,
  Folder,
  Loader2,
  Trash2,
  Paperclip,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  X,
} from 'lucide-react';

interface AiChatPanelProps {
  projects: Project[];
  selectedProjectId?: number;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  thought?: string;
  references?: SourceReference[];
  timestamp: string;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  projects,
  selectedProjectId: initialProjectId,
  isDrawer = false,
  onCloseDrawer,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    initialProjectId || (projects.length > 0 ? projects[0].id : undefined)
  );

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThought, setShowThought] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ Lý AI KBase được tích hợp mô hình Gemini 3.6 Flash. Bạn có thể hỏi bất kỳ câu hỏi nào về các tài liệu, hướng dẫn kỹ thuật hoặc thông số kiến trúc đã lưu trữ trong dự án.',
      thought: 'Hệ thống đã kết nối trực tiếp với cơ sở dữ liệu PostgreSQL và tải bộ chỉ mục văn bản RAG cho dự án.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialProjectId !== undefined && initialProjectId !== null) {
      setSelectedProjectId(initialProjectId);
    } else if (selectedProjectId === undefined || selectedProjectId === null) {
      setSelectedProjectId(0);
    }
  }, [initialProjectId, projects]);

  const toggleThought = (msgId: string) => {
    setShowThought((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputQuestion('');
    setLoading(true);

    try {
      const pid = selectedProjectId ?? 0;
      const response: ChatResponse = await chatApi.askQuestion(pid, q);
      const isSystemWide = pid === 0;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.answer,
        thought: isSystemWide
          ? 'Đã đối chiếu thông tin qua toàn bộ các dự án trong hệ thống KBase và trích dẫn nguồn.'
          : 'Đã phân tích các tài liệu liên quan trong dự án bằng Gemini AI và trích dẫn bằng chứng.',
        references: response.references,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Rất tiếc, đã xảy ra lỗi khi tìm kiếm và phân tích tài liệu: ' + (err.response?.data?.message || err.message),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const samplePrompts = [
    'Công nghệ và kiến trúc của hệ thống KBase gồm những gì?',
    'Giải thích phân quyền người dùng (Admin, Owner, User)',
    'Hệ thống hỗ trợ những định dạng tài liệu nào?',
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderLeft: isDrawer ? '1px solid #eaecf0' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          flexShrink: 0,
          minHeight: 58,
        }}
      >
        {/* Left Side: Bot Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 50%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} />
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                }}
              >
                Trợ Lý AI
              </span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 160,
              }}
              title={
                !selectedProjectId || selectedProjectId === 0
                  ? 'Phạm vi: Toàn bộ hệ thống (Tất cả dự án)'
                  : currentProject
                  ? `Dự án: ${currentProject.name}`
                  : 'Chưa chọn dự án'
              }
            >
              {!selectedProjectId || selectedProjectId === 0
                ? '🌐 Toàn bộ dự án'
                : currentProject
                ? `📁 ${currentProject.name}`
                : 'Chưa chọn dự án'}
            </span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Project selector with All Projects option */}
          <select
            value={selectedProjectId ?? 0}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: (!selectedProjectId || selectedProjectId === 0) ? '#eff6ff' : '#f8fafc',
              color: (!selectedProjectId || selectedProjectId === 0) ? '#1d4ed8' : '#1e293b',
              maxWidth: 165,
              outline: 'none',
              cursor: 'pointer',
              textOverflow: 'ellipsis',
            }}
            title="Chọn phạm vi tra cứu của Trợ lý AI"
          >
            <option value={0}>
              🌐 Tất cả dự án ({projects.reduce((acc, p) => acc + (p.documentCount || 0), 0)} tệp)
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name} ({p.documentCount || 0} tệp)
              </option>
            ))}
          </select>

          {/* Clear history */}
          <button
            onClick={() => setMessages([messages[0]])}
            className="btn btn-secondary btn-sm"
            title="Xóa lịch sử hội thoại"
            style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}
          >
            <Trash2 size={14} />
          </button>

          {/* Close Drawer Button */}
          {isDrawer && onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="btn btn-secondary btn-sm"
              title="Đóng bảng AI"
              style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          background: '#ffffff',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            {m.sender === 'user' ? (
              /* User Bubble */
              <div
                style={{
                  maxWidth: '85%',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: 14,
                  borderTopRightRadius: 2,
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
                }}
              >
                {m.text}
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>
                  {m.timestamp}
                </div>
              </div>
            ) : (
              /* Bot Message Block matching Reference Image */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Agent Title Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Sparkles size={13} />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    Trợ lý AI KBase
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {m.timestamp}
                  </span>
                </div>

                {/* Thought Indicator (Collapsible like reference image) */}
                {m.thought && (
                  <div style={{ marginLeft: 32 }}>
                    <button
                      onClick={() => toggleThought(m.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showThought[m.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      <span>Đã suy nghĩ trong vài giây</span>
                    </button>
                    {showThought[m.id] && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: '8px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '0.75rem',
                          color: '#475569',
                          lineHeight: 1.4,
                        }}
                      >
                        {m.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Bot Answer Content */}
                <div
                  style={{
                    marginLeft: 32,
                    fontSize: '0.85rem',
                    color: '#1e293b',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {m.text
                    .replace(/^#{1,6}\s*/gm, '')
                    .replace(/\*\*/g, '')
                    .replace(/`([^`]+)`/g, '$1')
                    .replace(/^[\*]\s+/gm, '• ')
                    .trim()}
                </div>

                {/* Source Document Citation Card (styled like the broadcast card in reference image) */}
                {m.references && m.references.length > 0 && (
                  <div style={{ marginLeft: 32, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.references.map((ref, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#d97706',
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={16} />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {ref.documentTitle}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                              Nguồn chứng cứ trích xuất
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#475569',
                                fontStyle: 'italic',
                                background: '#f8fafc',
                                padding: '4px 8px',
                                borderRadius: 6,
                                marginTop: 6,
                              }}
                            >
                              "{ref.snippet}"
                            </div>
                          </div>
                        </div>

                        <a
                          href={documentApi.getDownloadUrl(ref.documentId)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Tải tài liệu trích dẫn"
                          style={{ padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Sparkles size={13} />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#64748b',
              }}
            >
              <Loader2 size={15} className="spin" color="#6366f1" />
              <span>Đang tra cứu tài liệu và sinh câu trả lời bằng Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Pills */}
      <div
        style={{
          padding: '8px 16px',
          background: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: 9999,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#475569',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Input Area matching Reference Image */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid #eaecf0',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 9999,
            padding: '4px 6px 4px 14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s',
          }}
        >
          {/* Paperclip Icon */}
          <button
            type="button"
            title="Đính kèm tệp tham khảo"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px 6px 4px 0',
            }}
          >
            <Paperclip size={16} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              !selectedProjectId || selectedProjectId === 0
                ? 'Hỏi bất kỳ điều gì về tất cả tài liệu trong hệ thống...'
                : `Hỏi bất kỳ điều gì về ${currentProject?.name || 'dự án'}...`
            }
            disabled={loading}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.82rem',
              color: '#0f172a',
              padding: '6px 8px',
            }}
          />

          {/* Black Circular Send Button with ArrowUp */}
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0f172a',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !inputQuestion.trim() || loading ? 'not-allowed' : 'pointer',
              opacity: !inputQuestion.trim() || loading ? 0.4 : 1,
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <ArrowUp size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
