export type AnalyticsPrimitive = string | number | boolean | null;
export type SafeAnalyticsProperties = Record<string, AnalyticsPrimitive>;

const MAX_STRING_LENGTH = 120;

const SENSITIVE_KEY_PARTS = [
  "address",
  "body",
  "content",
  "description",
  "email",
  "file",
  "jwt",
  "message",
  "name",
  "note",
  "password",
  "phone",
  "secret",
  "stack",
  "text",
  "token",
  "url",
  "user_id",
  "userid",
  "username",
];

const ALLOWED_USER_TRAITS = new Set([
  "created_at",
  "level",
  "locale",
  "plan",
  "sessions_completed",
  "streak",
  "tier",
  "timezone",
]);

export function sanitizeEventName(eventName: string): string {
  const normalized = eventName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[:.\-\s]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .toLowerCase();

  return normalized || "unknown_event";
}

export function sanitizeAnalyticsProperties(
  properties: object = {},
): SafeAnalyticsProperties {
  const safe: SafeAnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (isSensitiveKey(key)) {
      continue;
    }

    const sanitizedValue = sanitizeValue(value);
    if (sanitizedValue !== undefined) {
      safe[toSnakeCase(key)] = sanitizedValue;
    }
  }

  return safe;
}

export function sanitizeUserTraits(
  traits: object = {},
): SafeAnalyticsProperties {
  const safe: SafeAnalyticsProperties = {};

  for (const [key, value] of Object.entries(traits)) {
    const normalizedKey = toSnakeCase(key);
    if (!ALLOWED_USER_TRAITS.has(normalizedKey)) {
      continue;
    }

    const sanitizedValue = sanitizeValue(value);
    if (sanitizedValue !== undefined) {
      safe[normalizedKey] = sanitizedValue;
    }
  }

  return safe;
}

function sanitizeValue(value: unknown): AnalyticsPrimitive | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || looksSensitiveString(trimmed)) {
      return undefined;
    }

    return trimmed.length > MAX_STRING_LENGTH
      ? `${trimmed.slice(0, MAX_STRING_LENGTH)}...`
      : trimmed;
  }

  return undefined;
}

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part));
}

function looksSensitiveString(value: string): boolean {
  if (value.includes("@")) {
    return true;
  }

  if (/bearer\s+[a-z0-9._-]+/i.test(value)) {
    return true;
  }

  return value.length > 40 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}
