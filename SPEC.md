# The Inverse Prediction Engine

## What It Does
Trains on failure patterns from failed startups, abandoned projects, and failed ventures. Analyzes user-submitted plans and predicts the specific timeline of how and when that plan will fail—with actionable insights to prevent destruction.

## How It Works
1. **Input**: User submits their business/project plan
2. **Analysis**: AI cross-references against known failure patterns
3. **Output**: Visual timeline showing failure points + specific prevention strategies

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Claude API for failure pattern analysis
- **Styling**: Tailwind CSS
- **Source Control**: GitHub

## Database Schema

### Tables

#### `failure_cases`
Pre-loaded knowledge base of documented failures.
```sql
- id: uuid PRIMARY KEY
- title: text
- description: text
- failure_type: text (startup, project, relationship, product)
- failure_stage: text (idea, MVP, growth, scaling, mature)
- root_causes: text[]
- timeline_events: jsonb
- lessons_learned: text
- industry: text
- year_failed: integer
- created_at: timestamp
```

#### `user_plans`
User-submitted plans for analysis.
```sql
- id: uuid PRIMARY KEY
- user_id: text
- title: text
- plan_content: text
- industry: text
- stage: text
- status: text (pending, analyzed, active)
- created_at: timestamp
- updated_at: timestamp
```

#### `predictions`
AI-generated failure predictions for each plan.
```sql
- id: uuid PRIMARY KEY
- plan_id: uuid REFERENCES user_plans
- failure_probability: float (0-1)
- predicted_timeline: jsonb
- failure_points: jsonb[]
- prevention_strategies: jsonb[]
- confidence_score: float
- analysis_text: text
- created_at: timestamp
```

## API Endpoints (Supabase Edge Functions)

### POST /api/analyze
Input: `{ title, planContent, industry, stage }`
Output: Full prediction with timeline, failure points, and prevention strategies

### POST /api/chat
Input: `{ messages, planContext }`
Output: AI response for follow-up questions about the analysis

### GET /predictions/:plan_id
Retrieve prediction for a specific plan

### GET /failure-patterns
Get aggregated failure patterns by industry/stage

## Core Features

1. **Plan Submission**
   - Rich text editor for plan details
   - Industry selection
   - Current stage picker

2. **Failure Analysis**
   - Pattern matching against knowledge base
   - AI-powered deep analysis
   - Risk scoring

3. **Timeline Visualization**
   - Interactive failure timeline
   - Critical failure points highlighted
   - Prevention checkpoints

4. **Strategy Generator**
   - Specific actionable recommendations
   - Priority ranking
   - Resource suggestions

5. **Failure Knowledge Base**
   - Browsable catalog of documented failures
   - Searchable by industry/type
   - Learn from others' mistakes

## Success Metrics
- Prediction accuracy tracking
- User return rate
- Prevention success stories

## Core Features

1. **Plan Submission**
   - Rich text editor for plan details
   - Industry selection
   - Current stage picker

2. **Failure Analysis**
   - Pattern matching against knowledge base
   - AI-powered deep analysis
   - Risk scoring

3. **Timeline Visualization**
   - Interactive failure timeline
   - Critical failure points highlighted
   - Prevention checkpoints

4. **Strategy Generator**
   - Specific actionable recommendations
   - Priority ranking
   - Resource suggestions

5. **Failure Knowledge Base**
   - Browsable catalog of documented failures
   - Searchable by industry/type
   - Learn from others' mistakes

6. **Discussion Chat Interface**
   - Post-analysis conversational AI
   - Follow-up questions about failure points
   - Deeper insights on prevention strategies
   - Context-aware responses based on analysis results
   - Collapsible chat panel with quick action suggestions

## Future Enhancements
- Community failure stories
- Team collaboration features
- Real-time monitoring
- Integration with project management tools
