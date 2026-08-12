'use client';

import React, { useState } from 'react';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { TerminalOutput } from '@/components/terminal-output';
import { 
  Menu, 
  ChevronDown, 
  Plus, 
  Mic, 
  AudioWaveform, 
  Image as ImageIcon, 
  Edit3, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RotateCcw
} from 'lucide-react';

export default function DashboardPage() {
  const [inputPrompt, setInputPrompt] = useState('');
  const { stage, logs, plan, artifact, evaluation, streamedReasoningText, runPipeline, resetPipeline } = useAgentStream();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    runPipeline(inputPrompt);
  };

  const handleQuickAction = (promptText: string) => {
    setInputPrompt(promptText);
    runPipeline(promptText);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between px-4 py-6 bg-gradient-to-b from-[#0052D4] via-[#4364F7] to-[#6FB1FC] text-white overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Menu className="w-6 h-6 text-white" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:bg-white/15 transition-all">
          <span className="font-semibold text-sm tracking-wide">Multi-Agent AI</span>
          <ChevronDown className="w-4 h-4 text-white/70" />
        </div>

        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>

      {/* Main Center Content (Idle / Initial View) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center z-10 my-auto">
        {/* Logo / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg shadow-black/10 mb-6">
          <Cpu className="w-8 h-8 text-white animate-pulse" />
        </div>

        {/* Greeting */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Hi, Developer.
        </h1>
        <p className="text-white/80 text-sm md:text-base mb-8">
          What architectural workflow are we building today?
        </p>

        {/* Input Bar */}
        <form onSubmit={handleStart} className="w-full relative flex items-center mb-6">
          <div className="w-full flex items-center bg-white/15 backdrop-blur-xl border border-white/25 rounded-full shadow-2xl px-4 py-3 transition-all focus-within:bg-white/20 focus-within:border-white/40">
            <button 
              type="button" 
              className="p-2 rounded-full hover:bg-white/20 text-white/90 transition-colors mr-2"
            >
              <Plus className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything or describe a system..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-sm md:text-base px-2"
            />

            <div className="flex items-center gap-1.5 ml-2">
              <button 
                type="button" 
                className="p-2 rounded-full hover:bg-white/20 text-white/90 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                type="submit" 
                disabled={stage !== 'idle' && stage !== 'completed'}
                className="p-2.5 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md disabled:opacity-50"
              >
                {stage !== 'idle' && stage !== 'completed' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <AudioWaveform className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button 
            onClick={() => handleQuickAction("Design a scalable microservices architecture")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-xs md:text-sm font-medium transition-all"
          >
            <ImageIcon className="w-4 h-4 text-cyan-200" />
            <span>Design Microservices</span>
          </button>

          <button 
            onClick={() => handleQuickAction("Write a high-throughput async worker in Node.js")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-xs md:text-sm font-medium transition-all"
          >
            <Edit3 className="w-4 h-4 text-amber-200" />
            <span>Write Async Worker</span>
          </button>

          <button 
            onClick={() => handleQuickAction("Analyze system bottlenecks and fault tolerance")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-xs md:text-sm font-medium transition-all"
          >
            <Globe className="w-4 h-4 text-emerald-200" />
            <span>Audit Bottlenecks</span>
          </button>
        </div>

        {/* Active Pipeline Execution Feed (Appears when running) */}
        {stage !== 'idle' && (
          <div className="w-full mt-8 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-left shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold tracking-wider uppercase text-white/90">Pipeline Stage: {stage}</span>
              </div>
              <button 
                onClick={resetPipeline}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Evaluation data if available */}
            {evaluation?.edgeCasesTested && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-white/70 mb-2">Edge Cases Tested:</p>
                <div className="space-y-1 text-zinc-300 text-xs">
                  {evaluation.edgeCasesTested.map((tc: { caseName: string, passed: boolean }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded">
                      <span>{tc.caseName}</span>
                      <span className={tc.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal Output */}
            <div className="h-48 overflow-hidden rounded-xl border border-white/10 bg-black/60">
              <TerminalOutput logs={logs} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center z-10 pt-4">
        <p className="text-[11px] uppercase tracking-widest text-white/60 font-medium">
          DESIGN BY: <span className="font-bold text-white tracking-wider">Multi-Agent Architect</span>
        </p>
      </div>
    </main>
  );
}
