# The Inverse Prediction Engine

> Train on failure. Predict how your plan will self-destruct.

## What It Does

The Inverse Prediction Engine learns from the graveyard of failed startups, abandoned projects, and doomed ventures. Instead of studying success, it studies destruction.

**Input**: Your business/project plan
**Output**: A timeline of how and when it will likely fail, with specific prevention strategies

## The Philosophy

Success has many forms. Failure has a grammar. By understanding how things break, we can build things that don't.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Source Control**: GitHub

## Getting Started

### 1. Set up Supabase

Run the schema and seed files in your Supabase SQL editor:

```bash
# In Supabase Dashboard > SQL Editor
# Run supabase/schema.sql first, then supabase/seed.sql
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start predicting failure.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   ├── globals.css       # Dark theme styling
│   │   └── layout.tsx        # Root layout
│   └── lib/
│       └── supabase.ts        # Supabase client & types
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Seed data (failure cases)
└── SPEC.md                    # Project specification
```

## Database Schema

- **failure_cases**: Pre-loaded knowledge base of documented failures
- **user_plans**: User-submitted plans for analysis
- **predictions**: AI-generated failure predictions

## The Knowledge Base

The system is seeded with documented failures including:
- Quibi (6-month collapse)
- Theranos (fraudulent healthcare)
- Juicero (solving non-problems)
- Pets.com (bad unit economics)
- WeWork (governance failure)

Each case includes root causes, timeline events, and lessons learned.

## License

MIT
