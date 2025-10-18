# MyAIM-Central

**The Operating System for Family Context Management**

MyAIM-Central empowers moms to amplify their visions using AI—even with a teething two-year-old on their lap.

---

## 🎯 Core Mission

MyAIM-Central is a platform-agnostic family context management system that helps families organize their unique dynamics, values, and goals—then transforms that context into optimized prompts for ANY AI platform (ChatGPT, Claude, Gemini, Midjourney, and more).

### The Three Pillars

1. **📚 Education Hub (Library)** - Teach moms HOW to use AI effectively and safely
2. **🧠 Context Engine (Archives)** - Centralized family context management for ANY AI platform
3. **🤖 LiLa Prompt Crafter** - Transform context into platform-specific optimized prompts

---

## 🌟 What Makes MyAIM-Central Different

### Platform-Agnostic Architecture
Unlike tools that lock you into one AI platform, MyAIM-Central works with ALL of them:
- ✅ ChatGPT, Claude, Gemini, Perplexity
- ✅ Midjourney, DALL-E, Stable Diffusion
- ✅ Custom GPTs, Gemini Gems, and future AI platforms

### Context-Driven Intelligence
Build your family's context **once**, use it **everywhere**:
- Bublup-style folder organization with custom covers
- Checkbox-controlled context (you decide what AI knows)
- Best Intentions system aligns AI outputs with family values
- Portable context files export to any platform

### Progressive Learning Journey
From AI beginner to power user in weeks:
1. **Discovery & Learning** (Days 1-7) - Tutorials and safe, guided tools
2. **Context Building** (Weeks 2-4) - Family profiles and Best Intentions
3. **Cross-Platform Power** (Month 2+) - Optimized prompts for any AI
4. **Advanced Features** (Month 3+) - Custom models, automation, marketplace

---

## 🏗️ System Architecture

### Frontend Stack
- **Framework:** React with TypeScript
- **Styling:** Styled Components + Emotion
- **State Management:** React Context API
- **Routing:** React Router v6

### Backend Stack
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password)
- **Real-time:** Supabase Real-time subscriptions
- **Storage:** Supabase Storage (folder covers, user files)
- **Vector Search:** pgvector for context retrieval

### Core Data Models

```
families
├── subscription_tier (essential, enhanced, full_magic, creator)
└── context_privacy_level

family_members
├── role (mom, dad, child, teen, guardian)
├── display_title (custom: "Mom", "Grandma", etc.)
├── is_primary_parent (boolean)
└── dashboard_type (adult, teen, child)

best_intentions
├── title, current_state, desired_state
├── why_it_matters
├── category_id
├── privacy_level
└── is_active (checkbox toggle)

intention_categories
├── system_default (available to all)
├── custom (family-specific)
└── guiding_value (from Inner Oracle)

archive_folders (User-Created)
├── folder_name, folder_type
├── cover_photo_url (Supabase Storage)
├── parent_folder_id (nested folders)
└── linked_member_id (if folder represents a person)

family_context (Archive Files)
├── folder_id
├── file_name, file_path
├── content_data (JSONB - flexible content)
├── is_active (checkbox for AI usage)
└── usage_count
```

---

## 📚 The Library Vault

### Purpose
Teach moms to use AI effectively through tutorials, tools, and templates.

### Content Types

**1. Tutorials** (Educational)
- AI Basics for Moms
- Writing Great Prompts
- Understanding AI Models
- AI Safety for Kids
- Image Generation 101
- Automation for Beginners

**2. Tools** (Functional)
- Task Breaker
- Meal Planner
- Story Generator
- Homework Helper
- Conflict Mediator
- Receipt Analyzer

**3. Templates** (Starting Points)
- Prompt templates
- Context file templates
- Best Intention examples
- Workflow templates

### Social Features (Internal Only)
- ❤️ Like - Show appreciation
- 💬 Comment - Share tips with app users
- ⭐ Bookmark - Save to favorites
- ❌ NO external sharing - Protects subscriber content

### "Add to Dashboard" Feature
Click "Add to Dashboard" from any Library tool to add it as a widget on your personalized Dashboard for instant access.

---

## 🗂️ The Archives System

### Flexible Folder Organization
Create **ANY** folder structure you want—no pre-defined templates:

```
📁 Archives
  ├─ 📁 Mom (Sarah) [Custom cover photo]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   ├─ 📄 Personality.md
  │   ├─ 📄 Interests.md
  │   └─ 📷 Photos
  │
  ├─ 📁 Best Intentions [Custom cover]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   └─ [Your intentions]
  │
  ├─ 📁 Jake's Soccer [Custom cover]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   ├─ 📄 Practice_Schedule.md
  │   └─ 📷 Game photos
  │
  └─ 📁 [ANY FOLDER YOU CREATE]
```

### Auto-Generated Overview Cards
Every folder automatically gets a "baseball card" overview showing:
- Custom folder cover photo
- All contents with checkbox toggles
- Usage statistics (times used in AI prompts)
- Last updated timestamp
- Quick actions (Edit, Export, Settings)

### Cross-Device File Access
- Files stored in Supabase Storage (cloud-based)
- Accessible from phone and computer
- Automatic syncing
- Offline caching for performance

### Context Export
Export active context to use with any AI platform:
- Markdown, Plain Text, or JSON formats
- Include only checked items
- Platform-specific formatting
- Copy to clipboard or download

---

## 🎯 Best Intentions System

### The Heart of MyAIM-Central
Best Intentions are your family's goals and values that guide AI optimization.

### Default Categories (Available to All Families)
1. 👨‍👩‍👧‍👦 Family Relationships
2. 🌱 Personal Growth
3. 🏠 Household Management
4. 💚 Health & Wellness
5. 📚 Education & Learning
6. 💬 Communication
7. ⏰ Daily Routines
8. 🤗 Emotional Support
9. 🙏 Spiritual Development
10. 💰 Financial Goals

### Custom Categories
Families can create custom categories aligned with their unique values.

### Privacy Levels
- **Family** - All family members can see
- **Parents Only** - Only parents can view
- **Private** - Only creator can see

### Active/Inactive Toggles
Use checkboxes to control which intentions LiLa uses for AI optimization.

---

## 🤖 LiLa Prompt Crafter System

### The Three LiLas

**1. LiLa Optimizer** - Context-aware prompt enhancement
- Mom types simple request
- LiLa reads active context from Archives
- LiLa reads active Best Intentions
- LiLa crafts optimized, platform-specific prompt
- Mom copies to any AI platform

**2. LiLa Assist** - Real-time help within the app
- Quick answers
- Tool suggestions
- Tutorial recommendations
- Navigation help

**3. LiLa Help** - Educational AI literacy
- Explaining AI concepts to kids
- Teaching prompt writing
- AI safety education
- Feature tutorials

### Platform-Specific Optimization

LiLa formats prompts differently for each platform:

**ChatGPT** - Conversational, friendly tone
**Claude** - Detailed, structured with clear context blocks
**Midjourney** - Image generation syntax with parameters
**Gemini** - Multimodal format for text + images

### Example Optimization

**Mom's Input:**
```
help with math homework
```

**LiLa Reads Context:**
- ☑️ Jake (age 10, visual learner, loves Minecraft)
- ☑️ Best Intention: "Help kids be independent learners"

**LiLa Output (for ChatGPT):**
```
I need help creating a math homework strategy for my 10-year-old
son Jake. He's a visual learner who loves Minecraft. Can you
suggest ways to explain [topic] using visual aids or Minecraft-
related examples? The goal is to help him become more independent,
so please include ways I can teach him to solve similar problems
on his own.
```

---

## 🎨 Dashboard Widget System

### Purpose
Your personalized command center with drag-and-drop customization.

### Widget Types

**1. Tool Widgets** (from Library)
- Full-functioning tools
- Added via "Add to Dashboard"
- Retain all functionality
- Configurable settings

**2. Info Widgets** (Display Data)
- Best Intentions summary
- Upcoming tasks
- Family calendar
- Recent Archive updates
- Quick stats

**3. Quick Action Widgets**
- Add new intention
- Mind Sweep capture
- Export context
- Open Multi-AI Panel
- One-click shortcuts

### Layout System
- Pinterest-style masonry grid
- Drag-and-drop repositioning
- Auto-arrange or manual mode
- Responsive (mobile/desktop)
- Save custom layouts

---

## 📦 Subscription Tiers

### Essential Tier
- Core tutorials in Library
- Basic prompt tools
- Limited context storage
- Manual context export
- Best Intentions (up to 5 active)

### Enhanced Tier
- All tutorials
- All basic tools
- Full context management
- LiLa prompt optimization
- Unlimited Best Intentions
- Dashboard widgets

### Full Magic Tier
- Everything in Enhanced
- Advanced tools
- Multi-AI panel integration
- Context presets/scenes
- Automation features
- Priority support

### Creator Tier
- Everything in Full Magic
- Custom tool builder
- Marketplace access (sell tools)
- White-label options
- Advanced analytics

### Premium Upsells (One-time or Add-ons)
- Custom model training (family photos)
- Voice cloning for audiobooks
- Image generation seed codes
- Advanced integrations

---

## 🚀 Getting Started

### For New Users

1. **Sign Up** - Create your account through beta login
2. **Family Setup** - Add family members with roles
3. **Create First Best Intention** - Define what matters to your family
4. **Organize Archives** - Create folders for family members and interests
5. **Explore Library** - Browse tutorials and tools
6. **Try LiLa** - Optimize your first prompt

### For Developers

#### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/MyAIM_Central.git
cd MyAIM_Central

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and keys to .env

# Run development server
npm start
```

#### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Database Setup

1. Create Supabase project
2. Run migrations in `supabase/migrations/` folder in order:
   - `001_initial_schema.sql`
   - `002_best_intentions_rls_and_functions.sql`
   - `003_seed_default_intention_categories.sql`

---

## 📂 Project Structure

```
MyAIM_Central/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── BestIntentions/ # Best Intentions system
│   │   ├── Library/       # Library Vault system
│   │   ├── Archives/      # Archives system
│   │   ├── Dashboard/     # Dashboard widgets
│   │   └── LiLa/          # LiLa Prompt Crafter
│   ├── lib/               # Utility functions
│   │   ├── categories.js  # Category management
│   │   └── supabase.js    # Supabase client
│   ├── styles/            # Global styles
│   └── App.tsx            # Main app component
├── supabase/
│   └── migrations/        # Database migrations
├── .env.example           # Environment template
├── package.json
└── README.md
```

---

## 🛠️ Development Commands

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 🔒 Security & Privacy

### Data Privacy
- **Granular Control** - Checkbox toggles for what AI knows
- **Privacy Levels** - Family, Parents Only, or Private
- **No External Sharing** - Library content stays internal
- **Portable Context** - Export your data anytime

### Authentication
- Supabase Auth (email/password)
- Row Level Security (RLS) policies
- Beta user access control
- Permission-based routing

---

## 📈 Roadmap

### Phase 1: Beta Launch (Current)
- ✅ Best Intentions system
- ✅ Basic Archives
- 🔨 Library browsing (in progress)
- 🔨 LiLa prompt crafting (in progress)

### Phase 2: Enhanced Context
- Context presets/scenes
- Smart suggestions
- Progress tracking
- Version history

### Phase 3: Advanced AI
- Multi-AI panel
- Platform-specific optimization
- Automation workflows
- Advanced integrations

### Phase 4: Custom Models (Upsell)
- Train on family photos
- Custom image generation codes
- Voice cloning
- Personalized AI models

### Phase 5: Creator Economy
- Tool marketplace
- Template selling
- Revenue sharing
- White-label options

---

## 🎯 Competitive Advantages

### What Competitors Offer
- **ChatGPT/Claude:** Generic AI, no family context
- **Custom GPTs:** Siloed to one platform
- **Notion AI:** Not portable, not AI-optimized
- **Other "AI for families":** Just wrapped ChatGPT

### What MyAIM-Central Offers
- ✅ Platform-agnostic (use ANY AI)
- ✅ Beautiful organization (Bublup-style)
- ✅ Purpose-driven (Best Intentions)
- ✅ Education included (Library tutorials)
- ✅ Privacy-first (checkbox control)
- ✅ Portable context (export anywhere)
- ✅ Multi-AI integration (convenience)
- ✅ Growing smarter over time

**This is a category creator: "Family Context Operating System"**

---

## 💡 Core Design Principles

### 1. "Mom Can Do This With a Teething Two-Year-Old"
- 5-minute workflows
- No technical knowledge required
- Clear, simple interfaces
- Quick wins first

### 2. Privacy & Control
- Mom decides what AI knows
- Visual privacy indicators
- Granular sharing controls
- No data surprises

### 3. Platform Agnostic
- Don't compete with AI platforms
- Enhance ALL of them
- Export to anywhere
- Future-proof

### 4. Education First
- Teach, don't assume
- Progressive feature revelation
- In-context help
- Safe experimentation

### 5. Purpose-Driven
- Not just tools, but goals (Best Intentions)
- Progress tracking
- Celebrate wins
- Meaningful outcomes

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

---

## 📞 Support

### For Users
- Email: support@myaimcentral.com
- "Hit a Snag" button in-app
- Beta user feedback system

### For Developers
- GitHub Issues: [Report bugs or request features]
- Discord Community: [Coming soon]

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🙏 Acknowledgments

Built with love for modern families who want to amplify their brilliance using AI.

**Let's amplify brilliance. Let's get moms RICH.** 💰✨

---

## 📊 Current Status

- **Version:** Beta v1.0
- **Status:** Active Development
- **Last Updated:** 2025-10-17
- **Next Milestone:** Library Vault completion + LiLa integration

---

**MyAIM-Central isn't just an app—it's infrastructure for the AI age. Build your family's context once, use it everywhere. From AI newbie to power user. From simple requests to professional results.**
