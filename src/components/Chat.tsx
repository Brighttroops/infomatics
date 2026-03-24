'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Prediction {
  failure_probability: number;
  failure_points: Array<{ point: string; severity: string; reason: string }>;
  prevention_strategies: Array<{ strategy: string; priority: string; impact: string }>;
}

interface ChatProps {
  planTitle: string;
  planContent: string;
  industry: string;
  stage: string;
  prediction: Prediction;
}

export default function Chat({ planTitle, planContent, industry, stage, prediction }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          planContext: {
            title: planTitle,
            planContent,
            industry,
            stage,
            analysis: prediction
          }
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isCollapsed ? 'w-auto' : 'w-[420px]'} transition-all duration-300`}>
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="group relative flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--destructive)] rounded-2xl shadow-2xl shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 transition-all duration-300 hover:scale-105"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="text-white font-bold">Discuss Your Plan</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </button>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[var(--card)] to-[var(--background)] border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--destructive)] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">Discuss Your Analysis</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Ask follow-up questions</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              aria-label="Minimize chat"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h4 className="font-bold text-[var(--foreground)] mb-2">Want to dive deeper?</h4>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ask questions about specific failure points, prevention strategies, or request more details about your analysis.
                </p>
                <div className="mt-6 w-full space-y-2">
                  <button
                    onClick={() => setInput("Explain the critical failure points in more detail")}
                    className="w-full px-4 py-2 text-sm text-left bg-[var(--background)] hover:bg-[var(--muted)] rounded-lg border border-[var(--border)] transition-colors"
                  >
                    Explain critical failure points in detail
                  </button>
                  <button
                    onClick={() => setInput("What are the top 3 priorities I should focus on?")}
                    className="w-full px-4 py-2 text-sm text-left bg-[var(--background)] hover:bg-[var(--muted)] rounded-lg border border-[var(--border)] transition-colors"
                  >
                    What are my top 3 priorities?
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--destructive)] text-white'
                      : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)]">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your analysis..."
                  rows={1}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl resize-none focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted-foreground)] text-sm"
                  style={{ maxHeight: '120px', minHeight: '48px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 p-3 bg-gradient-to-r from-[var(--primary)] to-[var(--destructive)] hover:opacity-90 disabled:from-[var(--muted)] disabled:to-[var(--muted)] disabled:cursor-not-allowed rounded-xl transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
