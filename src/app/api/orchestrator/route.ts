import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    
    // We create a readable stream to send updates back to the UI one by one
    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (text: string) => {
          controller.enqueue(encoder.encode(text));
        };

        // Simulated AI Agent Workflow
        sendUpdate("Orchestrator: Parsing your request...");
        await new Promise(r => setTimeout(r, 800));

        sendUpdate("UI Agent: Generating Tailwind CSS mesh gradients...");
        await new Promise(r => setTimeout(r, 1200));

        sendUpdate("Logic Agent: Scaffolding Next.js API routes...");
        await new Promise(r => setTimeout(r, 1000));

        sendUpdate("Review Agent: Checking for deployment errors...");
        await new Promise(r => setTimeout(r, 800));

        sendUpdate("Completed: Your code is ready!");
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
