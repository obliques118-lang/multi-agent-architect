'use client';

import React, { useState } from 'react';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { AgentCard } from '@/components/agent-card';
import { TerminalOutput } from '@/components/terminal-output';
import { CodeEditor } from '@/components/code-editor';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, ShieldCheck, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [inputPrompt, setInputPrompt] = useState('');
  const { stage, logs, plan, artifact, evaluation, streamedReasoningText, runPipeline, resetPipeline } = useAgentStream();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || stage !== 'IDLE') return;
    runPipeline(inputPrompt);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-mono">
      {/* Top Navigation Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-wide">MULTI-AGENT AI ARCHITECT</h1>
            <p className="text-[11px] text-zinc-500">Gemini 2.5 Pro ➔ DeepSeek-R1 ➔ Qwen Max</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
            STATUS: <strong className="text-emerald-400">{stage}</strong>
          </span>
          {stage !== 'IDLE' && (
            <Button variant="ghost" size="sm" onClick={resetPipeline}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Input + Agent Status Cards */}
        <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
          <form onSubmit={handleStart} className="flex flex-col gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
            <label className="text-xs font-semibold text-zinc-400">SYSTEM ARCHITECTURE SPECIFICATION</label>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. Design a distributed token-bucket rate limiter with Redis backend and TypeScript SDK..."
              className="w-full h-24 p-2.5 text-xs rounded border border-zinc-800 bg-black/60 text-zinc-200 focus:outline-none focus:border-emerald-500/80 resize-none font-mono"
              disabled={stage !== 'IDLE'}
            />
            <Button type="submit" disabled={stage !== 'IDLE' || !inputPrompt.trim()} className="w-full">
              <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Execute Pipeline
            </Button>
          </form>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            <AgentCard
              name="AGENT 1: ORCHESTRATOR"
              role="Task Decomposition & Context Routing"
              model="gemini-2.5-pro"
              activeStage={stage}
              targetStage="ORCHESTRATING"
              details={plan?.architectureOverview}
            />

            <AgentCard
              name="AGENT 2: REASONING ENGINE"
              role="Math & Production Code Synthesis"
              model="deepseek-reasoner"
              activeStage={stage}
              targetStage="REASONING"
              details={artifact ? `Synthesized ${artifact.generatedCode.filename}` : undefined}
            />

            <AgentCard
              name="AGENT 3: EVALUATOR"
              role="Backtesting & Edge-case Auditing"
              model="qwen-max"
              activeStage={stage}
              targetStage="EVALUATING"
              details={evaluation ? `Score: ${evaluation.score}/100 - ${evaluation.passed ? 'PASSED' : 'FAILED'}` : undefined}
            />

            {evaluation && (
              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Evaluation Report Summary
                </div>
                <div className="space-y-1 text-zinc-400 text-[11px]">
                  {evaluation.edgeCasesTested.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{tc.caseName}</span>
                      <span className={tc.passed ? 'text-emerald-400' : 'text-red-400'}>
                        {tc.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Column: Code Artifact & Terminal Output Stream */}
        <div className="col-span-8 grid grid-rows-2 gap-4 h-full overflow-hidden">
          <div className="h-full overflow-hidden">
            <CodeEditor file={artifact?.generatedCode || null} streamingText={streamedReasoningText} />
          </div>

          <div className="h-full overflow-hidden">
            <TerminalOutput logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}
