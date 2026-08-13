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
          max_completion_tokens: 8000, // Increased to prevent incomplete outputs
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
    // ==========================================
    const plan = await callGroq(
      'llama-3.3-70b-versatile',
      'You are the Orchestrator of the AI Council. Address the Executor directly. Break down the user\'s request into a flawless logical plan. Speak like a senior architect briefing a developer.',
      `User Request: ${message}` + (imageBase64 ? ` [User attached an image/screenshot]` : ''),
      { temperature: 0.8 }
    );
    councilThoughts.push({ agent: 'Llama 3.3 (Orchestrator)', text: plan });

    // ==========================================
    // AGENT 2: GPT-OSS 120B (The Executor)
    // ==========================================
    const executionDraft = await callGroq(
      'openai/gpt-oss-120b',
      'You are the Executor of the AI Council. Acknowledge the Orchestrator\'s plan and write the complete, highly detailed code and logic required. Do not leave anything incomplete.',
      `User Request: ${message}\n\nOrchestrator's Directives:\n${plan}`,
      { temperature: 0.7, reasoning_effort: 'medium' }
    );
    councilThoughts.push({ agent: 'GPT-OSS (Executor)', text: executionDraft });

    // ==========================================
    // AGENT 3: Qwen 3.6 27B (The Reviewer)
    // ==========================================
    const finalOutput = await callGroq(
      'qwen/qwen3.6-27b',
      'You are the Reviewer of the AI Council. You have the final say. Review the Executor\'s draft. Fix all bugs, ensure ALL code is 100% complete and fully written out without truncation. Format your response cleanly for the user. Speak directly to the user, not the council.',
      `User Request: ${message}\n\nExecutor's Draft:\n${executionDraft}`,
      { temperature: 0.5, top_p: 0.95 }
    );
    councilThoughts.push({ agent: 'Qwen 3.6 (Reviewer)', text: "Evaluating Executor's draft... Fixing bugs... Finalizing complete output." });

    // Return both the final reply AND the council's thoughts
    return NextResponse.json({ 
      reply: finalOutput,
      thoughts: councilThoughts 
    });

  } catch (error: any) {
    console.error('Multi-Agent Pipeline Error:', error);
    return NextResponse.json({ reply: `🚨 **Pipeline Failed:** ${error.message}` }, { status: 500 });
  }
}
