import React from 'react';
import { AgentLogEntry } from '@/lib/schemas/agent-payloads';
import { useTerminalScroll } from '@/hooks/use-terminal-scroll';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalOutputProps {
  logs: AgentLogEntry[];
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs }) => {
  const scrollRef = useTerminalScroll<HTMLDivElement>([logs]);

  return (
    <div className="flex flex-col h-full rounded-lg border border-zinc-800 bg-black/80 backdrop-blur-md overflow-hidden font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span>SYSTEM_LOG_FEED // SSE STREAM</span>
        </div>
        <span className="text-[10px] text-zinc-600">{logs.length} EVENTS RECORDED</span>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">Terminal idle. Dispatch pipeline request to view logs...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
              <span className={cn(
                'px-1 rounded text-[10px] font-bold select-none',
                log.agent === 'ORCHESTRATOR' && 'bg-blue-950 text-blue-400 border border-blue-800/50',
                log.agent === 'REASONING_ENGINE' && 'bg-purple-950 text-purple-400 border border-purple-800/50',
                log.agent === 'EVALUATOR' && 'bg-amber-950 text-amber-400 border border-amber-800/50',
                log.agent === 'SYSTEM' && 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              )}>
                {log.agent}
              </span>
              <span className={cn(
                'flex-1',
                log.level === 'INFO' && 'text-zinc-300',
                log.level === 'WARN' && 'text-amber-300',
                log.level === 'ERROR' && 'text-red-400',
                log.level === 'SUCCESS' && 'text-emerald-400 font-semibold'
              )}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
