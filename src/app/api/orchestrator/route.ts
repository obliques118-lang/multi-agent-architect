import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json({ 
        reply: "SYSTEM ERROR: Missing GROQ_API_KEY in Netlify environment variables." 
      });
    }

    // Helper function to call Groq models natively
    async function callGroq(modelName: string, systemPrompt: string, userPrompt: string, extraParams = {}) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 2048,
          stream: false,
          ...extraParams
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Groq API failed on model ${modelName}: ${errData.error?.message || res.statusText}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    }

    // ==========================================
    // AGENT 1: Llama 3.3 70B (The Orchestrator)
    // ==========================================
    const plan = await callGroq(
      'llama-3.3-70b-versatile',
      'You are the Orchestrator Agent. Analyze the user request and write a concise, step-by-step logic plan on how to solve it. Keep it under 4 sentences. Do not solve it, just plan it.',
      message,
      { temperature: 1 }
    );

    // ==========================================
    // AGENT 2: GPT-OSS 120B (The Executor)
    // Using reasoning_effort as specified in your snippet
    // ==========================================
    const executionDraft = await callGroq(
      'openai/gpt-oss-120b',
      'You are the Executor Agent. Strictly follow the Orchestrator\'s plan to solve the user\'s request. Provide a highly detailed, comprehensive output.',
      `User Request: ${message}\n\nOrchestrator's Plan:\n${plan}`,
      { temperature: 1, reasoning_effort: 'medium' }
    );

    // ==========================================
    // AGENT 3: Qwen 3.6 27B (The Reviewer)
    // ==========================================
    const finalOutput = await callGroq(
      'qwen/qwen3.6-27b',
      'You are the Reviewer Agent. Review the Executor\'s draft against the User\'s original request. Fix any bugs or factual errors, improve the formatting using clean markdown, remove unnecessary fluff, and provide the final polished response. Speak directly to the user.',
      `User Request: ${message}\n\nExecutor's Draft:\n${executionDraft}`,
      { temperature: 0.6, top_p: 0.95 }
    );

    return NextResponse.json({ reply: finalOutput });

  } catch (error: any) {
    console.error('Multi-Agent Pipeline Error:', error);
    return NextResponse.json({ reply: `🚨 **Pipeline Failed:** ${error.message}` }, { status: 500 });
  }
}
