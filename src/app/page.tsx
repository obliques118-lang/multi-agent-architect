'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Paperclip, ChevronDown, MessageSquare, Mic, ArrowUp, Loader2
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function MinimalChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userMsg = prompt;
    setPrompt(''); // Clear input immediately
    setIsGenerating(true);

    // Add user message to screen
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error('API failed');
      
      const data = await response.json();
      
      // Add AI response to screen
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: "Sorry, I encountered an error connecting to the server." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="relative flex flex-col h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* Soft CSS Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-white overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-pink-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px]" />
      </div>

      {/* Top Header Placeholder (Optional, for balance) */}
      <div className="w-full h-16 flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden">
        
        {messages.length === 0 ? (
          // INITIAL STATE: Centered greeting and input
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 animate-in fade-in zoom-in duration-500">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-gray-900 mb-8">
              Time to ship, Rajat
            </h1>
            <ChatInput 
              prompt={prompt} 
              setPrompt={setPrompt} 
              handleSubmit={handleSubmit} 
              isGenerating={isGenerating} 
            />
          </div>
        ) : (
          // CHAT STATE: Messages fill the space, input stays at the bottom
          <div className="flex-1 flex flex-col relative h-full">
            {/* Chat Output Feed */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-8 scroll-smooth hide-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] md:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gray-900 text-white rounded-[24px] rounded-tr-[8px]' 
                        : 'bg-white/60 backdrop-blur-md border border-white/40 text-gray-800 rounded-[24px] rounded-tl-[8px]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-white/60 backdrop-blur-md border border-white/40 text-gray-800 px-5 py-4 rounded-[24px] rounded-tl-[8px] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-[14px] text-gray-500 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Pinned Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white/90 via-white/50 to-transparent flex justify-center animate-in slide-in-from-bottom-8 duration-500">
              <ChatInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                handleSubmit={handleSubmit} 
                isGenerating={isGenerating} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Reusable Chat Input Component to avoid repeating code
function ChatInput({ prompt, setPrompt, handleSubmit, isGenerating }: any) {
  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-[640px] bg-[#fdfdfd]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/60 rounded-[28px] p-2 flex flex-col transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask the AI to create..."
        className="w-full h-[60px] resize-none bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 px-4 py-3"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      
      <div className="flex items-center justify-between px-2 pb-1">
        <div className="flex items-center gap-1">
          <IconButton icon={<Plus className="w-4 h-4" />} label="Add" />
          <IconButton icon={<Paperclip className="w-4 h-4" />} label="Attach" text="Attach" />
          <IconButton icon={<ChevronDown className="w-4 h-4 ml-1" />} label="Theme" text="Theme" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[13px] font-medium">Chat</span>
          </div>
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Mic className="w-[18px] h-[18px]" />
          </button>
          <button 
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 transition-all shadow-md"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}

const IconButton = ({ icon, label, text }: { icon: React.ReactNode, label: string, text?: string }) => (
  <button type="button" title={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-black/5 transition-colors text-gray-500">
    {icon}
    {text && <span className="text-[13px] font-medium hidden sm:inline-block">{text}</span>}
  </button>
);
