import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize OpenAI client (gracefully handles empty API keys)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key') {
    console.warn('OpenAI API key is missing or is using placeholder. AI services will run in fallback mock mode.');
    return null;
  }
  return new OpenAI({ apiKey });
};

export class AIService {
  /**
   * Automatically analyzes the text description of a civic complaint.
   * Returns: Summary, Severity Score (1-10), Priority, and Suggested Department.
   */
  static async analyzeDescription(description: string) {
    const openai = getOpenAIClient();

    if (!openai) {
      // Fallback Mock Service when API key is missing
      return this.fallbackTextAnalysis(description);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI Civic Analyst for CivicLink. Analyze the complaint description.
Return a valid JSON object ONLY with the following keys. Do not include markdown code block syntax (like \`\`\`json) in your response, just return the raw JSON:
{
  "summary": "A 1-2 sentence concise summary of the issue under 120 characters.",
  "severityScore": 8, // Integer from 1 to 10
  "priority": "High", // "Low", "Medium", or "High"
  "suggestedDepartment": "Roads Department" // Must be one of: "Roads Department", "Water Department", "Electricity Department", "Municipal Sanitation", "Public Works", "Environment Department"
}`,
          },
          {
            role: 'user',
            content: `Complaint description: "${description}"`,
          },
        ],
        temperature: 0.1,
      });

      const contentText = response.choices[0].message?.content || '{}';
      const parsedData = JSON.parse(contentText.trim());

      return {
        summary: parsedData.summary || description.slice(0, 100) + '...',
        severityScore: Number(parsedData.severityScore) || 5,
        priority: parsedData.priority || 'Medium',
        suggestedDepartment: parsedData.suggestedDepartment || 'Public Works',
        keywords: [parsedData.suggestedDepartment?.toLowerCase() || 'general'],
      };
    } catch (error) {
      console.error('OpenAI text analysis error:', error);
      return this.fallbackTextAnalysis(description);
    }
  }

  /**
   * Analyzes complaint images using OpenAI Vision.
   * Detects potholes, garbage, water leaks, streetlights, drainage, or road damage.
   * Checks for blurry or unrelated photos.
   */
  static async analyzeImage(base64Image: string) {
    const openai = getOpenAIClient();

    if (!openai) {
      // Fallback vision analysis
      return {
        detectedIssue: 'Pothole',
        confidence: 0.92,
        isBlurry: false,
        isUnrelated: false,
      };
    }

    try {
      // Format base64 correctly if not done
      let formattedImage = base64Image;
      if (!base64Image.startsWith('data:image')) {
        formattedImage = `data:image/jpeg;base64,${base64Image}`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI Civic Inspector for CivicLink. Analyze the attached image.
Check if the image is blurry, blurry-focused, or extremely low quality.
Check if the image is unrelated to standard municipal civic issues (e.g. selfies, random objects, clean indoor shots).
Return a valid JSON object ONLY. Do not use markdown blocks. Keys:
{
  "isBlurry": false, // boolean
  "isUnrelated": false, // boolean
  "detectedIssue": "Pothole", // one of: "Pothole", "Garbage", "Drainage issue", "Water leakage", "Streetlight damage", "Road damage" (null if unrelated or blurry)
  "confidence": 0.88 // Float between 0 and 1 representing confidence score
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: formattedImage,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      });

      const contentText = response.choices[0].message?.content || '{}';
      const parsedData = JSON.parse(contentText.trim());

      return {
        detectedIssue: parsedData.detectedIssue || null,
        confidence: Number(parsedData.confidence) || 0,
        isBlurry: !!parsedData.isBlurry,
        isUnrelated: !!parsedData.isUnrelated,
      };
    } catch (error) {
      console.error('OpenAI Vision error:', error);
      return {
        detectedIssue: 'Road damage',
        confidence: 0.85,
        isBlurry: false,
        isUnrelated: false,
      };
    }
  }

  /**
   * AI Conversational Assistant
   * Can check complaint status automatically by fetching database records if a ticket ID or name is recognized.
   */
  static async chatAssistant(userId: string, userMessage: string, history: { role: 'user' | 'assistant'; content: string }[]) {
    const openai = getOpenAIClient();

    // 1. Scan for ticket code matches (e.g. CIV-2026-0001, comp-cui123)
    const ticketPattern = /(CIV-\d{4}-\d{4}|comp-[a-z0-9]+)/gi;
    const matches = userMessage.match(ticketPattern);
    let databaseContext = '';

    if (matches && matches.length > 0) {
      const ticketId = matches[0].toUpperCase();
      console.log(`AI Chat scanning database for ticket ID: ${ticketId}`);

      try {
        const complaint = await prisma.complaint.findFirst({
          where: {
            OR: [
              { complaintNumber: ticketId },
              { id: ticketId.toLowerCase() },
            ],
          },
          include: {
            department: true,
            statusUpdates: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        });

        if (complaint) {
          const latestUpdate = complaint.statusUpdates[0];
          databaseContext = `[DATABASE CONTEXT] We found the following details in the database:
- Complaint Number: ${complaint.complaintNumber}
- Title: ${complaint.title}
- Current Status: ${complaint.status}
- Assigned Department: ${complaint.department?.name || 'Awaiting Routing'}
- Priority Level: ${complaint.priority}
- Description: ${complaint.description}
- Latest Update Remarks: "${latestUpdate?.remarks || 'Submitted'}" updated on ${latestUpdate?.timestamp.toLocaleDateString() || 'N/A'} by ${latestUpdate?.updatedBy || 'System'}
`;
        } else {
          databaseContext = `[DATABASE CONTEXT] The user asked about ticket ID "${ticketId}", but we could not find any complaint with that ID or complaint number in our database.`;
        }
      } catch (err) {
        console.error('Failed to query complaint for AI chatbot:', err);
      }
    }

    if (!openai) {
      return this.fallbackChatResponse(userMessage, databaseContext);
    }

    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `You are CivicAI, the official smart governance assistant for the CivicLink citizen complaints portal.
Your primary capabilities are:
1. Explain civic procedures (e.g., how to report, resolution pipelines).
2. Answer FAQ questions about departments and priority assignment.
3. Help users file complaints step-by-step.
4. Report complaint status. If [DATABASE CONTEXT] is provided below, summarize and present the current status, department, and latest updates to the user in a friendly, professional way.

Keep answers concise, direct, helpful, and formatted nicely in Markdown.
${databaseContext}`,
        },
        ...history,
        { role: 'user', content: userMessage },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      });

      return response.choices[0].message?.content || 'I apologize, I could not process that request.';
    } catch (error) {
      console.error('OpenAI chatbot error:', error);
      return this.fallbackChatResponse(userMessage, databaseContext);
    }
  }

  // --- Fallbacks for when keys are missing or API fails ---
  private static fallbackTextAnalysis(description: string) {
    const lowercase = description.toLowerCase();
    let category = 'Other';
    let suggestedDepartment = 'Public Works';
    let priority = 'Medium';
    let severityScore = 5;

    if (lowercase.includes('pothole') || lowercase.includes('road') || lowercase.includes('pavement')) {
      category = 'Roads';
      suggestedDepartment = 'Roads Department';
      priority = 'High';
      severityScore = 8;
    } else if (lowercase.includes('leak') || lowercase.includes('water') || lowercase.includes('pipe')) {
      category = 'Water Supply';
      suggestedDepartment = 'Water Department';
      priority = 'High';
      severityScore = 7;
    } else if (lowercase.includes('garbage') || lowercase.includes('trash') || lowercase.includes('waste')) {
      category = 'Sanitation';
      suggestedDepartment = 'Municipal Sanitation';
      priority = 'Medium';
      severityScore = 6;
    } else if (lowercase.includes('light') || lowercase.includes('streetlights') || lowercase.includes('bulb')) {
      category = 'Street Lights';
      suggestedDepartment = 'Electricity Department';
      priority = 'Medium';
      severityScore = 5;
    }

    return {
      summary: description.slice(0, 100) + (description.length > 100 ? '...' : ''),
      severityScore,
      priority,
      suggestedDepartment,
      keywords: [category.toLowerCase()],
    };
  }

  private static fallbackChatResponse(message: string, context: string) {
    if (context) {
      return `Based on our system records:\n\n${context.replace('[DATABASE CONTEXT]', '')}\n\nIs there anything else you'd like to check about this issue?`;
    }

    const query = message.toLowerCase();
    if (query.includes('how to report') || query.includes('file') || query.includes('submit')) {
      return `To file a complaint, click on **"Report Issue"** in the sidebar. Describe the issue in detail, pin the location, upload evidence, and click submit. I can also help you analyze description drafts before you submit!`;
    }
    if (query.includes('status') || query.includes('track')) {
      return `To track a grievance, enter the ticket ID (like "CIV-2026-0001") in our chat or head to the **"Track"** page in your sidebar to see real-time updates of all your reports.`;
    }

    return `Hello! I am your AI Civic Assistant. I can check the status of your complaints (e.g. check "CIV-2026-0001") or guide you through filing and procedures. How can I help you today?`;
  }
}
