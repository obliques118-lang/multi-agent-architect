'use client';

import React, { useState } from 'react';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { TerminalOutput } from '@/components/terminal-output';
import { 
  Plus, 
  Mic, 
  ArrowUp, 
  Sparkles, 
  SlidersHorizontal, 
  RotateCcw,
  Cpu
} from 'lucide-react';

export default function DashboardPage() {
  const [inputPrompt, setInputPrompt] = useState('');
  const { stage, logs, evaluation, runPipeline, resetPipeline } = useAgentStream();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    runPipeline(inputPrompt);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between px-6 py-8 bg-gradient-to-br from-[#0a192f] via-[#11224055] to-[#020c1b] text-white overflow-x-hidden">
      
      {/* Immersive Moving Fluid Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-cyan-900/30 to-slate-950/80 animate-fluid-bg pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />

      {/* Top Header */}
      <div className="w-full max-w-3xl flex items-center justify-between z-10 opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <span className="text-xs font-medium tracking-widest uppercase">Multi-Agent Core</span>
        </div>
        {stage !== 'idle' && (
          <button 
            onClick={resetPipeline}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset Session
          </button>
        )}
      </div>

      {/* Center Hero & Minimalist Input Capsule */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl text-center z-10 my-auto">
        
        {/* Minimalist Subtitle */}
        <p className="text-white/60 text-sm md:text-base font-light tracking-wide mb-8">
          What’s on your mind today?
        </p>

        {/* Floating Frosted Glass Capsule Search Bar */}
        <form onSubmit={handleStart} className="w-full">
          <div className="relative flex flex-col bg-white/[0.07] backdrop-blur-2xl border border-white/20 rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-3.5 transition-all focus-within:bg-white/[0.12] focus-within:border-white/40 focus-within:shadow-[0_8px_40px_0_rgba(56,189,248,0.2)]">
            
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-white/40 text-base md:text-lg px-3 py-2 font-light"
            />

            {/* Bottom Controls inside the Capsule */}
            <div className="flex items-center justify-between pt-2 px-1 border-t border-white/10 mt-1">
              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Add Attachment"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Tools & Agents"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </button>
                <button 
                  type="button" 
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Configure Parameters"
                >
                  <SlidersHorizontal className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  type="submit" 
                  disabled={!inputPrompt.trim() || (stage !== 'idle' && stage !== 'completed')}
                  className="p-2.5 rounded-2xl bg-white text-slate-950 hover:bg-cyan-100 transition-all shadow-lg disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                  title="Submit Prompt"
                >
                  <ArrowUp className="w-4 h-4 font-bold" />
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* Active Execution Stream Card (Appears when running) */}
        {stage !== 'idle' && (
          <div className="w-full mt-6 bg-slate-950/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 text-left shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-wider uppercase text-white/80">Pipeline: {stage}</span>
              </div>
            </div>

            {evaluation?.edgeCasesTested && (
              <div className="mb-3">
                <p className="text-[11px] font-medium text-white/60 mb-1.5">Evaluations:</p>
                <div className="space-y-1 text-xs">
                  {evaluation.edgeCasesTested.map((tc: { caseName: string, passed: boolean }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded-lg">
                      <span className="text-white/80">{tc.caseName}</span>
                      <span className={tc.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {tc.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-40 overflow-hidden rounded-xl border border-white/10 bg-black/50">
              <TerminalOutput logs={logs} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center z-10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">
          DESIGNED BY <span className="text-white/70 font-semibold">MULTI-AGENT ARCHITECT</span>
        </p>
      </div>

    </main>
  );
}
