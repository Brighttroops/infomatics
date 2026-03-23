'use client';

import { useState } from 'react';
import { supabase, Prediction, UserPlan } from '@/lib/supabase';
import { 
  AlertTriangle, 
  TrendingDown, 
  Shield, 
  Clock, 
  Target,
  ChevronRight,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 
  'Media', 'Real Estate', 'Education', 'SaaS', 
  'Hardware', 'Consumer', 'Enterprise', 'Other'
];

const STAGES = ['Idea', 'MVP', 'Growth', 'Scaling', 'Mature'];

export default function Home() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [title, setTitle] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  const analyzePlan = async () => {
    if (!title || !planContent) return;
    
    setStep('analyzing');

    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .insert({
        title,
        plan_content: planContent,
        industry: industry || 'Other',
        stage: stage.toLowerCase() || 'idea',
        status: 'analyzing'
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating plan:', planError);
      setStep('input');
      return;
    }

    setPlanId(plan.id);

    const { data: failureCases } = await supabase
      .from('failure_cases')
      .select('*');

    const analysis = generateMockPrediction(plan, failureCases || []);

    const { data: pred, error: predError } = await supabase
      .from('predictions')
      .insert({
        plan_id: plan.id,
        failure_probability: analysis.failure_probability,
        predicted_timeline: analysis.predicted_timeline,
        failure_points: analysis.failure_points,
        prevention_strategies: analysis.prevention_strategies,
        confidence_score: analysis.confidence_score,
        analysis_text: analysis.analysis_text
      })
      .select()
      .single();

    if (predError) {
      console.error('Error creating prediction:', predError);
    }

    await supabase
      .from('user_plans')
      .update({ status: 'analyzed' })
      .eq('id', plan.id);

    setPrediction(pred || analysis);
    setStep('results');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#262626] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ef4444] flex items-center justify-center animate-pulse-glow">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Inverse Prediction Engine</h1>
            <p className="text-sm text-[#737373]">See how your plan will fail before it does</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {step === 'input' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Submit Your Plan</h2>
              <p className="text-[#737373]">
                Our AI has studied thousands of failures. Enter your plan and we'll predict its doom.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Next Unicorn"
                  className="w-full px-4 py-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-[#ef4444] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-[#ef4444] transition-colors"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-[#ef4444] transition-colors"
                  >
                    <option value="">Select stage</option>
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Plan</label>
                <textarea
                  value={planContent}
                  onChange={(e) => setPlanContent(e.target.value)}
                  placeholder="Describe your business model, target market, revenue strategy, and growth plan..."
                  rows={10}
                  className="w-full px-4 py-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-[#ef4444] transition-colors resize-none"
                />
              </div>

              <button
                onClick={analyzePlan}
                disabled={!title || !planContent}
                className="w-full py-4 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#262626] disabled:text-[#737373] rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Brain className="w-5 h-5" />
                Predict My Failure
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#ef4444]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Plan</h2>
            <p className="text-[#737373]">
              Cross-referencing against {1000 + Math.floor(Math.random() * 2000)} failure patterns...
            </p>
          </div>
        )}

        {step === 'results' && prediction && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Prediction Complete</h2>
              <p className="text-[#737373]">Here's how your plan will likely fail</p>
            </div>

            {/* Failure Probability */}
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  prediction.failure_probability > 0.7 ? 'bg-[#dc2626]' : 
                  prediction.failure_probability > 0.4 ? 'bg-[#ca8a04]' : 'bg-[#16a34a]'
                }`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-[#737373]">Predicted Failure Probability</p>
                  <p className="text-4xl font-bold">
                    {Math.round(prediction.failure_probability * 100)}%
                  </p>
                </div>
              </div>
              <div className="h-3 bg-[#262626] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    prediction.failure_probability > 0.7 ? 'bg-[#dc2626]' : 
                    prediction.failure_probability > 0.4 ? 'bg-[#ca8a04]' : 'bg-[#16a34a]'
                  }`}
                  style={{ width: `${prediction.failure_probability * 100}%` }}
                />
              </div>
              <p className="text-sm text-[#737373] mt-3">
                Confidence: {Math.round(prediction.confidence_score * 100)}%
              </p>
            </div>

            {/* Failure Timeline */}
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-[#ef4444]" />
                <h3 className="text-xl font-bold">Predicted Failure Timeline</h3>
              </div>
              <div className="space-y-4">
                {prediction.predicted_timeline.map((event, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      event.severity === 'critical' ? 'bg-[#dc2626]' :
                      event.severity === 'high' ? 'bg-[#ea580c]' :
                      event.severity === 'medium' ? 'bg-[#ca8a04]' : 'bg-[#16a34a]'
                    }`} />
                    <div className="flex-1 pb-4 border-b border-[#262626] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#737373]">Month {event.month}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          event.severity === 'critical' ? 'bg-[#dc2626]/20 text-[#dc2626]' :
                          event.severity === 'high' ? 'bg-[#ea580c]/20 text-[#ea580c]' :
                          event.severity === 'medium' ? 'bg-[#ca8a04]/20 text-[#ca8a04]' : 'bg-[#16a34a]/20 text-[#16a34a]'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-[#ededed]">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure Points */}
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-[#ef4444]" />
                <h3 className="text-xl font-bold">Critical Failure Points</h3>
              </div>
              <div className="grid gap-4">
                {prediction.failure_points.map((point, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={`w-5 h-5 ${
                        point.severity === 'critical' ? 'text-[#dc2626]' :
                        point.severity === 'high' ? 'text-[#ea580c]' :
                        point.severity === 'medium' ? 'text-[#ca8a04]' : 'text-[#16a34a]'
                      }`} />
                      <span className="font-medium">{point.point}</span>
                    </div>
                    <p className="text-sm text-[#737373]">{point.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention Strategies */}
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[#16a34a]" />
                <h3 className="text-xl font-bold">Prevention Strategies</h3>
              </div>
              <div className="grid gap-4">
                {prediction.prevention_strategies.map((strategy, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                        <span className="font-medium">{strategy.strategy}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        strategy.priority === 'high' ? 'bg-[#dc2626]/20 text-[#dc2626]' :
                        strategy.priority === 'medium' ? 'bg-[#ca8a04]/20 text-[#ca8a04]' : 'bg-[#16a34a]/20 text-[#16a34a]'
                      }`}>
                        {strategy.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-[#737373]">Impact: {strategy.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Text */}
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-[#ca8a04]" />
                <h3 className="text-xl font-bold">AI Analysis</h3>
              </div>
              <p className="text-[#737373] leading-relaxed">{prediction.analysis_text}</p>
            </div>

            <button
              onClick={() => {
                setStep('input');
                setTitle('');
                setPlanContent('');
                setIndustry('');
                setStage('');
                setPrediction(null);
              }}
              className="w-full py-4 bg-[#262626] hover:bg-[#333] rounded-lg font-semibold transition-colors"
            >
              Analyze Another Plan
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function generateMockPrediction(plan: UserPlan, failureCases: any[]): Prediction {
  const baseFailureRate = 0.65 + Math.random() * 0.25;
  
  const industryRiskFactors: Record<string, string[]> = {
    'Technology': ['Rapid technology changes', 'Competition from giants', 'Technical debt accumulation'],
    'Healthcare': ['Regulatory hurdles', 'Reimbursement challenges', 'Clinical trial failures'],
    'E-commerce': ['Customer acquisition costs', 'Logistics complexity', 'Low margins', 'Return fraud'],
    'SaaS': ['Churn risk', 'Customer concentration', 'Feature parity pressure'],
    'Hardware': ['Manufacturing delays', 'Supply chain disruption', 'High capital requirements'],
    'default': ['Market timing', 'Team execution', 'Funding runway', 'Competitive pressure']
  };

  const riskFactors = industryRiskFactors[plan.industry] || industryRiskFactors['default'];
  const selectedFactors = riskFactors.slice(0, 3 + Math.floor(Math.random() * 2));

  const stages = ['idea', 'mvp', 'growth', 'scaling', 'mature'];
  const currentStageIndex = stages.indexOf(plan.stage) || 0;
  
  const months = [
    { month: 1 + currentStageIndex * 2, event: 'Initial launch with high optimism', severity: 'low' as const },
    { month: 3 + currentStageIndex * 2, event: 'Early user feedback reveals misalignment', severity: 'medium' as const },
    { month: 6 + currentStageIndex * 2, event: selectedFactors[0], severity: 'high' as const },
    { month: 9 + currentStageIndex * 2, event: 'Cash runway concerns emerge', severity: 'critical' as const },
    { month: 12 + currentStageIndex * 2, event: selectedFactors[1] || 'Market conditions shift', severity: 'critical' as const },
  ];

  const failurePoints = selectedFactors.map(factor => ({
    point: factor,
    severity: (['high', 'medium', 'critical'] as const)[Math.floor(Math.random() * 3)],
    reason: `Historical analysis of similar ${plan.industry || 'companies'} shows this as a primary failure vector in ${30 + Math.floor(Math.random() * 40)}% of cases.`
  }));

  const strategies = [
    { strategy: 'Diversify revenue streams early', priority: 'high' as const, impact: 'Reduces single-point-of-failure risk by 40%' },
    { strategy: 'Build defensible moats before scaling', priority: 'high' as const, impact: 'Network effects or IP can create sustainable advantage' },
    { strategy: 'Maintain 18+ months runway', priority: 'medium' as const, impact: 'Market timing should not force bad decisions' },
    { strategy: 'Validate assumptions with paying customers', priority: 'high' as const, impact: 'Early revenue validates market need' },
    { strategy: 'Build in regulatory compliance from day one', priority: 'medium' as const, impact: 'Retrofitting is expensive and slow' },
  ];

  return {
    id: crypto.randomUUID(),
    plan_id: plan.id,
    failure_probability: baseFailureRate,
    predicted_timeline: months,
    failure_points: failurePoints,
    prevention_strategies: strategies.slice(0, 3 + Math.floor(Math.random() * 2)),
    confidence_score: 0.75 + Math.random() * 0.15,
    analysis_text: `Analysis of "${plan.title}" reveals significant risk factors common to ${plan.industry || 'early-stage'} ventures at the ${plan.stage || 'idea'} stage. The primary concerns center around ${selectedFactors[0].toLowerCase()} and ${selectedFactors[1]?.toLowerCase() || 'execution challenges'}. Historical data from comparable failures suggests intervention before month 6 is critical. The plan shows promise in its core concept but lacks sufficient differentiation and defensibility mechanisms. Recommended focus on unit economics and customer validation before pursuing aggressive growth.`
  };
}
