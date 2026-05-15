# VEX AI Architecture: Server-Side Gemini Integration

## Overview

This document defines the architecture for integrating Google Gemini AI into VEX for Phase 7 AI Coach features.

**CRITICAL PRINCIPLE**: Gemini runs server-side ONLY. The React Native app never talks directly to Google's API.

---

## Strict Rules (Non-Negotiable)

### 1. API Key Security
- **NO Gemini API keys in Expo client code**
- **NO `EXPO_PUBLIC_GEMINI_API_KEY`**
- **API key lives ONLY in `.env.server`**
- API key is accessed ONLY by:
  - Supabase Edge Functions
  - Trigger.dev jobs
  - Server-side code

### 2. Network Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Native  │────▶│  Our Backend     │────▶│  Google Gemini  │
│   (Expo App)    │     │  (Edge Function) │     │  (External API) │
│                 │◄────│                  │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
  [Typed Request]        [Prompt Construction]
  [Zod Validation]       [Gemini API Call]
  [Fallback Ready]       [Response Validation]
                         [Typed Response]
```

### 3. Request Flow
1. **App sends typed request** → Backend
2. **Backend validates payload** (Zod schemas)
3. **Backend constructs prompt** (centralized templates)
4. **Backend calls Gemini** (with API key from env)
5. **Backend validates output** (parsing + Zod validation)
6. **Backend returns typed response** → App

### 4. Prompt Construction
- **All prompts centralized** in `ai-constants.ts`
- No ad-hoc prompt construction
- Template variables strictly typed
- System prompts versioned and tracked

### 5. Output Handling
- **All AI outputs parsed and validated**
- **No raw model output rendered directly**
- Fallback to template library if validation fails
- Sentry reporting for all AI errors

### 6. Non-Blocking Design
- **AI must never block core app flows**
- UI always responsive with fallback content
- AI calls happen asynchronously
- Network timeout handling (5-20s based on use case)

---

## Recommended Backend Flow

### Edge Function Architecture (Supabase)

```typescript
// supabase/functions/ai/coach-message/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

serve(async (req) => {
  // 1. Validate request
  const body = await req.json();
  const validatedRequest = validateCoachMessageRequest(body);
  
  // 2. Construct prompt from template
  const prompt = buildCoachMessagePrompt(validatedRequest.context);
  
  // 3. Call Gemini (server-side only)
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
    safetySettings: SAFETY_SETTINGS,
  });
  
  // 4. Parse and validate response
  const rawContent = result.response.text();
  const validatedResponse = validateAndSanitizeResponse(rawContent);
  
  // 5. Return typed response
  return new Response(JSON.stringify({
    success: true,
    requestType: 'GENERATE_COACH_MESSAGE',
    content: validatedResponse.content,
    metadata: {
      model: 'gemini-1.5-flash',
      processingTimeMs: Date.now() - startTime,
    },
  }), { headers: { 'Content-Type': 'application/json' } });
});
```

### Alternative: Trigger.dev Jobs

```typescript
// jobs/ai/coach-message.ts

import { job } from '@trigger.dev/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateCoachMessageJob = job({
  id: 'ai-generate-coach-message',
  run: async (payload: GenerateCoachMessageRequest) => {
    // Same flow as Edge Function
    // Access GEMINI_API_KEY from environment
    // Return validated response
  },
});
```

---

## Typed Use Cases for VEX

### 1. `generateCoachMessage`
**Purpose**: Generate contextual coach messages based on user state

**Request**:
```typescript
{
  requestType: 'GENERATE_COACH_MESSAGE',
  userId: string,
  context: {
    category: 'STREAK_RISK' | 'MILESTONE_HYPE' | 'MOTIVATION_BOOST',
    currentStreak?: number,
    hoursSinceLastSession?: number,
    personaStyle?: 'CHEERLEADER' | 'MENTOR' | 'DRILL_SERGEANT',
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  content: string, // Validated message (max 1000 chars)
  structuredData?: {
    message: string,
    emoji?: string,
    urgency?: 'low' | 'medium' | 'high',
  }
}
```

**Fallback**: Template library from `ai-constants.ts`

---

### 2. `generateSessionSummary`
**Purpose**: Summarize focus sessions with personalized insights

**Request**:
```typescript
{
  requestType: 'GENERATE_SESSION_SUMMARY',
  userId: string,
  context: {
    period: 'daily' | 'weekly',
    sessionCount: number,
    totalFocusMinutes: number,
    averageQuality: number,
    streakDays: number,
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  content: string,
  structuredData: {
    headline: string,
    highlights: string[],
    encouragement: string,
    nextGoal?: string,
  }
}
```

**Model**: `gemini-1.5-pro` (more complex generation)

---

### 3. `generateComebackPrompt`
**Purpose**: Encourage users rebuilding their streak after a break

**Request**:
```typescript
{
  requestType: 'GENERATE_COMEBACK_PROMPT',
  userId: string,
  context: {
    previousStreak: number,
    daysInactive: number,
    comebackDay: 1 | 2 | 3,
    bonusMultiplier: number,
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  content: string,
  structuredData: {
    message: string,
    progressPercent: number,
    encouragement: string,
  }
}
```

---

### 4. `generateStreakRiskNudge`
**Purpose**: Urgent notification when streak is about to break

**Request**:
```typescript
{
  requestType: 'GENERATE_STREAK_RISK_NUDGE',
  userId: string,
  context: {
    currentStreak: number,
    hoursRemaining: number,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  content: string, // Max 600 chars
  structuredData: {
    urgencyMessage: string,
    streakCount: number,
    suggestedDuration: number, // minutes
    emoji: string,
  }
}
```

**Timeout**: 5 seconds (must be fast)

---

### 5. `generateWeeklyReflection`
**Purpose**: Weekly summary with wins, reflection, and goals

**Request**:
```typescript
{
  requestType: 'GENERATE_WEEKLY_REFLECTION',
  userId: string,
  context: {
    weekNumber: number,
    sessionsCompleted: number,
    totalFocusHours: number,
    streakAtStart: number,
    streakAtEnd: number,
    xpEarned: number,
    levelUps: number,
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  content: string, // Markdown formatted
  structuredData: {
    headline: string,
    wins: string[],
    reflection: string,
    nextWeekGoal: string,
    encouragement: string,
  }
}
```

**Timeout**: 20 seconds (can be slower)

---

## Validation Rules

### Input Validation
All requests validated with Zod schemas:
```typescript
const GenerateCoachMessageRequestSchema = z.object({
  requestType: z.literal('GENERATE_COACH_MESSAGE'),
  userId: z.string().uuid(),
  context: z.object({
    category: z.enum([...]),
    currentStreak: z.number().optional(),
    // ...
  }),
});
```

### Output Validation
```typescript
// 1. Length validation
if (content.length > MAX_LENGTH) return fallback;

// 2. Forbidden pattern check
const forbiddenPatterns = [
  /i am an ai/i,
  /as an ai/i,
  /i cannot help/i,
];

// 3. Required content check
if (category === 'STREAK_RISK' && !content.includes('🔥')) {
  return fallback;
}

// 4. Zod schema validation
const validated = GenerateCoachMessageResponseSchema.parse({
  success: true,
  content,
  // ...
});
```

---

## Fallback Strategy

### When Fallback Is Used
- Gemini API unavailable
- Request times out
- Safety block triggered
- Output validation fails
- Rate limit exceeded

### Fallback Sources
1. **Template Library**: Pre-written messages by category
2. **Ruled Generation**: Simple template-based generation
3. **Static Fallbacks**: Hardcoded safe messages

### Fallback Priority
```
AI Generated (Gemini)
    ↓ (on failure)
Template Library (category-specific)
    ↓ (on failure)
Ruled Generation (template + variables)
    ↓ (on failure)
Static Fallback (generic safe message)
```

---

## Error Handling

### Error Reporting to Sentry
All AI errors reported with context (no PII):
```typescript
Sentry.captureException(error, {
  tags: {
    feature: 'ai',
    requestType: 'GENERATE_COACH_MESSAGE',
    errorCode: 'GEMINI_API_ERROR',
  },
  extra: {
    userId: hashUserId(userId), // Hashed
    processingTimeMs,
    fallbackUsed: true,
  },
});
```

### Client-Side Error Handling
```typescript
try {
  const response = await aiClient.generateCoachMessage(request);
  // Use AI-generated content
} catch (error) {
  if (error.code === 'AI_UNAVAILABLE') {
    // Use fallback content from CLIENT_FALLBACKS
    showFallbackMessage(fallbackContent);
  }
  // Never show error UI - always show something helpful
}
```

---

## Files Created

| File | Purpose | Location |
|------|---------|----------|
| `ai-types.ts` | Core type definitions for AI requests/responses | `src/shared/ai/` |
| `ai-events.ts` | Event definitions for AI analytics | `src/shared/ai/` |
| `ai-constants.ts` | Prompts, models, fallbacks, config | `src/shared/ai/` |
| `ai-client-contracts.ts` | React Native to backend contracts | `src/shared/ai/` |
| `ai.md` | This documentation | Root |

---

## Server-Side Environment Variables Required

Add to `.env.server` (already present):
```bash
# Google Gemini (server-side only)
GEMINI_API_KEY=your-gemini-api-key
```

### Edge Function Environment
Set in Supabase Dashboard:
```bash
GEMINI_API_KEY=your-gemini-api-key
```

### Trigger.dev Environment
Set in Trigger.dev dashboard:
```bash
GEMINI_API_KEY=your-gemini-api-key
```

---

## Where Gemini Belongs in Architecture

```
VEX Architecture Stack:

┌─────────────────────────────────────────┐
│  React Native (Expo)                   │
│  ├── UI Components                      │
│  ├── State Management (Zustand)         │
│  ├── TanStack Query (Server State)      │
│  └── AI Client (Calls Backend)          │  ◀── AI requests go here
│       (ai-client-contracts.ts)            │
├─────────────────────────────────────────┤
│  Network Layer                           │
│  ├── Supabase Client                     │
│  └── AI API Calls (Edge Functions)       │  ◀── Backend boundary
├─────────────────────────────────────────┤
│  Backend (Server-Side)                  │
│  ├── Supabase Edge Functions             │
│  │   └── ai/* (Gemini Integration)      │  ◀── GEMINI_API_KEY used here
│  ├── Trigger.dev Jobs                    │
│  │   └── AI-related jobs                 │
│  └── Database (Cache/Logs)               │
├─────────────────────────────────────────┤
│  External APIs                           │
│  └── Google Gemini                       │
└─────────────────────────────────────────┘
```

---

## What Still Must Be Done Manually

### 1. Supabase Edge Functions (Required)
Create these files in `supabase/functions/`:

```
supabase/functions/
├── ai/
│   ├── coach-message/
│   │   └── index.ts
│   ├── session-summary/
│   │   └── index.ts
│   ├── comeback-prompt/
│   │   └── index.ts
│   ├── streak-nudge/
│   │   └── index.ts
│   └── weekly-reflection/
│       └── index.ts
└── _shared/
    └── ai-utils.ts (shared utilities)
```

**Edge Function Template**:
```typescript
// supabase/functions/ai/coach-message/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  // Implementation from "Recommended Backend Flow" section
});
```

### 2. Deploy Edge Functions
```bash
supabase functions deploy ai/coach-message
supabase functions deploy ai/session-summary
supabase functions deploy ai/comeback-prompt
supabase functions deploy ai/streak-nudge
supabase functions deploy ai/weekly-reflection
```

### 3. Set Environment Variables
In Supabase Dashboard → Project Settings → API:
- Add `GEMINI_API_KEY` to Edge Function secrets

### 4. Database Cache Tables (Optional but Recommended)
```sql
-- Cache AI responses
CREATE TABLE ai_response_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  request_type TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- AI generation logs
CREATE TABLE ai_generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  request_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  processing_time_ms INTEGER,
  model TEXT,
  prompt_tokens INTEGER,
  response_tokens INTEGER,
  error_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. React Native AI Client Implementation
Create in `src/services/aiClient.ts`:
```typescript
// Implements AIAPIClient interface from ai-client-contracts.ts
// Calls Supabase Edge Functions
// Handles caching, retries, fallbacks
```

### 6. Integration with ai-coach Feature
Update `src/features/ai-coach/service.ts` to use AI client:
```typescript
// In generateMessage function:
// 1. Try AI-generated message via aiClient
// 2. Fall back to template library if AI fails
// 3. Fall back to static fallbacks if templates fail
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test prompt construction
describe('buildCoachMessagePrompt', () => {
  it('includes all context variables', () => {
    const prompt = buildCoachMessagePrompt({
      category: 'STREAK_RISK',
      currentStreak: 5,
    });
    expect(prompt).toContain('STREAK_RISK');
    expect(prompt).toContain('5');
  });
});

// Test response validation
describe('validateAIResponse', () => {
  it('rejects responses with forbidden patterns', () => {
    const response = { content: 'I am an AI and cannot help' };
    expect(() => validateAIResponse(response)).toThrow();
  });
});
```

### Integration Tests
```typescript
// Test full flow with mocked Gemini
describe('AI Integration', () => {
  it('generates coach message end-to-end', async () => {
    const result = await generateCoachMessage({
      userId: 'test-user',
      context: { category: 'MOTIVATION_BOOST' },
    });
    expect(result.content).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

---

## Security Checklist

- [ ] No `GEMINI_API_KEY` in any `.env` file that ships to client
- [ ] No `EXPO_PUBLIC_GEMINI_API_KEY` anywhere
- [ ] No Gemini API imports in `src/` outside of service layer
- [ ] All AI calls go through Edge Functions
- [ ] API key only in Supabase secrets / Trigger.dev env vars
- [ ] PII never sent to Gemini (only anonymized context)
- [ ] All outputs validated before display
- [ ] Fallbacks ready for all use cases
- [ ] Sentry error tracking enabled

---

## Summary

This architecture ensures:
1. **Security**: API keys never exposed to client
2. **Reliability**: Fallbacks at every level
3. **Type Safety**: Zod schemas for all data
4. **Observability**: Full event tracking and error reporting
5. **Performance**: Client-side caching, proper timeouts
6. **Maintainability**: Centralized prompts, clear separation of concerns

The React Native app is a "thin client" for AI - it sends typed requests and receives validated responses. All AI complexity lives server-side.
