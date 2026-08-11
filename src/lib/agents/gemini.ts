import { GoogleGenAI } from '@google/genai';
import { OrchestrationPlan, OrchestrationPlanSchema } from '@/lib/schemas/agent-payloads';

const maxRetries = 3;

export async function executeOrchestration(userPrompt: string): Promise<OrchestrationPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const ai = new GoogleGenAI({ apiKey });
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Agent 1 (Orchestrator). Decompose this target request into an execution plan. Ensure strict validity against the JSON schema format.\n\nUser Request: ${userPrompt}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              planId: { type: 'STRING' },
              originalPrompt: { type: 'STRING' },
              architectureOverview: { type: 'STRING' },
              executionGraph: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    stepId: { type: 'STRING' },
                    targetAgent: { type: 'STRING', enum: ['REASONING_ENGINE', 'EVALUATOR'] },
                    instruction: { type: 'STRING' },
                    expectedOutputFormat: {
                      type: 'STRING',
                      enum: ['CODE_TS', 'ALGORITHM_PSEUDO', 'TEST_SUITE']
                    }
                  },
                  required: ['stepId', 'targetAgent', 'instruction', 'expectedOutputFormat']
                }
              },
              systemConstraints: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              }
            },
            required: ['planId', 'originalPrompt', 'architectureOverview', 'executionGraph', 'systemConstraints']
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Received empty response from Gemini API');
      }

      const rawJson = JSON.parse(textOutput);
      return OrchestrationPlanSchema.parse(rawJson);
    } catch (error: any) {
      if (attempt >= maxRetries) {
        throw new Error(`Gemini Orchestration failed after ${maxRetries} attempts: ${error.message}`);
      }
      const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }

  throw new Error('Unhandled orchestration failure condition');
}
