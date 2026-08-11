import { NextRequest, NextResponse } from 'next/server';
import { executeOrchestration } from '@/lib/agents/gemini';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt string' }, { status: 400 });
    }

    const plan = await executeOrchestration(prompt);
    return NextResponse.json(plan, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Orchestration step failed', details: error.message },
      { status: 500 }
    );
  }
}
