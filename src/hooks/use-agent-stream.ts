import { useState } from 'react';

export type PipelineStage = 'idle' | 'orchestrating' | 'reasoning' | 'generating' | 'evaluating' | 'completed' | 'error' | string;

export interface LogEntry {
  message: string;
  id: string;
  timestamp: string;
  agent: "REASONING_ENGINE" | "EVALUATOR" | "ORCHESTRATOR" | "SYSTEM";
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
}

export const useAgentStream = () => {
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [artifact, setArtifact] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [streamedReasoningText, setStreamedReasoningText] = useState('');

  const runPipeline = async (prompt: string) => {
    // Your API call logic goes here
    console.log("Running pipeline for:", prompt);
  };

  const resetPipeline = () => {
    setStage('idle');
    setLogs([]);
    setPlan(null);
    setArtifact(null);
    setEvaluation(null);
    setStreamedReasoningText('');
  };

  return {
    stage,
    logs,
    plan,
    artifact,
    evaluation,
    streamedReasoningText,
    runPipeline,
    resetPipeline
  };
};

