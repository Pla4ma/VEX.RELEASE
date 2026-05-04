// ============================================================================
// Content Study Edge Function
// V1 Implementation
// 
// Endpoints:
// - POST /submit          Submit content (paste/pdf/youtube)
// - POST /extract         Extract text from content (pdf/youtube)
// - POST /generate        Generate study plan with AI
// - GET  /status/:id      Check generation status
// - POST /feedback        Submit user feedback on generation
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://esm.sh/zod@3.22.4';

// ============================================================================
// Types & Schemas
// ============================================================================

const SubmitContentSchema = z.object({
  type: z.enum(['PASTE', 'PDF', 'YOUTUBE']),
  content: z.string(),
  title: z.string().optional(),
  filename: z.string().optional(),
});

const GenerateStudyPlanSchema = z.object({
  contentId: z.string().uuid(),
});

const SubmitFeedbackSchema = z.object({
  generationId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  wasHelpful: z.boolean().optional(),
});

interface StudyTask {
  id: string;
  content: string;
  estimatedMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dependsOn?: string[];
}

interface QuizItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  conceptTag: string;
}

interface SessionPlan {
  recommendedDuration: number;
  recommendedSessions: number;
  breakIntervalMinutes: number;
  suggestedDifficulty: 'EASY' | 'NORMAL' | 'CHALLENGING';
  focusAreas: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_MODEL = 'gemini-2.5-pro';
const MAX_PDF_PAGES = 100;
const MAX_CONTENT_LENGTH = 50000; // ~12k tokens
const DAILY_GENERATION_LIMIT = 10;

// ============================================================================
// Gemini API Client
// ============================================================================

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          topP: 0.95,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================================
// Content Extraction
// ============================================================================

async function extractFromYouTube(url: string): Promise<string> {
  // Extract video ID from various YouTube URL formats
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL');
  }
  
  const videoId = videoIdMatch[1];
  
  // Try to fetch captions via YouTube's timedtext endpoint
  // This is a simplified approach - in production, use a proper transcript API
  try {
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    if (!response.ok) {
      // Fallback: use Gemini to summarize from video metadata
      return await extractVideoMetadata(videoId);
    }
    
    const xmlText = await response.text();
    // Parse XML captions (simplified)
    const captions = xmlText
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return captions.length > 100 ? captions : await extractVideoMetadata(videoId);
  } catch {
    return await extractVideoMetadata(videoId);
  }
}

async function extractVideoMetadata(videoId: string): Promise<string> {
  // Fetch oEmbed data as fallback
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    return `Title: ${data.title}\nAuthor: ${data.author_name}\nDescription: ${data.title}`;
  } catch {
    throw new Error('Could not extract YouTube content. Video may not have captions available.');
  }
}

async function extractFromPDF(storagePath: string, supabase: SupabaseClient): Promise<string> {
  // Download PDF from storage
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('study-content')
    .download(storagePath);
  
  if (downloadError || !fileData) {
    throw new Error(`Failed to download PDF: ${downloadError?.message}`);
  }
  
  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Simple text extraction from PDF bytes
  // This is a basic extraction - in production, use pdf-parse or similar
  const text = extractTextFromPDFBytes(uint8Array);
  
  return text;
}

function extractTextFromPDFBytes(data: Uint8Array): string {
  // Simple PDF text extraction by looking for text objects
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(data);
  
  // Extract text between BT (Begin Text) and ET (End Text) markers
  const textObjects: string[] = [];
  const btRegex = /BT\s*\((.*?)\)\s*Tj\s*ET/gs;
  let match;
  
  while ((match = btRegex.exec(text)) !== null) {
    textObjects.push(match[1]);
  }
  
  // Also look for text in parentheses outside BT/ET
  const parenRegex = /\(([^)]+)\)/g;
  while ((match = parenRegex.exec(text)) !== null) {
    if (match[1].length > 10 && !match[1].includes('/')) {
      textObjects.push(match[1]);
    }
  }
  
  const extracted = textObjects.join(' ').trim();
  
  if (extracted.length < 100) {
    // Fallback: try to extract any readable text
    const readableChars = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    return readableChars.slice(0, 10000).trim();
  }
  
  return extracted.slice(0, 50000);
}

// ============================================================================
// Study Plan Generation
// ============================================================================

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
    {
      "id": "task-1",
      "content": "Specific actionable study task",
      "estimatedMinutes": 15,
      "priority": "HIGH|MEDIUM|LOW",
      "dependsOn": ["task-0"] // optional
    }
  ],
  "quizItems": [
    {
      "id": "quiz-1",
      "question": "Clear question about the content",
      "answer": "Correct answer",
      "options": ["option1", "option2", "option3", "option4"], // for multiple choice
      "explanation": "Why this answer is correct",
      "difficulty": "EASY|MEDIUM|HARD",
      "conceptTag": "which key concept this tests"
    }
  ],
  "sessionPlan": {
    "recommendedDuration": 1800, // seconds (30 min)
    "recommendedSessions": 2,
    "breakIntervalMinutes": 25,
    "suggestedDifficulty": "NORMAL",
    "focusAreas": ["priority topic 1", "priority topic 2"]
  }
}

Requirements:
- Generate 3-5 study tasks
- Generate 3 quiz items (mix of multiple choice and short answer)
- Tasks should be specific and actionable
- Quiz should test understanding, not memorization
- Session plan should suggest realistic duration based on content length
- EstimatedMinutes per task: 10-30 minutes
- Return valid JSON only, no markdown formatting`;
}

function parseStudyPlanResponse(text: string): { tasks: StudyTask[]; quizItems: QuizItem[]; sessionPlan: SessionPlan; summary: string; keyConcepts: string[] } {
  try {
    // Clean up the response
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    return {
      summary: parsed.summary || 'Study material ready',
      keyConcepts: parsed.keyConcepts || [],
      tasks: (parsed.tasks || []).map((t: any, i: number) => ({
        id: t.id || `task-${i}`,
        content: t.content || 'Review content',
        estimatedMinutes: Math.min(Math.max(t.estimatedMinutes || 15, 5), 60),
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(t.priority) ? t.priority : 'MEDIUM',
        dependsOn: t.dependsOn || [],
      })),
      quizItems: (parsed.quizItems || []).map((q: any, i: number) => ({
        id: q.id || `quiz-${i}`,
        question: q.question || 'Review the content',
        answer: q.answer || 'See content',
        options: q.options || [],
        explanation: q.explanation,
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty) ? q.difficulty : 'MEDIUM',
        conceptTag: q.conceptTag || 'general',
      })),
      sessionPlan: {
        recommendedDuration: Math.min(Math.max(parsed.sessionPlan?.recommendedDuration || 1800, 600), 7200),
        recommendedSessions: Math.min(Math.max(parsed.sessionPlan?.recommendedSessions || 1, 1), 5),
        breakIntervalMinutes: Math.min(Math.max(parsed.sessionPlan?.breakIntervalMinutes || 25, 15), 60),
        suggestedDifficulty: ['EASY', 'NORMAL', 'CHALLENGING'].includes(parsed.sessionPlan?.suggestedDifficulty) 
          ? parsed.sessionPlan.suggestedDifficulty 
          : 'NORMAL',
        focusAreas: parsed.sessionPlan?.focusAreas || [],
      },
    };
  } catch (error) {
    console.error('Failed to parse study plan:', error);
    
    // Return fallback plan
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
      sessionPlan: {
        recommendedDuration: 1800,
        recommendedSessions: 1,
        breakIntervalMinutes: 25,
        suggestedDifficulty: 'NORMAL',
        focusAreas: ['Understanding main concepts'],
      },
    };
  }
}

// ============================================================================
// Database Helpers
// ============================================================================

async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<{ canGenerate: boolean; remaining: number }> {
  const { data, error } = await supabase
    .rpc('check_daily_generation_limit', {
      p_user_id: userId,
      p_limit: DAILY_GENERATION_LIMIT,
    });
  
  if (error || !data) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow generation
    return { canGenerate: true, remaining: DAILY_GENERATION_LIMIT };
  }
  
  return { canGenerate: data[0]?.can_generate ?? true, remaining: data[0]?.remaining ?? 0 };
}

async function incrementGenerationCount(supabase: SupabaseClient, userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('study_content')
    .update({
      generation_count_today: supabase.rpc('increment'),
      last_generation_date: today,
    })
    .eq('user_id', userId)
    .eq('last_generation_date', today);
}

// ============================================================================
// Request Handlers
// ============================================================================

async function handleSubmit(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  try {
    const body = await req.json();
    const validated = SubmitContentSchema.parse(body);
    
    // Create study content record
    const { data: content, error } = await supabase
      .from('study_content')
      .insert({
        user_id: userId,
        source_type: validated.type,
        source_url: validated.type === 'YOUTUBE' ? validated.content : null,
        original_filename: validated.filename || null,
        title: validated.title || null,
        extracted_text: validated.type === 'PASTE' ? validated.content : '',
        extracted_length: validated.type === 'PASTE' ? validated.content.length : 0,
        status: validated.type === 'PASTE' ? 'EXTRACTED' : 'PENDING',
        extracted_at: validated.type === 'PASTE' ? new Date().toISOString() : null,
      })
      .select()
      .single();
    
    if (error || !content) {
      throw new Error(`Failed to create content: ${error?.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        contentId: content.id,
        status: content.status,
        message: validated.type === 'PASTE' ? 'Content ready for generation' : 'Content submitted for extraction',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Submit error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleExtract(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  try {
    const body = await req.json();
    const { contentId } = body;
    
    if (!contentId) {
      throw new Error('contentId is required');
    }
    
    // Fetch content
    const { data: content, error } = await supabase
      .from('study_content')
      .select('*')
      .eq('id', contentId)
      .eq('user_id', userId)
      .single();
    
    if (error || !content) {
      throw new Error('Content not found');
    }
    
    // Update status
    await supabase
      .from('study_content')
      .update({ status: 'EXTRACTING' })
      .eq('id', contentId);
    
    let extractedText = '';
    
    try {
      if (content.source_type === 'YOUTUBE') {
        extractedText = await extractFromYouTube(content.source_url!);
      } else if (content.source_type === 'PDF') {
        extractedText = await extractFromPDF(content.storage_path!, supabase);
      } else {
        throw new Error(`Extraction not supported for type: ${content.source_type}`);
      }
      
      // Update with extracted text
      await supabase
        .from('study_content')
        .update({
          extracted_text: extractedText,
          extracted_length: extractedText.length,
          status: 'EXTRACTED',
          extracted_at: new Date().toISOString(),
        })
        .eq('id', contentId);
      
      return new Response(
        JSON.stringify({
          success: true,
          contentId,
          extractedLength: extractedText.length,
          status: 'EXTRACTED',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (extractError) {
      // Mark as failed
      await supabase
        .from('study_content')
        .update({
          status: 'FAILED',
          error_message: extractError instanceof Error ? extractError.message : 'Extraction failed',
        })
        .eq('id', contentId);
      
      throw extractError;
    }
  } catch (error) {
    console.error('Extract error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGenerate(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const validated = GenerateStudyPlanSchema.parse(body);
    
    // Check rate limit
    const { canGenerate, remaining } = await checkRateLimit(supabase, userId);
    if (!canGenerate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Daily limit reached. You can generate ${DAILY_GENERATION_LIMIT} study plans per day. Try again tomorrow.`,
          remaining: 0,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch content
    const { data: content, error: contentError } = await supabase
      .from('study_content')
      .select('*')
      .eq('id', validated.contentId)
      .eq('user_id', userId)
      .single();
    
    if (contentError || !content) {
      throw new Error('Content not found');
    }
    
    if (content.status !== 'EXTRACTED' && content.status !== 'READY') {
      throw new Error(`Content not ready. Current status: ${content.status}`);
    }
    
    // Update status
    await supabase
      .from('study_content')
      .update({ status: 'PROCESSING' })
      .eq('id', validated.contentId);
    
    // Use user-edited text if available
    const textToProcess = content.is_user_edited && content.user_edited_text 
      ? content.user_edited_text 
      : content.extracted_text;
    
    // Generate study plan
    const prompt = buildStudyPlanPrompt(textToProcess, content.title || undefined);
    const geminiResponse = await callGemini(prompt);
    const parsed = parseStudyPlanResponse(geminiResponse);
    
    const processingTime = Date.now() - startTime;
    
    // Save generation
    const { data: generation, error: genError } = await supabase
      .from('study_generations')
      .insert({
        content_id: validated.contentId,
        user_id: userId,
        model: GEMINI_MODEL,
        processing_time_ms: processingTime,
        summary: parsed.summary,
        key_concepts: parsed.keyConcepts,
        tasks: parsed.tasks,
        quiz_items: parsed.quizItems,
        session_plan: parsed.sessionPlan,
      })
      .select()
      .single();
    
    if (genError) {
      throw new Error(`Failed to save generation: ${genError.message}`);
    }
    
    // Update content status
    await supabase
      .from('study_content')
      .update({ 
        status: 'READY',
        generation_count_today: supabase.rpc('increment'),
        last_generation_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', validated.contentId);
    
    return new Response(
      JSON.stringify({
        success: true,
        generationId: generation.id,
        contentId: validated.contentId,
        summary: parsed.summary,
        keyConcepts: parsed.keyConcepts,
        tasks: parsed.tasks,
        quizItems: parsed.quizItems,
        sessionPlan: parsed.sessionPlan,
        remaining: remaining - 1,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate error:', error);
    
    // Mark as failed if content exists
    try {
      const body = await req.json();
      await supabase
        .from('study_content')
        .update({ status: 'FAILED' })
        .eq('id', body.contentId);
    } catch {}
    
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleStatus(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  try {
    const url = new URL(req.url);
    const contentId = url.pathname.split('/').pop();
    
    if (!contentId) {
      throw new Error('contentId is required');
    }
    
    const { data: content, error } = await supabase
      .from('study_content')
      .select('*, study_generations(*)')
      .eq('id', contentId)
      .eq('user_id', userId)
      .single();
    
    if (error || !content) {
      throw new Error('Content not found');
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        contentId: content.id,
        status: content.status,
        extractedLength: content.extracted_length,
        errorMessage: content.error_message,
        generation: content.study_generations?.[0] || null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Status error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleFeedback(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  try {
    const body = await req.json();
    const validated = SubmitFeedbackSchema.parse(body);
    
    const { error } = await supabase
      .from('study_generations')
      .update({
        user_rating: validated.rating,
        was_helpful: validated.wasHelpful,
      })
      .eq('id', validated.generationId)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to save feedback: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Feedback error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client with service role for storage access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = user.id;
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/content-study', '').replace(/^\//, '');
    
    // Route requests
    if (req.method === 'POST' && path === 'submit') {
      return await handleSubmit(req, supabase, userId);
    } else if (req.method === 'POST' && path === 'extract') {
      return await handleExtract(req, supabase, userId);
    } else if (req.method === 'POST' && path === 'generate') {
      return await handleGenerate(req, supabase, userId);
    } else if (req.method === 'GET' && path.startsWith('status/')) {
      return await handleStatus(req, supabase, userId);
    } else if (req.method === 'POST' && path === 'feedback') {
      return await handleFeedback(req, supabase, userId);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
