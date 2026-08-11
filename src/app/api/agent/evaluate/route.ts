import { NextRequest, NextResponse } from 'next/server';
import { executeEvaluation } from '@/lib/agents/qwen';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { artifact } = await req.json();

    if (!artifact || !artifact.planId || !artifact.generatedCode) {
      return NextResponse.json({ error: 'Invalid or missing Reasoning Artifact' }, { status: 400 });
    }

    const report = await executeEvaluation(artifact);
    return NextResponse.json(report, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Evaluation step failed', details: error.message },
      { status: 500 }
    );
  }
}
