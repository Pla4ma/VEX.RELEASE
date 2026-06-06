import { SAFETY_SETTINGS, RETRY_CONFIG } from '../../../src/shared/ai/ai-constants.ts';
import type { AIRequest, GeminiAPIResponse } from '../../../src/shared/ai/ai-types.ts';

const httpRequest = globalThis.fetch.bind(globalThis);

export async function callGemini(params: {
  apiKey: string; model: string; systemPrompt: string; userPrompt: string;
  timeoutMs: number; generationConfig: Record<string, number>;
}): Promise<string> {
  let attempt = 0;
  let lastError: Error | null = null;
  while (attempt < RETRY_CONFIG.MAX_RETRIES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), params.timeoutMs);
    try {
      const response = await httpRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': params.apiKey },
          body: JSON.stringify({
            systemInstruction: { role: 'user', parts: [{ text: params.systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: params.userPrompt }] }],
            generationConfig: params.generationConfig,
            safetySettings: SAFETY_SETTINGS,
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const payload = (await response.json()) as GeminiAPIResponse;
      const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n');
      if (!content) throw new Error('Gemini returned no content');
      return sanitizeContent(content);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt += 1;
      if (attempt >= RETRY_CONFIG.MAX_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(RETRY_CONFIG.INITIAL_DELAY_MS * RETRY_CONFIG.BACKOFF_MULTIPLIER ** (attempt - 1), RETRY_CONFIG.MAX_DELAY_MS)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError ?? new Error('Gemini call failed');
}

function sanitizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 1800);
}
