1|/**
2| * Trigger.dev Edge Function Entry Point
3| *
4| * Supabase Edge Function that serves as the webhook handler for Trigger.dev jobs.
5| * Deploy with: supabase functions deploy trigger-jobs
6| */
7|
8|     9|import { configure, handleRequest } from 'npm:@trigger.dev/sdk@latest';
10|import {
11|  buildCorsHeaders,
12|  withCorsHeaders,
13|  jsonWithCors,
14|} from '../_shared/cors.ts';
15|
16|type TriggerLogLevel = 'debug' | 'info' | 'warn' | 'error';
17|
18|function resolveTriggerLogLevel(value: string | null): TriggerLogLevel {
19|  return value === 'debug' ||
20|    value === 'info' ||
21|    value === 'warn' ||
22|    value === 'error'
23|    ? value
24|    : 'info';
25|}
26|
27|// Configure Trigger.dev SDK
28|configure({
29|  apiKey: Deno.env.get('TRIGGER_SECRET_KEY')!,
30|  project: Deno.env.get('TRIGGER_PROJECT_REF')!,
31|  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
32|  logLevel: resolveTriggerLogLevel(Deno.env.get('TRIGGER_LOG_LEVEL')),
33|});
34|
35|// Import all job definitions
36|// These imports register the jobs with Trigger.dev
37|import '../../../jobs/challenges/daily-refresh.ts';
38|import '../../../jobs/notifications/batch-send.ts';
39|import '../../../jobs/maintenance/health-check.ts';
40|import '../../../jobs/seasons/finalize-season.ts';
41|
42|/**
43| * Handle incoming requests
44| */
45|Deno.serve(async (req) => {
46|  // CORS headers for webhook access
47|  const corsHeaders = buildCorsHeaders(req);
48|
49|  // Handle CORS preflight
50|  if (req.method === 'OPTIONS') {
51|    return new Response('ok', { headers: corsHeaders });
52|  }
53|
54|  try {
55|    // Let Trigger.dev handle the request
56|    const response = await handleRequest(req);
57|
58|    // Add CORS headers to response
59|    return withCorsHeaders(response, corsHeaders);
60|  } catch (error) {
61|    console.error('trigger-jobs failed:', error);
62|    return jsonWithCors(
63|      req,
64|      {
65|        error: 'Internal server error',
66|        message: 'Job processing failed. Please try again.',
67|      },
68|      500,
69|    );
70|  }
71|});
72|