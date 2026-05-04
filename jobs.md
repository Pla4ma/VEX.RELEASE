# Trigger.dev Integration Plan for VEX

**Version:** 1.0  
**Trigger.dev Version:** v4  
**Status:** Implementation Plan

---

## ⚠️ CRITICAL ARCHITECTURE RULE

**Trigger.dev is SERVER-SIDE ONLY**

- **NEVER** put Trigger.dev secrets in client-side Expo code
- **NEVER** import Trigger.dev SDK in React Native components
- **NEVER** assume Trigger.dev runs inside the mobile app
- Trigger.dev lives in server-side infrastructure (cloud workers, edge functions, or separate worker service)

---

## Jobs Philosophy

### Core Principles

1. **Explicit over Implicit**
   - Background work must be explicitly defined, not hidden in side effects
   - Every job has a clear trigger, input, output, and lifecycle
   - No "magic" background processing

2. **Durable over Ephemeral**
   - Jobs must survive crashes, restarts, and network failures
   - State must be persisted, not held in memory
   - Results must be queryable

3. **Retryable by Design**
   - All jobs define clear retry behavior
   - Idempotency is the default, not an afterthought
   - Failures must be observable and actionable

4. **Separation of Concerns**
   - Jobs handle background work
   - UI handles user interactions
   - Services handle business logic
   - Never mix these layers

### What Belongs in Jobs

| Belongs in Jobs | Does NOT Belong in Jobs |
|----------------|------------------------|
| Season rollover | Button click handlers |
| Challenge refresh | Form validation |
| Delayed notifications | Local state updates |
| AI workflows | Sync calculations |
| Scheduled maintenance | Real-time UI feedback |
| Batch processing | Navigation transitions |
| Retryable external API calls | Immediate API responses |
| Data reconciliation | Optimistic UI updates |

---

## Trigger.dev Architecture for VEX

### System Position

```
┌─────────────────┐
│   Expo Client   │  ← React Native (NO Trigger.dev here)
│   (React Native)│
└────────┬────────┘
         │ API calls / Webhooks
         ▼
┌─────────────────┐
│    Supabase     │  ← Database, Auth, Realtime
│   (Postgres)    │
└────────┬────────┘
         │ Webhooks / RPC
         ▼
┌─────────────────┐
│  Trigger.dev    │  ← Background jobs (THIS IS WHERE JOBS LIVE)
│   Workers       │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────┐
│Sentry  │ │PostHog  │ ← Observability
└────────┘ └─────────┘
```

### Integration Points

1. **Supabase Webhooks** → Trigger Jobs
   - Database changes trigger jobs via webhooks
   - Supabase Edge Functions as webhook handlers
   - Payload validated before job enqueue

2. **Frontend** → Supabase → Jobs (Indirect)
   - Frontend calls Supabase RPC functions
   - RPC functions enqueue jobs via Trigger.dev API
   - Frontend receives job reference ID for polling

3. **Scheduled Jobs** → Trigger.dev Cron
   - Daily challenge refresh
   - Weekly analytics aggregation
   - Season rollover checks

---

## Implementation Plan

### Phase 1: Infrastructure Setup

**Files to Create:**

```
shared/jobs/
├── job-types.ts      # Core type definitions
├── job-events.ts     # Job event types
├── job-constants.ts  # Job constants
├── trigger-config.ts # Trigger.dev configuration
├── schemas.ts        # Zod schemas for all job payloads
└── index.ts          # Barrel export

jobs/
├── seasons/          # Season-related jobs
│   ├── rollover.ts
│   └── archive.ts
├── challenges/       # Challenge jobs
│   ├── daily-refresh.ts
│   ├── weekly-refresh.ts
│   └── expiry-cleanup.ts
├── battle-pass/      # Battle Pass jobs
│   └── season-reset.ts
├── notifications/    # Notification jobs
│   └── batch-send.ts
├── ai/              # AI workflow jobs
│   ├── session-summary.ts
│   └── challenge-generation.ts
├── maintenance/     # Maintenance jobs
│   ├── daily-cleanup.ts
│   ├── analytics-sync.ts
│   └── health-check.ts
└── economy/         # Economy jobs
    └── reconciliation.ts

supabase/functions/
├── trigger-webhook-handler/  # Webhook → Trigger.dev
└── job-status-poll/          # Frontend polling endpoint
```

### Phase 2: Environment Configuration

**Server-Side Environment Variables (NEVER in client):**

```bash
# Trigger.dev
TRIGGER_API_KEY=tr_dev_xxxxxxxxxxxxxxx
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_PROJECT_ID=proj_xxxxxxxx

# Supabase (for Trigger.dev to access)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # Service role key

# Observability
SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxx
POSTHOG_KEY=ph_project_key_xxx  # Future use

# Job-specific config
JOB_LOG_LEVEL=INFO
JOB_MAX_RETRIES=3
```

**Client-Side (Expo) Environment Variables:**

```bash
# These are safe for client
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Anon key only
EXPO_PUBLIC_SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxx
```

### Phase 3: First Jobs Implementation

**Priority 1 Jobs (Immediate):**

1. **challenge-daily-refresh**
   - Trigger: Cron (midnight UTC)
   - Generates new daily challenges
   - Assigns to active users
   - Cleans up expired challenges

2. **notification-batch-send**
   - Trigger: Webhook from Supabase
   - Sends push notifications in batches
   - Rate-limited to prevent spam
   - Tracks delivery status

3. **maintenance-health-check**
   - Trigger: Cron (every 5 minutes)
   - Checks system health
   - Reports to Sentry on failure
   - Updates health status in database

**Priority 2 Jobs (Next Sprint):**

4. **season-rollover**
   - Trigger: Scheduled when season ends
   - Archives old season data
   - Creates new season
   - Migrates users with grace period

5. **economy-reconcile**
   - Trigger: Cron (hourly)
   - Checks wallet balances
   - Detects discrepancies
   - Generates reports

6. **ai-session-summary**
   - Trigger: Webhook after session completion
   - Generates AI summary
   - Updates user profile
   - Limited to premium users

---

## Job Design Rules

### 1. Every Job Must Define

```typescript
interface JobDefinition<Input, Output> {
  // Identification
  id: string;                    // Unique job ID
  name: string;                  // Human-readable name
  category: JobCategory;         // Domain grouping
  
  // Contracts
  inputSchema: ZodSchema<Input>;  // Validated input
  outputSchema: ZodSchema<Output>; // Expected output
  
  // Resilience
  retryConfig: RetryConfig;      // Explicit retry rules
  timeoutSeconds: number;        // Hard timeout
  
  // Observability
  sentryEnabled: boolean;        // Error tracking
  logLevel: LogLevel;            // Logging granularity
}
```

### 2. Job Trigger Logic Must Be Separate

**WRONG:**
```typescript
// UI component triggering job directly
function ClaimButton() {
  const onPress = async () => {
    await triggerJob('claim-reward', { userId }); // ❌ NO
  }
}
```

**CORRECT:**
```typescript
// UI calls service
function ClaimButton() {
  const onPress = async () => {
    await claimReward(userId); // Service handles it
  }
}

// Service may enqueue job if needed
async function claimReward(userId: string) {
  const result = await processClaim(userId);
  if (result.needsBackgroundWork) {
    await enqueueJob('process-reward', result.payload);
  }
  return result;
}
```

### 3. Group Jobs by Domain

```
jobs/
├── seasons/          # All season-related jobs
├── challenges/       # Challenge jobs
├── battle-pass/      # Battle pass jobs
├── notifications/    # Notification jobs
├── ai/              # AI workflow jobs
├── maintenance/     # System maintenance
└── economy/         # Economy/rewards jobs
```

### 4. Idempotency Strategy

Every job must declare its idempotency approach:

- **Idempotent by nature**: Read-only operations
- **Idempotent via key**: Pass idempotency key in payload
- **Idempotent via state check**: Check if work already done
- **Not idempotent**: Document why and handle carefully

```typescript
// Idempotent via key
export const processPayment = job({
  id: 'process-payment',
  inputSchema: z.object({
    paymentId: z.string(),
    idempotencyKey: z.string(), // Required
  }),
  handler: async (input, io) => {
    // Check if already processed
    const existing = await io.runTask('check-existing', async () => {
      return db.payments.findByIdempotencyKey(input.idempotencyKey);
    });
    
    if (existing) return existing;
    
    // Process new payment
    return io.runTask('process-payment', async () => {
      return processNewPayment(input);
    });
  },
});
```

---

## Testing Rules

### Required Tests for Every Job

1. **Payload Validation**
   ```typescript
   it('validates input payload', async () => {
     await expect(runJob('my-job', { invalid: 'data' }))
       .rejects.toThrow(JobValidationError);
   });
   ```

2. **Retryable Failure Paths**
   ```typescript
   it('retries on network errors', async () => {
     mockNetworkFailure(2); // Fail twice
     const result = await runJob('my-job', payload);
     expect(result.attemptCount).toBe(3);
     expect(result.success).toBe(true);
   });
   ```

3. **Idempotency-Critical Flows**
   ```typescript
   it('is idempotent with same key', async () => {
     const key = 'idempotent-key-123';
     await runJob('my-job', { ...payload, idempotencyKey: key });
     await runJob('my-job', { ...payload, idempotencyKey: key });
     expect(db.calls).toHaveLength(1); // Only processed once
   });
   ```

4. **Scheduling Logic**
   ```typescript
   it('triggers at scheduled time', async () => {
     const job = getScheduledJob('daily-refresh');
     expect(job.schedule).toBe('0 0 * * *');
   });
   ```

---

## Quality Rules

### Forbidden Patterns

| ❌ Forbidden | ✅ Correct Approach |
|-------------|-------------------|
| Jobs hidden in UI actions | Explicit job triggers from services |
| Hardcoded retries without explanation | Documented retryConfig with justification |
| Jobs without typed payloads | Zod schemas for all inputs/outputs |
| Jobs without failure visibility | Sentry reporting + job status tracking |
| Direct client → Trigger.dev calls | Client → Supabase → Job (indirect) |
| Secrets in job payload logging | Redacted logging of sensitive fields |
| Infinite retries | maxAttempts with circuit breaker |
| Uncaught async errors | try/catch with error categorization |

---

## Manual Setup Required

### 1. Trigger.dev Dashboard Setup

After creating the job files, you must:

1. **Create Trigger.dev Project**
   - Visit https://trigger.dev
   - Create new project "vex-liveops"
   - Note the Project ID and API Key

2. **Configure Environment**
   - Add environment variables to Trigger.dev dashboard
   - Set up staging and production environments
   - Configure secret encryption

3. **Deploy Jobs**
   ```bash
   npx trigger.dev@latest deploy
   ```

4. **Verify Jobs**
   - Check jobs appear in dashboard
   - Test run a simple job
   - Verify logs flow to Sentry

### 2. Supabase Webhook Setup

1. **Create Webhook Handler**
   - Deploy `supabase/functions/trigger-webhook-handler`
   - Configure webhook URL in Supabase dashboard
   - Set webhook secret for verification

2. **Configure Database Webhooks**
   - Set up webhooks for relevant tables
   - Filter events to reduce noise
   - Test webhook delivery

### 3. Sentry Integration

1. **Create Sentry Project**
   - Create new project for Trigger.dev workers
   - Get DSN
   - Configure alert rules

2. **Test Error Reporting**
   - Trigger a failing job
   - Verify error appears in Sentry
   - Check context and breadcrumbs

---

## Files Created

| File | Purpose |
|------|---------|
| `shared/jobs/job-types.ts` | Core job type definitions |
| `shared/jobs/job-events.ts` | Job event type definitions |
| `shared/jobs/job-constants.ts` | Job constants (retry configs, timeouts, etc.) |
| `jobs.md` | This document - complete integration plan |

---

## Next Steps (Manual)

1. **Create Supabase Edge Function** for webhook handling
2. **Install Trigger.dev SDK** in server-side package
3. **Create first job file** (`jobs/challenges/daily-refresh.ts`)
4. **Set up environment variables** in deployment environment
5. **Test end-to-end flow**: DB change → Webhook → Job → Result
6. **Add Sentry integration** to job runner
7. **Create monitoring dashboard** for job health

---

## Security Checklist

- [ ] Trigger.dev API keys only in server environment
- [ ] No Trigger.dev imports in Expo client code
- [ ] Webhook secrets configured and verified
- [ ] Job payloads sanitized before logging
- [ ] Sensitive data redacted in job logs
- [ ] Rate limiting configured for job triggers
- [ ] Authentication/authorization on job triggers
- [ ] Audit logging for critical jobs

---

## Recommended First Jobs for VEX

### Immediate (Week 1)

1. **`challenge-daily-refresh`**
   - Schedule: Daily at 00:00 UTC
   - Input: `{ seasonId: string }`
   - Output: `{ generated: number, assigned: number }`
   - Purpose: Generate and assign daily challenges

2. **`notification-batch-send`**
   - Trigger: Supabase webhook on `notifications` table INSERT
   - Input: `{ notificationIds: string[], priority: string }`
   - Output: `{ sent: number, failed: number }`
   - Purpose: Send push notifications with rate limiting

3. **`maintenance-health-check`**
   - Schedule: Every 5 minutes
   - Input: `{}`
   - Output: `{ status: 'healthy' \| 'degraded' \| 'unhealthy', checks: CheckResult[] }`
   - Purpose: Monitor system health

### Short-term (Week 2-3)

4. **`season-rollover`**
   - Trigger: Scheduled when season end date reached
   - Input: `{ seasonId: string, gracePeriodDays: number }`
   - Output: `{ archivedId: string, newId: string, migrated: number }`
   - Purpose: End season, archive data, start new season

5. **`challenge-expiry-cleanup`**
   - Schedule: Daily at 01:00 UTC
   - Input: `{ cutoffDate: string }`
   - Output: `{ expired: number, cleaned: number }`
   - Purpose: Clean up expired challenge assignments

6. **`economy-reconcile`**
   - Schedule: Hourly
   - Input: `{ userIds?: string[], fixDiscrepancies: boolean }`
   - Output: `{ checked: number, discrepancies: number, fixed: number }`
   - Purpose: Detect and fix wallet discrepancies

### Future (Month 2+)

7. **`ai-session-summary`**
   - Trigger: Webhook on `sessions` table UPDATE (completed)
   - Input: `{ sessionId: string, userId: string }`
   - Output: `{ summary: string, tokensUsed: number }`
   - Purpose: Generate AI session summaries for premium users

8. **`analytics-aggregate`**
   - Schedule: Daily at 02:00 UTC
   - Input: `{ date: string, dimensions: string[] }`
   - Output: `{ recordsCreated: number }`
   - Purpose: Aggregate daily analytics

---

## Questions & Decisions

### Where should Trigger.dev jobs physically live?

**Options:**
1. **Supabase Edge Functions** (Deno) - Serverless, close to data
2. **Separate Node.js service** - Full Node.js ecosystem
3. **Vercel/Netlify Edge** - Serverless, separate from Supabase

**Recommendation:** Start with Supabase Edge Functions for webhook handlers, use separate Node.js service for complex jobs if needed.

### How does frontend know job status?

**Pattern:**
1. Frontend calls Supabase RPC to trigger job
2. RPC returns `jobRunId`
3. Frontend polls Supabase table `job_runs` for status
4. Or uses Supabase Realtime to subscribe to status changes

### What if Trigger.dev is down?

**Fallback Strategy:**
1. Queue jobs in Supabase table `pending_jobs`
2. Retry logic in webhook handler
3. Alert on-call if queue grows
4. Manual job replay capability

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-18 | Codeium | Initial plan |

---

**END OF DOCUMENT**
