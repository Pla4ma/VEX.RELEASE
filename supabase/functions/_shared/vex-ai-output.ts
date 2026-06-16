export function stripAiMarkdown(text: string): string {
  return text.replace(/```json|```/g, '').replace(/\*\*/g, '').trim();
}

export function extractJsonObject(text: string): string | null {
  return stripAiMarkdown(text).match(/\{[\s\S]*\}/)?.[0] ?? null;
}

export function hasJsonObject(text: string): boolean {
  return extractJsonObject(text) !== null;
}
