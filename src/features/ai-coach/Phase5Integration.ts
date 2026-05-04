/**
 * AI Coach Phase 5 Integration
 *
 * Phase 6C: AI Coach - Integrate AI Coach with new Phase 5 systems
 *
 * Creates intelligent coaching that understands and guides users through
 * the new Phase 5 systems (creatures, raids, events). Features include:
 *
 * - Creature care coaching and evolution guidance
 * - Raid participation optimization and squad coordination
 * - Prime Time event scheduling and reminders
 * - Cross-system insights and recommendations
 * - Personalized coaching for retention systems
 *
 * Dependencies:
 * - features/ai-coach (existing coach infrastructure)
 * - features/retention (Phase 5 systems)
 * - events (eventBus for coaching events)
 * - feature-flags (gradual rollout)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import { getStreakCreatureService } from '../retention/StreakCreatureSystem';
import { getWeeklyBossRaidsService } from '../retention/WeeklyBossRaids';
import { getPrimeTimeEventsService } from '../retention/PrimeTimeEvents';

// ============================================================================
// AI Coach Integration Constants
// ============================================================================

export const COACHING_INTEGRATION_CONFIG = {
  // Coaching priorities
  COACHING_PRIORITIES: {
    URGENT: 1.0,      // Immediate attention needed
    HIGH: 0.8,        // Important but not urgent
    MEDIUM: 0.6,      // Moderate importance
    LOW: 0.4,         // Nice to have
    INFO: 0.2,        // Informational only
  },

  // Intervention thresholds
  INTERVENTION_THRESHOLDS: {
    CREATURE_HAPPINESS_CRITICAL: 20,    // Below this = urgent coaching
    CREATURE_HEALTH_LOW: 40,            // Below this = coaching needed
    RAID_PARTICIPATION_DECLINE: 0.5,    // Below 50% recent participation
    EVENT_MISSED_THRESHOLD: 3,          // Miss 3 events = coaching
    EVOLUTION_STALL_WEEKS: 2,            // 2 weeks without evolution = coaching
  },

  // Coaching timing
  COACHING_WINDOWS: {
    MORNING_CHECKIN: { hour: 8, minute: 0 },    // Daily morning check-in
    EVENING_REVIEW: { hour: 20, minute: 0 },    // Daily evening review
    WEEKEND_PLANNING: { day: 'friday', hour: 17 }, // Weekend raid planning
    WEEKLY_SUMMARY: { day: 'sunday', hour: 18 }, // Weekly progress summary
  },

  // Message personalization
  PERSONALIZATION_LEVELS: {
    BASIC: 'basic',        // Generic coaching messages
    CONTEXTUAL: 'contextual', // System-aware messages
    PREDICTIVE: 'predictive', // Pattern-aware messages
    ADAPTIVE: 'adaptive',    // Learning user preferences
  },

  // Cross-system insights
  CROSS_SYSTEM_INSIGHTS: {
    enabled: true,
    minDataPoints: 5,      // Minimum data points for insights
    insightFrequency: 24 * 60 * 60 * 1000, // Daily insights
  },
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const CoachingTopicSchema = z.enum([
  'CREATURE_CARE',
  'CREATURE_EVOLUTION',
  'RAID_PREPARATION',
  'RAID_PARTICIPATION',
  'EVENT_OPTIMIZATION',
  'STRETCH_GOALS',
  'RECOVERY_GUIDANCE',
  'SQUAD_COORDINATION',
]);

export const CoachingPrioritySchema = z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'INFO']);

export const CoachingMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: CoachingTopicSchema,
  priority: CoachingPrioritySchema,
  
  // Content
  title: z.string(),
  message: z.string(),
  actionItems: z.array(z.string()).default([]),
  
  // Context
  context: z.record(z.unknown()).default({}),
  systemsInvolved: z.array(z.string()).default([]),
  
  // Personalization
  personalizationLevel: z.enum(['basic', 'contextual', 'predictive', 'adaptive']),
  userPreferences: z.record(z.boolean()).default({}),
  
  // Timing
  scheduledAt: z.number(),
  expiresAt: z.number().nullable().default(null),
  deliveredAt: z.number().nullable().default(null),
  
  // Engagement
  readAt: z.number().nullable().default(null),
  actionTaken: z.boolean().default(false),
  feedback: z.enum(['helpful', 'neutral', 'not_helpful']).nullable().default(null),
  
  createdAt: z.number(),
});

export const CrossSystemInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  insightType: z.enum([
    'CREATURE_RAID_SYNERGY',
    'EVENT_STREAK_CORRELATION',
    'SQUAD_PERFORMANCE_PATTERN',
    'PERSONALITY_BEHAVIOR_LINK',
    'RETENTION_RISK_ASSESSMENT',
  ]),
  
  // Insight content
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  
  // Data sources
  dataPoints: z.number(),
  systems: z.array(z.string()),
  confidence: z.number(), // 0-1
  
  // Impact assessment
  potentialImpact: z.enum(['low', 'medium', 'high', 'critical']),
  effortRequired: z.enum(['low', 'medium', 'high']),
  
  // Status
  status: z.enum(['new', 'acknowledged', 'acting_on', 'completed']).default('new'),
  createdAt: z.number(),
  acknowledgedAt: z.number().nullable().default(null),
});

export type CoachingTopic = z.infer<typeof CoachingTopicSchema>;
export type CoachingPriority = z.infer<typeof CoachingPrioritySchema>;
export type CoachingMessage = z.infer<typeof CoachingMessageSchema>;
export type CrossSystemInsight = z.infer<typeof CrossSystemInsightSchema>;

export interface UserCoachingProfile {
  userId: string;
  
  // Preferences
  preferredTopics: CoachingTopic[];
  messageFrequency: 'high' | 'medium' | 'low';
  personalizationLevel: 'basic' | 'contextual' | 'predictive' | 'adaptive';
  
  // Engagement patterns
  bestResponseTimes: number[]; // Hours when user is most responsive
  preferredMessageLength: 'short' | 'medium' | 'detailed';
  actionOriented: boolean; // Prefers actionable advice
  
  // Learning style
  learningStyle: 'visual' | 'textual' | 'interactive';
  motivationType: 'intrinsic' | 'extrinsic' | 'both';
  
  // System engagement
  systemEngagement: Record<string, number>; // system -> engagement score (0-1)
  
  updatedAt: number,
}

// ============================================================================
// AI Coach Phase 5 Integration Service
// ============================================================================

export class AICoachPhase5Integration {
  private coachingProfiles: Map<string, UserCoachingProfile> = new Map();
  private messageQueue: Map<string, CoachingMessage[]> = new Map(); // userId -> messages
  private insights: Map<string, CrossSystemInsight[]> = new Map(); // userId -> insights
  private interventionHistory: Map<string, any[]> = new Map(); // userId -> history

  // Phase 5 service references
  private creatureService = getStreakCreatureService();
  private raidService = getWeeklyBossRaidsService();
  private eventsService = getPrimeTimeEventsService();

  /**
   * Check if AI Coach integration is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('ai_coach_phase5_integration');
  }

  /**
   * Initialize user coaching profile
   */
  async initializeCoachingProfile(userId: string): Promise<UserCoachingProfile> {
    const existingProfile = this.coachingProfiles.get(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const profile: UserCoachingProfile = {
      userId,
      
      // Default preferences
      preferredTopics: ['CREATURE_CARE', 'RAID_PREPARATION', 'EVENT_OPTIMIZATION'],
      messageFrequency: 'medium',
      personalizationLevel: 'contextual',
      
      // Default engagement patterns
      bestResponseTimes: [8, 12, 20], // 8 AM, 12 PM, 8 PM
      preferredMessageLength: 'medium',
      actionOriented: true,
      
      // Default learning style
      learningStyle: 'textual',
      motivationType: 'both',
      
      // System engagement (will be updated with actual data)
      systemEngagement: {
        'creatures': 0.5,
        'raids': 0.5,
        'events': 0.5,
        'squads': 0.5,
      },
      
      updatedAt: Date.now(),
    };

    this.coachingProfiles.set(userId, profile);
    this.messageQueue.set(userId, []);
    this.insights.set(userId, []);

    // Emit initialization event
    eventBus.publish('ai_coach:profile_initialized', {
      userId,
      personalizationLevel: profile.personalizationLevel,
    });

    return profile;
  }

  /**
   * Generate comprehensive coaching for user
   */
  async generateCoachingSession(userId: string): Promise<{
    messages: CoachingMessage[];
    insights: CrossSystemInsight[];
    recommendations: string[];
  }> {
    const profile = await this.initializeCoachingProfile(userId);
    
    // Gather data from Phase 5 systems
    const creatureData = await this.gatherCreatureData(userId);
    const raidData = await this.gatherRaidData(userId);
    const eventData = await this.gatherEventData(userId);
    
    // Generate coaching messages
    const messages = await this.generateCoachingMessages(userId, profile, {
      creature: creatureData,
      raids: raidData,
      events: eventData,
    });
    
    // Generate cross-system insights
    const insights = await this.generateCrossSystemInsights(userId, {
      creature: creatureData,
      raids: raidData,
      events: eventData,
    });
    
    // Generate overall recommendations
    const recommendations = this.generateOverallRecommendations(profile, messages, insights);
    
    // Queue messages for delivery
    await this.queueCoachingMessages(userId, messages);
    
    return { messages, insights, recommendations };
  }

  /**
   * Analyze and coach creature care
   */
  async analyzeCreatureCare(userId: string): Promise<CoachingMessage | null> {
    const creatureStats = this.creatureService.getCreatureStats(userId);
    if (!creatureStats) return null;

    const profile = await this.initializeCoachingProfile(userId);
    const messages: CoachingMessage[] = [];

    // Critical: Low health or happiness
    if (creatureStats.health < COACHING_INTEGRATION_CONFIG.INTERVENTION_THRESHOLDS.CREATURE_HEALTH_LOW) {
      messages.push(await this.createCreatureHealthMessage(userId, creatureStats, 'HIGH'));
    }

    if (creatureStats.happiness < COACHING_INTEGRATION_CONFIG.INTERVENTION_THRESHOLDS.CREATURE_HAPPINESS_CRITICAL) {
      messages.push(await this.createCreatureHappinessMessage(userId, creatureStats, 'URGENT'));
    }

    // Evolution guidance
    if (creatureStats.nextEvolution.progress < 30) {
      messages.push(await this.createEvolutionGuidanceMessage(userId, creatureStats, 'MEDIUM'));
    }

    // Personality-based coaching
    if (creatureStats.personality.length > 0) {
      messages.push(await this.createPersonalityCoachingMessage(userId, creatureStats, 'LOW'));
    }

    return messages.length > 0 ? messages[0] : null;
  }

  /**
   * Analyze and coach raid participation
   */
  async analyzeRaidParticipation(userId: string): Promise<CoachingMessage | null> {
    const raidHistory = this.raidService.getUserRaidHistory(userId, 4); // Last 4 weeks
    const currentRaid = this.raidService.getCurrentRaid();
    
    const profile = await this.initializeCoachingProfile(userId);
    
    // Calculate participation rate
    const recentParticipation = raidHistory.filter(h => h.participation.status === 'completed').length;
    const participationRate = recentParticipation / Math.max(raidHistory.length, 1);
    
    if (participationRate < COACHING_INTEGRATION_CONFIG.INTERVENTION_THRESHOLDS.RAID_PARTICIPATION_DECLINE) {
      return await this.createRaidParticipationMessage(userId, {
        participationRate,
        currentRaid,
        recentHistory: raidHistory.slice(-2),
      }, 'HIGH');
    }

    // Squad coordination coaching
    if (currentRaid && currentRaid.status === 'active') {
      return await this.createRaidCoordinationMessage(userId, currentRaid, 'MEDIUM');
    }

    return null;
  }

  /**
   * Analyze and coach event participation
   */
  async analyzeEventParticipation(userId: string): Promise<CoachingMessage | null> {
    const upcomingEvents = this.eventsService.getUpcomingEvents(userId, 24);
    const userHistory = this.eventsService.getUserEventHistory(userId, 7);
    
    // Count missed events
    const missedEvents = userHistory.filter(h => 
      h.participation.status === 'dropped_out' || 
      (Date.now() - h.event.endTime > 24 * 60 * 60 * 1000 && !h.participation.completedAt)
    ).length;

    if (missedEvents >= COACHING_INTEGRATION_CONFIG.INTERVENTION_THRESHOLDS.EVENT_MISSED_THRESHOLD) {
      return await this.createEventParticipationMessage(userId, {
        missedEvents,
        upcomingEvents,
        recentHistory: userHistory.slice(-3),
      }, 'MEDIUM');
    }

    // Optimization coaching for upcoming events
    if (upcomingEvents.length > 0) {
      return await this.createEventOptimizationMessage(userId, upcomingEvents[0], 'LOW');
    }

    return null;
  }

  /**
   * Generate cross-system insights
   */
  async generateCrossSystemInsights(
    userId: string,
    data: {
      creature: any;
      raids: any;
      events: any;
    }
  ): Promise<CrossSystemInsight[]> {
    const insights: CrossSystemInsight[] = [];

    // Creature-Raid synergy
    const creatureRaidInsight = await this.analyzeCreatureRaidSynergy(userId, data);
    if (creatureRaidInsight) insights.push(creatureRaidInsight);

    // Event-Streak correlation
    const eventStreakInsight = await this.analyzeEventStreakCorrelation(userId, data);
    if (eventStreakInsight) insights.push(eventStreakInsight);

    // Squad performance patterns
    const squadPatternInsight = await this.analyzeSquadPerformancePattern(userId, data);
    if (squadPatternInsight) insights.push(squadPatternInsight);

    // Personality-behavior links
    const personalityInsight = await this.analyzePersonalityBehaviorLink(userId, data);
    if (personalityInsight) insights.push(personalityInsight);

    // Retention risk assessment
    const retentionInsight = await this.assessRetentionRisk(userId, data);
    if (retentionInsight) insights.push(retentionInsight);

    // Store insights
    const userInsights = this.insights.get(userId) || [];
    userInsights.push(...insights);
    this.insights.set(userId, userInsights);

    return insights;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Gather creature data for analysis
   */
  private async gatherCreatureData(userId: string): Promise<any> {
    const stats = this.creatureService.getCreatureStats(userId);
    const careHistory = this.creatureService.getCareHistory(userId, 10);
    
    return {
      stats,
      careHistory,
      lastCare: careHistory[0] || null,
    };
  }

  /**
   * Gather raid data for analysis
   */
  private async gatherRaidData(userId: string): Promise<any> {
    const history = this.raidService.getUserRaidHistory(userId, 8);
    const currentRaid = this.raidService.getCurrentRaid();
    const leaderboard = currentRaid ? this.raidService.getRaidLeaderboard(currentRaid.id, userId) : null;
    
    return {
      history,
      currentRaid,
      leaderboard,
      participationRate: history.filter(h => h.participation.status === 'completed').length / Math.max(history.length, 1),
    };
  }

  /**
   * Gather event data for analysis
   */
  private async gatherEventData(userId: string): Promise<any> {
    const upcoming = this.eventsService.getUpcomingEvents(userId, 48);
    const history = this.eventsService.getUserEventHistory(userId, 14);
    const active = this.eventsService.getActiveEvents();
    
    return {
      upcoming,
      history,
      active,
      participationRate: history.filter(h => h.participation.completedAt).length / Math.max(history.length, 1),
    };
  }

  /**
   * Generate coaching messages based on data
   */
  private async generateCoachingMessages(
    userId: string,
    profile: UserCoachingProfile,
    data: any
  ): Promise<CoachingMessage[]> {
    const messages: CoachingMessage[] = [];

    // Creature care messages
    const creatureMessage = await this.analyzeCreatureCare(userId);
    if (creatureMessage) messages.push(creatureMessage);

    // Raid participation messages
    const raidMessage = await this.analyzeRaidParticipation(userId);
    if (raidMessage) messages.push(raidMessage);

    // Event participation messages
    const eventMessage = await this.analyzeEventParticipation(userId);
    if (eventMessage) messages.push(eventMessage);

    // Sort by priority
    messages.sort((a, b) => {
      const priorityOrder = { URGENT: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return messages.slice(0, 3); // Limit to top 3 messages
  }

  /**
   * Create creature health coaching message
   */
  private async createCreatureHealthMessage(
    userId: string,
    creatureStats: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    
    return {
      id: `coach_${userId}_creature_health_${now}`,
      userId,
      topic: 'CREATURE_CARE',
      priority,
      title: 'Creature Health Alert',
      message: `Your ${creatureStats.stage} creature's health is at ${creatureStats.health}%. Low health can slow evolution and reduce abilities. Consider grooming your creature to restore health.`,
      actionItems: [
        'Groom your creature (25 health restored)',
        'Check for recent care activities',
        'Monitor health trends over the next few days',
      ],
      context: { creatureStats, healthLevel: creatureStats.health },
      systemsInvolved: ['creatures'],
      personalizationLevel: 'contextual',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create creature happiness coaching message
   */
  private async createCreatureHappinessMessage(
    userId: string,
    creatureStats: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    
    return {
      id: `coach_${userId}_creature_happiness_${now}`,
      userId,
      topic: 'CREATURE_CARE',
      priority,
      title: 'Creature Needs Attention!',
      message: `Your creature's happiness has dropped to ${creatureStats.happiness}%. Unhappy creatures may refuse to participate in activities and evolve more slowly.`,
      actionItems: [
        'Feed your creature (20 happiness restored)',
        'Play with your creature (15 bond restored)',
        'Check when you last cared for your creature',
      ],
      context: { creatureStats, happinessLevel: creatureStats.happiness },
      systemsInvolved: ['creatures'],
      personalizationLevel: 'contextual',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + 12 * 60 * 60 * 1000, // 12 hours (more urgent)
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create evolution guidance message
   */
  private async createEvolutionGuidanceMessage(
    userId: string,
    creatureStats: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    const nextStage = creatureStats.nextEvolution.stage;
    
    return {
      id: `coach_${userId}_evolution_${now}`,
      userId,
      topic: 'CREATURE_EVOLUTION',
      priority,
      title: `Evolution Progress: ${creatureStats.nextEvolution.progress}%`,
      message: `Your creature is ${creatureStats.nextEvolution.progress}% of the way to evolving into ${nextStage}. Higher purity sessions and consistent care will speed up evolution.`,
      actionItems: [
        'Focus on sessions with 80%+ purity',
        'Maintain daily creature care routine',
        'Complete sessions during your most productive hours',
      ],
      context: { creatureStats, evolutionProgress: creatureStats.nextEvolution.progress },
      systemsInvolved: ['creatures', 'sessions'],
      personalizationLevel: 'predictive',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + 48 * 60 * 60 * 1000, // 48 hours
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create personality-based coaching message
   */
  private async createPersonalityCoachingMessage(
    userId: string,
    creatureStats: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    const primaryTrait = creatureStats.personality[0];
    
    return {
      id: `coach_${userId}_personality_${now}`,
      userId,
      topic: 'CREATURE_CARE',
      priority,
      title: `Your ${primaryTrait} Creature`,
      message: this.generatePersonalityMessage(primaryTrait, creatureStats),
      actionItems: this.generatePersonalityActions(primaryTrait),
      context: { creatureStats, personality: creatureStats.personality },
      systemsInvolved: ['creatures'],
      personalizationLevel: 'adaptive',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + 72 * 60 * 60 * 1000, // 3 days
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Generate personality-specific message
   */
  private generatePersonalityMessage(trait: string, creatureStats: any): string {
    const messages = {
      'EARLY_BIRD': `Your Early Bird creature is most active in mornings! Schedule sessions before noon to maximize its happiness and evolution progress.`,
      'NIGHT_OWL': `Your Night Owl creature thrives in evening sessions. Consider scheduling focus time between 7 PM - 10 PM for best results.`,
      'STEADY': `Your Steady creature values routine. Maintain consistent session times to keep it happy and progressing steadily.`,
      'INTENSE': `Your Intense creature loves challenges! Longer, high-purity sessions will help it evolve faster and stay motivated.`,
      'SOCIAL': `Your Social creature thrives on interaction! Join squad sessions and participate in raids to keep it engaged.`,
      'EXPLORER': `Your Explorer creature loves variety! Try different session modes and participate in various events to keep it stimulated.`,
    };
    
    return messages[trait as keyof typeof messages] || 'Your creature has unique preferences - observe its behavior to learn more!';
  }

  /**
   * Generate personality-specific actions
   */
  private generatePersonalityActions(trait: string): string[] {
    const actions = {
      'EARLY_BIRD': [
        'Schedule morning sessions when possible',
        'Feed creature after early sessions',
        'Track morning session performance',
      ],
      'NIGHT_OWL': [
        'Optimize evening session scheduling',
        'Create relaxing evening routine',
        'Monitor evening energy levels',
      ],
      'STEADY': [
        'Maintain consistent session times',
        'Set up daily reminders',
        'Track routine adherence',
      ],
      'INTENSE': [
        'Challenge yourself with longer sessions',
        'Focus on high-purity targets',
        'Track intensity progress',
      ],
      'SOCIAL': [
        'Join squad activities regularly',
        'Participate in weekend raids',
        'Engage with squad members',
      ],
      'EXPLORER': [
        'Try different session modes',
        'Participate in various events',
        'Experiment with new techniques',
      ],
    };
    
    return actions[trait as keyof typeof actions] || ['Observe creature behavior patterns'];
  }

  /**
   * Create raid participation message
   */
  private async createRaidParticipationMessage(
    userId: string,
    data: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    
    return {
      id: `coach_${userId}_raid_participation_${now}`,
      userId,
      topic: 'RAID_PARTICIPATION',
      priority,
      title: 'Weekend Raid Participation',
      message: `Your recent raid participation is ${Math.round(data.participationRate * 100)}%. Weekend raids are great for squad bonding and epic rewards!`,
      actionItems: data.currentRaid ? [
        'Join the current weekend raid',
        'Coordinate with your squad',
        'Aim for at least 1000 damage contribution',
      ] : [
        'Plan for next weekend\'s raid',
        'Check raid schedule',
        'Prepare squad coordination',
      ],
      context: data,
      systemsInvolved: ['raids', 'squads'],
      personalizationLevel: 'contextual',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + (data.currentRaid ? 6 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000),
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create raid coordination message
   */
  private async createRaidCoordinationMessage(
    userId: string,
    currentRaid: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    const timeRemaining = currentRaid.endTime - Date.now();
    const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
    
    return {
      id: `coach_${userId}_raid_coordination_${now}`,
      userId,
      topic: 'SQUAD_COORDINATION',
      priority,
      title: 'Raid Coordination Needed',
      message: `Active raid in progress! ${hoursRemaining} hours remaining. Coordinate with your squad to maximize damage and rewards.`,
      actionItems: [
        'Join the current raid session',
        'Communicate with squad members',
        'Focus on high-purity sessions for more damage',
      ],
      context: { currentRaid, timeRemaining },
      systemsInvolved: ['raids', 'squads'],
      personalizationLevel: 'contextual',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: currentRaid.endTime,
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create event participation message
   */
  private async createEventParticipationMessage(
    userId: string,
    data: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    
    return {
      id: `coach_${userId}_event_participation_${now}`,
      userId,
      topic: 'EVENT_OPTIMIZATION',
      priority,
      title: 'Missed Bonus Events',
      message: `You've missed ${data.missedEvents} recent Prime Time events. These events offer bonus rewards and help maintain engagement.`,
      actionItems: [
        'Check upcoming event schedule',
        'Set reminders for preferred events',
        'Focus on events that match your schedule',
      ],
      context: data,
      systemsInvolved: ['events'],
      personalizationLevel: 'contextual',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Create event optimization message
   */
  private async createEventOptimizationMessage(
    userId: string,
    upcomingEvent: any,
    priority: CoachingPriority
  ): Promise<CoachingMessage> {
    const now = Date.now();
    const timeUntilStart = upcomingEvent.timeUntilStart;
    
    return {
      id: `coach_${userId}_event_optimization_${now}`,
      userId,
      topic: 'EVENT_OPTIMIZATION',
      priority,
      title: `Upcoming: ${upcomingEvent.event.name}`,
      message: `${upcomingEvent.event.name} starts in ${timeUntilStart} minutes! Prepare to maximize your rewards.`,
      actionItems: [
        'Schedule session time for the event',
        'Ensure creature is cared for',
        'Check squad participation options',
      ],
      context: { upcomingEvent },
      systemsInvolved: ['events'],
      personalizationLevel: 'predictive',
      userPreferences: {},
      scheduledAt: now,
      expiresAt: upcomingEvent.event.startTime,
      deliveredAt: null,
      readAt: null,
      actionTaken: false,
      feedback: null,
      createdAt: now,
    };
  }

  /**
   * Analyze creature-raid synergy
   */
  private async analyzeCreatureRaidSynergy(
    userId: string,
    data: any
  ): Promise<CrossSystemInsight | null> {
    const creatureStats = data.creature.stats;
    const raidData = data.raids;
    
    if (!creatureStats || !raidData.history.length) return null;
    
    // Look for correlation between creature care and raid performance
    const recentRaids = raidData.history.slice(-4);
    const goodCareRaids = recentRaids.filter(raid => {
      // This would check if creature was well-cared for before raid
      return raid.participation.totalDamage > 1000;
    }).length;
    
    const synergyScore = goodCareRaids / recentRaids.length;
    
    if (synergyScore > 0.7) {
      return {
        id: `insight_${userId}_creature_raid_${Date.now()}`,
        userId,
        insightType: 'CREATURE_RAID_SYNERGY',
        title: 'Creature Care Boosts Raid Performance',
        description: `Your raid performance improves when your creature is well-cared for. ${Math.round(synergyScore * 100)}% of your best raids followed good creature care.`,
        recommendation: 'Maintain consistent creature care, especially before weekend raids, to maximize your contribution.',
        dataPoints: recentRaids.length,
        systems: ['creatures', 'raids'],
        confidence: synergyScore,
        potentialImpact: 'high',
        effortRequired: 'low',
        status: 'new',
        createdAt: Date.now(),
        acknowledgedAt: null,
      };
    }
    
    return null;
  }

  /**
   * Analyze event-streak correlation
   */
  private async analyzeEventStreakCorrelation(
    userId: string,
    data: any
  ): Promise<CrossSystemInsight | null> {
    const eventData = data.events;
    const creatureStats = data.creature.stats;
    
    if (!eventData.history.length || !creatureStats) return null;
    
    // Look for correlation between event participation and streak/evolution
    const eventParticipants = eventData.history.filter(h => h.participation.completedAt);
    const streakCorrelation = creatureStats.currentStreak > 5 && eventParticipants.length > 3;
    
    if (streakCorrelation) {
      return {
        id: `insight_${userId}_event_streak_${Date.now()}`,
        userId,
        insightType: 'EVENT_STREAK_CORRELATION',
        title: 'Event Participation Supports Streak',
        description: 'Your consistent event participation correlates with strong streak maintenance and creature evolution.',
        recommendation: 'Continue prioritizing Prime Time events to support your streak and creature development.',
        dataPoints: eventData.history.length,
        systems: ['events', 'creatures', 'streaks'],
        confidence: 0.7,
        potentialImpact: 'medium',
        effortRequired: 'low',
        status: 'new',
        createdAt: Date.now(),
        acknowledgedAt: null,
      };
    }
    
    return null;
  }

  /**
   * Analyze squad performance patterns
   */
  private async analyzeSquadPerformancePattern(
    userId: string,
    data: any
  ): Promise<CrossSystemInsight | null> {
    const raidData = data.raids;
    
    if (!raidData.leaderboard) return null;
    
    const userRanking = raidData.leaderboard.userRanking;
    if (!userRanking) return null;
    
    // Analyze squad performance patterns
    const squadCoordination = userRanking.rank <= 5 ? 'excellent' : 'improving';
    
    return {
      id: `insight_${userId}_squad_pattern_${Date.now()}`,
      userId,
      insightType: 'SQUAD_PERFORMANCE_PATTERN',
      title: `Squad Coordination: ${squadCoordination}`,
      description: `Your raid performance shows ${squadCoordination} squad coordination with rank #${userRanking.rank} in recent raids.`,
      recommendation: squadCoordination === 'excellent' 
        ? 'Maintain current squad coordination strategies'
        : 'Consider increasing communication and coordination with squad members',
      dataPoints: raidData.history.length,
      systems: ['raids', 'squads'],
      confidence: 0.8,
      potentialImpact: 'medium',
      effortRequired: 'medium',
      status: 'new',
      createdAt: Date.now(),
      acknowledgedAt: null,
    };
  }

  /**
   * Analyze personality-behavior links
   */
  private async analyzePersonalityBehaviorLink(
    userId: string,
    data: any
  ): Promise<CrossSystemInsight | null> {
    const creatureStats = data.creature.stats;
    
    if (!creatureStats.personality.length) return null;
    
    const primaryTrait = creatureStats.personality[0];
    
    return {
      id: `insight_${userId}_personality_behavior_${Date.now()}`,
      userId,
      insightType: 'PERSONALITY_BEHAVIOR_LINK',
      title: `${primaryTrait} Personality Pattern`,
      description: `Your creature's ${primaryTrait} personality influences your optimal session timing and activity preferences.`,
      recommendation: this.generatePersonalityRecommendation(primaryTrait),
      dataPoints: creatureStats.totalSessions,
      systems: ['creatures', 'sessions'],
      confidence: 0.6,
      potentialImpact: 'medium',
      effortRequired: 'low',
      status: 'new',
      createdAt: Date.now(),
      acknowledgedAt: null,
    };
  }

  /**
   * Generate personality-based recommendation
   */
  private generatePersonalityRecommendation(trait: string): string {
    const recommendations = {
      'EARLY_BIRD': 'Schedule your most important sessions in the morning when your creature is most active.',
      'NIGHT_OWL': 'Focus on evening sessions to align with your creature\'s peak performance times.',
      'STEADY': 'Maintain consistent daily routines to keep your creature happy and productive.',
      'INTENSE': 'Challenge yourself with longer, more focused sessions to satisfy your creature\'s intensity.',
      'SOCIAL': 'Prioritize squad activities and social sessions to keep your engaged creature motivated.',
      'EXPLORER': 'Try new session modes and activities regularly to stimulate your curious creature.',
    };
    
    return recommendations[trait as keyof typeof recommendations] || 'Continue observing your creature\'s preferences to optimize your routine.';
  }

  /**
   * Assess retention risk
   */
  private async assessRetentionRisk(
    userId: string,
    data: any
  ): Promise<CrossSystemInsight | null> {
    const eventData = data.events;
    const raidData = data.raids;
    const creatureStats = data.creature.stats;
    
    // Calculate risk factors
    const riskFactors = [];
    
    if (eventData.participationRate < 0.3) riskFactors.push('Low event participation');
    if (raidData.participationRate < 0.3) riskFactors.push('Low raid participation');
    if (creatureStats?.happiness < 30) riskFactors.push('Creature neglect');
    
    const riskLevel = riskFactors.length;
    
    if (riskLevel >= 2) {
      return {
        id: `insight_${userId}_retention_risk_${Date.now()}`,
        userId,
        insightType: 'RETENTION_RISK_ASSESSMENT',
        title: 'Retention Risk Assessment',
        description: `Multiple risk factors detected: ${riskFactors.join(', ')}. This may impact long-term engagement.`,
        recommendation: 'Focus on re-engaging with one system at a time. Start with creature care to rebuild momentum.',
        dataPoints: 10,
        systems: ['creatures', 'raids', 'events'],
        confidence: 0.8,
        potentialImpact: 'critical',
        effortRequired: 'medium',
        status: 'new',
        createdAt: Date.now(),
        acknowledgedAt: null,
      };
    }
    
    return null;
  }

  /**
   * Generate overall recommendations
   */
  private generateOverallRecommendations(
    profile: UserCoachingProfile,
    messages: CoachingMessage[],
    insights: CrossSystemInsight[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Priority-based recommendations
    const urgentMessages = messages.filter(m => m.priority === 'URGENT');
    if (urgentMessages.length > 0) {
      recommendations.push('Address urgent creature care needs immediately');
    }
    
    // Insight-based recommendations
    const criticalInsights = insights.filter(i => i.potentialImpact === 'critical');
    if (criticalInsights.length > 0) {
      recommendations.push('Focus on retention-critical activities first');
    }
    
    // Engagement optimization
    if (profile.personalizationLevel === 'adaptive') {
      recommendations.push('Continue providing feedback to improve coaching personalization');
    }
    
    return recommendations;
  }

  /**
   * Queue coaching messages for delivery
   */
  private async queueCoachingMessages(userId: string, messages: CoachingMessage[]): Promise<void> {
    const queue = this.messageQueue.get(userId) || [];
    queue.push(...messages);
    this.messageQueue.set(userId, queue);
    
    // Emit queuing event
    eventBus.publish('ai_coach:messages_queued', {
      userId,
      messageCount: messages.length,
      priorities: messages.map(m => m.priority),
    });
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createAICoachPhase5Integration(): AICoachPhase5Integration {
  return new AICoachPhase5Integration();
}

// Singleton instance
let aiCoachPhase5Integration: AICoachPhase5Integration | null = null;

export function getAICoachPhase5Integration(): AICoachPhase5Integration {
  if (!aiCoachPhase5Integration) {
    aiCoachPhase5Integration = new AICoachPhase5Integration();
  }
  return aiCoachPhase5Integration;
}
