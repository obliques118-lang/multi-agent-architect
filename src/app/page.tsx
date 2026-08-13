'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sun, Moon } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function MinimalChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState('DeepSeek, Qwen & Gemini syncing...');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userMsg = prompt;
    setPrompt('');
    setIsGenerating(true);
    setAgentStatus('DeepSeek (Orchestrator) planning...');

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userMsg },
    ]);

    // Dynamic UI status updates to track the multi-agent execution sequence
    const statusTimer1 = setTimeout(
      () => setAgentStatus('Qwen (Executor) drafting output...'),
      3500
    );
    const statusTimer2 = setTimeout(
      () => setAgentStatus('Gemini (Reviewer) polishing & reviewing...'),
      8500
    );

    try {
      // Endpoint updated to match your exact folder structure (/api/orchestrator)
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || `HTTP error! status: ${response.status}`);
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'ai', content: data.reply },
      ]);
    } catch (error: any) {
      console.error('Chat API Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: `🚨 **Pipeline Error:** ${
            error.message ||
            'Failed to connect to the multi-agent backend. Check Netlify logs.'
          }`,
        },
      ]);
    } finally {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      setIsGenerating(false);
    }
  };

  return (
    <main
      className={`relative flex flex-col h-screen w-full transition-colors duration-500 font-sans overflow-hidden ${
        isDarkMode ? 'bg-[#0a0d14] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Blue to Red Ambient Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/25 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-red-600/25 rounded-full blur-[140px]" />
            <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] bg-blue-400/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] bg-red-400/20 rounded-full blur-[120px]" />
            <div className="absolute top-[25%] right-[15%] w-[45%] h-[45%] bg-indigo-300/20 rounded-full blur-[110px]" />
          </>
        )}
      </div>

      <div className="w-full h-12 flex-shrink-0" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden">
        {messages.length === 0 ? (
          /* INITIAL CENTERING */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 animate-in fade-in zoom-in duration-300">
            <h1
              className={`text-3xl md:text-4xl font-semibold tracking-tight mb-8 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Time to ship, Rajat
            </h1>
            <ChatInput
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              isGenerating={isGenerating}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </div>
        ) : (
          /* ACTIVE CHAT FEED */
          <div className="flex-1 flex flex-col relative h-full">
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-6 scroll-smooth hide-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-[22px] rounded-tr-[6px]'
                          : 'bg-gray-900 text-white rounded-[22px] rounded-tr-[6px]'
                        : isDarkMode
                        ? 'bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-[22px] rounded-tl-[6px]'
                        : 'bg-white/80 backdrop-blur-md border border-gray-200/80 text-gray-800 rounded-[22px] rounded-tl-[6px]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div
                    className={`px-5 py-3.5 rounded-[22px] rounded-tl-[6px] flex items-center gap-3 ${
                      isDarkMode
                        ? 'bg-white/10 text-gray-300 border border-white/10'
                        : 'bg-white/80 text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-[14px] animate-pulse font-medium">
                      {agentStatus}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div
              className={`absolute bottom-0 left-0 w-full p-6 flex justify-center backdrop-blur-sm ${
                isDarkMode
                  ? 'bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/80 to-transparent'
                  : 'bg-gradient-to-t from-white via-white/80 to-transparent'
              }`}
            >
              <ChatInput
                prompt={prompt}
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                isGenerating={isGenerating}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ChatInput({
  prompt,
  setPrompt,
  handleSubmit,
  isGenerating,
  isDarkMode,
  setIsDarkMode,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-[620px] backdrop-blur-xl shadow-lg border rounded-[26px] p-2 flex flex-col transition-all ${
        isDarkMode
          ? 'bg-[#121722]/90 border-white/10 focus-within:border-blue-500/50'
          : 'bg-white/90 border-gray-200 focus-within:border-blue-500/30'
      }`}
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask the agents to create..."
        className={`w-full h-[55px] resize-none bg-transparent border-none outline-none text-[15px] px-4 py-2.5 ${
          isDarkMode
            ? 'text-white placeholder-gray-500'
            : 'text-gray-800 placeholder-gray-400'
        }`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      <div className="flex items-center justify-between px-2 pb-1 pt-1 border-t border-transparent">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isDarkMode
              ? 'bg-white/10 text-gray-200 hover:bg-white/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isDarkMode ? (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-red-500" />
              <span>Light Theme</span>
            </>
          )}
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-500 to-red-500 text-white hover:opacity-90 disabled:opacity-30'
              : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-30'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
