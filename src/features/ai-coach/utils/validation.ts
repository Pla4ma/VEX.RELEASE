/**
 * AI Coach Validation Utilities
 *
 * Validates coaching messages, personalization data, flow transitions.
 *
 * @phase 9 - Deepening: AI Coach validation
 */

import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const CoachMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: z.enum(['TEXT', 'TIP', 'CHALLENGE', 'ENCOURAGEMENT', 'CHECK_IN']),
  content: z.string().min(1).max(1000),
  tone: z.enum(['FRIENDLY', 'PROFESSIONAL', 'MOTIVATIONAL', 'GENTLE']),
  sentAt: z.number(),
  context: z
    .object({
      streak: z.number().optional(),
      recentSessions: z.number().optional(),
      goals: z.array(z.string()).optional(),
    })
    .optional(),
});

export type CoachMessage = z.infer<typeof CoachMessageSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

export function validateCoachMessage(
  message: unknown,
  userContext: {
    lastMessageAt: number | null;
    messageCount24h: number;
    blockedKeywords: string[];
  },
): { valid: boolean; errors: string[]; data?: CoachMessage } {
  const errors: string[] = [];

  // Schema validation
  const result = CoachMessageSchema.safeParse(message);
  if (!result.success) {
    errors.push('Invalid message structure');
    return { valid: false, errors };
  }

  const data = result.data;

  // Check rate limiting (max 10 messages per 24h)
  if (userContext.messageCount24h >= 10) {
    errors.push('Daily message limit reached');
  }

  // Check time since last message (min 1 hour between non-urgent messages)
  if (userContext.lastMessageAt && data.type !== 'CHECK_IN') {
    const hoursSince =
      (Date.now() - userContext.lastMessageAt) / (60 * 60 * 1000);
    if (hoursSince < 1) {
      errors.push('Too soon for another message');
    }
  }

  // Check for blocked content
  const hasBlocked = userContext.blockedKeywords.some((keyword) =>
    data.content.toLowerCase().includes(keyword.toLowerCase()),
  );
  if (hasBlocked) {
    errors.push('Message contains blocked content');
  }

  // Validate content appropriateness
  if (data.content.length < 10) {
    errors.push('Message too short');
  }

  if (data.content.length > 500 && data.type === 'TIP') {
    errors.push('Tips should be concise (max 500 chars)');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

export function validatePersonalization(preferences: {
  tone: string;
  frequency: string;
  focusAreas: string[];
}): { valid: boolean; normalized?: typeof preferences; errors: string[] } {
  const errors: string[] = [];

  // Validate tone
  const validTones = ['FRIENDLY', 'PROFESSIONAL', 'MOTIVATIONAL', 'GENTLE'];
  if (!validTones.includes(preferences.tone.toUpperCase())) {
    errors.push(`Invalid tone: ${preferences.tone}`);
  }

  // Validate frequency
  const validFrequencies = ['LOW', 'MEDIUM', 'HIGH'];
  const normalizedFreq = preferences.frequency.toUpperCase();
  if (!validFrequencies.includes(normalizedFreq)) {
    errors.push(`Invalid frequency: ${preferences.frequency}`);
  }

  // Validate focus areas (max 3)
  if (preferences.focusAreas.length > 3) {
    errors.push('Maximum 3 focus areas allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized:
      errors.length === 0
        ? {
            ...preferences,
            tone: preferences.tone.toUpperCase(),
            frequency: preferences.frequency.toUpperCase(),
          }
        : undefined,
  };
}

export function shouldSendCheckIn(userState: {
  lastSessionAt: number | null;
  streak: number;
  lastMessageAt: number | null;
  optOut: boolean;
}): {
  shouldSend: boolean;
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  if (userState.optOut) {
    return { shouldSend: false, reason: 'User opted out', urgency: 'LOW' };
  }

  // If no sessions in 48 hours, send check-in
  if (userState.lastSessionAt) {
    const hoursSince =
      (Date.now() - userState.lastSessionAt) / (60 * 60 * 1000);

    if (hoursSince > 48 && userState.streak > 0) {
      return {
        shouldSend: true,
        reason: 'Streak at risk',
        urgency: 'HIGH',
      };
    }

    if (hoursSince > 72) {
      return {
        shouldSend: true,
        reason: 'Re-engagement',
        urgency: 'MEDIUM',
      };
    }
  }

  // If never messaged, send welcome
  if (!userState.lastMessageAt && !userState.lastSessionAt) {
    return {
      shouldSend: true,
      reason: 'Welcome message',
      urgency: 'LOW',
    };
  }

  return { shouldSend: false, reason: 'Not needed', urgency: 'LOW' };
}

// ============================================================================
// Export
// ============================================================================

export const AICoachValidation = {
  validateCoachMessage,
  validatePersonalization,
  shouldSendCheckIn,
  CoachMessageSchema,
};

export { AICoachValidation }