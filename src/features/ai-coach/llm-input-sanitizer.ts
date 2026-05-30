/**
 * Prompt Injection Sanitization
 *
 * Strips patterns commonly used for prompt injection from user-controllable
 * values before they are sent to the LLM edge function.
 *
 * This is a defense-in-depth layer. The edge function should also sanitize,
 * but we clean inputs on the client to reduce attack surface.
 */

/** Patterns that indicate prompt injection attempts */
const INJECTION_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|prompts?|rules?|context)\b/gi,
  /\b(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as|system\s*:\s*)\b/gi,
  /\b(?:ignore\s+(?:your|the)\s+(?:instructions?|rules?|constraints?|programming))\b/gi,
  /\[\s*system\s*\]|\[\s*INST\s*\]|\[\s*\/INST\s*\]|<\|im_start\|>|<\|im_end\|>/gi,
  /\b(?:override|bypass|jailbreak|DAN\s+mode|developer\s+mode)\b/gi,
  /\b(?:reveal|show|print|output|repeat)\s+(?:your|the)\s+(?:system|initial|original|hidden)\s+(?:prompt|instructions?|message)\b/gi,
];

/** Maximum length for any single context string value */
const MAX_CONTEXT_STRING_LENGTH = 500;

/**
 * Sanitize a single string value for safe inclusion in LLM context.
 * Truncates long strings and strips injection patterns.
 */
export function sanitizeForLLM(value: string): string {
  let sanitized = value.slice(0, MAX_CONTEXT_STRING_LENGTH);
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }
  return sanitized;
}

/**
 * Sanitize all string values in a context object before sending to the LLM.
 * Non-string values pass through unchanged (numbers, booleans, etc.).
 */
export function sanitizeLLMContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeForLLM(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeForLLM(item)
          : typeof item === "object" && item !== null
            ? sanitizeLLMContext(item as Record<string, unknown>)
            : item,
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLLMContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
