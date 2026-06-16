# VEX AI Core + Invisible Agent Design

**Date:** 2026-06-16
**Status:** Approved direction, pending user review of written spec
**Scope order:** A. AI Core + Provider Reliability, then B. Invisible Coach Agent v1, then C. Content Study AI Upgrade. AI Chat remains a first-class surface.

---

## 1. Goal

Make VEX feel like a 2026 AI-native focus OS without turning it into a generic chatbot app.

The AI should mostly be invisible: it reads context, chooses a bounded next-best action, writes a typed recommendation, and lets the user stay in flow. Chat still exists, but chat becomes one surface over the same typed AI core, not a separate gimmick.

## 2. Research Signals

- OpenAI Structured Outputs and Agents guidance emphasize schema-constrained outputs, tool boundaries, tracing, and guardrails for reliable agent behavior: <https://platform.openai.com/docs/guides/structured-outputs>, <https://platform.openai.com/docs/guides/agents>.
- Gemini structured output and function calling guidance points in the same direction: typed outputs and explicit tool/function contracts instead of unconstrained text: <https://ai.google.dev/gemini-api/docs/structured-output>, <https://ai.google.dev/gemini-api/docs/function-calling>.
- Anthropic tool use guidance similarly treats tools as explicit contracts and recommends structured tool parameters: <https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview>.
- FreeLLMAPI is OpenAI-compatible, supports `model: "auto"` routing, and uses a unified `freellmapi-...` bearer key for `/v1/chat/completions`: <https://github.com/tashfeenahmed/freellmapi>.

Design consequence for VEX: the agent must not be a freeform autonomous actor. It must be a typed decision engine with auditable outputs, schema validation, deterministic fallback, and user-confirmed actions.

## 3. Current VEX Evidence

- `supabase/functions/_shared/openai-compatible.ts` provides the OpenAI-compatible FreeLLMAPI adapter and supports JSON mode.
- `supabase/functions/ai-coach/index.ts` calls FreeLLMAPI with `auto` primary and uses a JSON fallback model only when coach output fails validation.
- `src/features/ai-coach/pipeline/pipeline.ts` invokes the `ai-coach` Edge Function, sanitizes LLM context, persists coach messages, and already has fallback messages.
- `src/features/content-study` already owns content generation, study plans, quiz items, and session routing.

Inference: VEX does not need a new AI product bolted on. It needs a central AI core that makes current AI surfaces reliable, then an agent layer that composes existing coach, memory, session, streak, and content-study systems.

## 4. Architecture

### A. AI Core + Provider Reliability

Create a shared AI contract layer for all LLM calls.

Responsibilities:
- FreeLLMAPI provider calls with `LLM_MODEL_FAST=auto` and `LLM_MODEL_PRO=auto`.
- Optional `LLM_MODEL_JSON_FALLBACK` only for structured retry after parse failure.
- Zod schemas for every LLM output.
- Prompt kernel with VEX voice, safety limits, action policy, and output shape.
- Structured error classes: provider unavailable, auth failed, rate limited, parse failed, unsafe action, budget exceeded.
- Telemetry: model used, auto/fallback path, latency, token estimate, schema parse result, request type.
- Deterministic fallback content for every request.

No feature may consume raw LLM text directly. All AI outputs must pass schema validation before they become app state.

### B. Invisible Coach Agent v1

Create a bounded agent that makes one next-best recommendation from current context.

Inputs:
- user progression, streak state, recent session summaries, session setup draft, active study plan, coach memory, notification settings, offline state, current route context.

Output:
- one typed `CoachAgentDecision`.

Allowed decisions:
- `START_SESSION`
- `ADJUST_SESSION_PLAN`
- `RESCUE_STREAK`
- `CONTINUE_STUDY_PLAN`
- `START_COMEBACK`
- `OPEN_AI_CHAT`
- `NO_ACTION`

Every decision includes:
- user-facing line
- reason code
- confidence
- action payload
- expiry
- suppression reason if no action
- telemetry metadata

Agent never directly starts sessions, spends currency, changes settings, sends notifications, or purchases anything. It only writes recommendations or opens confirmable flows.

### C. Content Study AI Upgrade

Use the same AI Core for content-study generation.

Outputs: `StudyPlan`, `StudyTask[]`, `QuizItem[]`, `SessionPlan`, and `ContentWeaknessInsight[]`.

Content Study supports generated plans from pasted text/PDF/YouTube extract, grounded quiz items, suggested session config, post-session adjustment, and a fallback plan when AI is unavailable.

## 5. AI Chat

AI Chat remains part of the product, but it should use the same core contracts.

Chat modes: Coach Chat, Study Chat, Session Debrief, and Planning Chat.

Each chat response includes visible message, optional suggested action, optional memory candidate, safety/quality flags, and source context IDs when grounded in study/session data.

The UI may show normal chat, but internally each response remains structured and validated.

## 6. Data Flow

Primary app flow:

Component -> Hook -> Service -> Repository -> Supabase

AI flow:

Component -> Hook -> Feature Service -> AI Core Client -> Supabase Edge Function -> FreeLLMAPI -> Zod validation -> Feature Service -> Repository

Agent flow:

Context Snapshot -> Agent Service -> AI Core -> Decision Schema -> Recommendation Repository -> UI Surface

## 7. Prompt Kernel

The VEX prompt kernel is shared text plus per-request instructions.

Kernel rules: speak as VEX, never mention provider/model/tokens unless asked in chat, stay concise, prefer one next step, do not invent user history, do not claim medical/legal/financial authority, ground study answers in supplied content, and return only the required schema for structured calls.

## 8. Guardrails

Validation: Zod schema parse for every structured response, output length caps, enum-only action IDs, UUID/userId validation, and context sanitization before prompt.

Recovery: `auto` primary, JSON fallback only after parse failure, deterministic fallback after provider/fallback failure, Sentry capture for unexpected errors, and user-facing degraded state where UI depends on AI output.

Autonomy limits: AI can recommend, user confirms meaningful actions, and AI cannot directly purchase, delete, spend currency, opt into notifications, or change settings.

## 9. Tests And Evals

Unit tests: provider request construction, schema parse success/failure, fallback model retry, deterministic fallback, agent decision ranking, and action payload validation.

Integration tests: AI Coach generation through service boundary, Content Study fallback, and invisible recommendation appearing on home/session setup.

Eval fixtures: streak at risk, first session, failed session comeback, active study plan behind schedule, overloaded user, offline state, and reduced-motion user.

## 10. Implementation Plan Boundary

First implementation plan covers only A: central AI schemas, provider reliability, VEX prompt kernel, targeted Edge Function refactor, and tests for auto-primary plus structured fallback.

B and C follow after A passes tests and deploy smoke checks.

## 11. Acceptance Criteria

- FreeLLMAPI `auto` remains primary for normal usage.
- Structured AI calls retry `LLM_MODEL_JSON_FALLBACK` only after parse failure.
- No raw LLM output reaches UI state without schema validation.
- AI Coach still works if FreeLLMAPI fails.
- Content Study still works if FreeLLMAPI fails.
- AI Chat remains supported by the same core.
- All new files stay under 200 lines.
- `npx tsc --noEmit` is run; existing unrelated failures are reported if they block verification.

## 12. Self-Review

- No incomplete markers remain.
- Scope is decomposed into A, B, C.
- `auto` primary requirement is explicit.
- AI Chat requirement is explicit.
- Agent autonomy is bounded and confirmable.
- Repository architecture rules are preserved.
