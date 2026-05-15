# VEX Retrieval Architecture: Server-Side Pinecone Integration

## Overview

This document defines the architecture for integrating Pinecone vector database into VEX for Phase 7 AI memory and retrieval.

**CRITICAL PRINCIPLE**: Pinecone runs server-side ONLY. The React Native app never queries Pinecone directly.

---

## How Pinecone Will Be Used in VEX

### 1. User Memory Retrieval
Retrieve relevant past experiences to personalize coaching:
- Similar past sessions based on topic, time, difficulty
- Historical performance patterns
- Contextual triggers that worked before

### 2. Prior Session Retrieval
Find sessions similar to current context:
- Same time of day patterns
- Same difficulty level outcomes
- Same focus topic results

### 3. Streak History Context
Retrieve streak-related memories for interventions:
- Previous streak-saving moments
- What worked during past streak risks
- Streak milestone celebrations

### 4. Personalized Coaching Context
Maintain coach "memory" across interactions:
- Recent coach-user interactions
- What coaching approaches worked
- User preferences learned over time

### 5. Semantic Search (Future)
Search user's reflections and notes:
- Find similar past struggles
- Discover recurring themes
- Surface relevant insights

---

## Strict Rules (Non-Negotiable)

### 1. Server-Side Only
```
React Native → Edge Function → Pinecone
     ↑              ↓
  [Request]    [Query + Response]
  [Validation] [Validation]
```

- ✅ Pinecone API key only in `.env.server`
- ✅ NO `EXPO_PUBLIC_PINECONE_API_KEY`
- ✅ NO Pinecone client in React Native code
- ✅ All queries through Supabase Edge Functions

### 2. Request Flow
1. **App sends typed request** → Backend Edge Function
2. **Backend validates input** (Zod schemas)
3. **Backend queries Pinecone** (with API key from env)
4. **Backend passes curated context** to Gemini (for AI generation)
5. **Backend validates output** (type checking + sanitization)
6. **Backend returns typed response** → App

### 3. Input Validation
- All requests validated with Zod before Pinecone query
- Query vectors generated server-side (embeddings API)
- Metadata filters validated (no injection)
- User ID verified against auth context

### 4. Output Requirements
- Retrieved results must be typed
- Raw Pinecone data transformed to app types
- PII filtered from returned context
- Relevance scores included for ranking

### 5. Fallback Behavior
- Database fallback if Pinecone unavailable
- Static defaults if no data found
- Graceful degradation (app never breaks)
- Sentry logging for all failures

### 6. Non-Blocking
- Retrieval never blocks core app flows
- Timeouts enforced (5-10s per use case)
- Async loading with loading states
- Display without context while fetching

---

## Recommended Backend Flow

### Edge Function Architecture

```typescript
// supabase/functions/retrieval/session-history/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Pinecone } from 'npm:@pinecone-database/pinecone';

serve(async (req) => {
  // 1. Validate request
  const body = await req.json();
  const validatedRequest = validateFetchSessionHistoryRequest(body);
  
  // 2. Get user auth context
  const userId = await getUserIdFromAuth(req);
  
  // 3. Generate embedding for query (server-side)
  const queryEmbedding = await generateEmbedding(
    validatedRequest.context.currentFocusTopic || 'focus session'
  );
  
  // 4. Query Pinecone (server-side only)
  const pc = new Pinecone({ apiKey: Deno.env.get('PINECONE_API_KEY') });
  const index = pc.index(Deno.env.get('PINECONE_INDEX_NAME'));
  
  const namespace = `${userId}__sessions`;
  
  const results = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK: validatedRequest.limit,
    includeMetadata: true,
    filter: {
      completed: true,
      quality: { $gte: validatedRequest.filters?.minQuality || 50 },
    },
  });
  
  // 5. Transform to app types
  const relevantSessions = results.matches?.map(match => ({
    sessionId: match.id,
    date: match.metadata.timestamp,
    duration: match.metadata.duration,
    quality: match.metadata.quality,
    topic: match.metadata.focusTopic,
    similarityScore: match.score,
  })) || [];
  
  // 6. Fetch full details from Supabase (Pinecone only stores vectors + minimal metadata)
  const sessionDetails = await fetchSessionDetailsFromSupabase(
    relevantSessions.map(s => s.sessionId)
  );
  
  // 7. Return typed response
  return new Response(JSON.stringify({
    success: true,
    queryType: 'FETCH_RELEVANT_SESSION_HISTORY',
    context: {
      relevantSessions: sessionDetails,
      patterns: extractPatterns(sessionDetails),
    },
    metadata: {
      processingTimeMs: Date.now() - startTime,
      itemsFound: relevantSessions.length,
      namespace,
    },
  }), { headers: { 'Content-Type': 'application/json' } });
});
```

### Integration with Gemini

```typescript
// When generating AI coach message with memory context:

async function generateCoachMessageWithMemory(request) {
  // 1. Fetch memory context from Pinecone
  const memoryContext = await fetchRetrieval({
    queryType: 'FETCH_COACH_MEMORY_CONTEXT',
    userId: request.userId,
    context: { memoryTypes: ['RECENT_INTERACTIONS'], forCoachCategory: request.category },
  });
  
  // 2. Fetch relevant session history
  const sessionHistory = await fetchRetrieval({
    queryType: 'FETCH_RELEVANT_SESSION_HISTORY',
    userId: request.userId,
    context: { similarTo: 'current_context', lookbackDays: 30 },
  });
  
  // 3. Combine contexts
  const enrichedContext = {
    ...request.context,
    memoryContext: memoryContext.context,
    sessionHistory: sessionHistory.context,
  };
  
  // 4. Call Gemini with enriched context
  return await callGeminiWithContext({
    ...request,
    context: enrichedContext,
  });
}
```

---

## Typed Retrieval Use Cases

### 1. `fetchRelevantSessionHistory`
**Purpose**: Find similar past sessions for pattern recognition and coaching personalization

**Request**:
```typescript
{
  queryType: 'FETCH_RELEVANT_SESSION_HISTORY',
  userId: string,
  context: {
    currentFocusTopic?: string,
    currentDifficulty?: number,
    timeOfDay?: 'morning' | 'afternoon' | 'evening',
    lookbackDays: number,
    similarTo: 'current_context' | 'high_quality' | 'streak_saving',
  },
  filters?: { minQuality?: number, completedOnly?: boolean },
  limit: number,
}
```

**Response**:
```typescript
{
  success: boolean,
  context: {
    relevantSessions: Array<{
      sessionId: string,
      date: number,
      duration: number,
      quality: number,
      topic?: string,
      similarityScore: number,
    }>,
    patterns: {
      bestTimeOfDay?: string,
      averageQuality?: number,
    },
  },
  metadata: { processingTimeMs, itemsFound, namespace },
}
```

**Namespace**: `{userId}__sessions`

---

### 2. `fetchRelevantUserPatterns`
**Purpose**: Retrieve learned behavioral patterns for personalization

**Request**:
```typescript
{
  queryType: 'FETCH_RELEVANT_USER_PATTERNS',
  userId: string,
  context: {
    patternTypes: Array<'FOCUS_PATTERNS' | 'STREAK_BEHAVIOR' | 'DIFFICULTY_PREFERENCE'>,
    currentState?: string,
    timeHorizon: 'recent' | 'medium' | 'all_time',
  },
  limit: number,
}
```

**Response**:
```typescript
{
  success: boolean,
  context: {
    patterns: Array<{
      patternType: string,
      description: string,
      confidence: number,
      evidence: string[],
    }>,
    insights: string[],
  },
  metadata: { processingTimeMs, itemsFound },
}
```

**Namespace**: `{userId}__patterns`

---

### 3. `fetchCoachMemoryContext`
**Purpose**: Retrieve coach "memory" for continuity and personalization

**Request**:
```typescript
{
  queryType: 'FETCH_COACH_MEMORY_CONTEXT',
  userId: string,
  context: {
    memoryTypes: Array<'RECENT_INTERACTIONS' | 'PERSONALIZED_INSIGHTS' | 'STREAK_HISTORY'>,
    forCoachCategory?: 'STREAK_RISK' | 'MOTIVATION_BOOST',
  },
  limit: number,
}
```

**Response**:
```typescript
{
  success: boolean,
  context: {
    memoryItems: Array<{
      type: string,
      timestamp: number,
      summary: string,
      emotionalTone: 'positive' | 'neutral' | 'challenging',
      relevanceScore: number,
    }>,
    continuityNotes: string[],
    suggestedApproach?: string,
  },
  metadata: { processingTimeMs, itemsFound },
}
```

**Namespace**: `{userId}__coach_memory`

---

### 4. `fetchRecentReflectionContext`
**Purpose**: Retrieve user's reflections for contextual coaching

**Request**:
```typescript
{
  queryType: 'FETCH_RECENT_REFLECTION_CONTEXT',
  userId: string,
  context: {
    lookbackDays: number,
    themes?: string[],
    relatedTo?: string,
  },
  limit: number,
}
```

**Response**:
```typescript
{
  success: boolean,
  context: {
    reflections: Array<{
      id: string,
      timestamp: number,
      content: string,
      tags: string[],
      emotionalTone?: string,
    }>,
    themes: Array<{
      theme: string,
      frequency: number,
    }>,
  },
  metadata: { processingTimeMs, itemsFound },
}
```

**Namespace**: `{userId}__reflections`

---

## Memory Rules

### 1. Data Storage Strategy

**What Goes in Pinecone (Vectors + Minimal Metadata)**:
```typescript
{
  id: 'session-123',
  vector: [0.1, 0.2, ...], // 768 dimensions
  metadata: {
    userId: 'user-123',
    type: 'session',
    timestamp: 1234567890,
    contentHash: 'a1b2c3', // Hash of full content
    duration: 1500, // seconds
    quality: 85, // 0-100
    completed: true,
    focusTopic: 'deep work',
    // NO full content, NO PII
  },
}
```

**What Stays in Supabase (Full Data)**:
- Complete session details
- User-generated content
- Reflections text
- Personal notes

**Linking Strategy**:
- Pinecone ID = Supabase ID (for easy joining)
- Content hash for integrity verification

### 2. Namespace Strategy

```
Per-User Namespaces:
- {userId}__sessions      → Focus sessions
- {userId}__reflections   → User reflections
- {userId}__patterns      → Learned patterns
- {userId}__coach_memory  → Coach interactions
- {userId}__milestones    → Achievements

Global Namespaces:
- global__patterns        → Cross-user patterns (anonymized)
- global__coach_insights  → Coaching effectiveness data
```

**Benefits**:
- User data isolation
- Faster queries (smaller search space)
- Easy per-user cleanup
- Multi-tenant by design

### 3. Retention & Update Strategy

**Automatic Cleanup**:
```typescript
const RETENTION_POLICIES = {
  SESSIONS: {
    maxAgeDays: 90,
    maxItems: 100,
    consolidationAfterDays: 30,
  },
  REFLECTIONS: {
    maxAgeDays: 180,
    maxItems: 50,
    consolidationAfterDays: 60,
  },
  PATTERNS: {
    maxAgeDays: 365, // Patterns are valuable
    maxItems: 20,
    consolidationEnabled: false,
  },
};
```

**Consolidation Process**:
1. Old sessions (30+ days) → Summarized into patterns
2. Multiple similar sessions → "Consistent morning focus"
3. Original vectors deleted
4. Pattern vector stored

**Update Strategy**:
- New sessions: Upsert to Pinecone immediately
- Pattern updates: Weekly batch job
- Reflections: On creation
- Coach interactions: After each interaction

### 4. Privacy & Security

**Never Store in Pinecone**:
- Raw email addresses
- Full names
- Phone numbers
- Precise locations
- Device IDs
- Full content (use hash + Supabase reference)

**Always Hash/Anonymize**:
```typescript
// Store hash, not content
contentHash: generateContentHash(fullContent)

// Store reference to Supabase
sessionId: 'session-123' // Same ID in Supabase
```

**Metadata Size Limit**: 1KB max per vector

---

## Files Created

| File | Purpose | Location |
|------|---------|----------|
| `retrieval.md` | This documentation | Root |
| `retrieval-types.ts` | Core type definitions | `src/shared/retrieval/` |
| `retrieval-events.ts` | Event definitions | `src/shared/retrieval/` |
| `retrieval-constants.ts` | Config, namespaces, fallbacks | `src/shared/retrieval/` |
| `retrieval-client-contracts.ts` | Client-backend contracts | `src/shared/retrieval/` |
| `index.ts` | Barrel exports | `src/shared/retrieval/` |

---

## Server-Side Environment Variables Required

Set in `.env.server`:
```bash
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=vex-memory
```

### Edge Function Environment
Set in Supabase Dashboard:
```bash
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=vex-memory
```

### Trigger.dev Environment
Set in Trigger.dev dashboard:
```bash
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=vex-memory
```

---

## What Must Be Created Manually in Pinecone Console

### 1. Create Index: `vex-memory`

**Steps**:
1. Go to https://app.pinecone.io
2. Click "Create Index"
3. Configure:
   - **Name**: `vex-memory`
   - **Dimensions**: `768` (for text-embedding-004)
   - **Metric**: `cosine`
   - **Cloud**: `AWS`
   - **Region**: `us-east-1`
   - **Pod Type**: `p1.x1` (start small, scale up)

4. Click "Create Index"

### 2. Recommended First Index Strategy for VEX

**Initial Setup (MVP)**:
```
Index: vex-memory
├── Namespace Pattern: {userId}__{type}
├── Dimensions: 768
├── Metric: cosine
├── Pod Type: p1.x1 (~$70/month)
└── Capacity: ~1M vectors per pod
```

**Scaling Strategy**:
- **0-1K users**: 1 pod (p1.x1)
- **1K-10K users**: 2-3 pods or serverless
- **10K+ users**: Serverless tier (pay per query)

**Namespace per User** (Recommended):
- Query performance: O(log n) where n = user's vectors
- Data isolation: By design
- Easy cleanup: Delete namespace when user deletes account

**Alternative: Single Namespace with Filter**:
- Query performance: O(log n) where n = all vectors
- Requires userId filter on every query
- Simpler management
- Use if user count > 100K

### 3. Create First Namespaces (Manual Test)

After creating index, create test namespaces:
```bash
# Using Pinecone SDK or REST API
curl -X POST "https://vex-memory-xxx.svc.aped-4627-b74a.pinecone.io/vectors/upsert" \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "test-user__sessions",
    "vectors": [{
      "id": "test-session-1",
      "values": [0.1, 0.2, ...768 dims...],
      "metadata": {
        "userId": "test-user",
        "type": "session",
        "timestamp": 1234567890,
        "contentHash": "abc123",
        "quality": 85
      }
    }]
  }'
```

---

## Manual Setup Tasks

### 1. Create Supabase Edge Functions

Create these files in `supabase/functions/`:

```
supabase/functions/
├── retrieval/
│   ├── session-history/
│   │   └── index.ts
│   ├── user-patterns/
│   │   └── index.ts
│   ├── coach-memory/
│   │   └── index.ts
│   └── reflection-context/
│       └── index.ts
├── _shared/
│   ├── pinecone-client.ts
│   ├── embedding-service.ts
│   └── retrieval-utils.ts
└── config/
    └── pinecone.ts
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy retrieval/session-history
supabase functions deploy retrieval/user-patterns
supabase functions deploy retrieval/coach-memory
supabase functions deploy retrieval/reflection-context
```

### 3. Set Environment Variables in Supabase

```bash
supabase secrets set PINECONE_API_KEY=your-key
supabase secrets set PINECONE_INDEX_NAME=vex-memory
```

### 4. Create Database Tables for Full Content

```sql
-- Sessions (full data - Pinecone stores vector + minimal metadata)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  quality_score INTEGER,
  focus_topic TEXT,
  notes TEXT,
  -- Link to Pinecone vector
  pinecone_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reflections
CREATE TABLE user_reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id UUID REFERENCES user_sessions,
  content TEXT,
  tags TEXT[],
  emotional_tone TEXT,
  pinecone_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach Interactions
CREATE TABLE coach_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  category TEXT,
  message_content TEXT,
  user_response TEXT,
  effectiveness_score INTEGER,
  pinecone_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Pinecone ID lookups
CREATE INDEX idx_sessions_pinecone ON user_sessions(pinecone_id);
CREATE INDEX idx_reflections_pinecone ON user_reflections(pinecone_id);
```

### 5. Create Trigger.dev Jobs for Memory Management

```typescript
// jobs/retrieval/memory-consolidation.ts

import { job } from '@trigger.dev/sdk';

export const memoryConsolidationJob = job({
  id: 'retrieval-memory-consolidation',
  cron: '0 2 * * *', // Daily at 2 AM
  run: async () => {
    // Consolidate old memories
    // Delete expired vectors
    // Update patterns
  },
});
```

### 6. React Native Integration

Create `src/services/retrievalClient.ts`:
```typescript
// Implements RetrievalAPIClient interface
// Calls Supabase Edge Functions
// Handles caching, retries, fallbacks
```

Update `src/features/ai-coach/service.ts` to use retrieval:
```typescript
// In generateMessage function:
// 1. Fetch memory context via retrievalClient
// 2. Add to Gemini context
// 3. Generate personalized message
```

---

## Security Checklist

- [ ] No `PINECONE_API_KEY` in any `.env` file that ships to client
- [ ] No `EXPO_PUBLIC_PINECONE_API_KEY` anywhere
- [ ] No Pinecone client imports in `src/` outside service layer
- [ ] All queries go through Edge Functions
- [ ] API key only in Supabase secrets
- [ ] PII never stored in Pinecone metadata
- [ ] Full content stays in Supabase only
- [ ] User namespaces for isolation
- [ ] Sentry error tracking enabled
- [ ] Fallbacks ready for all use cases

---

## Summary

This architecture ensures:
1. **Security**: API keys never exposed to client
2. **Privacy**: PII stays in Supabase, vectors are anonymized
3. **Performance**: User namespaces, client-side caching
4. **Scalability**: Per-user isolation, easy cleanup
5. **Reliability**: Fallbacks at every level, timeouts enforced
6. **Cost Control**: Metadata limits, retention policies

The React Native app is a "thin client" for retrieval - it requests context and receives curated results. All vector operations happen server-side.
