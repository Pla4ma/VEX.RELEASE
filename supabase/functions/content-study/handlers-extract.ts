/**
 * Content Study - Extract Handler
 *
 * Handles content extraction from YouTube and PDF sources.
 * Extracted from handlers.ts for file size compliance.
 */

import type { ContentStudyClient } from "./supabase-client.ts";
import {
  extractFromPDF,
  extractFromPlainText,
  extractFromYouTube,
} from "./extractors.ts";
import { isPdfStudyFile, isPlainTextStudyFile } from "./text-extraction.ts";
import { json } from "./handlers.ts";
import { STUDY_CONTENT_COLUMNS_STR } from "./columns.ts";

export async function handleExtract(
  req: Request,
  supabase: ContentStudyClient,
  userId: string,
): Promise<Response> {
  const contentId = new URL(req.url).pathname.split("/").pop();
  if (!contentId) {
    return json({ success: false, error: "contentId required" }, 400);
  }
  const { data: content, error } = await supabase.from("study_content").select(
    STUDY_CONTENT_COLUMNS_STR,
  ).eq("id", contentId).eq("user_id", userId).single();
  if (error || !content) {
    return json({ success: false, error: "Content not found" }, 400);
  }
  await supabase.from("study_content").update({ status: "EXTRACTING" }).eq(
    "id",
    contentId,
  );
  try {
    let extractedText = "";
    if (content.source_type === "YOUTUBE" && content.source_url) {
      extractedText = await extractFromYouTube(content.source_url);
    } else if (content.source_type === "PDF" && content.storage_path) {
      const filename = content.original_filename ??
        content.storage_path.split("/").pop() ?? "";
      if (isPlainTextStudyFile(filename)) {
        extractedText = await extractFromPlainText(
          content.storage_path,
          supabase,
        );
      } else if (isPdfStudyFile(filename)) {
        extractedText = await extractFromPDF(content.storage_path, supabase);
      } else {
        throw new Error("Unsupported study file format");
      }
    } else throw new Error(`Unsupported type: ${content.source_type}`);
    await supabase.from("study_content").update({
      extracted_text: extractedText,
      extracted_length: extractedText.length,
      status: "EXTRACTED",
      extracted_at: new Date().toISOString(),
    }).eq("id", contentId);
    return json({
      success: true,
      contentId,
      extractedLength: extractedText.length,
      status: "EXTRACTED",
    });
  } catch (e) {
    await supabase.from("study_content").update({
      status: "FAILED",
      error_message: "Extraction failed",
    }).eq("id", contentId);
    return json({
      success: false,
      error: "Content extraction failed. Please try again.",
    }, 400);
  }
}
