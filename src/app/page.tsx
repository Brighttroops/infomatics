'use client';

import { useState } from 'react';
import { supabase, Prediction } from '@/lib/supabase';
import { analyzePlan } from '@/lib/analyze';
import { useTheme } from './providers';
import Chat from '@/components/Chat';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  Target,
  ChevronRight,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Skull,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 
  'Media', 'Real Estate', 'Education', 'SaaS', 
  'Hardware', 'Consumer', 'Enterprise', 'Other'
];

const STAGES = ['Idea', 'MVP', 'Growth', 'Scaling', 'Mature'];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [title, setTitle] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [, setPlanId] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!title || !planContent) return;
    
    setStep('analyzing');

    let planId: string | null = null;

    if (supabase) {
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
      planId = plan.id;
      setPlanId(plan.id);
    }

    const analysis = await analyzePlan({
      title,
      planContent,
      industry: industry || 'Other',
      stage: stage.toLowerCase() || 'idea',
    });

    if (supabase && planId) {
      const { data: pred, error: predError } = await supabase
        .from('predictions')
        .insert({
          plan_id: planId,
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
        .eq('id', planId);

      setPrediction(pred || analysis);
    } else {
      setPrediction(analysis);
    }
    
    setStep('results');
  };

  const getSeverityColor = (prob: number) => {
    if (prob > 0.7) return { bg: 'from-red-600 to-red-700', text: 'text-red-500', glow: 'shadow-red-500/30' };
    if (prob > 0.4) return { bg: 'from-amber-500 to-orange-600', text: 'text-amber-500', glow: 'shadow-amber-500/30' };
    return { bg: 'from-green-500 to-emerald-600', text: 'text-green-500', glow: 'shadow-green-500/30' };
  };

  const severityColors = getSeverityColor(prediction?.failure_probability || 0);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      <div className="fixed inset-0 dark:bg-gradient-to-br dark:from-red-950/20 dark:via-transparent dark:to-transparent bg-gradient-to-br from-red-100/50 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
      <div className="fixed inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-red-900/10 dark:via-transparent dark:to-transparent bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-200/30 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
      
      <header className="relative border-b border-[var(--border)] backdrop-blur-sm py-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--primary)] rounded-xl blur-xl opacity-50 animate-pulse dark:opacity-50" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--destructive)] flex items-center justify-center animate-pulse-glow">
              <Skull className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-gradient">Inverse Prediction Engine</span>
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              See how your plan will fail before it does
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Powered by Groq AI
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--primary)]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {step === 'input' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium mb-6">
                <Brain className="w-4 h-4" />
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                Submit Your <span className="text-gradient">Business Plan</span>
              </h2>
              <p className="text-[var(--muted-foreground)] text-lg max-w-md mx-auto">
                Our AI has studied thousands of failures. Enter your plan and we will predict its doom.
              </p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-[var(--foreground)] group-focus-within:text-[var(--primary)] transition-colors">Plan Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Next Unicorn"
                    className="w-full px-5 py-4 bg-[var(--card)]/80 backdrop-blur border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-[var(--foreground)] group-focus-within:text-[var(--primary)] transition-colors">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-5 py-4 bg-[var(--card)]/80 backdrop-blur border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-[var(--foreground)] group-focus-within:text-[var(--primary)] transition-colors">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-5 py-4 bg-[var(--card)]/80 backdrop-blur border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select stage</option>
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-[var(--foreground)] group-focus-within:text-[var(--primary)] transition-colors">Your Plan</label>
                <textarea
                  value={planContent}
                  onChange={(e) => setPlanContent(e.target.value)}
                  placeholder="Describe your business model, target market, revenue strategy, and growth plan..."
                  rows={8}
                  className="w-full px-5 py-4 bg-[var(--card)]/80 backdrop-blur border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none placeholder:text-[var(--muted-foreground)]"
                />
              </div>

              <button
                onClick={runAnalysis}
                disabled={!title || !planContent}
                className="group relative w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--destructive)] hover:opacity-90 disabled:from-[var(--muted)] disabled:to-[var(--muted)] disabled:text-[var(--muted-foreground)] rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/25 hover:shadow-[var(--primary)]/40 disabled:shadow-none"
              >
                <span className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Brain className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Predict My Failure</span>
                <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Analysis powered by Groq&apos;s Llama model. Free and fast.
              </p>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[var(--primary)] rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
                <Brain className="w-12 h-12 text-[var(--primary)] animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3">Analyzing Your Plan</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-6">
              Cross-referencing against failure patterns...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              Processing with AI
            </div>
          </div>
        )}

        {step === 'results' && prediction && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Analysis Complete
              </div>
              <h2 className="text-4xl font-black mb-2">
                Your <span className="text-gradient">Results</span> Are In
              </h2>
            </div>

            <div className={`bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl ${severityColors.glow} animate-scale-in`}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                <div className={`relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${severityColors.bg} rounded-2xl blur-xl opacity-50`} />
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${severityColors.bg} flex items-center justify-center shadow-lg`}>
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--muted-foreground)] mb-1">Predicted Failure Probability</p>
                  <p className={`text-6xl font-black ${severityColors.text}`}>
                    {Math.round(prediction.failure_probability * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--muted-foreground)]">Confidence</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {Math.round(prediction.confidence_score * 100)}%
                  </p>
                </div>
              </div>
              <div className="h-4 bg-[var(--muted)] rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${severityColors.bg} rounded-full transition-all duration-1000 ease-out shadow-lg animate-progress-pulse`}
                  style={{ width: `${prediction.failure_probability * 100}%` }}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-2xl p-6 card-hover animate-slide-in stagger-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-bold">Failure Timeline</h3>
                </div>
                <div className="space-y-4">
                  {prediction.predicted_timeline.map((event, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                        event.severity === 'critical' ? 'bg-[#dc2626] shadow-[#dc2626]/50 shadow-lg' :
                        event.severity === 'high' ? 'bg-[#ea580c]' :
                        event.severity === 'medium' ? 'bg-[#ca8a04]' : 'bg-[#16a34a]'
                      }`} />
                      <div className="flex-1 pb-4 border-b border-[var(--border)] last:border-0 group-hover:border-[var(--primary)]/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-[var(--muted-foreground)]">Month {event.month}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.severity === 'critical' ? 'bg-[#dc2626]/20 text-[#dc2626]' :
                            event.severity === 'high' ? 'bg-[#ea580c]/20 text-[#ea580c]' :
                            event.severity === 'medium' ? 'bg-[#ca8a04]/20 text-[#ca8a04]' : 'bg-[#16a34a]/20 text-[#16a34a]'
                          }`}>
                            {event.severity}
                          </span>
                        </div>
                        <p className="text-[var(--foreground)]">{event.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-2xl p-6 card-hover animate-slide-in stagger-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-bold">Critical Failure Points</h3>
                </div>
                <div className="space-y-4">
                  {prediction.failure_points.map((point, i) => (
                    <div key={i} className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className={`w-5 h-5 shrink-0 ${
                          point.severity === 'critical' ? 'text-[#dc2626]' :
                          point.severity === 'high' ? 'text-[#ea580c]' :
                          point.severity === 'medium' ? 'text-[#ca8a04]' : 'text-[#16a34a]'
                        }`} />
                        <span className="font-semibold">{point.point}</span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] ml-8">{point.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-2xl p-6 card-hover animate-slide-in stagger-3">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#16a34a]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#16a34a]" />
                </div>
                <h3 className="text-lg font-bold">Prevention Strategies</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prediction.prevention_strategies.map((strategy, i) => (
                  <div key={i} className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] hover:border-[#16a34a]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                        <span className="font-semibold text-sm">{strategy.strategy}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        strategy.priority === 'high' ? 'bg-[#dc2626]/20 text-[#dc2626]' :
                        strategy.priority === 'medium' ? 'bg-[#ca8a04]/20 text-[#ca8a04]' : 'bg-[#16a34a]/20 text-[#16a34a]'
                      }`}>
                        {strategy.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] ml-7">{strategy.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-2xl p-6 card-hover animate-slide-in stagger-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ca8a04]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#ca8a04]" />
                </div>
                <h3 className="text-lg font-bold">AI Analysis</h3>
              </div>
              <p className="text-[var(--foreground)] leading-relaxed text-lg">{prediction.analysis_text}</p>
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
              className="w-full py-4 bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] hover:border-[var(--primary)]/30 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Another Plan
            </button>
          </div>
        )}
      </div>

      {step === 'results' && prediction && (
        <Chat 
          planTitle={title}
          planContent={planContent}
          industry={industry}
          stage={stage}
          prediction={prediction}
        />
      )}
    </main>
  );
}
