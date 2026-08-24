import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    const reply = await AIService.chatAssistant(message, history || []);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while communicating with the assistant.' },
      { status: 500 }
    );
  }
}
