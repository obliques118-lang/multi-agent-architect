import { NextRequest, NextResponse } from 'next/server';
import { executeReasoning } from '@/lib/agents/deepseek';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!plan || !plan.planId) {
      return NextResponse.json({ error: 'Invalid or missing Orchestration Plan' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await executeReasoning(plan, (chunk) => {
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Reasoning step failed', details: error.message },
      { status: 500 }
    );
  }
}
