import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Simulate network delay to show the beautiful "Thinking..." state
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // Basic logic so it actually replies to you
    let aiReply = "That sounds interesting! Tell me more about what you want to build.";
    
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
      aiReply = "Hello there! I'm ready to help you ship your next big project. What are we building today?";
    } else if (lowerMsg.includes("code") || lowerMsg.includes("build")) {
      aiReply = "I can definitely help with that. Let's break down the requirements step by step.";
    } else if (lowerMsg.includes("who are you")) {
      aiReply = "I am your AI assistant, designed to help you write code, design UIs, and ship products faster.";
    }

    return NextResponse.json({ reply: aiReply });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
