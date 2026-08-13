'use client';

import React, { useState } from 'react';
import { 
  Home, Search, LayoutGrid, Star, Users, Compass, 
  LayoutTemplate, GraduationCap, Gift, Zap, Plus, 
  Paperclip, ChevronDown, MessageSquare, Mic, ArrowUp,
  PanelLeft
} from 'lucide-react';

export default function CreatorDashboard() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setAgentStatus('Orchestrator: Analyzing request...');

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          if (chunkValue) setAgentStatus(chunkValue);
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setAgentStatus('System Error: Pipeline failed.');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setAgentStatus(null);
        setPrompt('');
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-[260px] h-full flex flex-col border-r border-gray-100 bg-[#fbfbfb] px-4 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold shadow-sm">♥</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        <button className="flex items-center justify-between w-full p-2 mb-6 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">S</div>
            <span className="text-[13px] font-medium">Samlee's Workspace</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        <div className="space-y-6 flex-1 overflow-y-auto hide-scrollbar">
          <div className="space-y-1">
            <NavItem icon={<Home className="w-4 h-4" />} label="Home" active />
            <NavItem icon={<Search className="w-4 h-4" />} label="Search" />
          </div>

          <div className="space-y-1">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Projects</h4>
            <NavItem icon={<LayoutGrid className="w-4 h-4" />} label="All projects" />
            <NavItem icon={<Star className="w-4 h-4" />} label="Starred" />
            <NavItem icon={<Users className="w-4 h-4" />} label="Shared with me" />
          </div>

          <div className="space-y-1">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Resources</h4>
            <NavItem icon={<Compass className="w-4 h-4" />} label="Discover" />
            <NavItem icon={<LayoutTemplate className="w-4 h-4" />} label="Templates" />
            <NavItem icon={<GraduationCap className="w-4 h-4" />} label="Learn" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div>
              <p className="text-[13px] font-medium text-gray-700">Share Workspace</p>
              <p className="text-[11px] text-gray-500">Get 10 credits each</p>
            </div>
            <Gift className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-100">
            <div>
              <p className="text-[13px] font-medium text-gray-700">Upgrade to Pro</p>
              <p className="text-[11px] text-gray-500">Unlock more benefits</p>
            </div>
            <Zap className="w-4 h-4 text-indigo-500 fill-indigo-100" />
          </div>
        </div>
      </aside>

      {/* Main Content Area with Mesh Gradient Background */}
      <main className="flex-1 relative flex flex-col items-center pt-24 px-6">
        {/* CSS Mesh Gradient */}
        <div className="absolute inset-0 -z-10 bg-white overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-pink-500/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px]" />
        </div>

        {/* Top Tag */}
        <button className="flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-full shadow-sm hover:bg-white/80 transition-colors mb-8 text-[13px] font-medium text-gray-700">
          <span className="text-pink-500 font-semibold">$50</span> Buy a gift card <span className="text-gray-400 ml-1">→</span>
        </button>

        {/* Greeting */}
        <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 mb-8">
          Time to ship, Rajat
        </h1>

        {/* Floating Input Component */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-[640px] bg-[#fdfdfd] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/60 rounded-[28px] p-2 flex flex-col transition-all focus-within:ring-2 focus-within:ring-pink-500/20"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[13px] font-medium">Chat</span>
              </div>
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Mic className="w-[18px] h-[18px]" />
              </button>
              <button 
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 transition-all"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Status Indicator */}
        <div className="h-6 mt-4">
          {agentStatus && (
            <p className="text-[13px] font-medium text-gray-600 animate-pulse bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full">
              {agentStatus}
            </p>
          )}
        </div>

        {/* Bottom Templates Shelf (Partially visible) */}
        <div className="w-full max-w-[900px] mt-auto bg-white rounded-t-[32px] p-6 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] border-t border-x border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-medium text-gray-800">Templates</h3>
            <button className="text-[13px] text-gray-500 hover:text-gray-800">Browse all →</button>
          </div>
          {/* Add your template cards here */}
          <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 border-dashed" />
        </div>
      </main>
    </div>
  );
}

// Reusable Components
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[13px] ${
    active ? 'bg-white text-gray-900 shadow-sm border border-gray-100/50' : 'text-gray-600 hover:bg-gray-100'
  }`}>
    <span className={active ? 'text-gray-900' : 'text-gray-400'}>{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const IconButton = ({ icon, label, text }: { icon: React.ReactNode, label: string, text?: string }) => (
  <button title={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
    {icon}
    {text && <span className="text-[13px] font-medium">{text}</span>}
  </button>
);
