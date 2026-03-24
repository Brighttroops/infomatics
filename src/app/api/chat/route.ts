import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInput {
  messages: Message[];
  planContext: {
    title: string;
    planContent: string;
    industry: string;
    stage: string;
    analysis: {
      failure_probability: number;
      failure_points: Array<{ point: string; severity: string; reason: string }>;
      prevention_strategies: Array<{ strategy: string; priority: string; impact: string }>;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, planContext }: ChatInput = await request.json();

    const contextPrompt = `You are an expert business failure analyst for the "Inverse Prediction Engine". 
You have just analyzed this business plan and provided failure predictions.

Plan Details:
- Title: ${planContext.title}
- Industry: ${planContext.industry || 'Not specified'}
- Stage: ${planContext.stage || 'Not specified'}
- Details: ${planContext.planContent}

Previous Analysis Results:
- Failure Probability: ${(planContext.analysis.failure_probability * 100).toFixed(0)}%
- Key Failure Points: ${planContext.analysis.failure_points.map(fp => fp.point).join(', ')}
- Prevention Strategies: ${planContext.analysis.prevention_strategies.map(ps => ps.strategy).join(', ')}

The user is now asking follow-up questions about their plan. Answer their questions based on the analysis above.
Be specific, insightful, and continue providing valuable insights about potential weaknesses and how to address them.
If the user asks about topics unrelated to their plan or business failure/success, gently redirect them back to discussing their plan's risks and prevention strategies.`;

    const systemMessage = { role: 'system' as const, content: contextPrompt };
    const conversationHistory = [systemMessage, ...messages];

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content;
    if (!assistantMessage) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: assistantMessage,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Chat failed', details: message }, { status: 500 });
  }
}
