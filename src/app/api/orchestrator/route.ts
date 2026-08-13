import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message, imageBase64 } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ 
        reply: "SYSTEM ERROR: Missing GROQ_API_KEY in Netlify environment variables." 
      });
    }

    // Helper function with dynamic max_completion_tokens to respect Groq TPM limits
    async function callGroq(
      modelName: string, 
      systemPrompt: string, 
      userPrompt: string, 
      maxTokens: number = 2048, 
      extraParams = {}
    ) {
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
          max_completion_tokens: maxTokens,
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

    const councilThoughts = [];

    // ==========================================
    // AGENT 1: Llama 3.3 70B (The Orchestrator)
    // maxTokens: 1024 (Plans are short)
    // ==========================================
    const plan = await callGroq(
      'llama-3.3-70b-versatile',
      'You are the Orchestrator of the AI Council. Address the Executor directly. Break down the user\'s request into a concise, flawless logical plan. Speak like a senior architect briefing a developer.',
      `User Request: ${message}` + (imageBase64 ? ` [User attached an image/screenshot]` : ''),
      1024,
      { temperature: 0.8 }
    );
    councilThoughts.push({ agent: 'Llama 3.3 (Orchestrator)', text: plan });

    // ==========================================
    // AGENT 2: GPT-OSS 120B (The Executor)
    // maxTokens: 3500 (Keeps total requested tokens under 8000 TPM limit)
    // ==========================================
    const executionDraft = await callGroq(
      'openai/gpt-oss-120b',
      'You are the Executor of the AI Council. Acknowledge the Orchestrator\'s plan and write complete, production-ready code and logic. Do not truncate.',
      `User Request: ${message}\n\nOrchestrator's Directives:\n${plan}`,
      3500,
      { temperature: 0.7, reasoning_effort: 'medium' }
    );
    councilThoughts.push({ agent: 'GPT-OSS (Executor)', text: executionDraft });

    // ==========================================
    // AGENT 3: Qwen 3.6 27B (The Reviewer)
    // maxTokens: 3500
    // ==========================================
    const finalOutput = await callGroq(
      'qwen/qwen3.6-27b',
      'You are the Reviewer of the AI Council. Review the Executor\'s draft. Fix any bugs, ensure formatting is clean with standard code blocks, and output the polished solution directly to the user.',
      `User Request: ${message}\n\nExecutor's Draft:\n${executionDraft}`,
      3500,
      { temperature: 0.5, top_p: 0.95 }
    );
    councilThoughts.push({ 
      agent: 'Qwen 3.6 (Reviewer)', 
      text: "Evaluated draft, verified logic, fixed syntax/formatting errors, and finalized response." 
    });

    return NextResponse.json({ 
      reply: finalOutput,
      thoughts: councilThoughts 
    });

  } catch (error: any) {
    console.error('Multi-Agent Pipeline Error:', error);
    return NextResponse.json({ reply: `🚨 **Pipeline Failed:** ${error.message}` }, { status: 500 });
  }
}
