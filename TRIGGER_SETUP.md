# Trigger.dev Setup Guide

## Installation

### 1. Install Trigger.dev SDK

```bash
# Install the SDK
npm install @trigger.dev/sdk

# Install additional dependencies for jobs
npm install @sentry/node zod
```

### 2. Environment Variables

Add to your `.env.server` file (NEVER in client code):

```bash
# Trigger.dev (server-side only)
TRIGGER_SECRET_KEY=tr_dev_your_secret_key_here
TRIGGER_PROJECT_REF=proj_your_project_ref_here
TRIGGER_API_URL=https://api.trigger.dev
TRIGGER_LOG_LEVEL=info

# Supabase (for jobs to access)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry (for error tracking in jobs)
SENTRY_DSN=https://your-sentry-dsn
```

### 3. Create Supabase Edge Function Entry Point

Create `supabase/functions/trigger-jobs/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { configure, handleRequest } from 'npm:@trigger.dev/sdk@latest';

// Configure Trigger.dev
configure({
  apiKey: Deno.env.get('TRIGGER_SECRET_KEY')!,
  project: Deno.env.get('TRIGGER_PROJECT_REF')!,
  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
});

// Import all jobs
import '../../../jobs/challenges/daily-refresh.ts';
import '../../../jobs/notifications/batch-send.ts';
import '../../../jobs/maintenance/health-check.ts';

serve(async (req) => {
  return await handleRequest(req);
});
```

### 4. Deploy Supabase Function

```bash
# Deploy the edge function
supabase functions deploy trigger-jobs

# Set secrets
supabase secrets set TRIGGER_SECRET_KEY=tr_dev_xxx
supabase secrets set TRIGGER_PROJECT_REF=proj_xxx
supabase secrets set TRIGGER_API_URL=https://api.trigger.dev
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_SERVICE_KEY=xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
supabase secrets set SENTRY_DSN=xxx
```

### 5. Configure Trigger.dev Dashboard

1. Go to https://trigger.dev
2. Create a new project
3. Note the Project ID and API Key
4. Add webhook endpoint: `https://your-project.supabase.co/functions/v1/trigger-jobs`

### 6. Deploy Jobs

```bash
# Option 1: Deploy via Trigger.dev CLI (if using Node.js runtime)
npx trigger.dev@latest deploy --project-ref proj_xxx

# Option 2: Via Supabase Edge Functions (recommended for this setup)
# The edge function entry point handles job registration
supabase functions deploy trigger-jobs
```

## Job Structure

### Job Files Created

```
jobs/
├── index.ts                    # Job exports
├── trigger.config.ts          # SDK configuration
├── challenges/
│   └── daily-refresh.ts       # Daily challenge generation
├── notifications/
│   └── batch-send.ts          # Batch push notifications
└── maintenance/
    └── health-check.ts        # System health monitoring
```

### Running Jobs

#### Schedule Triggers
Jobs run automatically based on their cron schedule:
- `challenge-daily-refresh`: Every day at 00:00 UTC
- `maintenance-health-check`: Every 5 minutes

#### Manual Trigger
Trigger a job manually from code:

```typescript
import { sendEvent } from '@trigger.dev/sdk';

// Trigger notification batch
await sendEvent({
  id: 'notification-batch-send',
  payload: {
    userIds: ['user-1', 'user-2'],
    title: 'New Challenge Available!',
    body: 'Check out your daily challenges',
  },
});
```

## Testing Jobs

### Local Testing with Trigger.dev CLI

```bash
# Login to Trigger.dev
npx trigger.dev@latest login

# Dev server (watches for changes)
npx trigger.dev@latest dev --project-ref proj_xxx
```

### Test Job Execution

```bash
# Trigger a job manually via CLI
npx trigger.dev@latest trigger challenge-daily-refresh \
  --payload '{"seasonId": "test-season-id"}'
```

## Monitoring

### View Job Runs

1. Trigger.dev Dashboard: https://trigger.dev
2. Select your project
3. View "Runs" tab for execution history

### Sentry Integration

Jobs automatically report errors to Sentry:
- Job failures
- Task failures
- Exceptions in run functions

### Logging

Jobs use structured logging via `io.logger`:
- `io.logger.info()` - General information
- `io.logger.error()` - Errors
- `io.logger.warn()` - Warnings

Logs are viewable in Trigger.dev dashboard.

## Troubleshooting

### "Cannot find module '@trigger.dev/sdk'"

The SDK needs to be installed:
```bash
npm install @trigger.dev/sdk
```

### Jobs not appearing in dashboard

1. Verify `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_REF` are correct
2. Ensure jobs are imported in the entry point
3. Redeploy the edge function

### Jobs failing with timeout

Increase timeout in job definition:
```typescript
export const myJob = job({
  id: 'my-job',
  timeout: '30m', // or number in seconds
  // ...
});
```

## Next Steps

1. ✅ Install SDK: `npm install @trigger.dev/sdk`
2. ✅ Set environment variables
3. ✅ Deploy Supabase edge function
4. ✅ Configure webhooks in Trigger.dev dashboard
5. ✅ Test job execution
6. Add more jobs as needed:
   - `jobs/seasons/rollover.ts`
   - `jobs/economy/reconcile.ts`
   - `jobs/ai/session-summary.ts`

## Additional Jobs to Implement

### Season Rollover Job
Create `jobs/seasons/rollover.ts`:
```typescript
export const seasonRollover = job({
  id: 'season-rollover',
  trigger: { type: 'schedule', cron: '0 0 * * *' },
  // ... implementation
});
```

### Economy Reconciliation Job
Create `jobs/economy/reconcile.ts`:
```typescript
export const economyReconcile = job({
  id: 'economy-reconcile',
  trigger: { type: 'schedule', cron: '0 * * * *' },
  // ... implementation
});
```

Refer to existing jobs for implementation patterns.
