import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type FailureCase = {
  id: string;
  title: string;
  description: string;
  failure_type: string;
  failure_stage: string;
  root_causes: string[];
  timeline_events: { month: number; event: string }[];
  lessons_learned: string;
  industry: string;
  year_failed: number;
};

export type UserPlan = {
  id: string;
  user_id: string;
  title: string;
  plan_content: string;
  industry: string;
  stage: string;
  status: string;
  created_at: string;
};

export type Prediction = {
  id: string;
  plan_id: string;
  failure_probability: number;
  predicted_timeline: { month: number; event: string; severity: 'low' | 'medium' | 'high' | 'critical' }[];
  failure_points: { point: string; severity: 'low' | 'medium' | 'high' | 'critical'; reason: string }[];
  prevention_strategies: { strategy: string; priority: 'high' | 'medium' | 'low'; impact: string }[];
  confidence_score: number;
  analysis_text: string;
};
