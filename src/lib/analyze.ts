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

export async function analyzePlan(input: AnalysisInput): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}
