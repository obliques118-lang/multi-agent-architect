import { OrchestrationPlan, ReasoningArtifact, ReasoningArtifactSchema } from '@/lib/schemas/agent-payloads';

export async function executeReasoning(
  plan: OrchestrationPlan,
  onChunk?: (chunk: string) => void
): Promise<ReasoningArtifact> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
  }

  const systemPrompt = `You are Agent 2 (Reasoning Engine). Your role is to solve algorithmic and architectural constraints, derive mathematical proofs if needed, and write robust, production-ready TypeScript code. Respond ONLY in valid JSON conforming strictly to the requested schema.`;

  const userContent = `Execute reasoning and synthesize code based on this orchestration plan:\n${JSON.stringify(plan, null, 2)}`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      stream: true
    })
  });

  if (!response.ok || !response.body) {
    const errText = await response.text();
    throw new Error(`DeepSeek API returned error ${response.status}: ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.delta?.reasoning_content || '';
          if (delta) {
            fullText += delta;
            if (onChunk) onChunk(delta);
          }
        } catch {
          // ignore chunk parse errors
        }
      }
    }
  }

  const cleanedOutput = fullText.substring(fullText.indexOf('{'), fullText.lastIndexOf('}') + 1);
  const parsedJson = JSON.parse(cleanedOutput);
  return ReasoningArtifactSchema.parse(parsedJson);
}
