'use client';

import React from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';

export default function AdminChat() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="assistant-intro">
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Admin AI Assistant Chat</h1>
        <p style={{ marginTop: '4px' }}>Query structural routing rules, review department contacts, or test natural language grievance parsing.</p>
      </div>

      <div style={{ flex: 1 }}>
        <ChatWindow />
      </div>
    </div>
  );
}
