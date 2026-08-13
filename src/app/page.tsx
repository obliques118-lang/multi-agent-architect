'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Connects to your production API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error('Network response failed');
      
      const data = await response.json();
      
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: "Sorry, I'm having trouble connecting to the server." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-[#242424] rounded-[24px] p-6 shadow-2xl flex flex-col h-[550px] border border-white/5 relative">
        
        {/* Header - Matches the video exactly */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="mb-2">
              <Bot className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-400">
              Ask AI Anything
            </h1>
            <p className="text-[#888888] text-[13px] leading-relaxed max-w-[280px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
             <div className="flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-400">
              Ask AI Anything
            </h1>
          </div>
        )}

        {/* Chat Feed */}
        <div className={`flex-1 overflow-y-auto space-y-4 pr-1 ${messages.length === 0 ? 'hidden' : 'block'}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#8B5CF6] text-white rounded-[20px] rounded-tr-[4px]' 
                    : 'bg-[#333333] text-white rounded-[20px] rounded-tl-[4px]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#333333] text-white px-4 py-3 rounded-[20px] rounded-tl-[4px] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field - Matches the video layout */}
        <form onSubmit={handleSubmit} className="mt-4 relative w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Anything"
            className="w-full bg-[#1a1a1a] text-sm text-white placeholder-[#666666] rounded-full pl-5 pr-14 py-3.5 outline-none border border-white/5 focus:border-purple-500/30 transition-colors"
          />
          {/* The specific glowing purple circle button from the video */}
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 border-2 border-[#5b32a8] bg-transparent"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#9d72ff] shadow-[0_0_12px_rgba(157,114,255,0.8)]" />
          </button>
        </form>

      </div>
    </main>
  );
}
