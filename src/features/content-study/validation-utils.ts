import { CONTENT_STUDY_CONSTANTS } from "./types";

export function sanitizeTextForStorage(text: string): string {
  return text
    .replace(/\x00/g, "")
    .replace(/[\x80-\x9F]/g, "")
    .trim();
}

export function truncateText(
  text: string,
  maxLength: number,
  suffix = "...",
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [/(?:v=|\/|shorts\/|embed\/)([\w-]{11})/, /^([\w-]{11})$/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1] ?? null;
  }
  return null;
}

export function isValidFileType(mimeType: string): boolean {
  const supportedTypes: readonly string[] = [
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES,
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES,
  ];
  return supportedTypes.includes(mimeType);
}

export function formatValidationErrors(
  errors: import("./types").ValidationError[],
): string {
  const errorMessages = errors
    .filter((e) => e.severity === "error")
    .map((e) => e.message);
  const warningMessages = errors
    .filter((e) => e.severity === "warning")
    .map((e) => `Warning: ${e.message}`);
  return [...errorMessages, ...warningMessages].join("\n");
}
