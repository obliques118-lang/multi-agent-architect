import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Pulling your keys securely from Netlify Environment Variables
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const qwenKey = process.env.QWEN_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!deepseekKey || !qwenKey || !geminiKey) {
      return NextResponse.json({ 
        reply: "SYSTEM ERROR: Missing API keys. Make sure DEEPSEEK_API_KEY, QWEN_API_KEY, and GEMINI_API_KEY are added to your Netlify Environment Variables." 
      });
    }

    // ==========================================
    // AGENT 1: DEEPSEEK (The Orchestrator)
    // ==========================================
    const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are the Orchestrator Agent. Analyze the user request and write a concise, step-by-step logic plan on how to solve it. Keep it under 4 sentences. Do not solve it, just plan it.' },
          { role: 'user', content: message }
        ]
      })
    });
    
    if (!dsResponse.ok) throw new Error(`DeepSeek API failed: ${dsResponse.statusText}`);
    const dsData = await dsResponse.json();
    const plan = dsData.choices[0].message.content;

    // ==========================================
    // AGENT 2: QWEN (The Executor)
    // ==========================================
    // Using Alibaba's DashScope OpenAI-compatible endpoint
    const qwenResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: 'You are the Executor Agent. Strictly follow the Orchestrator\'s plan to solve the user\'s request. Provide a highly detailed, comprehensive output.' },
          { role: 'user', content: `User Request: ${message}\n\nOrchestrator's Plan:\n${plan}` }
        ]
      })
    });

    if (!qwenResponse.ok) throw new Error(`Qwen API failed: ${qwenResponse.statusText}`);
    const qwenData = await qwenResponse.json();
    const executionDraft = qwenData.choices[0].message.content;

    // ==========================================
    // AGENT 3: GEMINI (The Reviewer)
    // ==========================================
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { 
          role: 'user', 
          parts: [{ text: 'You are the Reviewer Agent. Review the Executor\'s draft against the User\'s original request. Fix any bugs or factual errors, improve the formatting using clean markdown, remove unnecessary fluff, and provide the final polished response. Speak directly to the user.' }] 
        },
        contents: [
          { role: 'user', parts: [{ text: `User Request: ${message}\n\nExecutor's Draft:\n${executionDraft}` }] }
        ]
      })
    });

    if (!geminiResponse.ok) throw new Error(`Gemini API failed: ${geminiResponse.statusText}`);
    const geminiData = await geminiResponse.json();
    const finalOutput = geminiData.candidates[0].content.parts[0].text;

    // ==========================================
    // RETURN FINAL POLISHED OUTPUT TO UI
    // ==========================================
    return NextResponse.json({ reply: finalOutput });

  } catch (error: any) {
    console.error('Multi-Agent Pipeline Error:', error);
    return NextResponse.json({ reply: `Pipeline Error: ${error.message}` }, { status: 500 });
  }
}
