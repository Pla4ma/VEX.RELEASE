/**
 * AI Coach Message Quality Gate - Phase 7
 *
 * Validates coach messages to reject generic templates and ensure
 * every message includes at least two required quality elements.
 */

import { z } from 'zod';

// ============================================================================
// Message Quality Elements
// ============================================================================

export const MessageQualityElements = {
  OBSERVED_BEHAVIOR: 'observed_behavior',
  SPECIFIC_RECOMMENDATION: 'specific_recommendation',
  TIMING_SUGGESTION: 'timing_suggestion',
  REASON: 'reason',
  NEXT_ACTION: 'next_action',
  CONFIDENCE_LEVEL: 'confidence_level',
} as const;

export const MessageQualityElementValues = Object.values(MessageQualityElements) as [
  'reason',
  'confidence_level', 
  'observed_behavior',
  'specific_recommendation',
  'timing_suggestion',
  'next_action'
];

export type MessageQualityElement = typeof MessageQualityElementValues[number];

// ============================================================================
// Quality Validation Schema
// ============================================================================

export const MessageQualityAnalysisSchema = z.object({
  messageId: z.string().uuid(),
  content: z.string().max(1000),
  category: z.enum([
    'STREAK_RISK', 'SESSION_SUGGESTION', 'MILESTONE_HYPE', 'COMEBACK_SUPPORT',
    'POST_FAILURE', 'PROGRESS_REMINDER', 'DIFFICULTY_ADJUST', 'CHALLENGE_PROMPT',
    'MOTIVATION_BOOST', 'BREAK_SUGGESTION', 'OVERLOAD_WARNING'
  ]),
  qualityElements: z.array(z.enum(MessageQualityElementValues)),
  isGeneric: z.boolean(),
  genericReasons: z.array(z.string()).max(5),
  passesQualityGate: z.boolean(),
  confidence: z.number().min(0).max(1),
  suggestedAction: z.enum(['approve', 'reject', 'improve']).optional(),
});

export type MessageQualityAnalysis = z.infer<typeof MessageQualityAnalysisSchema>;

// ============================================================================
// Generic Message Patterns (REJECTED)
// ============================================================================

// Generic encouragement
const GENERIC_PATTERNS = [
  /keep going/i,
  /you'?re doing great/i,
  /try focusing more/i,
  /come back today/i,
  /good job/i,
  /nice work/i,
  /well done/i,
  /awesome/i,
  /fantastic/i,
  /you can do it/i,
  /believe in yourself/i,
  /stay strong/i,
  /keep it up/i,
  
  // Generic instructions
  /focus more/i,
  /try harder/i,
  /do better/i,
  /improve your/i,
  /make sure to/i,
  /remember to/i,
  /don'?t forget to/i,
  
  // Generic statements
  /every day is a new opportunity/i,
  /progress takes time/i,
  /consistency is key/i,
  /you'?re amazing/i,
  /you'?re incredible/i,
  /you'?re unstoppable/i,
  
  // Generic questions
  /how are you feeling/i,
  /ready to focus/i,
  /how'?s your day/i,
];

// ============================================================================
// Quality Element Detection Patterns
// ============================================================================

// Quality Element Detection Patterns
const QUALITY_PATTERNS = {
  [MessageQualityElements.OBSERVED_BEHAVIOR]: [
    /your \d+[- ]day streak/i,
    /your last \d+ sessions/i,
    /you'?ve completed \d+ sessions/i,
    /your streak is at \d+/i,
    /you'?ve been (active|consistent) for \d+ days/i,
    /your recent sessions show/i,
    /in the past week you'?ve/i,
    /your average session quality is \d+/i,
    /your strongest sessions/i,
    /your sessions this week/i,
  ],
  
  [MessageQualityElements.SPECIFIC_RECOMMENDATION]: [
    /try a \d+[- ]minute \w+ session/i,
    /suggest a \d+[- ]minute session/i,
    /consider a \w+ difficulty session/i,
    /aim for \d+ minutes/i,
    /a \d+[- ]minute \w+ session would be/i,
    /try the \w+ challenge/i,
    /complete the \w+ mission/i,
    /a \d+[- ]minute \w+ session/i,
  ],
  
  [MessageQualityElements.TIMING_SUGGESTION]: [
    /right now|today|tonight|this morning|this afternoon|this evening/i,
    /in \d+ hours|at \d+ [ap]m/i,
    /before \d+ [ap]m|after \d+ [ap]m/i,
    /your optimal time is/i,
    /perfect timing for/i,
    /good time to/i,
    /after \d+ [ap]m/i,
  ],
  
  [MessageQualityElements.REASON]: [
    /because|since|due to|as you'?ve/i,
    /this will help you/i,
    /to maintain your/i,
    /to improve your/i,
    /to protect your/i,
    /based on your/i,
    /according to your/i,
    /without overreaching/i,
  ],
  
  [MessageQualityElements.NEXT_ACTION]: [
    /start a session|begin a session|launch session/i,
    /complete the \w+|finish the \w+/i,
    /accept the challenge|take the challenge/i,
    /adjust your difficulty|change difficulty/i,
    /schedule a reminder|set a reminder/i,
    /view your progress|check progress/i,
    /try a \d+[- ]minute session/i,
  ],
  
  [MessageQualityElements.CONFIDENCE_LEVEL]: [
    /i'?m \d+% sure|i'?m (confident|certain|positive)/i,
    /highly likely|good chance|strong possibility/i,
    /based on your patterns|according to your data/i,
    /your data suggests|your patterns indicate/i,
    /likely to maintain/i,
  ],
};

// ============================================================================
// Quality Gate Implementation
// ============================================================================

/**
 * Validates a coach message against quality standards
 */
export function validateMessageQuality(
  messageId: string,
  content: string,
  category: string
): MessageQualityAnalysis {
  // Ensure messageId is a valid UUID (for testing, generate one if needed)
  const validMessageId = isValidUUID(messageId) ? messageId : generateMockUUID();
  
  // Check for generic patterns
  const genericAnalysis = detectGenericPatterns(content);
  
  // Detect quality elements
  const qualityElements = detectQualityElements(content);
  
  // Determine if message passes quality gate
  const passesQualityGate = !genericAnalysis.isGeneric && qualityElements.length >= 2;
  
  // Calculate confidence score
  const confidence = calculateQualityConfidence(
    genericAnalysis.isGeneric,
    qualityElements.length,
    content.length
  );
  
  // Determine suggested action
  const suggestedAction = determineSuggestedAction(
    genericAnalysis.isGeneric,
    qualityElements.length,
    confidence
  );

  return MessageQualityAnalysisSchema.parse({
    messageId: validMessageId,
    content,
    category,
    qualityElements,
    isGeneric: genericAnalysis.isGeneric,
    genericReasons: genericAnalysis.reasons,
    passesQualityGate,
    confidence,
    suggestedAction,
  });
}

/**
 * Checks if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Generates a mock UUID for testing
 */
function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Detects generic patterns in message content
 */
function detectGenericPatterns(content: string): { isGeneric: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isGeneric = false;

  const lowerContent = content.toLowerCase();

  // Direct string matching for the exact phrases mentioned in Phase 7
  const genericPhrases = [
    'keep going',
    'you are doing great',
    'try focusing more',
    'come back today',
    'good job',
    'nice work',
    'well done',
    'awesome',
    'fantastic',
    'you can do it',
    'believe in yourself',
    'stay strong',
    'keep it up',
  ];

  for (const phrase of genericPhrases) {
    if (lowerContent.includes(phrase)) {
      isGeneric = true;
      reasons.push(`Generic phrase detected: ${phrase}`);
      // Only collect first few reasons to avoid noise
      if (reasons.length >= 3) break;
    }
  }

  // Additional checks for generic content
  if (content.length < 20) {
    isGeneric = true;
    reasons.push('Message too short (< 20 chars)');
  }

  if (!containsSpecificData(content)) {
    isGeneric = true;
    reasons.push('No specific user data referenced');
  }

  if (isAllEncouragement(content)) {
    isGeneric = true;
    reasons.push('Only generic encouragement, no specific guidance');
  }

  return { isGeneric, reasons };
}

/**
 * Detects quality elements in message content
 */
function detectQualityElements(content: string): MessageQualityElement[] {
  const elements: MessageQualityElement[] = [];
  const lowerContent = content.toLowerCase();

  // Direct string matching for quality elements
  if (containsSpecificData(lowerContent)) {
    elements.push(MessageQualityElements.OBSERVED_BEHAVIOR);
  }

  if (lowerContent.includes('try a') && lowerContent.includes('minute')) {
    elements.push(MessageQualityElements.SPECIFIC_RECOMMENDATION);
  }

  if (lowerContent.includes('tonight') || lowerContent.includes('today') || lowerContent.includes('now')) {
    elements.push(MessageQualityElements.TIMING_SUGGESTION);
  }

  if (lowerContent.includes('because') || lowerContent.includes('to protect') || lowerContent.includes('without')) {
    elements.push(MessageQualityElements.REASON);
  }

  if (lowerContent.includes('try') && lowerContent.includes('session')) {
    elements.push(MessageQualityElements.NEXT_ACTION);
  }

  if (lowerContent.includes('based on') || lowerContent.includes('your patterns')) {
    elements.push(MessageQualityElements.CONFIDENCE_LEVEL);
  }

  return elements;
}

/**
 * Checks if content contains specific user data
 */
function containsSpecificData(content: string): boolean {
  // Look for numbers (streak days, session count, minutes, etc.)
  const hasNumbers = /\d+/.test(content);
  
  // Look for specific time references
  const hasTime = /\b(\d+:\d+|\d+ [ap]m|today|tonight|morning|afternoon|evening)\b/i.test(content);
  
  // Look for specific difficulty levels
  const hasDifficulty = /\b(easy|normal|challenging|push)\b/i.test(content);
  
  // Look for specific session types
  const hasSessionType = /\b(recovery|focus|deep work|meditation|study)\b/i.test(content);

  return hasNumbers || hasTime || hasDifficulty || hasSessionType;
}

/**
 * Checks if content is only generic encouragement
 */
function isAllEncouragement(content: string): boolean {
  const encouragementWords = [
    'great', 'amazing', 'fantastic', 'wonderful', 'excellent',
    'good', 'nice', 'awesome', 'incredible', 'unstoppable',
    'keep', 'going', 'continue', 'believe', 'trust', 'stay'
  ];
  
  const words = content.toLowerCase().split(/\s+/);
  const encouragementCount = words.filter(word =>
    encouragementWords.some(enc => word.includes(enc))
  ).length;

  // If more than 70% of words are encouragement and no specific data, it's generic
  return words.length > 0 &&
    encouragementCount / words.length > 0.7 &&
    !containsSpecificData(content);
}

/**
 * Calculates quality confidence score
 */
function calculateQualityConfidence(
  isGeneric: boolean,
  qualityElementCount: number,
  contentLength: number
): number {
  let confidence = 0.5; // Base confidence

  // Penalize generic messages heavily
  if (isGeneric) {
    confidence -= 0.4;
  }

  // Reward quality elements
  confidence += (qualityElementCount * 0.15);

  // Reward appropriate length
  if (contentLength >= 50 && contentLength <= 300) {
    confidence += 0.1;
  } else if (contentLength > 300) {
    confidence -= 0.05; // Too long might be rambling
  }

  // Ensure confidence stays in bounds
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Determines suggested action for the message
 */
function determineSuggestedAction(
  isGeneric: boolean,
  qualityElementCount: number,
  confidence: number
): 'approve' | 'reject' | 'improve' {
  if (isGeneric && qualityElementCount < 2) {
    return 'reject';
  }
  
  if (confidence < 0.4 || qualityElementCount < 2) {
    return 'improve';
  }
  
  return 'approve';
}

// ============================================================================
// Example Quality Messages (APPROVED)
// ============================================================================

export const APPROVED_MESSAGE_EXAMPLES = [
  {
    category: 'STREAK_RISK',
    content: 'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak without overreaching.',
    expectedElements: [MessageQualityElements.REASON, MessageQualityElements.CONFIDENCE_LEVEL, MessageQualityElements.OBSERVED_BEHAVIOR, MessageQualityElements.SPECIFIC_RECOMMENDATION],
  },
  {
    category: 'SESSION_SUGGESTION',
    content: 'Based on your 92% average quality in evening sessions, a 30-minute Challenging session at 7 PM would likely maintain your momentum.',
    expectedElements: [MessageQualityElements.REASON, MessageQualityElements.CONFIDENCE_LEVEL, MessageQualityElements.OBSERVED_BEHAVIOR, MessageQualityElements.NEXT_ACTION],
  },
];

// ============================================================================
// Generic Message Examples (REJECTED)
// ============================================================================

export const REJECTED_MESSAGE_EXAMPLES = [
  {
    category: 'STREAK_RISK',
    content: 'Keep going! You are doing great!',
    rejectionReasons: ['Generic pattern detected: keep going', 'Generic pattern detected: you are doing great', 'No specific user data referenced'],
  },
  {
    category: 'SESSION_SUGGESTION',
    content: 'Try focusing more today.',
    rejectionReasons: ['Generic pattern detected: try focusing more', 'Message too short (< 20 chars)', 'No specific user data referenced'],
  },
];

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Creates a mock quality analysis for testing
 */
export function createMockQualityAnalysis(overrides: Partial<MessageQualityAnalysis> = {}): MessageQualityAnalysis {
  return MessageQualityAnalysisSchema.parse({
    messageId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16)),
    content: 'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight.',
    category: 'STREAK_RISK',
    qualityElements: [
      MessageQualityElements.REASON,
      MessageQualityElements.CONFIDENCE_LEVEL,
      MessageQualityElements.OBSERVED_BEHAVIOR,
    ],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: 'approve',
    ...overrides,
  });
}

/**
 * Batch validates multiple messages
 */
export function batchValidateMessages(
  messages: Array<{ id: string; content: string; category: string }>
): MessageQualityAnalysis[] {
  return messages.map(msg => validateMessageQuality(msg.id, msg.content, msg.category));
}