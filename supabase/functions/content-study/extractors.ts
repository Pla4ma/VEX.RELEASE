import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_MODEL = 'gemini-2.5-pro';

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.95, topK: 40 },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function extractFromYouTube(url: string): Promise<string> {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (!videoIdMatch) throw new Error('Invalid YouTube URL');
  const videoId = videoIdMatch[1];
  try {
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    if (!response.ok) return await extractVideoMetadata(videoId);
    const xmlText = await response.text();
    const captions = xmlText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return captions.length > 100 ? captions : await extractVideoMetadata(videoId);
  } catch {
    return await extractVideoMetadata(videoId);
  }
}

async function extractVideoMetadata(videoId: string): Promise<string> {
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  const data = await response.json();
  return `Title: ${data.title}\nAuthor: ${data.author_name}\nDescription: ${data.title}`;
}

export async function extractFromPDF(storagePath: string, supabase: SupabaseClient): Promise<string> {
  const { data: fileData, error } = await supabase.storage.from('study-content').download(storagePath);
  if (error || !fileData) throw new Error(`Failed to download PDF: ${error?.message}`);
  const uint8Array = new Uint8Array(await fileData.arrayBuffer());
  return extractTextFromPDFBytes(uint8Array);
}

function extractTextFromPDFBytes(data: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(data);
  const textObjects: string[] = [];
  const btRegex = /BT\s*\((.*?)\)\s*Tj\s*ET/gs;
  let match;
  while ((match = btRegex.exec(text)) !== null) textObjects.push(match[1]);
  const parenRegex = /\(([^)]+)\)/g;
  while ((match = parenRegex.exec(text)) !== null) {
    if (match[1].length > 10 && !match[1].includes('/')) textObjects.push(match[1]);
  }
  const extracted = textObjects.join(' ').trim();
  if (extracted.length < 100) return text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').slice(0, 10000).trim();
  return extracted.slice(0, 50000);
}

export async function generateStudyPlan(content: string, title?: string): Promise<string> {
  const MAX_CONTENT_LENGTH = 50000;
  const safeContent = content.slice(0, MAX_CONTENT_LENGTH);
  const safeTitle = title || 'Study Material';
  const prompt = `You are an expert study planner. Analyze the following content and create a comprehensive study plan.

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
  return callGemini(prompt);
}

export { callGemini };
