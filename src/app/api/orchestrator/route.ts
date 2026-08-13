import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message || '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let reply = "I'm ready to help! What are we working on next?";
    const lower = message.toLowerCase();

    if (lower.includes('hi') || lower.includes('hello')) {
      reply = "Hello Rajat! How can I help you today?";
    } else if (lower.includes('theme')) {
      reply = "You can toggle between Dark and Light themes using the button at the bottom left of the chat box!";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
