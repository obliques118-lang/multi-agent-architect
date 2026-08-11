import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { GeneratedCodeFile } from '@/lib/schemas/agent-payloads';

interface CodeEditorProps {
  file: GeneratedCodeFile | null;
  streamingText?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ file, streamingText }) => {
  const [copied, setCopied] = useState(false);

  const contentToDisplay = file?.content || streamingText || '// Awaiting code execution output from Reasoning Engine...';

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-zinc-800 bg-zinc-950/80 backdrop-blur-md overflow-hidden font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>{file?.filename || 'workspace/artifact.ts'}</span>
          {file?.language && (
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">
              {file.language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto text-xs font-mono text-emerald-300/90 leading-relaxed bg-black/40">
        <pre className="whitespace-pre-wrap break-words">{contentToDisplay}</pre>
      </div>
    </div>
  );
};
