import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { buildCorsHeaders, withCorsHeaders } from '../_shared/cors.ts';
import { SubmitContentSchema, GenerateStudyPlanSchema, SubmitFeedbackSchema, type StudyTask, type QuizItem, type SessionPlan, type RawStudyTask, type RawQuizItem, type RawStudyPlanResponse, type RawSessionPlan } from './schemas.ts';
import { extractFromYouTube, extractFromPDF, generateStudyPlan } from './extractors.ts';

const MAX_CONTENT_LENGTH = 50000;
const DAILY_GENERATION_LIMIT = 10;

function buildStudyPlanPrompt(content: string, title?: string): string {
  const safeContent = content.slice(0, MAX_CONTENT_LENGTH);
  const safeTitle = title || 'Study Material';
  return `You are an expert study planner. Analyze the following content and create a comprehensive study plan.

CONTENT TITLE: ${safeTitle}

CONTENT:
${safeContent}

Generate a JSON response with the following structure:
{
  "summary": "2-3 sentence overview of the main topics",
  "keyConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "tasks": [
    { "id": "task-1", "content": "Specific actionable study task", "estimatedMinutes": 15, "priority": "HIGH|MEDIUM|LOW", "dependsOn": ["task-0"] }
  ],
  "quizItems": [
    { "id": "quiz-1", "question": "Clear question about the content", "answer": "Correct answer", "options": ["option1"], "explanation": "Why this answer is correct", "difficulty": "EASY|MEDIUM|HARD", "conceptTag": "which key concept this tests" }
  ],
  "sessionPlan": { "recommendedDuration": 1800, "recommendedSessions": 2, "breakIntervalMinutes": 25, "suggestedDifficulty": "NORMAL", "focusAreas": ["priority topic 1"] }
}`;
}

function mapStudyTask(t: RawStudyTask, i: number): StudyTask {
  const priority: StudyTask['priority'] = t.priority === 'HIGH' || t.priority === 'MEDIUM' || t.priority === 'LOW' ? t.priority : 'MEDIUM';
  return {
    id: typeof t.id === 'string' ? t.id : `task-${i}`,
    content: typeof t.content === 'string' ? t.content : 'Review content',
    estimatedMinutes: Math.min(Math.max(typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : 15, 5), 60),
    priority,
    dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn.filter((item): item is string => typeof item === 'string') : [],
  };
}

function mapQuizItem(q: RawQuizItem, i: number): QuizItem {
  const difficulty: QuizItem['difficulty'] = q.difficulty === 'EASY' || q.difficulty === 'MEDIUM' || q.difficulty === 'HARD' ? q.difficulty : 'MEDIUM';
  return {
    id: typeof q.id === 'string' ? q.id : `quiz-${i}`,
    question: typeof q.question === 'string' ? q.question : 'Review the content',
    answer: typeof q.answer === 'string' ? q.answer : 'See content',
    options: Array.isArray(q.options) ? q.options.filter((item): item is string => typeof item === 'string') : [],
    explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
    difficulty,
    conceptTag: typeof q.conceptTag === 'string' ? q.conceptTag : 'general',
  };
}

function mapSessionPlan(raw: RawSessionPlan): SessionPlan {
  return {
    recommendedDuration: Math.min(Math.max(typeof raw.recommendedDuration === 'number' ? raw.recommendedDuration : 1800, 600), 7200),
    recommendedSessions: Math.min(Math.max(typeof raw.recommendedSessions === 'number' ? raw.recommendedSessions : 1, 1), 5),
    breakIntervalMinutes: Math.min(Math.max(typeof raw.breakIntervalMinutes === 'number' ? raw.breakIntervalMinutes : 25, 15), 60),
    suggestedDifficulty: raw.suggestedDifficulty === 'EASY' || raw.suggestedDifficulty === 'NORMAL' || raw.suggestedDifficulty === 'CHALLENGING' ? raw.suggestedDifficulty : 'NORMAL',
    focusAreas: Array.isArray(raw.focusAreas) ? raw.focusAreas.filter((item): item is string => typeof item === 'string') : [],
  };
}

function parseStudyPlanResponse(text: string): { tasks: StudyTask[]; quizItems: QuizItem[]; sessionPlan: SessionPlan; summary: string; keyConcepts: string[] } {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned) as RawStudyPlanResponse;
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const rawQuizItems = Array.isArray(parsed.quizItems) ? parsed.quizItems : [];
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Study material ready',
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.filter((item): item is string => typeof item === 'string') : [],
      tasks: rawTasks.map(mapStudyTask),
      quizItems: rawQuizItems.map(mapQuizItem),
      sessionPlan: mapSessionPlan(parsed.sessionPlan ?? {}),
    };
  } catch {
    return {
      summary: 'Study the provided content thoroughly',
      keyConcepts: ['Main topic'],
      tasks: [
        { id: 'task-1', content: 'Read through the content carefully', estimatedMinutes: 15, priority: 'HIGH' },
        { id: 'task-2', content: 'Identify and note key concepts', estimatedMinutes: 10, priority: 'HIGH' },
        { id: 'task-3', content: 'Review and summarize main points', estimatedMinutes: 15, priority: 'MEDIUM' },
      ],
      quizItems: [
        { id: 'quiz-1', question: 'What is the main topic of this content?', answer: 'See content for details', difficulty: 'MEDIUM', conceptTag: 'general' },
        { id: 'quiz-2', question: 'What are the key concepts discussed?', answer: 'See content for details', difficulty: 'MEDIUM', conceptTag: 'general' },
        { id: 'quiz-3', question: 'What conclusions can you draw from this material?', answer: 'See content for details', difficulty: 'HARD', conceptTag: 'general' },
      ],
      sessionPlan: { recommendedDuration: 1800, recommendedSessions: 1, breakIntervalMinutes: 25, suggestedDifficulty: 'NORMAL', focusAreas: ['Understanding main concepts'] },
    };
  }
}

async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<{ canGenerate: boolean; remaining: number }> {
  const { data, error } = await supabase.rpc('check_daily_generation_limit', { p_user_id: userId, p_limit: DAILY_GENERATION_LIMIT });
  if (error || !data) return { canGenerate: true, remaining: DAILY_GENERATION_LIMIT };
  return { canGenerate: data[0]?.can_generate ?? true, remaining: data[0]?.remaining ?? 0 };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

async function handleSubmit(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const body = await req.json();
  const validated = SubmitContentSchema.parse(body);
  const { data: content, error } = await supabase.from('study_content').insert({
    user_id: userId, source_type: validated.type,
    source_url: validated.type === 'YOUTUBE' ? validated.content : null,
    original_filename: validated.filename || null,
    title: validated.title || null,
    extracted_text: validated.type === 'PASTE' ? validated.content : '',
    extracted_length: validated.type === 'PASTE' ? validated.content.length : 0,
    status: validated.type === 'PASTE' ? 'EXTRACTED' : 'PENDING',
    extracted_at: validated.type === 'PASTE' ? new Date().toISOString() : null,
  }).select().single();
  if (error || !content) return json({ success: false, error: `Failed: ${error?.message}` }, 400);
  return json({ success: true, contentId: content.id, status: content.status, message: validated.type === 'PASTE' ? 'Content ready' : 'Submitted for extraction' }, 200);
}

async function handleExtract(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const { contentId } = await req.json();
  if (!contentId) return json({ success: false, error: 'contentId required' }, 400);
  const { data: content, error } = await supabase.from('study_content').select('*').eq('id', contentId).eq('user_id', userId).single();
  if (error || !content) return json({ success: false, error: 'Content not found' }, 400);
  await supabase.from('study_content').update({ status: 'EXTRACTING' }).eq('id', contentId);
  try {
    let extractedText = '';
    if (content.source_type === 'YOUTUBE') extractedText = await extractFromYouTube(content.source_url!);
    else if (content.source_type === 'PDF') extractedText = await extractFromPDF(content.storage_path!, supabase);
    else throw new Error(`Unsupported type: ${content.source_type}`);
    await supabase.from('study_content').update({ extracted_text: extractedText, extracted_length: extractedText.length, status: 'EXTRACTED', extracted_at: new Date().toISOString() }).eq('id', contentId);
    return json({ success: true, contentId, extractedLength: extractedText.length, status: 'EXTRACTED' });
  } catch (e) {
    await supabase.from('study_content').update({ status: 'FAILED', error_message: e instanceof Error ? e.message : 'Extraction failed' }).eq('id', contentId);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown' }, 400);
  }
}

async function handleGenerate(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const startTime = Date.now();
  const body = await req.json();
  const validated = GenerateStudyPlanSchema.parse(body);
  const { canGenerate, remaining } = await checkRateLimit(supabase, userId);
  if (!canGenerate) return json({ success: false, error: `Daily limit reached (${DAILY_GENERATION_LIMIT}/day)`, remaining: 0 }, 429);
  const { data: content, error: contentError } = await supabase.from('study_content').select('*').eq('id', validated.contentId).eq('user_id', userId).single();
  if (contentError || !content) return json({ success: false, error: 'Content not found' }, 400);
  if (content.status !== 'EXTRACTED' && content.status !== 'READY') return json({ success: false, error: `Not ready: ${content.status}` }, 400);
  await supabase.from('study_content').update({ status: 'PROCESSING' }).eq('id', validated.contentId);
  try {
    const textToProcess = content.is_user_edited && content.user_edited_text ? content.user_edited_text : content.extracted_text;
    const prompt = buildStudyPlanPrompt(textToProcess, content.title || undefined);
    const geminiResponse = await generateStudyPlan(textToProcess, content.title || undefined);
    const parsed = parseStudyPlanResponse(geminiResponse);
    const { data: generation, error: genError } = await supabase.from('study_generations').insert({
      content_id: validated.contentId, user_id: userId, model: 'gemini-2.5-pro', processing_time_ms: Date.now() - startTime,
      summary: parsed.summary, key_concepts: parsed.keyConcepts, tasks: parsed.tasks, quiz_items: parsed.quizItems, session_plan: parsed.sessionPlan,
    }).select().single();
    if (genError) throw new Error(`Save failed: ${genError.message}`);
    await supabase.from('study_content').update({ status: 'READY', generation_count_today: supabase.rpc('increment'), last_generation_date: new Date().toISOString().split('T')[0] }).eq('id', validated.contentId);
    return json({ success: true, generationId: generation.id, contentId: validated.contentId, summary: parsed.summary, keyConcepts: parsed.keyConcepts, tasks: parsed.tasks, quizItems: parsed.quizItems, sessionPlan: parsed.sessionPlan, remaining: remaining - 1 });
  } catch (e) {
    await supabase.from('study_content').update({ status: 'FAILED' }).eq('id', validated.contentId);
    return json({ success: false, error: e instanceof Error ? e.message : 'Unknown' }, 400);
  }
}

async function handleStatus(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const contentId = new URL(req.url).pathname.split('/').pop();
  if (!contentId) return json({ success: false, error: 'contentId required' }, 400);
  const { data: content, error } = await supabase.from('study_content').select('*, study_generations(*)').eq('id', contentId).eq('user_id', userId).single();
  if (error || !content) return json({ success: false, error: 'Not found' }, 400);
  return json({ success: true, contentId: content.id, status: content.status, extractedLength: content.extracted_length, errorMessage: content.error_message, generation: content.study_generations?.[0] || null });
}

async function handleFeedback(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const body = await req.json();
  const validated = SubmitFeedbackSchema.parse(body);
  const { error } = await supabase.from('study_generations').update({ user_rating: validated.rating, was_helpful: validated.wasHelpful }).eq('id', validated.generationId).eq('user_id', userId);
  if (error) return json({ success: false, error: error.message }, 400);
  return json({ success: true });
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ success: false, error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/content-study', '').replace(/^\//, '');
    if (req.method === 'POST' && path === 'submit') return withCorsHeaders(await handleSubmit(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && path === 'extract') return withCorsHeaders(await handleExtract(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && path === 'generate') return withCorsHeaders(await handleGenerate(req, supabase, user.id), corsHeaders);
    if (req.method === 'GET' && path.startsWith('status/')) return withCorsHeaders(await handleStatus(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && path === 'feedback') return withCorsHeaders(await handleFeedback(req, supabase, user.id), corsHeaders);
    return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
