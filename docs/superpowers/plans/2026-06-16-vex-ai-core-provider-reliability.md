# VEX AI Core Provider Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make VEX AI calls FreeLLMAPI `auto`-first, schema-safe, VEX-voiced, observable, and resilient.

**Architecture:** Keep app code stable and harden Supabase Edge AI boundary. Add small shared Edge modules for VEX prompt policy, response parsing, and provider metadata; keep raw LLM text out of app state unless parsed by Zod.

**Tech Stack:** Deno Edge Functions, TypeScript, Zod, FreeLLMAPI OpenAI-compatible `/v1/chat/completions`, Sentry-facing error metadata.

---

## File Structure

- Modify: `supabase/functions/_shared/openai-compatible.ts` — provider request/response adapter and metadata.
- Create: `supabase/functions/_shared/vex-ai-prompt.ts` — VEX prompt kernel and request-specific prompt builders.
- Create: `supabase/functions/_shared/vex-ai-output.ts` — JSON extraction, parse classification, fallback metadata helpers.
- Modify: `supabase/functions/ai-coach/index.ts` — use shared prompt/output helpers; keep `auto` primary.
- Modify: `supabase/functions/content-study/extractors.ts` — use shared JSON extraction and fallback classification.
- Test: `scripts/probe-llm-json.cjs` — smoke strict JSON behavior against local `.env.server`.

## Task 1: Provider Metadata

**Files:**
- Modify: `supabase/functions/_shared/openai-compatible.ts`

- [ ] **Step 1: Add provider metadata type**

Add `model`, `fallbackUsed`, and `provider` fields to `OpenAICompatibleResult`.

- [ ] **Step 2: Return model metadata**

Set `model: parsed response model ?? requested model`, `provider: 'freellmapi'`, and `fallbackUsed: false`.

- [ ] **Step 3: Run quick scan**

Run: `rtk rg -n "OpenAICompatibleResult|fallbackUsed|provider" supabase/functions/_shared/openai-compatible.ts`

Expected: type and return object both include metadata.

## Task 2: VEX Prompt Kernel

**Files:**
- Create: `supabase/functions/_shared/vex-ai-prompt.ts`
- Modify: `supabase/functions/ai-coach/index.ts`

- [ ] **Step 1: Create kernel**

Create exported constants:

```ts
export const VEX_AI_KERNEL = [
  'You are VEX, an elite focus coach inside a production mobile app.',
  'Do not mention model, provider, tokens, or being an AI unless the user asks in chat.',
  'Use direct, specific, VEX-voiced copy. One next step beats generic motivation.',
  'Do not invent user history. Use only supplied context.',
  'For structured requests, return only valid JSON matching the requested keys.',
].join('\n');
```

- [ ] **Step 2: Create coach system prompt helper**

Export `buildCoachSystemPrompt(persona: string): string` that appends persona and allowed action enum text.

- [ ] **Step 3: Wire AI Coach**

Replace inline coach system prompt in `buildPrompt()` with `buildCoachSystemPrompt(persona)`.

- [ ] **Step 4: Verify**

Run: `rtk rg -n "VEX_AI_KERNEL|buildCoachSystemPrompt|You are VEX AI Coach" supabase/functions`

Expected: new kernel present; old inline coach prompt gone from `ai-coach/index.ts`.

## Task 3: Output Parsing Helper

**Files:**
- Create: `supabase/functions/_shared/vex-ai-output.ts`
- Modify: `supabase/functions/ai-coach/index.ts`
- Modify: `supabase/functions/content-study/extractors.ts`

- [ ] **Step 1: Create parse helper**

Export:

```ts
export function extractJsonObject(text: string): string | null {
  const stripped = text.replace(/```json|```/g, '').trim();
  return stripped.match(/\{[\s\S]*\}/)?.[0] ?? null;
}

export function hasJsonObject(text: string): boolean {
  return extractJsonObject(text) !== null;
}
```

- [ ] **Step 2: Wire AI Coach parser**

Change `parseJsonBlock()` to call `extractJsonObject()` and throw `LLM returned non-JSON content` when null.

- [ ] **Step 3: Wire Content Study**

Replace local `hasJsonObject()` with shared import.

- [ ] **Step 4: Verify**

Run: `rtk rg -n "extractJsonObject|hasJsonObject|LLM returned non-JSON" supabase/functions`

Expected: shared helper used by both functions.

## Task 4: Auto-Primary Structured Retry

**Files:**
- Modify: `supabase/functions/ai-coach/index.ts`
- Modify: `supabase/functions/content-study/extractors.ts`

- [ ] **Step 1: Preserve auto primary**

Confirm `getOpenAICompatibleModel('fast', 'auto')` and `getOpenAICompatibleModel('pro', 'auto')` remain primary.

- [ ] **Step 2: Mark fallback metadata**

When retrying `LLM_MODEL_JSON_FALLBACK`, use returned metadata and set response metadata model to fallback model.

- [ ] **Step 3: Verify secrets**

Run: `rtk npx supabase secrets set LLM_MODEL_FAST=auto LLM_MODEL_PRO=auto LLM_MODEL_JSON_FALLBACK=groq/compound-mini`

Expected: `Finished supabase secrets set.`

## Task 5: Smoke Test And Deploy

**Files:**
- Test: `scripts/probe-llm-json.cjs`

- [ ] **Step 1: Run local provider smoke**

Run: `rtk node scripts/probe-llm-json.cjs`

Expected: `status=200`; if `jsonParse=failed` for `auto`, deployed fallback still covers structured app calls.

- [ ] **Step 2: Deploy functions**

Run:

```bash
rtk npx supabase functions deploy ai-coach
rtk npx supabase functions deploy content-study
```

Expected: both deploy successfully to project `icnbpjkyupuqzuvwuvbk`.

- [ ] **Step 3: Typecheck**

Run: `rtk npx tsc --noEmit`

Expected: pass or existing unrelated syntax failures reported with first files.

## Self-Review

- Spec A covered: provider reliability, prompt kernel, output validation, auto primary, fallback retry, telemetry metadata, smoke/deploy.
- Spec B and C intentionally excluded from this plan except preserving extension points.
- No raw LLM output reaches AI Coach structured state without JSON extraction and Zod parse.
- No new library introduced.
