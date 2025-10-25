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
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    headers: {
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AIMfM Family Intelligence System'
    }
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
 * Used by simple AI operations that don't need complex workflows
 */
async function makeOpenRouterRequest(systemPrompt, userPrompt, options = {}) {
  if (!AI_CONFIG.openrouter.apiKey) {
    throw new AIServiceError('OpenRouter API key not configured', 'openrouter');
  }

  try {
    const response = await fetch(AI_CONFIG.openrouter.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        ...AI_CONFIG.openrouter.headers
      },
      body: JSON.stringify({
        model: options.model || AI_CONFIG.openrouter.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.1,
        ...options.extraParams
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new AIServiceError(
        `OpenRouter API error: ${response.status} - ${errorData}`,
        'openrouter'
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Failed to connect to OpenRouter', 'openrouter', error);
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
      "accessLevel": "guided|independent|full|none",
      "nicknames": ["string"],
      "notes": "string with age info if detected"
    }
  ]
}`;

    const userPrompt = `Extract family members from: "${familyDescription}"

Focus on detecting:
- Ages to determine child vs out-of-nest
- Living situations (home vs moved out vs separate household)
- Generational relationships (children vs grandchildren vs great-grandchildren)
- Relationship indicators (mom, dad, spouse, grandchild, etc.)

Examples of "out-of-nest":
- "My adult daughter Sarah and her kids"
- "Grandson Jake who's in college" 
- "Our married son and his family"
- "Daughter-in-law Emma"
- "Great-grandchildren from our oldest"`;

    const aiResponse = await makeOpenRouterRequest(systemPrompt, userPrompt);

    // Parse and validate response
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanedResponse);

    if (!parsedData.familyMembers || !Array.isArray(parsedData.familyMembers)) {
      throw new AIServiceError('Invalid response structure from AI', 'family-processing');
    }

    // Process and format for database
    const processedMembers = parsedData.familyMembers.map((member, index) => {
      // Smart defaults for access levels
      let accessLevel = member.accessLevel;
      if (!accessLevel) {
        if (member.relationship === 'out-of-nest' || member.relationship === 'special') {
          accessLevel = 'none'; // Context only
        } else if (member.relationship === 'partner' || member.relationship === 'self') {
          accessLevel = 'full';
        } else if (member.age && member.age >= 13) {
          accessLevel = 'independent';
        } else {
          accessLevel = 'guided';
        }
      }

      return {
        id: Date.now() + index,
        name: member.name || 'Unknown',
        nicknames: Array.isArray(member.nicknames) ? member.nicknames : [member.nicknames || ''],
        birthday: '',
        relationship: member.relationship || 'child',
        customRole: member.relationship === 'special' ? member.name : '',
        accessLevel: accessLevel,
        inHousehold: member.relationship !== 'out-of-nest' && member.relationship !== 'special',
        permissions: {},
        notes: member.notes || `Added via AI on ${new Date().toLocaleDateString()}${member.age ? ` (Age: ${member.age})` : ''}`
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
      detectedRelationships: processedMembers.map(m => ({
        name: m.name,
        relationship: m.relationship,
        inHousehold: m.inHousehold,
        accessLevel: m.accessLevel
      }))
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

    // Convert conversation history to OpenRouter format
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await fetch(AI_CONFIG.openrouter.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        ...AI_CONFIG.openrouter.headers
      },
      body: JSON.stringify({
        model: AI_CONFIG.openrouter.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new AIServiceError(
        `OpenRouter API error: ${response.status} - ${errorData}`,
        'openrouter'
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
      service: 'openrouter-direct'
    };

  } catch (error) {
    console.error('[AI Services] Brain dump processing error:', error);
    return {
      success: false,
      error: error.message,
      response: "I'm sorry, I'm having trouble processing that right now. Could you try rephrasing your thoughts?",
      intentionReady: false,
      intention: null,
      service: 'openrouter-direct'
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