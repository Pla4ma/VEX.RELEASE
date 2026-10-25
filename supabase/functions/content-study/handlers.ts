/**
 * Content Study Handlers
 *
 * Request handlers and helper functions for the content-study edge function.
 * Extracted from index.ts for file size compliance.
 */

import type { ContentStudyClient } from './supabase-client.ts';
import { GenerateStudyPlanSchema, StudyPlanModelResponseSchema, SubmitFeedbackSchema, type StudyTask, type QuizItem, type SessionPlan, type RawStudyTask, type RawQuizItem, type RawSessionPlan } from './schemas.ts';
import { generateStudyPlan } from './study-plan-generator.ts';
import { STUDY_CONTENT_COLUMNS_STR, STUDY_CONTENT_WITH_GENERATIONS } from './columns.ts';
import { json } from './responses.ts';
import { normalizeStudyContentJson, type ContentStudyDatabase } from './database.ts';
export { handleExtract } from './handlers-extract.ts';
export { handleSubmit } from './handlers-submit.ts';
const DAILY_GENERATION_LIMIT = 10;



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

export function parseStudyPlanResponse(text: string): { tasks: StudyTask[]; quizItems: QuizItem[]; sessionPlan: SessionPlan; summary: string; keyConcepts: string[] } {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = StudyPlanModelResponseSchema.parse(JSON.parse(cleaned));
  return {
    summary: parsed.summary,
    keyConcepts: parsed.keyConcepts,
    tasks: parsed.tasks.map(mapStudyTask),
    quizItems: parsed.quizItems.map(mapQuizItem),
    sessionPlan: mapSessionPlan(parsed.sessionPlan ?? {}),
  };
}

async function checkRateLimit(supabase: ContentStudyClient, userId: string): Promise<{ canGenerate: boolean; remaining: number }> {
  const { data, error } = await supabase.rpc('check_daily_generation_limit', { p_user_id: userId, p_limit: DAILY_GENERATION_LIMIT });
  if (error) throw new Error('Study generation limit check failed');
  const limit = data?.[0];
  if (!limit || typeof limit.can_generate !== 'boolean' || typeof limit.remaining !== 'number') {
    throw new Error('Study generation limit check returned no result');
  }
  return { canGenerate: limit.can_generate, remaining: limit.remaining };
}

export { json };

export async function handleGenerate(req: Request, supabase: ContentStudyClient, userId: string): Promise<Response> {
  const startTime = Date.now();
  const body = await req.json();
  const validated = GenerateStudyPlanSchema.parse(body);
  let rateLimit: { canGenerate: boolean; remaining: number };
  try {
    rateLimit = await checkRateLimit(supabase, userId);
  } catch {
    return json({ success: false, error: 'Study generation is temporarily unavailable. Please try again.' }, 503);
  }
  const { canGenerate, remaining } = rateLimit;
  if (!canGenerate) return json({ success: false, error: `Daily limit reached (${DAILY_GENERATION_LIMIT}/day)`, remaining: 0 }, 429);
  const { data: content, error: contentError } = await supabase.from('study_content').select(STUDY_CONTENT_COLUMNS_STR).eq('id', validated.contentId).eq('user_id', userId).single();
  if (contentError || !content) return json({ success: false, error: 'Content not found' }, 400);
  if (content.status !== 'EXTRACTED' && content.status !== 'READY') return json({ success: false, error: `Not ready: ${content.status}` }, 400);
  await supabase.from('study_content').update({ status: 'PROCESSING' }).eq('id', validated.contentId);
  try {
    const textToProcess = content.is_user_edited && content.user_edited_text ? content.user_edited_text : content.extracted_text;
    const generationResult = await generateStudyPlan(textToProcess, content.title || undefined);
    const parsed = parseStudyPlanResponse(generationResult.content);
    const generationInput: ContentStudyDatabase['public']['Tables']['study_generations']['Insert'] = {
      content_id: validated.contentId, user_id: userId, model: generationResult.model, processing_time_ms: Date.now() - startTime,
      summary: parsed.summary,
      key_concepts: parsed.keyConcepts,
      tasks: normalizeStudyContentJson(parsed.tasks),
      quiz_items: normalizeStudyContentJson(parsed.quizItems),
      session_plan: normalizeStudyContentJson(parsed.sessionPlan),
      is_llm_generated: true,
    };
    const { data: generation, error: genError } = await supabase.from('study_generations').insert(generationInput).select().single();
    if (genError) {
      throw new Error('Failed to save study generation');
    }
    await supabase.from('study_content').update({ status: 'READY', generation_count_today: remaining - 1, last_generation_date: new Date().toISOString().split('T')[0] }).eq('id', validated.contentId);
    return json({ success: true, generationId: generation.id, contentId: validated.contentId, summary: parsed.summary, keyConcepts: parsed.keyConcepts, tasks: parsed.tasks, quizItems: parsed.quizItems, sessionPlan: parsed.sessionPlan, remaining: remaining - 1 });
  } catch (e) {
    await supabase.from('study_content').update({ status: 'FAILED' }).eq('id', validated.contentId);
    return json({ success: false, error: 'Study plan generation failed. Please try again.' }, 400);
  }
}

export async function handleStatus(req: Request, supabase: ContentStudyClient, userId: string): Promise<Response> {
  const contentId = new URL(req.url).pathname.split('/').pop();
  if (!contentId) return json({ success: false, error: 'contentId required' }, 400);
  const { data: content, error } = await supabase.from('study_content').select(STUDY_CONTENT_WITH_GENERATIONS).eq('id', contentId).eq('user_id', userId).single();
  if (error || !content) return json({ success: false, error: 'Not found' }, 400);
  return json({ success: true, contentId: content.id, status: content.status, extractedLength: content.extracted_length, errorMessage: content.error_message, generation: content.study_generations?.[0] || null });
}

export async function handleFeedback(req: Request, supabase: ContentStudyClient, userId: string): Promise<Response> {
  const body = await req.json();
  const validated = SubmitFeedbackSchema.parse(body);
  const { error } = await supabase.from('study_generations').update({ user_rating: validated.rating, was_helpful: validated.wasHelpful }).eq('id', validated.generationId).eq('user_id', userId);
  if (error) return json({ success: false, error: 'Failed to save feedback.' }, 400);
  return json({ success: true });
}
