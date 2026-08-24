import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIController {
  // POST /api/ai/analyze & POST /api/ai/summarize
  static async analyze(req: Request, res: Response) {
    try {
      const { description } = req.body;

      if (!description || description.trim().length < 10) {
        return res.status(400).json({
          error: 'Description must be at least 10 characters long to analyze.',
        });
      }

      const aiSummary = await AIService.analyzeDescription(description);
      return res.json({ aiSummary });
    } catch (error) {
      console.error('AI analyze controller error:', error);
      return res.status(500).json({ error: 'Server error during AI analysis.' });
    }
  }

  // POST /api/ai/chat
  static async chat(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { message, history } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      // Convert history format to match OpenAI format: { role: 'user'|'assistant', content: string }
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      }));

      const reply = await AIService.chatAssistant(user.id, message, formattedHistory);

      // Save dialogue to database ChatHistory table
      await prisma.chatHistory.create({
        data: {
          userId: user.id,
          message: message,
          response: reply,
        },
      });

      return res.json({ reply });
    } catch (error) {
      console.error('AI chat controller error:', error);
      return res.status(500).json({ error: 'Server error during AI chat session.' });
    }
  }

  // POST /api/ai/image-analyze
  static async imageAnalyze(req: Request, res: Response) {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image content is required.' });
      }

      const result = await AIService.analyzeImage(image);

      // In case image is blurry or unrelated, we can send messages in a unified structure
      // So the client can show custom warning messages
      let message = '';
      if (result.isBlurry) {
        message = 'Image quality is poor. Please retake the photo.';
      } else if (result.isUnrelated) {
        message = 'This image does not appear to contain a civic issue.';
      }

      return res.json({
        detectedIssue: result.detectedIssue,
        confidence: result.confidence,
        isBlurry: result.isBlurry,
        isUnrelated: result.isUnrelated,
        message,
      });
    } catch (error) {
      console.error('AI image analyze controller error:', error);
      return res.status(500).json({ error: 'Server error during AI image check.' });
    }
  }
}
