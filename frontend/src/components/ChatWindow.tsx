'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Civic Assistant. I can help explain complaint procedures, suggest responsible departments, help you submit complaints, or provide status guidance. What can I do for you today?'
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10) // Send recent history for context
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: 'Sorry, I encountered an issue connecting to the AI helper. Please check your connection and try again.' }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'An unexpected connection error occurred. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-avatar">
          <Bot size={22} />
        </div>
        <div className="chat-title-container">
          <span className="chat-title">AI Civic Assistant</span>
          <span className="chat-status">Online</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-typing">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          placeholder="Ask about filing procedures, complaint status, or routing..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '12px' }} disabled={loading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
