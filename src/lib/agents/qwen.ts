import { EvaluationReport, EvaluationReportSchema, ReasoningArtifact } from '@/lib/schemas/agent-payloads';

export async function executeEvaluation(artifact: ReasoningArtifact): Promise<EvaluationReport> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('Missing QWEN_API_KEY environment variable');
  }

  const prompt = `You are Agent 3 (Evaluator & Backtester). Evaluate the provided code artifact for edge-case vulnerabilities, spatial/temporal complexity, and algorithmic correctness.
Return your answer strictly in JSON matching the specified properties:
- planId: string (must match input planId)
- passed: boolean
- score: number (0-100)
- edgeCasesTested: array of { caseName: string, passed: boolean, errorLog?: string }
- suggestedFixes: string (optional)

Artifact to evaluate:
${JSON.stringify(artifact, null, 2)}`;

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [
        { role: 'system', content: 'You are a strict automated code validation engine. Output raw JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API returned error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const rawText = result.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Received empty evaluation response from Qwen API');
  }

  const parsedJson = JSON.parse(rawText);
  return EvaluationReportSchema.parse(parsedJson);
}
