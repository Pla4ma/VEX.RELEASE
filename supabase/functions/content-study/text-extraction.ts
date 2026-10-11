const MAX_EXTRACTED_TEXT_LENGTH = 50000;

export function isPlainTextStudyFile(filename: string): boolean {
  return /\.(?:txt|md)$/i.test(filename);
}

export function isPdfStudyFile(filename: string): boolean {
  return /\.pdf$/i.test(filename);
}

export function extractPlainTextFromBytes(data: Uint8Array): string {
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(data);
  const normalized = decoded.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")
    .trim();
  if (!normalized) throw new Error("The uploaded text file is empty");
  return normalized.slice(0, MAX_EXTRACTED_TEXT_LENGTH);
}
