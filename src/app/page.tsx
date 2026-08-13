'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Paperclip, TerminalSquare, BrainCircuit, X, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Thought = { agent: string; text: string };
type Message = { id: string; role: 'user' | 'ai'; content: string; thoughts?: Thought[]; image?: string };
type CodeBlock = { language: string; code: string; filename: string };

export default function ChatGPTMultiAgent() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCodeBlocks, setActiveCodeBlocks] = useState<CodeBlock[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Parses AI text to find code blocks and extracts them for the right panel
  const parseContentAndExtractCode = (content: string) => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    const blocks: CodeBlock[] = [];
    let cleanText = content;
    let counter = 1;

    while ((match = regex.exec(content)) !== null) {
      const lang = match[1] || 'text';
      blocks.push({ language: lang, code: match[2].trim(), filename: `script_${counter}.${lang}` });
      counter++;
    }
    
    // If we found code, remove it from the chat feed and update the right panel
    if (blocks.length > 0) {
      setActiveCodeBlocks(blocks);
      setActiveTab(0);
    }
    return content.replace(regex, '*(Code output displayed in the right-hand panel)*');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imagePreview) return;

    const userMsg = prompt;
    const currentImg = imagePreview;
    
    setPrompt('');
    setImagePreview(null);
    setIsGenerating(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userMsg, image: currentImg || undefined },
    ]);

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, imageBase64: currentImg }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.reply || `HTTP error! status: ${response.status}`);

      // Extract code for the split screen
      const cleanContent = parseContentAndExtractCode(data.reply);

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'ai', content: cleanContent, thoughts: data.thoughts },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'ai', content: `🚨 Error: ${error.message}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-gray-100 font-sans overflow-hidden">
      
      {/* LEFT PANEL: Chat Window (ChatGPT Style) */}
      <div className={`flex flex-col h-full transition-all duration-500 ${activeCodeBlocks.length > 0 ? 'w-1/2 border-r border-gray-700/50' : 'w-full max-w-4xl mx-auto'}`}>
        
        {/* Header */}
        <div className="flex-shrink-0 h-14 flex items-center px-4 border-b border-gray-800">
          <TerminalSquare className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-semibold text-sm tracking-wide text-gray-300">Council OS</span>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto pt-8 pb-32 scroll-smooth hide-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 animate-in fade-in zoom-in duration-500">
              <h1 className="text-4xl font-bold tracking-tight mb-8 text-white drop-shadow-md">
                Let's get Tf lockin , Rajat
              </h1>
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`w-full ${msg.role === 'ai' ? 'bg-[#2f2f2f]' : ''} py-6`}>
                  <div className={`w-full max-w-3xl mx-auto flex gap-5 px-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Avatar AI */}
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <TerminalSquare className="w-5 h-5 text-[#212121]" />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 max-w-[85%]">
                      {/* Thought Window (Council of AI) */}
                      {msg.thoughts && msg.thoughts.length > 0 && (
                        <details className="mb-4 group cursor-pointer">
                          <summary className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors list-none">
                            <BrainCircuit className="w-4 h-4" />
                            <span>AI Council Thoughts ({msg.thoughts.length})</span>
                          </summary>
                          <div className="mt-3 pl-4 border-l-2 border-gray-700 space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                            {msg.thoughts.map((thought, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-bold text-blue-400 block mb-1">{thought.agent}:</span>
                                <p className="text-gray-400 whitespace-pre-wrap">{thought.text}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* User Image Attachment */}
                      {msg.image && (
                        <img src={msg.image} alt="upload" className="max-w-[200px] rounded-lg mb-3 shadow-lg border border-gray-700" />
                      )}

                      {/* Message Content */}
                      <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#2f2f2f] px-5 py-3 rounded-3xl rounded-tr-sm inline-block' : 'text-gray-200'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Generating Status */}
              {isGenerating && (
                <div className="w-full bg-[#2f2f2f] py-6">
                  <div className="max-w-3xl mx-auto flex gap-5 px-6">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                      <TerminalSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-gray-400 text-sm animate-pulse">The Council is deliberating...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full md:w-[inherit] p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
          <div className="max-w-3xl mx-auto relative bg-[#2f2f2f] rounded-2xl border border-gray-700 focus-within:border-gray-500 shadow-xl transition-all">
            
            {imagePreview && (
              <div className="p-3 border-b border-gray-700 relative inline-block">
                <img src={imagePreview} className="h-16 w-16 object-cover rounded-md" alt="Preview" />
                <button onClick={() => setImagePreview(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-500 transition-colors">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end p-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Message the Council..."
                className="flex-1 max-h-[200px] h-[52px] min-h-[52px] resize-none bg-transparent border-none outline-none text-[15px] px-2 py-3 text-white placeholder-gray-500 overflow-y-auto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
              />
              
              <button
                type="submit"
                disabled={(!prompt.trim() && !imagePreview) || isGenerating}
                className="p-2 mb-1 mr-1 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-20 transition-all shadow-sm"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Glowing Code Compiler View */}
      {activeCodeBlocks.length > 0 && (
        <div className="w-1/2 h-full bg-[#0d1117] flex flex-col border-l border-gray-800 animate-in slide-in-from-right duration-500 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          
          {/* Tabs */}
          <div className="flex bg-[#161b22] border-b border-gray-800 px-2 pt-2 gap-1 overflow-x-auto">
            {activeCodeBlocks.map((block, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-lg transition-colors ${
                  activeTab === idx ? 'bg-[#0d1117] text-blue-400 border-t border-x border-gray-800' : 'bg-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Code2 className="w-4 h-4" />
                {block.filename}
              </button>
            ))}
          </div>

          {/* Code Viewer (Glowing effect applied via Tailwind shadow and Prism theme) */}
          <div className="flex-1 overflow-y-auto relative bg-[#0d1117] p-4 custom-scrollbar">
             {/* The Glow Effect */}
            <div className="absolute inset-0 bg-blue-500/5 pointer-events-none shadow-[inset_0_0_50px_rgba(59,130,246,0.1)]" />
            
            <SyntaxHighlighter
              language={activeCodeBlocks[activeTab].language}
              style={vscDarkPlus}
              customStyle={{
                background: 'transparent',
                margin: 0,
                padding: 0,
                fontSize: '14px',
                lineHeight: '1.5',
                textShadow: '0 0 1px rgba(255,255,255,0.1)', // Subtle text glow
              }}
              wrapLines={true}
            >
              {activeCodeBlocks[activeTab].code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}
