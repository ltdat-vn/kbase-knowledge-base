import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatResponse, SourceReference } from '../types';
import { chatApi, documentApi } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Download,
  Folder,
  Loader2,
  HelpCircle,
  Trash2,
} from 'lucide-react';

interface AiChatPanelProps {
  projects: Project[];
  selectedProjectId?: number;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  references?: SourceReference[];
  timestamp: string;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  projects,
  selectedProjectId: initialProjectId,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    initialProjectId || (projects.length > 0 ? projects[0].id : undefined)
  );

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ Lý Trí Tuệ Nhân Tạo KBase. Hãy đặt câu hỏi cho tôi về tài liệu đặc tả, hướng dẫn kiến trúc hoặc các tệp tin trong dự án của bạn.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [initialProjectId, projects]);

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion.trim();
    if (!q || !selectedProjectId || loading) return;

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
      const response: ChatResponse = await chatApi.askQuestion(selectedProjectId, q);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.answer,
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
    'Hệ thống hỗ trợ những định dạng tài liệu và media nào?',
  ];

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(6, 182, 212, 0.4)'
          }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Trợ Lý Tri Thức AI</h2>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                Hỗ Trợ RAG
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Tổng hợp câu trả lời trực tiếp từ tài liệu dự án kèm nguồn trích dẫn chứng cứ cụ thể
            </p>
          </div>
        </div>

        {/* Project Selector & Clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Folder size={16} color="#9ca3af" />
            <select
              className="input-field"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.documentCount} tài liệu)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="btn btn-secondary btn-sm"
            title="Xóa lịch sử hội thoại"
            style={{ padding: '6px 10px' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '82%' }}>
              {m.sender === 'bot' && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  <Bot size={18} color="#fff" />
                </div>
              )}

              <div>
                <div
                  style={{
                    background: m.sender === 'user'
                      ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                      : 'rgba(30, 41, 59, 0.75)',
                    border: m.sender === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    borderRadius: 14,
                    borderTopRightRadius: m.sender === 'user' ? 2 : 14,
                    borderTopLeftRadius: m.sender === 'bot' ? 2 : 14,
                    padding: '12px 18px',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: '#f9fafb',
                    whiteSpace: 'pre-line',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {m.text}
                </div>

                {/* Source Document Citations */}
                {m.references && m.references.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} color="#60a5fa" />
                      Tài liệu trích dẫn tham khảo ({m.references.length}):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {m.references.map((ref, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(15, 23, 42, 0.85)',
                            border: '1px solid rgba(96, 165, 250, 0.25)',
                            borderRadius: 10,
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                              <FileText size={15} color="#60a5fa" />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ref.documentTitle}
                              </span>
                            </div>
                            <a
                              href={documentApi.getDownloadUrl(ref.documentId)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              title="Tải tài liệu trích dẫn"
                              style={{ padding: '3px 7px', fontSize: '0.7rem' }}
                            >
                              <Download size={13} />
                            </a>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 6 }}>
                            "{ref.snippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 4, textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Loader2 size={18} className="spin" color="#818cf8" />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Đang tra cứu và phân tích tài liệu trong {currentProject?.name || 'dự án'}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div style={{ padding: '10px 24px', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <HelpCircle size={14} /> Gợi ý câu hỏi:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading || !selectedProjectId}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: 9999 }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11, 15, 25, 0.9)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: 10 }}
        >
          <input
            type="text"
            placeholder={
              selectedProjectId
                ? `Hỏi bất kỳ điều gì về tài liệu trong ${currentProject?.name || 'dự án này'}...`
                : 'Vui lòng chọn một dự án ở trên để bắt đầu đặt câu hỏi...'
            }
            disabled={!selectedProjectId || loading}
            className="input-field"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            style={{ borderRadius: 12, padding: '12px 18px' }}
          />
          <button
            type="submit"
            disabled={!selectedProjectId || !inputQuestion.trim() || loading}
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: '12px 22px' }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
