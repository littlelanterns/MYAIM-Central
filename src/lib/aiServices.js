// src/lib/aiServices.js - Updated to support "Out of Nest" terminology
// This file will grow to handle all your AI needs while keeping components simple

// =============================================================================
// CONFIGURATION & UTILITIES
// =============================================================================

/**
 * Central configuration for all AI services
 */
const AI_CONFIG = {
  openrouter: {
    // Use serverless endpoint for security (API key stays server-side)
    serverlessEndpoint: '/api/openrouter',
    defaultModel: 'anthropic/claude-3.5-sonnet'
  },
  n8n: {
    familyProcessing: import.meta.env.VITE_N8N_FAMILY_WEBHOOK,
    mindsweepProcessing: import.meta.env.VITE_N8N_MINDSWEEP_WEBHOOK,
    taskProcessing: import.meta.env.VITE_N8N_TASK_WEBHOOK
  },
  pipedream: {
    subtaskGeneration: import.meta.env.VITE_PIPEDREAM_SUBTASK_WEBHOOK,
    mealPlanning: import.meta.env.VITE_PIPEDREAM_MEAL_WEBHOOK
  }
};

/**
 * Standard error handling for all AI operations
 */
class AIServiceError extends Error {
  constructor(message, service, originalError = null) {
    super(message);
    this.name = 'AIServiceError';
    this.service = service;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Generic OpenRouter request handler
 * Calls our secure serverless endpoint instead of OpenRouter directly
 * This keeps the API key server-side for security
 */
async function makeOpenRouterRequest(systemPrompt, userPrompt, options = {}) {
  try {
    const response = await fetch(AI_CONFIG.openrouter.serverlessEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        options: {
          model: options.model || AI_CONFIG.openrouter.defaultModel,
          maxTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.1,
          extraParams: options.extraParams
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new AIServiceError(
        `API error: ${response.status} - ${errorData.error || errorData.message || 'Unknown error'}`,
        'openrouter-serverless'
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Failed to connect to AI service', 'openrouter-serverless', error);
  }
}

// =============================================================================
// FAMILY MANAGEMENT AI
// =============================================================================

/**
 * Process natural language family descriptions into structured data
 * 
 * Current: Direct OpenRouter call
 * Future: Could route to n8n workflow for complex family situations
 * 
 * @param {string} familyDescription - Natural language family description
 * @param {Array} existingMembers - Current family members to avoid duplicates
 * @returns {Object} Processed family member data
 */
export async function processFamilyDescription(familyDescription, existingMembers = []) {
  try {
    console.log('[AI Services] Processing family description:', familyDescription);

    // Future enhancement: Route complex families to n8n workflow
    // if (familyDescription.length > 500 || containsComplexRelationships(familyDescription)) {
    //   return await processComplexFamilyViaWorkflow(familyDescription, existingMembers);
    // }

    const systemPrompt = `You are a family data extraction specialist. Convert natural language family descriptions into structured JSON data.

CRITICAL JSON FORMATTING RULES:
- Return ONLY valid JSON - no extra text, explanations, markdown, or comments
- Ensure all string values are properly quoted
- Ensure all commas are properly placed between array items and object properties
- Do NOT include trailing commas before closing brackets
- For large families (10+ people), double-check your JSON syntax is perfect

IMPORTANT RULES:
1. Extract ONLY the people mentioned in the input
2. Infer relationships and ages from context clues
3. Use these relationship types EXACTLY:
   - "self" - The person setting up the system (use sparingly, only if explicitly stated)
   - "child" - Children living in household (under 18, living at home)
   - "out-of-nest" - Anyone not living in the household: grown children, adult children, college kids, married children, grandchildren, great-grandchildren, children-in-law, nephews/nieces living elsewhere
   - "partner" - Spouse, husband, wife, partner, significant other
   - "special" - Grandparents, caregivers, tutors, babysitters, family friends, aunts/uncles, cousins, other relatives
4. Use these access levels: "guided" (kids under 13), "independent" (teens 13+), "full" (adults), "none" (context-only)
5. Return ONLY valid JSON - no extra text, explanations, or markdown

RELATIONSHIP DETECTION GUIDE:
- Children 18+ or described as "moved out", "college", "married", "adult children" → "out-of-nest"
- Grandchildren, great-grandchildren, children-in-law → "out-of-nest"
- Children under 18 living at home → "child"
- Spouse, husband, wife, partner, boyfriend, girlfriend → "partner"
- Grandparents, aunts, uncles, cousins living elsewhere → "special"
- Anyone described as "babysitter", "tutor", "caregiver" → "special"

HOUSEHOLD DETECTION:
- "Out-of-nest" = Context-only (no dashboard access) - includes ALL descendants not living in the house
- "Special" = Context-only (no dashboard access) - includes extended family and caregivers
- Only "child", "partner", and "self" typically get household access

Output format (return EXACTLY this structure):
{
  "familyMembers": [
    {
      "name": "string",
      "relationship": "self|child|out-of-nest|partner|special",
      "age": number or null,
      "birthday": "YYYY-MM-DD" or null (extract if mentioned, use any date format but return as YYYY-MM-DD),
      "accessLevel": "guided|independent|full|none",
      "nicknames": ["string"],
      "notes": "string with age info if detected"
    }
  ]
}`;

    const userPrompt = `Extract family members from: "${familyDescription}"

Focus on detecting:
- Ages to determine child vs out-of-nest
- Birthdays (in any format: "March 15", "3/15/2010", "born 2010-03-15", etc.) - convert to YYYY-MM-DD
- Living situations (home vs moved out vs separate household)
- Generational relationships (children vs grandchildren vs great-grandchildren)
- Relationship indicators (mom, dad, spouse, grandchild, etc.)

Examples of "out-of-nest":
- "My adult daughter Sarah and her kids"
- "Grandson Jake who's in college"
- "Our married son and his family"
- "Daughter-in-law Emma"
- "Great-grandchildren from our oldest"

Birthday extraction examples:
- "Emma, age 10, birthday March 15" → "birthday": "2015-03-15" (calculate year from age)
- "John born 5/20/2008" → "birthday": "2008-05-20"
- "Sarah's birthday is December 1st, she's 12" → "birthday": "2013-12-01"`;

    const aiResponse = await makeOpenRouterRequest(systemPrompt, userPrompt, {
      maxTokens: 3000, // Increased for large families
      temperature: 0.1
    });

    // Parse and validate response
    let cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();

    // Log the raw response for debugging
    console.log('[AI Services] Raw AI response length:', cleanedResponse.length);
    console.log('[AI Services] First 500 chars:', cleanedResponse.substring(0, 500));
    console.log('[AI Services] Last 500 chars:', cleanedResponse.substring(cleanedResponse.length - 500));

    // Try to extract JSON if there's extra text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // Try to fix common JSON errors
      console.error('[AI Services] JSON parse error, attempting repair:', parseError.message);

      // Try removing trailing commas
      const repairedResponse = cleanedResponse
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      try {
        parsedData = JSON.parse(repairedResponse);
        console.log('[AI Services] JSON repair successful');
      } catch (repairError) {
        console.error('[AI Services] Full response that failed to parse:', cleanedResponse);
        throw new AIServiceError(
          `AI returned invalid JSON: ${parseError.message}. Response length: ${cleanedResponse.length} chars`,
          'family-processing',
          parseError
        );
      }
    }

    if (!parsedData.familyMembers || !Array.isArray(parsedData.familyMembers)) {
      throw new AIServiceError('Invalid response structure from AI', 'family-processing');
    }

    // Process and format for database
    const processedMembers = parsedData.familyMembers.map((member, index) => {
      // Calculate age from birthday - ALWAYS use birthday if available, ignore AI's age
      let calculatedAge = null;
      if (member.birthday) {
        try {
          const birthDate = new Date(member.birthday);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          calculatedAge = age;
          console.log(`[AI Services] Calculated age for ${member.name}: ${calculatedAge} from birthday ${member.birthday}`);
        } catch (e) {
          console.warn('Could not calculate age from birthday:', member.birthday);
          // Fall back to AI's age only if birthday calculation fails
          calculatedAge = member.age;
        }
      } else {
        // No birthday provided, use AI's age estimate
        calculatedAge = member.age;
      }

      // Smart defaults for access levels
      let accessLevel = member.accessLevel;
      if (!accessLevel) {
        if (member.relationship === 'out-of-nest' || member.relationship === 'special') {
          accessLevel = 'none'; // Context only
        } else if (member.relationship === 'partner' || member.relationship === 'self') {
          accessLevel = 'full';
        } else if (calculatedAge && calculatedAge >= 13) {
          accessLevel = 'independent';
        } else {
          accessLevel = 'guided';
        }
      }

      // Set dashboard type based on age (for children only)
      let dashboardType = 'guided'; // default
      if (member.relationship === 'child' && calculatedAge) {
        if (calculatedAge >= 13) {
          dashboardType = 'independent'; // Ages 13-18
        } else if (calculatedAge >= 10) {
          dashboardType = 'guided'; // Ages 10-12
        } else if (calculatedAge >= 5) {
          dashboardType = 'play'; // Ages 5-9
        } else {
          dashboardType = 'play'; // Under 5
        }
      }

      return {
        id: Date.now() + index,
        name: member.name || 'Unknown',
        nicknames: Array.isArray(member.nicknames) ? member.nicknames : [member.nicknames || ''],
        birthday: member.birthday || '',
        relationship: member.relationship || 'child',
        customRole: member.relationship === 'special' ? member.name : '',
        accessLevel: accessLevel,
        dashboard_type: member.relationship === 'child' ? dashboardType : undefined,
        inHousehold: member.relationship !== 'out-of-nest' && member.relationship !== 'special',
        permissions: {},
        notes: member.notes || `Added via AI on ${new Date().toLocaleDateString()}${calculatedAge ? ` (Age: ${calculatedAge})` : ''}`
      };
    });

    // Check for duplicates
    const existingNames = existingMembers.map(m => m.name.toLowerCase());
    const newMembers = processedMembers.filter(member => 
      !existingNames.includes(member.name.toLowerCase())
    );
    const duplicates = processedMembers.filter(member => 
      existingNames.includes(member.name.toLowerCase())
    );

    return {
      success: true,
      newMembers,
      duplicates,
      totalProcessed: parsedData.familyMembers.length,
      service: 'openrouter-direct',
      detectedRelationships: processedMembers.map(m => {
        // Display-friendly access level text
        let accessDisplay = m.accessLevel;
        if (m.relationship === 'partner' || m.relationship === 'special') {
          accessDisplay = 'Additional Adult Dashboard';
        } else if (m.accessLevel === 'none') {
          accessDisplay = 'Context Only';
        } else if (m.accessLevel === 'play') {
          accessDisplay = 'Play Mode';
        } else if (m.accessLevel === 'guided') {
          accessDisplay = 'Guided Mode';
        } else if (m.accessLevel === 'independent') {
          accessDisplay = 'Independent Mode';
        } else if (m.accessLevel === 'full') {
          accessDisplay = 'Full Access';
        }

        return {
          name: m.name,
          relationship: m.relationship,
          inHousehold: m.inHousehold,
          accessLevel: accessDisplay
        };
      })
    };

  } catch (error) {
    console.error('[AI Services] Family processing error:', error);
    return {
      success: false,
      error: error.message,
      newMembers: [],
      duplicates: [],
      service: 'openrouter-direct'
    };
  }
}

// =============================================================================
// TASK MANAGEMENT AI
// =============================================================================

/**
 * Generate AI subtasks for a given task
 * 
 * Current: Direct OpenRouter call
 * Future: Could route to Pipedream for complex task breakdown
 */
export async function generateTaskSubtasks(taskName, description = '', taskType = 'task') {
  try {
    console.log('[AI Services] Generating subtasks for:', taskName);

    const systemPrompt = `Generate 3-5 helpful subtasks for the given task. Return as a simple JSON array of strings.
Focus on practical, actionable steps that help complete the main task.
For chores: break down the physical steps
For homework: break down the learning/completion process
For opportunities: break down the exploration/decision process

Return format: ["step 1", "step 2", "step 3"]`;

    const userPrompt = `Task: "${taskName}"${description ? `\nDescription: ${description}` : ''}${taskType !== 'task' ? `\nType: ${taskType}` : ''}`;

    const aiResponse = await makeOpenRouterRequest(systemPrompt, userPrompt, {
      maxTokens: 500,
      temperature: 0.3
    });

    const subtasks = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, '').trim());

    return {
      success: true,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      service: 'openrouter-direct'
    };

  } catch (error) {
    console.error('[AI Services] Subtask generation error:', error);
    return {
      success: false,
      error: error.message,
      subtasks: [],
      service: 'openrouter-direct'
    };
  }
}

// =============================================================================
// LILA OPTIMIZER AI
// =============================================================================

/**
 * Optimize prompts with family context
 * 
 * Current: Will be direct OpenRouter call
 * Future: Complex optimization might use n8n workflow with RAG
 */
export async function optimizePrompt(originalPrompt, familyContext = {}, promptType = 'general') {
  try {
    console.log('[AI Services] Optimizing prompt:', promptType);

    // Future: Route complex optimizations to n8n with RAG
    // if (familyContext.complexContext || promptType === 'behavior-management') {
    //   return await optimizePromptViaWorkflow(originalPrompt, familyContext, promptType);
    // }

    const systemPrompt = `You are LiLa, the family prompt optimizer. Enhance prompts to be more effective with family context.

Improve the prompt by:
1. Adding relevant family context
2. Making language more appropriate for the situation
3. Adding helpful constraints or guidance
4. Maintaining the original intent

Return only the optimized prompt, no explanations.`;

    const contextString = Object.keys(familyContext).length > 0 
      ? `\nFamily Context: ${JSON.stringify(familyContext)}`
      : '';

    const userPrompt = `Original prompt: "${originalPrompt}"${contextString}\nPrompt type: ${promptType}`;

    const optimizedPrompt = await makeOpenRouterRequest(systemPrompt, userPrompt, {
      maxTokens: 800,
      temperature: 0.2
    });

    return {
      success: true,
      originalPrompt,
      optimizedPrompt,
      improvementSuggestions: [], // Future: extract suggestions
      service: 'openrouter-direct'
    };

  } catch (error) {
    console.error('[AI Services] Prompt optimization error:', error);
    return {
      success: false,
      error: error.message,
      originalPrompt,
      optimizedPrompt: originalPrompt, // Fallback to original
      service: 'openrouter-direct'
    };
  }
}

// =============================================================================
// BEST INTENTIONS AI
// =============================================================================

/**
 * Process Brain Dump conversations and extract intentions
 * 
 * Current: Direct OpenRouter call with conversation management
 * Future: Could route to n8n workflow for complex intention detection
 */
export async function processBrainDumpConversation(conversationHistory, isInitialDump = false) {
  try {
    console.log('[AI Services] Processing brain dump conversation');

    const systemPrompt = `You are a warm, supportive family coach helping a parent create a focused "Best Intention" for their family. Your goal is to help them process messy thoughts and identify ONE meaningful area to work on.

CONVERSATION FLOW:
1. Read their brain dump and identify 2-4 main themes/areas of concern
2. Acknowledge what you heard with empathy
3. Help them choose ONE area to focus on first (most pressing or impactful)
4. Ask clarifying questions to understand:
   - Current State: What's happening now? What's the struggle?
   - Desired State: What would success look like? What's the goal?
   - Why It Matters: What's the deeper motivation? Why is this important?
5. Keep conversation focused - max 8-10 exchanges per intention
6. When you have clear answers, format the intention data

TONE:
- Warm and understanding (like talking to a supportive friend)
- Non-judgmental
- Gently guiding but not pushy
- Acknowledge feelings while staying solution-focused
- Use "you/your" language (not "we")

CONSTRAINTS:
- Focus on ONE intention at a time
- If they dump many concerns, help prioritize
- Ask one question at a time (don't overwhelm)
- Keep responses conversational (2-4 sentences usually)
- Avoid therapy-speak or being overly formal

OUTPUT FORMAT:
When intention is clear, return structured data in this JSON format:
{
  "response": "Your conversational response to the user",
  "intentionReady": true/false,
  "intention": {
    "title": "Clear, action-oriented title (6-10 words)",
    "current_state": "What's happening now",
    "desired_state": "What success looks like", 
    "why_it_matters": "The deeper motivation",
    "category": "family_relationships|personal_growth|household_culture|spiritual_development",
    "priority": "high|medium|low based on urgency in their language"
  }
}

Continue conversation until you have enough clarity for all fields. Only set intentionReady to true when you have complete information.`;

    // Convert conversation history to messages format
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Call our secure serverless endpoint
    const response = await fetch(AI_CONFIG.openrouter.serverlessEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        options: {
          model: AI_CONFIG.openrouter.defaultModel,
          maxTokens: 1500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new AIServiceError(
        `API error: ${response.status} - ${errorData.error || 'Unknown error'}`,
        'openrouter-serverless'
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    // Try to parse JSON response
    let parsedResponse;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: treat as plain text response
        parsedResponse = {
          response: aiResponse,
          intentionReady: false,
          intention: null
        };
      }
    } catch (parseError) {
      // Fallback: treat as plain text response
      parsedResponse = {
        response: aiResponse,
        intentionReady: false,
        intention: null
      };
    }

    return {
      success: true,
      response: parsedResponse.response,
      intentionReady: parsedResponse.intentionReady || false,
      intention: parsedResponse.intention || null,
      service: 'openrouter-serverless'
    };

  } catch (error) {
    console.error('[AI Services] Brain dump processing error:', error);
    return {
      success: false,
      error: error.message,
      response: "I'm sorry, I'm having trouble processing that right now. Could you try rephrasing your thoughts?",
      intentionReady: false,
      intention: null,
      service: 'openrouter-serverless'
    };
  }
}

// =============================================================================
// QUICK ACTIONS AI
// =============================================================================

/**
 * Process Quick Action requests with AI
 * 
 * Future: Different actions might route to different services
 */
export async function processQuickAction(actionType, userInput, familyContext = {}) {
  try {
    console.log('[AI Services] Processing quick action:', actionType);

    // Future routing logic:
    // switch (actionType) {
    //   case 'meal-planning': return await processMealPlanningAction(userInput, familyContext);
    //   case 'schedule-optimization': return await processScheduleAction(userInput, familyContext);
    //   case 'behavior-guidance': return await processBehaviorAction(userInput, familyContext);
    //   default: return await processGenericAction(actionType, userInput, familyContext);
    // }

    return {
      success: true,
      response: "Quick Actions AI not yet implemented",
      actionType,
      service: 'placeholder'
    };

  } catch (error) {
    console.error('[AI Services] Quick action error:', error);
    return {
      success: false,
      error: error.message,
      service: 'openrouter-direct'
    };
  }
}

// =============================================================================
// MINDSWEEP PROCESSING AI
// =============================================================================

/**
 * Process MindSweep items (voice, text, images)
 * 
 * Current: Placeholder
 * Future: Route to n8n workflow for complex processing
 */
export async function processMindsweepItem(content, contentType, familyContext = {}) {
  try {
    console.log('[AI Services] Processing MindSweep item:', contentType);

    // Future: Route to n8n workflow
    // if (AI_CONFIG.n8n.mindsweepProcessing) {
    //   return await processMindsweepViaWorkflow(content, contentType, familyContext);
    // }

    return {
      success: true,
      category: 'uncategorized',
      summary: 'MindSweep processing not yet implemented',
      suggestedActions: [],
      service: 'placeholder'
    };

  } catch (error) {
    console.error('[AI Services] MindSweep processing error:', error);
    return {
      success: false,
      error: error.message,
      service: 'placeholder'
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check the health of all AI services
 */
export async function checkAIServicesHealth() {
  const status = {
    openrouter: !!AI_CONFIG.openrouter.apiKey,
    n8n: !!AI_CONFIG.n8n.familyProcessing,
    pipedream: !!AI_CONFIG.pipedream.subtaskGeneration,
    timestamp: new Date().toISOString()
  };

  console.log('[AI Services] Health check:', status);
  return status;
}

/**
 * Get usage statistics for AI services
 */
export async function getAIUsageStats() {
  // Future: Track usage across all services
  return {
    totalRequests: 0,
    requestsByService: {},
    costEstimate: 0,
    timestamp: new Date().toISOString()
  };
}