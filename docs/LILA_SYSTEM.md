# LiLa Prompt Crafter System

## 🤖 PURPOSE

LiLa is MyAIM-Central's **AI assistant** that transforms mom's simple requests into perfect, platform-specific prompts using family context - making ANY AI platform smarter about her family.

**Key Innovation:** Context-aware + Platform-optimized + Portable to any AI.

---

## 🎯 THE THREE LiLas

### 1. LiLa Optimizer
**Purpose:** Context-aware prompt enhancement
**Use Case:** Mom types simple request → LiLa creates perfect prompt

**Example:**
```
Mom's input: "help with math homework"

LiLa reads context:
☑️ Jake (age 10, visual learner, loves Minecraft)
☑️ Best Intention: "Help kids be independent"

LiLa output (for ChatGPT):
"I need help creating a math strategy for my 10-year-old
son Jake. He's a visual learner who loves Minecraft.
Can you explain [topic] using visual aids or Minecraft
examples? The goal is to help him become more independent,
so include ways I can teach him to solve similar problems
on his own."

[Copy Prompt] [Try in App] [Adjust Context]
```

### 2. LiLa Assist
**Purpose:** Real-time help within the app
**Use Case:** Quick answers, tool suggestions, navigation help

**Example:**
```
Mom: "I need help with dinner"

LiLa Assist: "I can help with that! Here are some options:
• Use the Meal Planner tool (quick meals from pantry)
• Browse family favorites in Archives
• Try Recipe Scaler if you have one in mind

[Meal Planner] [View Favorites] [Browse Tools]"
```

### 3. LiLa Help
**Purpose:** Educational AI literacy
**Use Case:** Teaching AI concepts to moms and kids

**Example:**
```
Child: "What is AI?"

LiLa Help: "Great question! AI is like a really smart helper
that learns from examples, kind of like how you learn
to ride a bike by practicing.

Want to try it? Let's do a fun experiment together!
[Try AI Activity]"
```

---

## 🏗️ LILA OPTIMIZER ARCHITECTURE

### Core Workflow

```
1. Mom enters simple request
   ↓
2. LiLa analyzes request type
   (homework? meal? behavior? creative?)
   ↓
3. LiLa checks active context
   (which checkboxes are ☑️?)
   ↓
4. LiLa determines target platform
   (ChatGPT? Claude? Midjourney? Gemini?)
   ↓
5. LiLa crafts optimized prompt
   (platform-specific formatting)
   ↓
6. Mom copies or uses in Multi-AI Panel
```

### Request Type Detection

```typescript
const detectRequestType = (input: string): RequestType => {
  const patterns = {
    homework: /homework|study|test|school|learn/i,
    meal: /dinner|lunch|meal|cook|recipe|eat/i,
    behavior: /behavior|discipline|conflict|argue|fight/i,
    creative: /story|draw|art|imagine|create|game/i,
    schedule: /plan|calendar|schedule|organize|when/i,
    general: // Default fallback
  };

  // Match patterns and return type
  // Determines which context to prioritize
};
```

---

## 📦 CONTEXT INTEGRATION

### How LiLa Pulls Context

```typescript
const gatherContext = async (
  familyId: string,
  requestType: RequestType
): Promise<ContextBundle> => {

  // 1. Get all active context (is_active = true)
  const { data: activeContext } = await supabase
    .from('family_context')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true);

  // 2. Filter by relevance to request type
  const relevantContext = filterByRelevance(
    activeContext,
    requestType
  );

  // 3. Get active Best Intentions
  const { data: intentions } = await supabase
    .from('best_intentions')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true);

  // 4. Build context bundle
  return {
    familyMembers: relevantContext.filter(c => c.context_type === 'personality'),
    bestIntentions: intentions,
    preferences: relevantContext.filter(c => c.context_type === 'preferences'),
    // ... other context types
  };
};
```

### Context Weight Management

```
Too little context → Generic AI response
Just right context → Personalized, useful
Too much context → Overwhelming, slow

LiLa's goal:
- Include only RELEVANT context
- Prioritize by usage frequency
- Warn if context weight is high
```

---

## 🎨 PLATFORM-SPECIFIC OPTIMIZATION

### Different Platforms Need Different Formats

**ChatGPT (Conversational):**
```
I'm a mom of two kids, Jake (10) and Sally (7).
Jake is a visual learner who loves Minecraft.

Can you help me explain fractions using Minecraft
blocks as an example? I want him to understand
quarters and halves.

Also, can you suggest ways he can practice on his
own so he becomes more independent?
```

**Claude (Detailed & Structured):**
```
Context:
- Child: Jake, age 10
- Learning style: Visual learner
- Interests: Minecraft, building, LEGOs
- Challenge: Understanding fractions
- Goal: Independent learning

Task:
Explain fractions (1/4, 1/2) using Minecraft blocks
as visual aids.

Requirements:
1. Use Minecraft terminology he knows
2. Include practice problems
3. Teach problem-solving strategy
4. Keep explanations age-appropriate

Expected outcome:
Jake can solve similar fraction problems independently.
```

**Midjourney (Image Generation):**
```
anime style portrait of a 7-year-old girl with brown
curly hair, green eyes, bright smile, wearing purple
shirt, holding teddy bear, soft lighting, watercolor
style --v 6 --ar 16:9 --seed 847392
```

**Gemini (Multimodal):**
```
[Attached: Photo of Jake's math homework]

My 10-year-old son Jake is stuck on these fraction
problems. He's a visual learner who loves Minecraft.

Can you:
1. Explain what he got wrong
2. Use visual examples (Minecraft if possible)
3. Give him a similar problem to try

This aligns with our family goal of helping him
become more independent in learning.
```

### Platform Detection

```
LiLa: "Where will you be using this prompt?"

┌────────────────────────────┐
│ ○ ChatGPT                  │
│ ○ Claude                   │
│ ○ Gemini                   │
│ ○ Midjourney               │
│ ○ Perplexity              │
│ ○ Custom GPT               │
│ ○ Use in Multi-AI Panel    │
└────────────────────────────┘
```

---

## 🎯 USER INTERFACE

### LiLa Optimizer Panel

```
┌─────────────────────────────────────────┐
│  🤖 LiLa Optimizer                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  What do you need help with?            │
│  ┌─────────────────────────────────┐   │
│  │ help with math homework         │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Active Context: ✓                      │
│  • Jake's profile                       │
│  • Best Intention: "Independent learning"│
│                                         │
│  [Optimize Prompt]                      │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📋 Your Optimized Prompt:              │
│  ┌─────────────────────────────────┐   │
│  │ I need help creating a math     │   │
│  │ strategy for my 10-year-old...  │   │
│  │                                 │   │
│  │ [Full prompt appears here]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Platform: [ChatGPT ▼]                  │
│                                         │
│  [Copy Prompt] [Use in Multi-AI Panel]  │
│  [Adjust Context] [Save Template]       │
└─────────────────────────────────────────┘
```

### Context Selection Panel

```
┌─────────────────────────────────────────┐
│  Select Context for This Prompt         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  Family Members:                        │
│  ☑️ Jake (age 10)                       │
│  ☐ Sally (age 7)                        │
│  ☐ Dad                                  │
│                                         │
│  Best Intentions:                       │
│  ☑️ Independent learning                │
│  ☐ Sibling communication                │
│  ☐ Morning routine                      │
│                                         │
│  Other Context:                         │
│  ☐ Family meal preferences              │
│  ☐ Schedule constraints                 │
│                                         │
│  Context Weight: ● Low ○ Medium ○ High  │
│                                         │
│  💡 Tip: Less context = faster, more    │
│     focused responses                   │
│                                         │
│  [Use Selected] [Cancel]                │
└─────────────────────────────────────────┘
```

---

## 🔄 MULTI-AI PANEL

### Use Optimized Prompt Across Multiple AIs

```
┌─────────────────────────────────────────┐
│  🤖 Multi-AI Panel                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  Your prompt:                           │
│  "Help my visual learner understand..." │
│                                         │
│  Try with:                              │
│  [ChatGPT] [Claude] [Gemini] [More...]  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ChatGPT Response:                      │
│  ┌─────────────────────────────────┐   │
│  │ Let me help you explain         │   │
│  │ fractions using Minecraft...    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Copy] [Save] [Try Different AI]       │
│                                         │
│  Claude Response:                       │
│  ┌─────────────────────────────────┐   │
│  │ Here's a structured approach... │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Copy] [Save] [Compare Responses]      │
└─────────────────────────────────────────┘
```

---

## 🎨 ADVANCED FEATURES (FUTURE)

### Custom Model Training (Upsell)

```
Mom uploads family photos → Trains custom model
  ↓
Gets seed codes for image generation
  ↓
LiLa includes codes in Midjourney prompts

Example:
"Create anime portrait of Sally --seed [custom_seed_847392]"

Result: Consistent character across all images
```

### Prompt Templates

```
Save frequently-used prompts:

📋 My Templates:
• Homework Help (Jake)
• Story Time (Sally)
• Meal Planning (Family)
• Behavior Support (Both kids)

[+ New Template]
```

### Smart Suggestions

```
🤖 LiLa noticed:
"You ask about homework often. Want me to create
a shortcut button on your dashboard?"

[Yes, Create Shortcut] [Maybe Later]
```

---

## 🗄️ DATABASE SCHEMA

```sql
-- LiLa conversations (history)
CREATE TABLE lila_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  family_id UUID REFERENCES families(id),

  -- Request
  original_request TEXT NOT NULL,
  request_type TEXT, -- 'homework', 'meal', 'behavior', etc.

  -- Context used
  context_snapshot JSONB, -- What context was active
  intentions_referenced UUID[], -- Which intentions used

  -- Output
  optimized_prompt TEXT NOT NULL,
  target_platform TEXT, -- 'chatgpt', 'claude', 'midjourney', etc.

  -- Feedback
  was_used BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,

  -- Tracking
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prompt templates (saved)
CREATE TABLE user_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_name TEXT NOT NULL,
  template_description TEXT,

  -- Template content
  request_pattern TEXT, -- What triggers this template
  context_presets JSONB, -- Which context to use
  prompt_template TEXT, -- Template with placeholders
  target_platform TEXT,

  -- Usage
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom model data (upsell feature)
CREATE TABLE custom_ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model_type TEXT NOT NULL, -- 'image_generation', 'voice', 'custom_gpt'

  -- Training data
  training_images_urls TEXT[],
  model_seed_code TEXT,
  model_config JSONB,

  -- Model info
  model_name TEXT,
  description TEXT,
  trained_on TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'trained', 'failed'

  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage analytics
CREATE TABLE lila_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 PROMPT OPTIMIZATION RULES

### What Makes a Good Prompt

**1. Clear Context**
```
❌ Bad: "help with homework"
✅ Good: "Help my 10-year-old visual learner with fractions"
```

**2. Specific Goal**
```
❌ Bad: "make dinner"
✅ Good: "Plan 3 dinners using chicken, considering dairy allergy"
```

**3. Relevant Background**
```
❌ Bad: "behavior problem"
✅ Good: "Siblings (10 & 7) fighting over Minecraft. Want peaceful resolution aligned with our communication goals"
```

**4. Desired Outcome**
```
❌ Bad: "story"
✅ Good: "Bedtime story for 7-year-old about bravery, 5 minutes long"
```

### LiLa's Optimization Process

```
1. Identify missing elements
2. Pull from active context
3. Add specificity
4. Include relevant intentions
5. Format for target platform
6. Add helpful constraints
```

---

## ✅ SUCCESS CRITERIA

**User Experience:**
- [ ] Simple input → Perfect output
- [ ] Works in < 3 seconds
- [ ] Easy to adjust context
- [ ] Platform switching is smooth
- [ ] Copy/paste is one-click

**Quality:**
- [ ] Prompts are specific
- [ ] Context is relevant
- [ ] Platform formatting correct
- [ ] Results are better than manual
- [ ] Users rate 4+ stars average

**Adoption:**
- [ ] 60%+ of users try LiLa
- [ ] 40%+ use regularly
- [ ] Template creation rate
- [ ] Multi-AI Panel usage
- [ ] Drives tier upgrades

---

LiLa is the **magic layer** that makes MyAIM-Central's portable context system work seamlessly across ANY AI platform! 🤖✨
