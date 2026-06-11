1|     2|import { z } from 'npm:zod';
3|
4|import { configure } from 'npm:@trigger.dev/sdk@latest';
5|import { finalizeSeasonTask } from '../../../jobs/seasons/finalize-season.ts';
6|import { buildCorsHeaders, jsonWithCors } from '../_shared/cors.ts';
7|
8|configure({
9|  apiKey: Deno.env.get('TRIGGER_SECRET_KEY') ?? '',
10|  project: Deno.env.get('TRIGGER_PROJECT_REF') ?? '',
11|  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
12|  logLevel: 'info',
13|});
14|
15|const BodySchema = z.object({
16|  seasonId: z.string().uuid(),
17|});
18|
19|Deno.serve(async (req) => {
20|  const corsHeaders = buildCorsHeaders(req);
21|
22|  if (req.method === 'OPTIONS') {
23|    return new Response('ok', { headers: corsHeaders });
24|  }
25|
26|  try {
27|    const body = BodySchema.parse(await req.json());
28|    const handle = await finalizeSeasonTask.trigger(body, {
29|      idempotencyKey: `season-finalize:${body.seasonId}`,
30|    });
31|
32|    return jsonWithCors(req, { success: true, runId: handle.id }, 200);
33|  } catch (error) {
34|    console.error('season-finalize failed:', error);
35|    return jsonWithCors(
36|      req,
37|      {
38|        success: false,
39|        message: 'Season finalization failed. Please try again.',
40|      },
41|      500,
42|    );
43|  }
44|});
45|