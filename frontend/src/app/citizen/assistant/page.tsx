'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Paperclip, Sparkles, HelpCircle } from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  avatar?: string;
  isInitial?: boolean;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I'm CivicAI, your governance assistant. I can help you distill complex civic issues into actionable summaries or check the status of pending maintenance requests. How can I assist you today?",
      isInitial: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend.trim(), avatar: 'JD' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: "Sorry, I'm experiencing connectivity issues to the server. Please try again." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "An unexpected network error occurred. Please verify your connection." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="assistant-container-stitch animate-fade-in">
      {/* Intro Header text */}
      <div className="assistant-header-stitch">
        <h1 className="assistant-title-stitch">CivicAI Assistant</h1>
        <p className="assistant-sub-stitch">Get instant clarity on city regulations, summarize lengthy complaints, or track the real-time status of your local reports.</p>
      </div>

      {/* Chat pane layout */}
      <div className="chat-viewport-card-stitch">
        <div className="chat-messages-area-stitch">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'ai';
            return (
              <div key={idx} className={`message-row-stitch ${isBot ? 'ai' : 'user'}`}>
                {isBot && (
                  <div className="bot-avatar-circle-stitch">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`message-bubble-stitch ${isBot ? 'ai-bubble' : 'user-bubble'}`}>
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  
                  {/* If initial bot greeting, show suggested buttons inside/below it */}
                  {msg.isInitial && (
                    <div className="suggested-actions-row-stitch">
                      <div className="suggested-card-stitch" onClick={() => handleSend("Summarize Case #comp-1")}>
                        <span className="card-act-title">Summarize a complaint &rarr;</span>
                        <span className="card-act-desc">Paste a long text or report ID</span>
                      </div>
                      <div className="suggested-card-stitch" onClick={() => handleSend("Check status for Maple Avenue Pothole")}>
                        <span className="card-act-title">Check status &rarr;</span>
                        <span className="card-act-desc">Update on Case #8821</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="user-avatar-circle-stitch">
                    JD
                  </div>
                )}
              </div>
            );
          })}
          
          {loading && (
            <div className="message-row-stitch ai">
              <div className="bot-avatar-circle-stitch">
                <Bot size={16} />
              </div>
              <div className="chat-typing-bubbles-stitch">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box section */}
        <div className="chat-input-wrapper-stitch">
          <form onSubmit={handleFormSubmit} className="chat-form-row-stitch">
            <input
              type="text"
              placeholder="Ask CivicAI anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            
            <div className="input-actions-stitch">
              <button type="button" className="btn-clip-stitch" title="Attach file">
                <Paperclip size={18} />
              </button>
              <button type="submit" className="btn-send-stitch" disabled={loading || !input.trim()}>
                <span>Send</span>
                <Send size={12} />
              </button>
            </div>
          </form>
          <span className="disclaimer-text-stitch">
            CIVICAI CAN MAKE MISTAKES. CHECK IMPORTANT INFO.
          </span>
        </div>
      </div>

      <style jsx>{`
        .assistant-header-stitch {
          margin-bottom: 20px;
        }

        .assistant-title-stitch {
          font-size: 26px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        .assistant-sub-stitch {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
          margin-top: 4px;
        }

        .chat-viewport-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-messages-area-stitch {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background-color: var(--card);
        }

        .message-row-stitch {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }

        .message-row-stitch.ai {
          align-self: flex-start;
        }

        .message-row-stitch.user {
          align-self: flex-end;
          justify-content: flex-end;
        }

        .bot-avatar-circle-stitch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-avatar-circle-stitch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background-color: var(--accent);
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
        }

        .message-bubble-stitch {
          padding: 14px 18px;
          border-radius: var(--radius-md);
          font-size: 14px;
          line-height: 1.5;
        }

        .ai-bubble {
          background-color: #F1F5F9;
          color: var(--foreground);
          border-top-left-radius: 2px;
        }

        .user-bubble {
          background-color: var(--primary);
          color: white;
          border-top-right-radius: 2px;
        }

        /* Suggested actions */
        .suggested-actions-row-stitch {
          display: flex;
          gap: 12px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .suggested-card-stitch {
          flex: 1;
          min-width: 180px;
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .suggested-card-stitch:hover {
          border-color: var(--primary);
          background-color: var(--card-hover);
        }

        .card-act-title {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--primary);
        }

        .card-act-desc {
          font-size: 11px;
          color: var(--muted);
        }

        /* Typing shimmer indicator */
        .chat-typing-bubbles-stitch {
          display: flex;
          gap: 4px;
          padding: 14px 18px;
          background-color: #F1F5F9;
          border-radius: var(--radius-md);
          align-items: center;
        }

        .chat-typing-bubbles-stitch span {
          width: 6px;
          height: 6px;
          background-color: var(--muted);
          border-radius: var(--radius-full);
          animation: pulse 1.5s infinite;
        }

        .chat-typing-bubbles-stitch span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing-bubbles-stitch span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Input wrapped footer */
        .chat-input-wrapper-stitch {
          padding: 20px 24px;
          background-color: var(--card);
          border-top: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .chat-form-row-stitch {
          width: 100%;
          position: relative;
        }

        .chat-form-row-stitch input {
          width: 100%;
          padding: 14px 140px 14px 18px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          background-color: var(--card);
          color: var(--foreground);
          font-size: 14px;
          outline: none;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.01);
        }

        .input-actions-stitch {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-clip-stitch {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-fast);
        }

        .btn-clip-stitch:hover {
          background-color: var(--card-hover);
        }

        .btn-send-stitch {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background-color var(--transition-fast);
        }

        .btn-send-stitch:hover {
          background-color: var(--primary-hover);
        }

        .btn-send-stitch:disabled {
          background-color: var(--muted-light);
          color: var(--muted);
          cursor: not-allowed;
        }

        .disclaimer-text-stitch {
          font-size: 10px;
          font-weight: 800;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
