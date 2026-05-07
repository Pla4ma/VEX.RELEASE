/**
 * AI Coach Phase 7 Integration
 * 
 * Integrates coach with daily mission, session recommendations, streak risk
 * and ensures coach suggestions can become daily missions while respecting priority engine.
 */

import { z } from 'zod';
import { validateCoachInput, type CoachInputContract } from './input-contract';
import { validateMessageQuality, type MessageQualityAnalysis } from './message-quality-gate';
import * as repository from './repository';
import * as service from './service';
import { eventBus } from '../../events';
import { CoachInputContractSchema } from './input-contract';

// ============================================================================
// Phase 7 Integration Types
// ============================================================================

export const CoachSuggestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['DAILY_MISSION', 'SESSION_RECOMMENDATION', 'STREAK_PROTECTION']),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  suggestedAction: z.string().max(200),
  confidence: z.number().min(0).max(1),
  expiresAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  canBecomeMission: z.boolean(),
});

export type CoachSuggestion = z.infer<typeof CoachSuggestionSchema>;

export const PriorityEngineSchema = z.object({
  streakCritical: z.boolean(),
  pendingSync: z.boolean(),
  coachNextAction: z.boolean(),
  dailyMissionReminder: z.boolean(),
  squadHelp: z.boolean(),
});

export type PriorityEngine = z.infer<typeof PriorityEngineSchema>;

// ============================================================================
// Coach Integration with Daily Mission
// ============================================================================

/**
 * Generate coach suggestion that can become daily mission
 */
export async function generateMissionSuggestion(
  userId: string,
  inputContract: CoachInputContract
): Promise<CoachSuggestion | null> {
  // Validate input contract
  const validatedInput = validateCoachInput(inputContract);
  
  // Check if coach should intervene
  const priority = determineCoachPriority(validatedInput);
  if (priority === 'low') {
    return null; // Coach should stay quiet
  }

  // Generate coach message
  const messageContent = await generateContextualMessage(validatedInput, priority);
  
  // Validate message quality
  const qualityAnalysis = validateMessageQuality(
    'mission-suggestion',
    messageContent,
    'SESSION_SUGGESTION'
  );

  if (!qualityAnalysis.passesQualityGate) {
    return null; // Reject generic or low-quality suggestions
  }

  // Create suggestion
  const suggestion: CoachSuggestion = {
    id: generateUUID(),
    type: 'DAILY_MISSION',
    title: extractSuggestionTitle(messageContent),
    description: messageContent,
    priority,
    suggestedAction: extractActionFromMessage(messageContent),
    confidence: qualityAnalysis.confidence,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    createdAt: Date.now(),
    canBecomeMission: true,
  };

  return CoachSuggestionSchema.parse(suggestion);
}

/**
 * Convert coach suggestion to daily mission
 */
export async function convertSuggestionToMission(
  userId: string,
  suggestion: CoachSuggestion
): Promise<{ missionId: string; success: boolean }> {
  if (!suggestion.canBecomeMission) {
    return { missionId: '', success: false };
  }

  try {
    // Create mission through mission service
    const missionId = await createDailyMissionFromSuggestion(userId, suggestion);
    
    // Track analytics
    trackCoachSuggestionAccepted(userId, suggestion.id, 'mission_created');
    
    return { missionId, success: true };
  } catch (error) {
    console.error('Failed to convert suggestion to mission:', error);
    return { missionId: '', success: false };
  }
}

// ============================================================================
// Session Recommendation Integration
// ============================================================================

/**
 * Generate session recommendation based on user context
 */
export async function generateSessionRecommendation(
  userId: string,
  inputContract: CoachInputContract
): Promise<CoachSuggestion | null> {
  const validatedInput = validateCoachInput(inputContract);
  
  // Analyze user patterns
  const recommendation = await analyzeSessionPatterns(validatedInput);
  if (!recommendation) {
    return null;
  }

  // Generate contextual message
  const messageContent = await generateRecommendationMessage(validatedInput, recommendation);
  
  // Validate quality
  const qualityAnalysis = validateMessageQuality(
    'session-recommendation',
    messageContent,
    'SESSION_SUGGESTION'
  );

  if (!qualityAnalysis.passesQualityGate) {
    return null;
  }

  const suggestion: CoachSuggestion = {
    id: generateUUID(),
    type: 'SESSION_RECOMMENDATION',
    title: `${recommendation.duration}min ${recommendation.difficulty} Session`,
    description: messageContent,
    priority: recommendation.priority,
    suggestedAction: `Start ${recommendation.duration}min ${recommendation.difficulty} session`,
    confidence: qualityAnalysis.confidence,
    expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 hours
    createdAt: Date.now(),
    canBecomeMission: false,
  };

  return CoachSuggestionSchema.parse(suggestion);
}

// ============================================================================
// Streak Risk Integration
// ============================================================================

/**
 * Handle streak risk with coach intervention
 */
export async function handleStreakRiskIntegration(
  userId: string,
  streakData: {
    currentStreak: number;
    hoursSinceLastSession: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }
): Promise<CoachSuggestion | null> {
  // Only intervene for medium+ risk
  if (streakData.riskLevel === 'low') {
    return null;
  }

  const inputContract = await buildInputContractFromStreakData(userId, streakData);
  const validatedInput = validateCoachInput(inputContract);

  // Generate streak protection message
  const messageContent = await generateStreakProtectionMessage(validatedInput, streakData);
  
  // Validate quality
  const qualityAnalysis = validateMessageQuality(
    'streak-protection',
    messageContent,
    'STREAK_RISK'
  );

  if (!qualityAnalysis.passesQualityGate) {
    return null;
  }

  const suggestion: CoachSuggestion = {
    id: generateUUID(),
    type: 'STREAK_PROTECTION',
    title: 'Protect Your Streak!',
    description: messageContent,
    priority: streakData.riskLevel === 'critical' ? 'critical' : 'high',
    suggestedAction: extractActionFromMessage(messageContent),
    confidence: qualityAnalysis.confidence,
    expiresAt: Date.now() + (streakData.hoursSinceLastSession < 12 ? 2 : 6) * 60 * 60 * 1000,
    createdAt: Date.now(),
    canBecomeMission: true,
  };

  return CoachSuggestionSchema.parse(suggestion);
}

// ============================================================================
// Priority Engine Integration
// ============================================================================

/**
 * Determine if coach should show based on priority engine
 */
export function shouldCoachShowSuggestion(
  priorityEngine: PriorityEngine,
  suggestionPriority: 'critical' | 'high' | 'medium' | 'low'
): boolean {
  // Coach cannot override streak critical or pending sync
  if (priorityEngine.streakCritical || priorityEngine.pendingSync) {
    return suggestionPriority === 'critical';
  }

  // Coach suggestions are third priority after streak critical and pending sync
  if (suggestionPriority === 'critical' || suggestionPriority === 'high') {
    return true;
  }

  // Medium/low suggestions only show if no higher priority items
  return !priorityEngine.coachNextAction && 
         !priorityEngine.dailyMissionReminder && 
         !priorityEngine.squadHelp;
}

/**
 * Get current priority engine state
 */
export async function getPriorityEngineState(userId: string): Promise<PriorityEngine> {
  // For Phase 7, implement basic priority checks
  // In production, these would query actual system states
  
  // Check user's current state
  const coachState = await repository.fetchCoachState(userId);
  const recentMessages = await repository.fetchRecentMessages(userId, 5);
  
  // Determine priority based on coach state and recent activity
  const streakCritical = coachState?.currentState === 'STREAK_AT_RISK';
  const pendingSync = recentMessages.some(msg => msg.status === 'SENT');
  const hasDailyMission = false; // Would integrate with mission service
  const squadHelp = false; // Would integrate with squad service

  return PriorityEngineSchema.parse({
    streakCritical,
    pendingSync,
    coachNextAction: false,
    dailyMissionReminder: hasDailyMission,
    squadHelp,
  });
}

// ============================================================================
// Home Screen Integration
// ============================================================================

/**
 * Get best coach suggestion for Home screen
 * Only shows when it's the best action or useful context
 */
export async function getHomeCoachSuggestion(
  userId: string
): Promise<CoachSuggestion | null> {
  // Get priority engine state
  const priorityState = await getPriorityEngineState(userId);
  
  // Don't show if higher priority items exist
  if (priorityState.streakCritical || priorityState.pendingSync) {
    return null;
  }

  // Get user context
  const inputContract = await buildInputContractForUser(userId);
  const validatedInput = validateCoachInput(inputContract);

  // Generate suggestions based on context
  const suggestions = await Promise.all([
    generateMissionSuggestion(userId, validatedInput),
    generateSessionRecommendation(userId, validatedInput),
    handleStreakRiskIntegration(userId, {
      currentStreak: validatedInput.streakState.currentStreak,
      hoursSinceLastSession: validatedInput.streakState.hoursSinceLastSession,
      riskLevel: validatedInput.streakState.streakAtRisk ? 'high' : 'low',
    })
  ]);

  // Filter valid suggestions
  const validSuggestions = suggestions.filter(Boolean) as CoachSuggestion[];
  
  if (validSuggestions.length === 0) {
    return null;
  }

  // Select best suggestion based on priority and confidence
  const bestSuggestion = validSuggestions.reduce((best, current) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const bestPriority = priorityOrder[best.priority];
    const currentPriority = priorityOrder[current.priority];
    
    if (currentPriority > bestPriority) return current;
    if (currentPriority === bestPriority && current.confidence > best.confidence) return current;
    return best;
  });

  // Check if coach should show this suggestion
  if (!shouldCoachShowSuggestion(priorityState, bestSuggestion.priority)) {
    return null;
  }

  return bestSuggestion;
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineCoachPriority(input: CoachInputContract): 'critical' | 'high' | 'medium' | 'low' {
  if (input.streakState.streakAtRisk && input.streakState.hoursSinceLastSession > 20) {
    return 'critical';
  }
  
  if (input.streakState.streakAtRisk) {
    return 'high';
  }
  
  if (input.focusScoreFactors.trend === 'declining') {
    return 'medium';
  }
  
  return 'low';
}

async function generateContextualMessage(
  input: CoachInputContract,
  priority: 'critical' | 'high' | 'medium' | 'low'
): Promise<string> {
  // This would integrate with the existing message generation service
  // For now, return a contextual message based on input
  if (priority === 'critical') {
    return `Your ${input.streakState.currentStreak}-day streak is at risk! Try a ${input.preferredSessionLengths[0] || 25}-minute session tonight to protect it.`;
  }
  
  if (priority === 'high') {
    return `Based on your recent sessions, a ${input.preferredSessionLengths[0] || 25}-minute session would maintain your momentum.`;
  }
  
  return `Your patterns show you focus best in the ${input.timeContext?.currentHour ? getTimeOfDay(input.timeContext.currentHour) : 'evening'}. Consider a session then.`;
}

function extractSuggestionTitle(message: string): string {
  // Extract first 50 chars as title
  return message.length > 50 ? message.substring(0, 47) + '...' : message;
}

function extractActionFromMessage(message: string): string {
  // Look for action phrases
  const actionMatch = message.match(/(try|start|complete|do)\s+[^.!?]+/i);
  return actionMatch ? actionMatch[0] : 'Start a session';
}

async function analyzeSessionPatterns(input: CoachInputContract): Promise<{
  duration: number;
  difficulty: string;
  priority: 'high' | 'medium' | 'low';
} | null> {
  // Analyze user patterns from input contract
  const preferredDuration = input.preferredSessionLengths[0] || 25;
  const recentGrades = input.recentSessionGrades;
  
  if (recentGrades.length === 0) {
    return null;
  }

  const averageGrade = recentGrades.reduce((sum, session) => sum + session.grade, 0) / recentGrades.length;
  
  let difficulty = 'NORMAL';
  if (averageGrade > 90) difficulty = 'CHALLENGING';
  else if (averageGrade < 70) difficulty = 'EASY';

  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (input.streakState.streakAtRisk) priority = 'high';
  else if (averageGrade > 85) priority = 'low';

  return { duration: preferredDuration, difficulty, priority };
}

async function generateRecommendationMessage(
  input: CoachInputContract,
  recommendation: { duration: number; difficulty: string; priority: string }
): Promise<string> {
  return `Your recent sessions show ${recommendation.difficulty.toLowerCase()} difficulty works well. Try a ${recommendation.duration}-minute ${recommendation.difficulty} session today.`;
}

async function generateStreakProtectionMessage(
  input: CoachInputContract,
  streakData: { currentStreak: number; hoursSinceLastSession: number; riskLevel: string }
): Promise<string> {
  const hoursLeft = Math.max(0, 24 - streakData.hoursSinceLastSession);
  return `Your ${streakData.currentStreak}-day streak expires in ${hoursLeft} hours! A quick ${input.preferredSessionLengths[0] || 25}-minute session will save it.`;
}

async function buildInputContractFromStreakData(
  userId: string,
  streakData: { currentStreak: number; hoursSinceLastSession: number; riskLevel: string }
): Promise<CoachInputContract> {
  // This would fetch real user data - for now return minimal contract
  return {
    recentSessionGrades: [],
    preferredSessionLengths: [25],
    completionTimes: [],
    streakState: {
      currentStreak: streakData.currentStreak,
      streakAtRisk: streakData.riskLevel !== 'low',
      hoursSinceLastSession: streakData.hoursSinceLastSession,
      streakRecord: streakData.currentStreak,
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 75,
      trend: 'stable',
      primaryFactors: [],
    },
    missionHistory: [],
    userGoalCategory: 'focus_improvement',
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: {
      isActive: false,
      tier: 'free',
      features: [],
    },
    timeContext: {
      currentHour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
      localTimezone: 'America/New_York',
    },
  };
}

async function buildInputContractForUser(userId: string): Promise<CoachInputContract> {
  // This would fetch real user data from various sources
  // For now, return a mock contract
  return {
    recentSessionGrades: [
      {
        sessionId: generateUUID(),
        grade: 85,
        duration: 1500,
        completedAt: Date.now() - 86400000,
        difficulty: 'NORMAL',
      },
    ],
    preferredSessionLengths: [1500, 1800],
    completionTimes: [9, 19],
    streakState: {
      currentStreak: 5,
      streakAtRisk: false,
      hoursSinceLastSession: 18,
      streakRecord: 12,
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 78,
      trend: 'improving',
      primaryFactors: ['consistency'],
    },
    missionHistory: [],
    userGoalCategory: 'focus_improvement',
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: {
      isActive: false,
      tier: 'free',
      features: [],
    },
    timeContext: {
      currentHour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
      localTimezone: 'America/New_York',
    },
  };
}

async function createDailyMissionFromSuggestion(
  userId: string,
  suggestion: CoachSuggestion
): Promise<string> {
  // This would integrate with the mission service
  // For now, return a mock mission ID
  return generateUUID();
}

function trackCoachSuggestionAccepted(userId: string, suggestionId: string, action: string): void {
  // Track analytics for coach suggestion acceptance
  eventBus.emit('coach:suggestion_accepted', {
    userId,
    suggestionId,
    action,
    timestamp: Date.now(),
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}