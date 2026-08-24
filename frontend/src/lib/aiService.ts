import { AISummary } from './db';

// Heuristic categories mapping
const KEYWORDS_MAP = [
  {
    category: 'Roads',
    dept: 'Roads Department',
    priority: 'High' as const,
    matches: ['pothole', 'road', 'cracks', 'tarmac', 'paving', 'highway', 'pavement', 'divider', 'asphalt', 'bump'],
    keywords: ['road maintenance', 'pothole', 'traffic safety', 'asphalt repair']
  },
  {
    category: 'Water Supply',
    dept: 'Water Department',
    priority: 'High' as const,
    matches: ['water', 'pipe', 'leak', 'flooding', 'drain', 'drainage', 'gushing', 'clogged', 'sewage', 'burst'],
    keywords: ['water leakage', 'plumbing infrastructure', 'flooding', 'conservation']
  },
  {
    category: 'Electricity',
    dept: 'Electricity Department',
    priority: 'High' as const,
    matches: ['power', 'electricity', 'blackout', 'outage', 'wire', 'transformer', 'voltage', 'shock', 'cable'],
    keywords: ['power grid', 'electrical hazard', 'outage repair', 'grid load']
  },
  {
    category: 'Sanitation',
    dept: 'Municipal Sanitation',
    priority: 'Medium' as const,
    matches: ['garbage', 'trash', 'litter', 'rubbish', 'refuse', 'dump', 'smell', 'odor', 'hygiene', 'bin', 'waste'],
    keywords: ['waste management', 'littering', 'public hygiene', 'waste removal']
  },
  {
    category: 'Street Lights',
    dept: 'Electricity Department',
    priority: 'Medium' as const,
    matches: ['streetlight', 'dark', 'lamp', 'bulb', 'night', 'unsafe', 'lighting', 'illumination'],
    keywords: ['street lighting', 'public safety', 'dark block', 'bulb replacement']
  },
  {
    category: 'Public Safety',
    dept: 'Public Works',
    priority: 'High' as const,
    matches: ['safety', 'crime', 'hazard', 'abandoned', 'danger', 'collapse', 'structural', 'encroachment', 'stray'],
    keywords: ['public safety', 'structural hazard', 'nuisance', 'civil protection']
  },
  {
    category: 'Environment',
    dept: 'Environment Department',
    priority: 'Medium' as const,
    matches: ['pollution', 'tree', 'air', 'smoke', 'dust', 'noise', 'chemical', 'pests', 'mosquitoes', 'dumping'],
    keywords: ['environmental hazard', 'air quality', 'noise pollution', 'tree cutting']
  }
];

export const AIService = {
  /**
   * Summarizes a complaint description and recommends categories, priorities, and departments.
   */
  summarizeComplaint: async (description: string): Promise<AISummary> => {
    // Artificial slight delay to simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowercaseText = description.toLowerCase();
    
    // Find best matching category by counting keyword matches
    let bestMatch = KEYWORDS_MAP[KEYWORDS_MAP.length - 1]; // Fallback to 'Other' style
    let maxMatches = 0;

    for (const entry of KEYWORDS_MAP) {
      const matchCount = entry.matches.filter(m => lowercaseText.includes(m)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = entry;
      }
    }

    // Default category fallback
    const category = maxMatches > 0 ? bestMatch.category : 'Other';
    const recommendedDepartment = maxMatches > 0 ? bestMatch.dept : 'Public Works';
    const priority = maxMatches > 0 ? bestMatch.priority : 'Medium';
    const keywords = maxMatches > 0 ? bestMatch.keywords : ['general grievance', 'civic request'];

    // Generate a structured summary sentences
    let summary = '';
    const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 0) {
      summary = sentences[0];
      if (sentences.length > 1) {
        summary += '. ' + sentences[1];
      }
      if (summary.length > 120) {
        summary = summary.substring(0, 117) + '...';
      }
    } else {
      summary = 'Civic issue report submitted regarding ' + category.toLowerCase() + '.';
    }

    return {
      summary,
      category,
      priority,
      recommendedDepartment,
      keywords
    };
  },

  /**
   * Handles chatbot assistant interactions.
   */
  chatAssistant: async (message: string, chatHistory: { sender: 'user' | 'ai'; text: string }[]): Promise<string> => {
    // Artificial slight delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const query = message.toLowerCase();

    // Check for help/how to report
    if (query.includes('how to report') || query.includes('submit') || query.includes('report a complaint') || query.includes('file a complaint')) {
      return `To report a civic issue on our platform, follow these simple steps:
1. Navigate to the **"Report Issue"** page from your sidebar.
2. Enter a descriptive title (e.g., *"Clogged storm drain on Main Street"*).
3. Type in the detailed description. You can click **"AI Analyze & Auto-fill"** to automatically summarize it and find its category.
4. Set the location and upload any relevant images.
5. Click **"Submit Complaint"** to file your grievance.
Once submitted, you'll be able to track it in real-time under **"Track Grievance"**!`;
    }

    // Check for statuses explanation
    if (query.includes('status') || query.includes('tracking') || query.includes('stages')) {
      return `Every complaint goes through a structured resolution workflow:
1. 📬 **Submitted**: Your complaint has been recorded and queued.
2. 🔍 **Under Review**: Administrators are validating the details.
3. ⚙️ **Assigned**: The issue has been routed to the correct department (e.g., Water, Roads).
4. 🛠️ **In Progress**: Ground crews are dispatched to resolve the issue.
5. ✅ **Resolved**: The department has fixed the issue. You can review the result.
6. 🔒 **Closed**: The ticket is archived. If you are satisfied with the resolution, you can close it yourself!`;
    }

    // Check for departments
    if (query.includes('department') || query.includes('responsible')) {
      return `We route complaints to six specialized municipal departments:
- **Roads Department**: Potholes, damaged paving, missing lane markers.
- **Water Department**: Pipeline bursts, drainage flooding, poor water quality.
- **Electricity Department**: Faulty streetlights, broken transformers.
- **Municipal Sanitation**: Garbage collection, littering, public toilets.
- **Environment Department**: Industrial pollution, park trimming, noise.
- **Public Works**: General municipal repairs and structural public hazards.`;
    }

    // Check for greetings
    if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greetings')) {
      return `Hello! I am your AI Civic Assistant. I'm here to help you navigate the citizen complaints platform.
      
You can ask me questions like:
- *"How do I report a civic issue?"*
- *"What do the different tracking statuses mean?"*
- *"Which departments handle water leaks or streetlights?"*
- *"How does the AI auto-routing work?"*

What can I help you with today?`;
    }

    // Check for app description
    if (query.includes('what is this') || query.includes('about this app') || query.includes('who are you')) {
      return `I am the AI assistant for **Citizen Connect**—a modern grievance resolution portal. Our app uses smart algorithms to automatically route civic issues to government departments, prioritize them, and map them in real-time to bring transparency and speed to community resolution.`;
    }

    // Default conversational fallback
    return `I understand you're asking about "${message}". If this is related to a civic issue, you can report it using the **"Report Issue"** tab, track its timeline under **"Track Grievance"**, or view interactive status pins on the **"Nearby Issues Map"**. 

Is there a specific procedure, status stage, or department you would like me to explain further?`;
  }
};
