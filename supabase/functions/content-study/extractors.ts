import type { ContentStudyClient } from "./supabase-client.ts";
import { extractPlainTextFromBytes } from "./text-extraction.ts";
import { getYouTubeVideoId } from "./youtube-video.ts";

export async function extractFromYouTube(url: string): Promise<string> {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) throw new Error("Invalid YouTube URL");
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    );
    if (!response.ok) return await extractVideoMetadata(videoId);
    const xmlText = await response.text();
    const captions = xmlText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
      .trim();
    return captions.length > 100
      ? captions
      : await extractVideoMetadata(videoId);
  } catch {
    return await extractVideoMetadata(videoId);
  }
}

async function extractVideoMetadata(videoId: string): Promise<string> {
  const response = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );
  const data = await response.json();
  return `Title: ${data.title}\nAuthor: ${data.author_name}\nDescription: ${data.title}`;
}

export async function extractFromPDF(
  storagePath: string,
  supabase: ContentStudyClient,
): Promise<string> {
  const { data: fileData, error } = await supabase.storage.from("study-content")
    .download(storagePath);
  if (error || !fileData) {
    throw new Error(`Failed to download PDF: ${error?.message}`);
  }
  const uint8Array = new Uint8Array(await fileData.arrayBuffer());
  return extractTextFromPDFBytes(uint8Array);
}

const MAX_TEXT_FILE_BYTES = 10 * 1024 * 1024;

export async function extractFromPlainText(
  storagePath: string,
  supabase: ContentStudyClient,
): Promise<string> {
  const { data: fileData, error } = await supabase.storage.from("study-content")
    .download(storagePath);
  if (error || !fileData) {
    throw new Error(`Failed to download text file: ${error?.message}`);
  }
  if (fileData.size > MAX_TEXT_FILE_BYTES) {
    throw new Error("Text file exceeds the upload limit");
  }
  return extractPlainTextFromBytes(
    new Uint8Array(await fileData.arrayBuffer()),
  );
}

function extractTextFromPDFBytes(data: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(data);
  const textObjects: string[] = [];
  const btRegex = /BT\s*\((.*?)\)\s*Tj\s*ET/gs;
  let match;
  while ((match = btRegex.exec(text)) !== null) textObjects.push(match[1]);
  const parenRegex = /\(([^)]+)\)/g;
  while ((match = parenRegex.exec(text)) !== null) {
    if (match[1].length > 10 && !match[1].includes("/")) {
      textObjects.push(match[1]);
    }
  }
  const extracted = textObjects.join(" ").trim();
  if (extracted.length < 100) {
    return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").slice(
      0,
      10000,
    ).trim();
  }
  return extracted.slice(0, 50000);
}

