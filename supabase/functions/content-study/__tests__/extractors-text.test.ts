import {
  extractPlainTextFromBytes,
  isPdfStudyFile,
  isPlainTextStudyFile,
} from "../text-extraction.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

Deno.test("routes TXT and Markdown uploads to the text extractor", () => {
  assert(isPlainTextStudyFile("notes.txt"), "TXT extension was not recognized");
  assert(
    isPlainTextStudyFile("LECTURE.MD"),
    "Markdown extension was not case insensitive",
  );
  assert(
    !isPlainTextStudyFile("lecture.pdf"),
    "PDF was routed to the text extractor",
  );
  assert(isPdfStudyFile("lecture.PDF"), "PDF extension was not recognized");
  assert(
    !isPdfStudyFile("lecture.docx"),
    "Unsupported files were treated as PDFs",
  );
});

Deno.test("decodes uploaded text, removes a BOM, and normalizes line endings", () => {
  const bytes = new TextEncoder().encode("\uFEFFfirst line\r\nsecond line\r");
  const text = extractPlainTextFromBytes(bytes);
  assert(
    text === "first line\nsecond line",
    "Text encoding or line endings were not normalized",
  );
});

Deno.test("rejects empty text files instead of marking them extracted", () => {
  let rejected = false;
  try {
    extractPlainTextFromBytes(new TextEncoder().encode("\uFEFF  \r\n"));
  } catch {
    rejected = true;
  }
  assert(rejected, "Empty text was accepted as extracted content");
});

Deno.test("caps extracted text at the study generation input limit", () => {
  const text = extractPlainTextFromBytes(
    new TextEncoder().encode("x".repeat(51000)),
  );
  assert(
    text.length === 50000,
    "Extracted text exceeded the study generation limit",
  );
});
