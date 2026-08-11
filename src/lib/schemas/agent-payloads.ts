import { z } from 'zod';

export const TaskStepSchema = z.object({
  stepId: z.string().uuid(),
  targetAgent: z.enum(['REASONING_ENGINE', 'EVALUATOR']),
  instruction: z.string().min(1),
  expectedOutputFormat: z.enum(['CODE_TS', 'ALGORITHM_PSEUDO', 'TEST_SUITE'])
});

export const OrchestrationPlanSchema = z.object({
  planId: z.string().uuid(),
  originalPrompt: z.string(),
  architectureOverview: z.string(),
  executionGraph: z.array(TaskStepSchema),
  systemConstraints: z.array(z.string())
});

export const GeneratedCodeFileSchema = z.object({
  filename: z.string(),
  language: z.string(),
  content: z.string()
});

export const ReasoningArtifactSchema = z.object({
  planId: z.string().uuid(),
  thinkingChain: z.string(),
  mathematicalProof: z.string().optional(),
  generatedCode: GeneratedCodeFileSchema
});

export const TestCaseResultSchema = z.object({
  caseName: z.string(),
  passed: z.boolean(),
  errorLog: z.string().optional()
});

export const EvaluationReportSchema = z.object({
  planId: z.string().uuid(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  edgeCasesTested: z.array(TestCaseResultSchema),
  suggestedFixes: z.string().optional()
});

export const AgentLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  agent: z.enum(['ORCHESTRATOR', 'REASONING_ENGINE', 'EVALUATOR', 'SYSTEM']),
  level: z.enum(['INFO', 'WARN', 'ERROR', 'SUCCESS']),
  message: z.string()
});

export type TaskStep = z.infer<typeof TaskStepSchema>;
export type OrchestrationPlan = z.infer<typeof OrchestrationPlanSchema>;
export type GeneratedCodeFile = z.infer<typeof GeneratedCodeFileSchema>;
export type ReasoningArtifact = z.infer<typeof ReasoningArtifactSchema>;
export type TestCaseResult = z.infer<typeof TestCaseResultSchema>;
export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;
export type AgentLogEntry = z.infer<typeof AgentLogEntrySchema>;
