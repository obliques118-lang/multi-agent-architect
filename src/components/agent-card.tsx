import React from 'react';
import { cn } from '@/lib/utils';
import { PipelineStage } from '@/hooks/use-agent-stream';
import { Cpu, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AgentCardProps {
  name: string;
  role: string;
  model: string;
  activeStage: PipelineStage;
  targetStage: PipelineStage;
  details?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  role,
  model,
  activeStage,
  targetStage,
  details
}) => {
  const isCurrent = activeStage === targetStage;
  const isPassed =
    (targetStage === 'ORCHESTRATING' && ['REASONING', 'EVALUATING', 'COMPLETED'].includes(activeStage)) ||
    (targetStage === 'REASONING' && ['EVALUATING', 'COMPLETED'].includes(activeStage)) ||
    (targetStage === 'EVALUATING' && activeStage === 'COMPLETED');

  const isFailed = activeStage === 'FAILED' && !isPassed;

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all duration-300 backdrop-blur-md bg-zinc-950/60',
        isCurrent && 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
        isPassed && 'border-zinc-800/80 bg-zinc-900/30',
        isFailed && 'border-red-900/50 bg-red-950/10',
        !isCurrent && !isPassed && !isFailed && 'border-zinc-800/40 opacity-60'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded border',
            isCurrent ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/50' : 'border-zinc-800 text-zinc-500 bg-zinc-900'
          )}>
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-zinc-200">{name}</h3>
            <p className="font-mono text-xs text-zinc-500">{role}</p>
          </div>
        </div>

        <div>
          {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
          {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isFailed && <AlertCircle className="w-4 h-4 text-red-400" />}
          {!isCurrent && !isPassed && !isFailed && <Terminal className="w-4 h-4 text-zinc-700" />}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono">
        <span className="text-zinc-500">Model:</span>
        <span className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{model}</span>
      </div>

      {details && (
        <div className="mt-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 p-2 rounded border border-zinc-800/60 line-clamp-2">
          {details}
        </div>
      )}
    </div>
  );
};
