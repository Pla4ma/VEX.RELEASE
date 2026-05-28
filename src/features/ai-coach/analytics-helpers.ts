export function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(16)}`;
}

export function sanitizeContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!context) {
    return undefined;
  }
  const sensitiveKeys = ["email", "name", "phone", "address", "ip", "location"];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function sanitizeProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    "email",
    "name",
    "phone",
    "address",
    "content",
    "message",
  ];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      if (key === "content" || key === "message") {
        sanitized[key] = "[CONTENT_REDACTED]";
      } else {
        sanitized[key] = "[REDACTED]";
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function calculateEffectivenessScore(
  opened: boolean,
  actionTaken: boolean,
  sessionCompleted: boolean,
): number {
  let score = 0;
  if (opened) {
    score += 0.3;
  }
  if (actionTaken) {
    score += 0.4;
  }
  if (sessionCompleted) {
    score += 0.3;
  }
  return score;
}
