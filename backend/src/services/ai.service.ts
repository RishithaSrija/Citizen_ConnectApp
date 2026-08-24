import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.warn(
      'Gemini API key is missing. AI services will use fallback mode.'
    );
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });
};

export class AIService {
  // ============================================================
  // TEXT ANALYSIS / COMPLAINT SUMMARIZATION
  // ============================================================

  static async analyzeDescription(description: string) {
    const model = getGeminiModel();

    if (!model) {
      return this.fallbackTextAnalysis(description);
    }

    try {
      const prompt = `
You are an AI Civic Analyst for CivicLink.

Analyze the following civic complaint:

"${description}"

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Return exactly this structure:

{
  "summary": "Short summary of the complaint",
  "severityScore": 5,
  "priority": "Medium",
  "suggestedDepartment": "Public Works"
}

Rules:

severityScore must be an integer from 1 to 10.

priority must be one of:
Low
Medium
High

suggestedDepartment must be one of:
Roads Department
Water Department
Electricity Department
Municipal Sanitation
Public Works
Environment Department
`;

      const result = await model.generateContent(prompt);

      const text = result.response.text().trim();

      const cleanedText = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const data = JSON.parse(cleanedText);

      return {
        summary:
          data.summary ||
          description.slice(0, 100) +
            (description.length > 100 ? '...' : ''),
        severityScore: Number(data.severityScore) || 5,
        priority: data.priority || 'Medium',
        suggestedDepartment:
          data.suggestedDepartment || 'Public Works',
        keywords: [
          (data.suggestedDepartment || 'general').toLowerCase(),
        ],
      };
    } catch (error) {
      console.error('Gemini text analysis error:', error);
      return this.fallbackTextAnalysis(description);
    }
  }

  // ============================================================
  // IMAGE ANALYSIS
  // ============================================================

  static async analyzeImage(base64Image: string) {
    const model = getGeminiModel();

    if (!model) {
      return {
        detectedIssue: 'Pothole',
        confidence: 0.92,
        isBlurry: false,
        isUnrelated: false,
      };
    }

    try {
      let imageData = base64Image;
      let mimeType = 'image/jpeg';

      if (base64Image.startsWith('data:image/')) {
        const match = base64Image.match(
          /^data:(image\/[^;]+);base64,(.+)$/
        );

        if (match) {
          mimeType = match[1];
          imageData = match[2];
        }
      }

      const prompt = `
You are an AI Civic Inspector for CivicLink.

Analyze the attached image.

Determine:

1. Whether the image is blurry.
2. Whether the image is unrelated to a municipal civic issue.
3. What civic issue is visible.

Return ONLY valid JSON.

Use exactly this structure:

{
  "isBlurry": false,
  "isUnrelated": false,
  "detectedIssue": "Pothole",
  "confidence": 0.90
}

detectedIssue must be one of:

Pothole
Garbage
Drainage issue
Water leakage
Streetlight damage
Road damage

If the image is blurry or unrelated, detectedIssue should be null.

confidence must be between 0 and 1.
`;

      const result = await model.generateContent([
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageData,
          },
        },
      ]);

      const text = result.response.text().trim();

      const cleanedText = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const data = JSON.parse(cleanedText);

      return {
        detectedIssue: data.detectedIssue || null,
        confidence: Number(data.confidence) || 0,
        isBlurry: Boolean(data.isBlurry),
        isUnrelated: Boolean(data.isUnrelated),
      };
    } catch (error) {
      console.error('Gemini image analysis error:', error);

      return {
        detectedIssue: 'Road damage',
        confidence: 0.85,
        isBlurry: false,
        isUnrelated: false,
      };
    }
  }

  // ============================================================
  // CHAT ASSISTANT
  // ============================================================

  static async chatAssistant(
    userId: string,
    userMessage: string,
    history: {
      role: 'user' | 'assistant';
      content: string;
    }[]
  ) {
    const model = getGeminiModel();

    const ticketPattern =
      /(CIV-\d{4}-\d{4}|comp-[a-z0-9]+)/gi;

    const matches = userMessage.match(ticketPattern);

    let databaseContext = '';

    if (matches && matches.length > 0) {
      const ticketId = matches[0].toUpperCase();

      console.log(
        `AI Chat scanning database for ticket ID: ${ticketId}`
      );

      try {
        const complaint =
          await prisma.complaint.findFirst({
            where: {
              OR: [
                {
                  complaintNumber: ticketId,
                },
                {
                  id: ticketId.toLowerCase(),
                },
              ],
            },
            include: {
              department: true,
              statusUpdates: {
                orderBy: {
                  timestamp: 'desc',
                },
                take: 1,
              },
            },
          });

        if (complaint) {
          const latestUpdate =
            complaint.statusUpdates[0];

          databaseContext = `
[DATABASE CONTEXT]

Complaint Number: ${complaint.complaintNumber}
Title: ${complaint.title}
Current Status: ${complaint.status}
Assigned Department: ${
            complaint.department?.name ||
            'Awaiting Routing'
          }
Priority: ${complaint.priority}
Description: ${complaint.description}
Latest Update: ${
            latestUpdate?.remarks || 'Submitted'
          }
Updated On: ${
            latestUpdate?.timestamp.toLocaleDateString() ||
            'N/A'
          }
Updated By: ${
            latestUpdate?.updatedBy || 'System'
          }
`;
        } else {
          databaseContext = `
[DATABASE CONTEXT]

The complaint "${ticketId}" was not found in the database.
`;
        }
      } catch (error) {
        console.error(
          'Failed to query complaint:',
          error
        );
      }
    }

    if (!model) {
      return this.fallbackChatResponse(
        userMessage,
        databaseContext
      );
    }

    try {
      const conversationHistory =
        history
          .map((item) => {
            const speaker =
              item.role === 'user'
                ? 'Citizen'
                : 'CivicAI';

            return `${speaker}: ${item.content}`;
          })
          .join('\n');

      const prompt = `
You are CivicAI, the official smart governance assistant for the CivicLink citizen complaints portal.

Your responsibilities:

1. Explain civic procedures.
2. Help citizens file complaints.
3. Explain departments.
4. Explain complaint priority.
5. Help citizens track complaints.
6. Answer questions about the Citizen Connect application.

Be concise, friendly and professional.

Do not invent complaint information.

If database context is provided, use it when answering complaint-status questions.

${databaseContext}

Previous conversation:

${conversationHistory || 'No previous conversation.'}

Citizen:
${userMessage}

CivicAI:
`;

      const result =
        await model.generateContent(prompt);

      const reply =
        result.response.text().trim();

      return (
        reply ||
        'Sorry, I could not process your request.'
      );
    } catch (error) {
      console.error(
        'Gemini chatbot error:',
        error
      );

      return this.fallbackChatResponse(
        userMessage,
        databaseContext
      );
    }
  }

  // ============================================================
  // FALLBACK TEXT ANALYSIS
  // ============================================================

  private static fallbackTextAnalysis(
    description: string
  ) {
    const lowercase =
      description.toLowerCase();

    let category = 'Other';
    let suggestedDepartment = 'Public Works';
    let priority = 'Medium';
    let severityScore = 5;

    if (
      lowercase.includes('pothole') ||
      lowercase.includes('road') ||
      lowercase.includes('pavement')
    ) {
      category = 'Roads';
      suggestedDepartment =
        'Roads Department';
      priority = 'High';
      severityScore = 8;
    } else if (
      lowercase.includes('leak') ||
      lowercase.includes('water') ||
      lowercase.includes('pipe')
    ) {
      category = 'Water Supply';
      suggestedDepartment =
        'Water Department';
      priority = 'High';
      severityScore = 7;
    } else if (
      lowercase.includes('garbage') ||
      lowercase.includes('trash') ||
      lowercase.includes('waste')
    ) {
      category = 'Sanitation';
      suggestedDepartment =
        'Municipal Sanitation';
      priority = 'Medium';
      severityScore = 6;
    } else if (
      lowercase.includes('light') ||
      lowercase.includes('streetlights') ||
      lowercase.includes('bulb')
    ) {
      category = 'Street Lights';
      suggestedDepartment =
        'Electricity Department';
      priority = 'Medium';
      severityScore = 5;
    }

    return {
      summary:
        description.slice(0, 100) +
        (description.length > 100 ? '...' : ''),
      severityScore,
      priority,
      suggestedDepartment,
      keywords: [category.toLowerCase()],
    };
  }

  // ============================================================
  // FALLBACK CHAT
  // ============================================================

  private static fallbackChatResponse(
    message: string,
    context: string
  ) {
    if (context) {
      return `
Based on our system records:

${context.replace(
  '[DATABASE CONTEXT]',
  ''
)}

Is there anything else you'd like to check about this issue?
`;
    }

    const query =
      message.toLowerCase();

    if (
      query.includes('how to report') ||
      query.includes('file') ||
      query.includes('submit')
    ) {
      return `
To file a complaint, click on **"Report Issue"** in the sidebar.

Describe the issue, pin the location, upload evidence and submit the complaint.
`;
    }

    if (
      query.includes('status') ||
      query.includes('track')
    ) {
      return `
To track a complaint, enter your ticket ID such as **CIV-2026-0001** in the chat or open the **Track** page.
`;
    }

    return `
Hello! I am your AI Civic Assistant.

I can help you:
- File complaints
- Track complaints
- Understand civic procedures
- Understand complaint status

How can I help you?
`;
  }
}