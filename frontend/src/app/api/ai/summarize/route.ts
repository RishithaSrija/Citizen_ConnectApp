import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters long to analyze.' },
        { status: 400 }
      );
    }

    const aiSummary = await AIService.summarizeComplaint(description);
    return NextResponse.json({ aiSummary });
  } catch (error) {
    console.error('AI summarize API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while analyzing the text.' },
      { status: 500 }
    );
  }
}
