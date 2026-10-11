import { SubmitContentSchema } from "../schemas.ts";
import {
  buildStudyContentInsert,
  isOwnedStudyFilePath,
} from "../submit-content.ts";

const userId = "a2a1e7a0-fcac-4a9b-890c-c34845e89230";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

Deno.test("accepts the three request shapes used by the content input flow", () => {
  const paste = SubmitContentSchema.safeParse({
    type: "PASTE",
    content: "Study notes ".repeat(10),
  });
  const pdf = SubmitContentSchema.safeParse({
    type: "PDF",
    fileId: `${userId}/17234_notes.pdf`,
    filename: "notes.pdf",
  });
  const youtube = SubmitContentSchema.safeParse({
    type: "YOUTUBE",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  });
  assert(
    paste.success && pdf.success && youtube.success,
    "A supported input was rejected",
  );
});

Deno.test("rejects the stale content field for PDF and YouTube requests", () => {
  const pdf = SubmitContentSchema.safeParse({ type: "PDF", content: "notes" });
  const youtube = SubmitContentSchema.safeParse({
    type: "YOUTUBE",
    content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  });
  assert(
    !pdf.success && !youtube.success,
    "A mismatched request shape was accepted",
  );
});

Deno.test("rejects short pasted content and non-YouTube URLs at the Edge boundary", () => {
  const shortPaste = SubmitContentSchema.safeParse({
    type: "PASTE",
    content: "Too short",
  });
  const invalidVideo = SubmitContentSchema.safeParse({
    type: "YOUTUBE",
    url: "https://example.com/watch?v=dQw4w9WgXcQ",
  });
  assert(
    !shortPaste.success,
    "Pasted content below the client minimum was accepted",
  );
  assert(!invalidVideo.success, "A non-YouTube URL was accepted");
});

Deno.test("allows only a single safe file path in the authenticated user folder", () => {
  assert(
    isOwnedStudyFilePath(`${userId}/17234_notes.pdf`, userId),
    "The user-owned upload path was rejected",
  );
  assert(
    !isOwnedStudyFilePath("another-user/17234_notes.pdf", userId),
    "Another user’s upload path was accepted",
  );
  assert(
    !isOwnedStudyFilePath(`${userId}/nested/notes.pdf`, userId),
    "A nested upload path was accepted",
  );
});

Deno.test("maps PDF and YouTube requests into the database columns extraction needs", () => {
  const pdf = SubmitContentSchema.parse({
    type: "PDF",
    fileId: `${userId}/17234_notes.pdf`,
    filename: "notes.pdf",
  });
  const pdfRow = buildStudyContentInsert(userId, pdf);
  assert(
    pdfRow.storage_path === `${userId}/17234_notes.pdf`,
    "PDF storage path was not persisted",
  );
  assert(
    pdfRow.original_filename === "notes.pdf",
    "PDF filename was not persisted",
  );
  assert(
    pdfRow.status === "PENDING",
    "PDF extraction did not start as pending",
  );

  const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const youtube = SubmitContentSchema.parse({ type: "YOUTUBE", url });
  const youtubeRow = buildStudyContentInsert(userId, youtube);
  assert(youtubeRow.source_url === url, "YouTube URL was not persisted");
  assert(
    youtubeRow.status === "PENDING",
    "YouTube extraction did not start as pending",
  );
});

Deno.test("maps pasted notes to extracted content without a background extraction", () => {
  const content = "Study notes ".repeat(10);
  const request = SubmitContentSchema.parse({
    type: "PASTE",
    content,
  });
  const row = buildStudyContentInsert(userId, request);
  assert(row.extracted_text === content, "Pasted notes were not stored");
  assert(
    row.extracted_length === content.length,
    "Pasted note length was incorrect",
  );
  assert(
    row.status === "EXTRACTED",
    "Pasted notes were unnecessarily queued for extraction",
  );
  assert(
    typeof row.extracted_at === "string",
    "Pasted note timestamp was not set",
  );
});
