## 1. Executive Summary & Tech Stack Table

The **Multi-Agent AI Architect Chatbox** is an event-driven, edge-native collaborative LLM platform designed for real-time software design, automated code generation, and empirical backtesting. The architecture coordinates three specialized LLM models into a deterministic processing pipeline:

```
                  ┌──────────────────────────────────────────────┐
                  │           Client / UI Dashboard              │
                  │   (Next.js App Router + Vercel AI SDK)       │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTP / SSE
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      Vercel Serverless / Edge Gateway        │
                  │    (Zod Schema Engine & Context Router)     │
                  └──────┬────────────────┬──────────────────────┘
                         │                │                │
      ┌──────────────────┘                │                └──────────────────┐
      │ Task Distribution                 │ Reasoning Loop                    │ Backtest Protocol
      ▼                                   ▼                                   ▼
┌───────────┐                       ┌───────────┐                       ┌───────────┐
│  Gemini   │ ── Orchestrated Payload ──►│ DeepSeek- │ ── Code & Math Artifact ──►│   Qwen    │
│  2.5 Pro  │                       │    R1     │                       │    Max    │
│(Architect)│◄── Validation Report ────│(Reasoning)│◄── Iterative Feedback ───│(Evaluator)│
└───────────┘                       └───────────┘                       └───────────┘

```

1. **Orchestrator (Gemini 2.5 Pro):** Ingests system requirements, decomposes tasks into typed directed acyclic graphs (DAGs), routes state vectors, and manages conversation memory.
2. **Reasoning Engine (DeepSeek-R1):** Executes deep reasoning, mathematical modeling, formal algorithm specification, and core source code generation.
3. **Evaluator & Backtester (Qwen Max):** Evaluates generated code against edge cases, executes virtual test suites, measures algorithmic time/space complexity, and issues pass/fail validation reports.

| Component | Technology | Target Version/Model | Engineering Scope | Architectural Justification |
| --- | --- | --- | --- | --- |
| **Frontend Framework** | Next.js | 15.x (App Router) | Client-side dashboard, streaming UI, state sync | Native React Server Components (RSC) and low-latency Edge API route integration. |
| **Runtime Infrastructure** | Vercel Serverless / Edge | Node.js 20.x Engine | Stateless route handlers, streaming SSE proxying | Zero-cold-start edge routing, automatic scaling, and native streaming integration. |
| **Agent 1 (Orchestrator)** | Google Gemini API | `gemini-2.5-pro` | Task breakdown, context routing, JSON output | Large context window, rapid function calling, structured JSON output compliance. |
| **Agent 2 (Reasoning)** | DeepSeek API | `deepseek-reasoner` (R1) | Math/physics derivation, code synthesis | Open-weights reasoning performance on complex algorithmic and structural problems. |
| **Agent 3 (Evaluator)** | DashScope / Qwen API | `qwen-max` | Backtesting, edge-case simulation, static audit | High coding benchmark score, low cost for iterative code validation loops. |
| **State & Streaming** | Vercel AI SDK | `ai` v4.x | Streams management, agent state transport | Standardized `ReadableStream` abstractions and UI hooks (`useChat`, `useCompletion`). |
| **Schema Validation** | Zod | 3.24.x | In-flight payload validation, agent typing | Run-time schema enforcement across inter-agent payload transfers. |
| **Styling & Theme** | Tailwind CSS | 4.x | Utility-first terminal aesthetic | Near-zero runtime CSS overhead with atomic dark-mode design tokens. |

---

## 2. Full Project Directory Tree

```
multi-agent-architect/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline for Vercel deployment & validation
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── agent/
│   │   │       ├── orchestrate/
│   │   │       │   └── route.ts    # Agent 1 (Gemini) endpoint: DAG parsing & routing
│   │   │       ├── reason/
│   │   │       │   └── route.ts    # Agent 2 (DeepSeek-R1) endpoint: Code synthesis
│   │   │       └── evaluate/
│   │   │           └── route.ts    # Agent 3 (Qwen) endpoint: Validation & backtest
│   │   ├── globals.css             # Terminal aesthetics, custom scrollbars, backdrop filters
│   │   ├── layout.tsx              # Root layout with dark-mode enforcement and providers
│   │   └── page.tsx                # Main developer dashboard and agent status canvas
│   ├── components/
│   │   ├── agent-card.tsx          # Component visualizing real-time agent state & latency
│   │   ├── code-editor.tsx         # Read-only dynamic stream renderer for generated code
│   │   ├── terminal-output.tsx     # SSE stream log feed utilizing Web APIs
│   │   └── ui/                     # Atomic UI primitives (Buttons, Badges, Modals)
│   ├── hooks/
│   │   ├── use-agent-stream.ts     # Custom hook orchestrating multi-agent SSE lifecycle
│   │   └── use-terminal-scroll.ts  # DOM observer maintaining auto-scroll lock on streaming
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── gemini.ts           # Gemini API client wrapper with exponential backoff
│   │   │   ├── deepseek.ts         # DeepSeek-R1 client with thinking-process streamer
│   │   │   └── qwen.ts             # Qwen API client configured for backtest payloads
│   │   ├── schemas/
│   │   │   └── agent-payloads.ts   # Zod validation schemas for Inter-Agent Handoff
│   │   └── utils.ts                # Tailwind merge helper and mathematical formatters
├── .env.example                    # Template for required environment keys
├── next.config.js                  # Next.js configuration (Server Actions, Edge rules)
├── package.json                    # Fixed dependency tree
├── tsconfig.json                   # Strict TypeScript compiler options
└── vercel.json                     # Serverless execution overrides & route configs

```

---

## 3. System Architecture & Data Flow Diagram

```
[ Client Interface ]
       │
       │ 1. POST /api/agent/orchestration (User Query + Context)
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Vercel Serverless Runtime: Step 1 (Gemini 2.5 Pro)                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Action: Decompose requirement into structured execution plan       │ │
│ │ Output: Zod-validated `OrchestrationPlan` JSON                     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 2. Pipeline Payload Handshake
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Vercel Serverless Runtime: Step 2 (DeepSeek-R1)                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Action: Consume Orchestration Plan; emit dynamic reasoning process │ │
│ │ Output: Streamed `ReasoningArtifact` (LaTeX/Algorithm + Code)      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 3. Code Generation Payload
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Vercel Serverless Runtime: Step 3 (Qwen Max)                           │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Action: Execute synthetic unit tests & security analysis           │ │
│ │ Output: Zod-validated `EvaluationReport` JSON                      │ │
│ └───────────────────────────────────┬────────────────────────────────┘ │
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          │ Pass                                                  │ Fail (Max Retries = 3)
          ▼                                                       ▼
┌───────────────────────────────────┐                   ┌───────────────────┐
│ Final Client Stream (Success UI)  │                   │ Loop back to      │
│ Render validated code & metrics   │                   │ DeepSeek with     │
└───────────────────────────────────┘                   │ Failure Diagnostics│
                                                        └───────────────────┘

```

### Connection Lifecycle & Payload Schemas

#### 1. Payload Serialization Schema (`src/lib/schemas/agent-payloads.ts`)

```typescript
import { z } from 'zod';

export const TaskStepSchema = z.object({
  stepId: z.string().uuid(),
  targetAgent: z.enum(['REASONING_ENGINE', 'EVALUATOR']),
  instruction: z.string().min(1),
  expectedOutputFormat: z.enum(['CODE_TS', 'ALGORITHM_PSEUDO', 'TEST_SUITE']),
});

export const OrchestrationPlanSchema = z.object({
  planId: z.string().uuid(),
  originalPrompt: z.string(),
  architectureOverview: z.string(),
  executionGraph: z.array(TaskStepSchema),
  systemConstraints: z.array(z.string()),
});

export const ReasoningArtifactSchema = z.object({
  planId: z.string().uuid(),
  thinkingChain: z.string(),
  mathematicalProof: z.string().optional(),
  generatedCode: z.object({
    filename: z.string(),
    language: z.string(),
    content: z.string(),
  }),
});

export const EvaluationReportSchema = z.object({
  planId: z.string().uuid(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  edgeCasesTested: z.array(z.object({
    caseName: z.string(),
    passed: z.boolean(),
    errorLog: z.string().optional(),
  })),
  suggestedFixes: z.string().optional(),
});

export type OrchestrationPlan = z.infer<typeof OrchestrationPlanSchema>;
export type ReasoningArtifact = z.infer<typeof ReasoningArtifactSchema>;
export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;

```

#### 2. Handshake Protocol & Context Transfer (`src/app/api/agent/orchestrate/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { OrchestrationPlanSchema } from '@/lib/schemas/agent-payloads';

export const runtime = 'edge';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are Agent 1 (Orchestrator). Decompose this task into a strict architecture plan:\n${prompt}`
          }]
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
                  expectedOutputFormat: { type: 'STRING', enum: ['CODE_TS', 'ALGORITHM_PSEUDO', 'TEST_SUITE'] }
                },
                required: ['stepId', 'targetAgent', 'instruction', 'expectedOutputFormat']
              }
            },
            systemConstraints: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['planId', 'originalPrompt', 'architectureOverview', 'executionGraph', 'systemConstraints']
        }
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedJson = JSON.parse(rawText);
    const validatedPlan = OrchestrationPlanSchema.parse(parsedJson);

    return NextResponse.json(validatedPlan, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Orchestration pipeline failure', details: error.message },
      { status: 500 }
    );
  }
}

```

---

## 4. Engineering Edge Cases & Solutions Matrix

| Failure Mode | Trigger Condition | System Impact | Explicit Code-Level/Architectural Solution |
| --- | --- | --- | --- |
| **Serverless Execution Timeout** | DeepSeek-R1 exceeds 60s execution window during complex math/code synthesis. | HTTP 504 Gateway Timeout on Vercel; lost agent state. | Implement **Chunked HTTP Streams** via `ReadableStream` + `TextEncoder` on Edge Runtime. Return execution status immediately and chunk token emission to maintain TCP socket activity. |
| **Agent Hallucination Loop** | Qwen rejects DeepSeek code output repeatedly (>3 cycles). | Infinite agent loop; exponential token depletion. | Maintain a hard `max_retry_count = 3` counter within the execution state. If `retry_count >= 3`, circuit-breaker fires, reverting system state to user with partial step logs and diagnostics. |
| **Provider Rate Limiting (429)** | Concurrent high-volume queries exceed API RPM/TPM thresholds. | Unhandled request failures; broken user sessions. | Wrap provider API clients with a Token Bucket Leaky Algorithm using exponential backoff with jitter: $t_{wait} = \min(t_{max}, t_{base} \times 2^{attempt} + \text{rand}(0, 1000\text{ms}))$. |
| **JSON Schema Violation** | Model outputs invalid structure or malformed markdown inside JSON. | Runtime parsing exceptions (`SyntaxError`). | Enforce native JSON Mode / Structured Outputs at model parameters level (`responseMimeType: "application/json"`). Pass malformed output back into Zod `safeParse()`, catching errors and feeding structural repair prompts back to model. |
| **Context Window Truncation** | Large codebases pass through DeepSeek $\rightarrow$ Qwen pipeline exceeding model limits. | Model truncates tail end of code, breaking valid output payload. | Implement AST-driven token pruning (`tree-sitter`). Strip inline prose comments, compress whitespace, and isolate active execution context before payload handoff. |

---

## 5. Configuration & Deployment Pipeline

### Configuration Overrides

#### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm ci",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "src/app/api/agent/orchestrate/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "src/app/api/agent/reason/route.ts": {
      "maxDuration": 300,
      "memory": 3072
    },
    "src/app/api/agent/evaluate/route.ts": {
      "maxDuration": 120,
      "memory": 2048
    }
  }
}

```

#### `.github/workflows/deploy.yml`

```yaml
name: Production Deployment Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  static-analysis:
    name: Code Quality & Schema Verification
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Type Check TypeScript
        run: npx tsc --noEmit

      - name: Run ESLint
        run: npm run lint

  deploy-production:
    name: Deploy to Vercel Production
    needs: static-analysis
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}

```

### Environment Variable Injection Protocol

Execute the script below via Vercel CLI to populate secrets securely across serverless environments without logging raw values:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Injecting LLM Secrets to Vercel Production Environment..."

vercel env add GEMINI_API_KEY production <<< "$GEMINI_API_KEY"
vercel env add DEEPSEEK_API_KEY production <<< "$DEEPSEEK_API_KEY"
vercel env add QWEN_API_KEY production <<< "$QWEN_API_KEY"

echo "Injection Complete."

```

---

## 6. Scalability Strategy & Upgrade Path

```
Current Architecture (Vercel Edge Streaming)
┌──────────┐     POST     ┌────────────────┐
│ Client UI│ ───────────► │ Serverless Edge│ ──(Streaming HTTP)──► LLM APIs
└──────────┘              └────────────────┘

Target Enterprise Architecture (Async Queue + Vector Memory)
┌──────────┐   HTTP/WS    ┌────────────────┐   Publish   ┌───────────────┐
│ Client UI│ ◄──────────► │ API Gateway    │ ───────────►│ Upstash Redis │
└──────────┘              └────────────────┘             └───────┬───────┘
                                                                 │ Consume
                                                                 ▼
┌──────────┐    Query     ┌────────────────┐   Dispatch  ┌───────────────┐
│ Qdrant   │ ◄──────────► │ Pinecone Vector│ ◄───────────│ Worker Pool   │
│ Vector DB│              │ Memory Engine  │             │ (Node/Go Nodes│
└──────────┘              └────────────────┘             └───────┬───────┘
                                                                 │ API Calls
                                                                 ▼
                                                             LLM APIs

```

### 1. Transitioning Long-Running Tasks to Asynchronous Messaging

* **Current Bottleneck:** Synchronous HTTP calls on Vercel Edge hit strict timeout limits when handling intensive reasoning loops from DeepSeek-R1.
* **Target Architecture:**
* Implement **Upstash Redis / QStash** as an asynchronous event queue.
* When a user submits an architectural task, the Edge Route fires a message payload to `QStash` and immediately returns a `202 Accepted` response with an execution `jobId`.
* Background worker services (hosted on AWS Fargate or Railway) pull jobs off the queue, process agent logic without execution time caps, and stream state changes over **WebSockets (Ably / Socket.io)** directly to the client UI.



### 2. Persistent Memory Engine via Vector Database

* **Current Bottleneck:** Inter-agent context is passed transiently inside HTTP JSON payloads, limiting multi-turn cross-session knowledge retention.
* **Target Architecture:**
* Integrate **Pinecone / Qdrant** vector database clusters.
* Store system designs, code generated by DeepSeek, and edge case fixes from Qwen as dense vector embeddings (`text-embedding-3-large` or `Qwen-Embedding`).
* Implement Retrieval-Augmented Generation (RAG) during Agent 1's (Gemini) orchestration phase:



$$\text{Similarity}(q, d) = \frac{\vec{q} \cdot \vec{d}}{\Vert{}\vec{q}\Vert{} \Vert{}\vec{d}\Vert{}}$$

* Prevents duplicate reasoning loops by retrieving past solutions for similar architectural patterns.

### 3. Context Window Optimization & Token Reduction

* **Target Protocol:**
1. **Dynamic AST Compression:** Parse generated code using `tree-sitter` binaries. Strip non-essential AST nodes before passing code down the pipeline to Qwen for evaluation.
2. **Sliding Window Summarization:** When context length reaches 70% of the target model's limits, trigger an automated background summarization job via Gemini to condense history into key structural constraints, maintaining prompt size below:



$$T_{total} = T_{system\_prompt} + T_{compressed\_context} + T_{active\_input} \le 0.70 \times T_{max}$$
