/**
 * Content Study - Extract Handler
 *
 * Handles content extraction from YouTube and PDF sources.
 * Extracted from handlers.ts for file size compliance.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';
import { extractFromYouTube, extractFromPDF } from './extractors.ts';
import { json } from './handlers.ts';

export async function handleExtract(req: Request, supabase: SupabaseClient, userId: string): Promise<Response> {
  const { contentId } = await req.json();
  if (!contentId) return json({ success: false, error: 'contentId required' }, 400);
  const { data: content, error } = await supabase.from('study_content').select('id, user_id, source_type, source_url, original_filename, storage_path, title, extracted_text, extracted_length, language, user_edited_text, is_user_edited, status, error_message, generation_count_today, last_generation_date, deleted_at, created_at, updated_at, extracted_at').eq('id', contentId).eq('user_id', userId).single();
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
    await supabase.from('study_content').update({ status: 'FAILED', error_message: 'Extraction failed' }).eq('id', contentId);
    return json({ success: false, error: 'Content extraction failed. Please try again.' }, 400);
  }
}
