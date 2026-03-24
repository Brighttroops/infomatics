import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface AnalysisInput {
  title: string;
  planContent: string;
  industry: string;
  stage: string;
}

interface TimelineEvent {
  month: number;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface FailurePoint {
  point: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

interface PreventionStrategy {
  strategy: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

interface AnalysisResult {
  failure_probability: number;
  predicted_timeline: TimelineEvent[];
  failure_points: FailurePoint[];
  prevention_strategies: PreventionStrategy[];
  confidence_score: number;
  analysis_text: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
    
    const input: AnalysisInput = await request.json();

    const prompt = `You are the "Inverse Prediction Engine" - an AI trained on the graveyard of failed startups, abandoned projects, and doomed ventures.

Analyze this business plan and predict how it will likely fail. Be specific, insightful, and brutally honest.

Business Plan:
- Title: ${input.title}
- Industry: ${input.industry || 'Not specified'}
- Stage: ${input.stage || 'Not specified'}
- Details: ${input.planContent}

Respond ONLY with valid JSON in this exact format:
{
  "failure_probability": 0.0-1.0,
  "predicted_timeline": [
    {"month": 1-24, "event": "description", "severity": "low|medium|high|critical"}
  ],
  "failure_points": [
    {"point": "name", "severity": "low|medium|high|critical", "reason": "why this is a failure risk"}
  ],
  "prevention_strategies": [
    {"strategy": "action name", "priority": "low|medium|high", "impact": "how this helps"}
  ],
  "confidence_score": 0.0-1.0,
  "analysis_text": "2-3 sentence summary"
}`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    const result = JSON.parse(content);
    
    const analysis: AnalysisResult = {
      failure_probability: result.failure_probability ?? 0.5,
      predicted_timeline: result.predicted_timeline ?? [],
      failure_points: result.failure_points ?? [],
      prevention_strategies: result.prevention_strategies ?? [],
      confidence_score: result.confidence_score ?? 0.7,
      analysis_text: result.analysis_text ?? 'Analysis completed.',
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Analysis failed', details: message }, { status: 500 });
  }
}
