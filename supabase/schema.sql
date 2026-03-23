-- Inverse Prediction Engine Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Failure cases knowledge base
CREATE TABLE failure_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  failure_type TEXT NOT NULL CHECK (failure_type IN ('startup', 'project', 'product', 'relationship', 'company')),
  failure_stage TEXT NOT NULL CHECK (failure_stage IN ('idea', 'mvp', 'growth', 'scaling', 'mature', 'decline')),
  root_causes TEXT[] NOT NULL,
  timeline_events JSONB DEFAULT '[]',
  lessons_learned TEXT,
  industry TEXT,
  year_failed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User submitted plans
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  title TEXT NOT NULL,
  plan_content TEXT NOT NULL,
  industry TEXT,
  stage TEXT CHECK (stage IN ('idea', 'mvp', 'growth', 'scaling', 'mature')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES user_plans(id) ON DELETE CASCADE,
  failure_probability FLOAT NOT NULL CHECK (failure_probability >= 0 AND failure_probability <= 1),
  predicted_timeline JSONB NOT NULL,
  failure_points JSONB DEFAULT '[]',
  prevention_strategies JSONB DEFAULT '[]',
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  analysis_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_failure_cases_type ON failure_cases(failure_type);
CREATE INDEX idx_failure_cases_industry ON failure_cases(industry);
CREATE INDEX idx_failure_cases_stage ON failure_cases(failure_stage);
CREATE INDEX idx_user_plans_status ON user_plans(status);
CREATE INDEX idx_predictions_plan_id ON predictions(plan_id);

-- Row Level Security
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_cases ENABLE ROW LEVEL SECURITY;

-- Public read access for failure cases
CREATE POLICY "Public read failure cases" ON failure_cases
  FOR SELECT USING (true);

-- Users can only access their own plans
CREATE POLICY "Users access own plans" ON user_plans
  FOR ALL USING (true);

CREATE POLICY "Users access own predictions" ON predictions
  FOR ALL USING (true);
