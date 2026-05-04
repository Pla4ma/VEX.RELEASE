/**
 * Rivals Feature Events
 * 
 * Event definitions for competitive gameplay, rivalries, and leaderboard features.
 */

import { RivalEvent } from './types';

// Base Event Interface
export interface BaseRivalEvent {
  id: string;
  userId: string;
  rivalId?: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  correlationId?: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

// Rivalry Lifecycle Events
export interface RivalryStartedEvent extends BaseRivalEvent {
  type: 'rivalry_started';
  data: {
    rivalryId: string;
    initiatedBy: string;
    rivalryType: string;
    stakes: {
      type: string;
      amount: number;
      duration?: number;
      conditions: any[];
      rewards: any[];
      penalties: any[];
    };
    context: {
      triggerReason: string;
      previousInteractions: number;
      mutualConsent: boolean;
    };
    expectations: {
      duration: number;
      intensity: string;
      frequency: string;
    };
  };
}

export interface RivalryAcceptedEvent extends BaseRivalEvent {
  type: 'rivalry_accepted';
  data: {
    rivalryId: string;
    acceptedAt: Date;
    responseTime: number; // time since invitation in seconds
    modifications: {
      stakes: any[];
      rules: any[];
      timeline: any[];
    };
    motivation: string;
    confidence: number;
  };
}

export interface RivalryDeclinedEvent extends BaseRivalEvent {
  type: 'rivalry_declined';
  data: {
    rivalryId: string;
    declinedAt: Date;
    responseTime: number;
    reason: 'not_interested' | 'stakes_too_high' | 'timing_bad' | 'skill_mismatch' | 'personal';
    message?: string;
    alternativeOffer?: {
      type: string;
      parameters: any;
    };
  };
}

export interface RivalryEndedEvent extends BaseRivalEvent {
  type: 'rivalry_ended';
  data: {
    rivalryId: string;
    endDate: Date;
    endReason: string;
    endedBy: string;
    mutual: boolean;
    finalMetrics: {
      duration: number;
      totalEvents: number;
      userWins: number;
      rivalWins: number;
      draws: number;
      userScore: number;
      rivalScore: number;
    };
    outcomes: {
      winner?: string;
      sportsmanship: number;
      satisfaction: number;
      rematchInterest: boolean;
    };
    settlement: {
      stakes: any[];
      rewards: any[];
      penalties: any[];
    };
  };
}

// Match Events
export interface RivalryMatchStartedEvent extends BaseRivalEvent {
  type: 'rivalry_match_started';
  data: {
    matchId: string;
    rivalryId: string;
    matchType: string;
    format: string;
    settings: {
      difficulty: string;
      duration: number;
      rules: any[];
      objectives: any[];
    };
    participants: {
      user: {
        userId: string;
        readiness: number;
        strategy: string;
      };
      rival: {
        rivalId: string;
        readiness: number;
        strategy: string;
      };
    };
    context: {
      environment: string;
      spectators: number;
      importance: string;
    };
  };
}

export interface RivalryMatchCompletedEvent extends BaseRivalEvent {
  type: 'rivalry_match_completed';
  data: {
    matchId: string;
    rivalryId: string;
    completedAt: Date;
    duration: number;
    result: {
      winner: string;
      loser?: string;
      score: {
        user: number;
        rival: number;
      };
      method: string;
      margin: number;
    };
    performance: {
      user: {
        accuracy: number;
        speed: number;
        efficiency: number;
        strategy: string;
      };
      rival: {
        accuracy: number;
        speed: number;
        efficiency: number;
        strategy: string;
      };
    };
    impact: {
      rivalryMomentum: number;
      userMomentum: number;
      rivalMomentum: number;
      psychologicalImpact: number;
    };
  };
}

export interface RivalryMatchInterruptedEvent extends BaseRivalEvent {
  type: 'rivalry_match_interrupted';
  data: {
    matchId: string;
    rivalryId: string;
    interruptedAt: Date;
    interruptionReason: 'technical' | 'user_disconnection' | 'mutual_agreement' | 'fair_play_violation';
    interruptionBy: string;
    progress: {
      completion: number;
      currentScore: {
        user: number;
        rival: number;
      };
      timeElapsed: number;
    };
    resolution: {
      rescheduled: boolean;
      newTime?: Date;
      compensation: any[];
    };
  };
}

// Performance Events
export interface RivalryPerformanceMilestoneEvent extends BaseRivalEvent {
  type: 'rivalry_performance_milestone';
  data: {
    rivalryId: string;
    milestoneType: string;
    achievedAt: Date;
    milestone: {
      type: string;
      value: number;
      description: string;
      significance: string;
    };
    context: {
      matchId?: string;
      situation: string;
      pressure: number;
    };
    impact: {
      morale: number;
      confidence: number;
      strategy: string;
    };
    recognition: {
      achievement: string;
      badge: string;
      celebration: boolean;
    };
  };
}

export interface RivalryStreakUpdatedEvent extends BaseRivalEvent {
  type: 'rivalry_streak_updated';
  data: {
    rivalryId: string;
    streakType: 'wins' | 'losses' | 'draws' | 'matches';
    currentStreak: number;
    previousStreak: number;
    streakDirection: 'extended' | 'broken' | 'reset';
    lastMatch: {
      matchId: string;
      result: string;
      opponent: string;
      date: Date;
    };
    streakHistory: {
      longest: number;
      current: number;
      average: number;
      total: number;
    };
    psychological: {
      momentum: number;
      pressure: number;
      confidence: number;
    };
  };
}

export interface RivalryRankingChangedEvent extends BaseRivalEvent {
  type: 'rivalry_ranking_changed';
  data: {
    rivalryId: string;
    rankingType: string;
    previousRank: number;
    currentRank: number;
    rankChange: number;
    totalParticipants: number;
    percentile: number;
    leaderboard: {
      type: string;
      scope: string;
      timeframe: string;
    };
    context: {
      contributingMatch: string;
      performance: number;
      factors: string[];
    };
    implications: {
      qualification: any;
      seeding: any;
      recognition: any;
    };
  };
}

// Tournament Events
export interface RivalryTournamentJoinedEvent extends BaseRivalEvent {
  type: 'rivalry_tournament_joined';
  data: {
    tournamentId: string;
    tournamentName: string;
    tournamentType: string;
    format: string;
    joinedAt: Date;
    entry: {
      seed: number;
      bracket: string;
      division: string;
    };
    expectations: {
      participants: number;
      duration: number;
      difficulty: string;
      prizes: any[];
    };
    rivalry: {
      rivalInTournament: boolean;
      rivalSeed?: number;
      potentialMatchup: number;
    };
  };
}

export interface RivalryTournamentMatchEvent extends BaseRivalEvent {
  type: 'rivalry_tournament_match';
  data: {
    tournamentId: string;
    matchId: string;
    round: number;
    bracket: string;
    stage: string;
    participants: {
      user: {
        userId: string;
        seed: number;
        rank: number;
      };
      opponent: {
        userId: string;
        seed: number;
        rank: number;
      };
    };
    stakes: {
      advancement: boolean;
      elimination: boolean;
      prize: any[];
      ranking: any[];
    };
    context: {
      importance: number;
      spectators: number;
      pressure: number;
    };
  };
}

export interface RivalryTournamentProgressEvent extends BaseRivalEvent {
  type: 'rivalry_tournament_progress';
  data: {
    tournamentId: string;
    stage: string;
    round: number;
    progress: {
      advanced: boolean;
      eliminated: boolean;
      placement: number;
      performance: number;
    };
    statistics: {
      matchesPlayed: number;
      wins: number;
      losses: number;
      points: number;
      differential: number;
    };
    rivalry: {
      rivalProgress: any;
      headToHead: any;
      potentialMeeting: any;
    };
    achievements: {
      milestones: string[];
      records: string[];
      badges: string[];
    };
  };
}

// Social Events
export interface RivalryTrashTalkEvent extends BaseRivalEvent {
  type: 'rivalry_trash_talk';
  data: {
    rivalryId: string;
    messageId: string;
    content: string;
    tone: 'friendly' | 'competitive' | 'aggressive' | 'humorous' | 'respectful';
    medium: 'chat' | 'emote' | 'gesture' | 'voice' | 'custom';
    context: {
      timing: string; // pre-match, during-match, post-match
      situation: string;
      trigger: string;
    };
    reception: {
      reaction: string;
      response: string;
      impact: number;
    };
    moderation: {
      flagged: boolean;
      warning: boolean;
      penalty: any;
    };
  };
}

export interface RivalrySportsmanshipEvent extends BaseRivalEvent {
  type: 'rivalry_sportsmanship';
  data: {
    rivalryId: string;
    action: string;
    sportsmanshipType: 'good' | 'poor' | 'excellent' | 'questionable';
    context: {
      matchId?: string;
      timing: string;
      situation: string;
    };
    impact: {
      onRival: number;
      onCommunity: number;
      onReputation: number;
    };
    recognition: {
      points: number;
      badge: string;
      title: string;
    };
  };
}

export interface RivalrySocialInteractionEvent extends BaseRivalEvent {
  type: 'rivalry_social_interaction';
  data: {
    rivalryId: string;
    interactionType: 'friend_request' | 'message' | 'gift' | 'compliment' | 'invitation';
    interaction: {
      action: string;
      content?: string;
      value?: any;
    };
    context: {
      timing: string;
      motivation: string;
      public: boolean;
    };
    outcome: {
      accepted: boolean;
      response?: string;
      impact: number;
    };
  };
}

// Analytics Events
export interface RivalryAnalyticsEvent extends BaseRivalEvent {
  type: 'rivalry_analytics';
  data: {
    analyticsType: 'performance' | 'engagement' | 'trends' | 'predictions' | 'insights';
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, any>;
    insights: {
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }[];
    trends: {
      metric: string;
      direction: 'up' | 'down' | 'stable';
      change: number;
      significance: string;
    }[];
    generatedAt: Date;
  };
}

export interface RivalryPerformanceReportEvent extends BaseRivalEvent {
  type: 'rivalry_performance_report';
  data: {
    reportPeriod: {
      start: Date;
      end: Date;
    };
    overview: {
      totalRivalries: number;
      activeRivalries: number;
      winRate: number;
      averageScore: number;
      bestStreak: number;
      currentStreak: number;
    };
    performance: {
      byType: Record<string, any>;
      byStakeType: Record<string, any>;
      byTimeframe: Record<string, any>;
      againstSkillLevel: Record<string, any>;
    };
    trends: {
      winRate: Array<{ date: Date; rate: number }>;
      score: Array<{ date: Date; score: number }>;
      activity: Array<{ date: Date; matches: number }>;
      satisfaction: Array<{ date: Date; rating: number }>;
    };
    insights: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    recommendations: {
      shortTerm: string[];
      longTerm: string[];
    };
  };
}

// Matchmaking Events
export interface RivalryMatchmakingRequestEvent extends BaseRivalEvent {
  type: 'rivalry_matchmaking_request';
  data: {
    requestType: 'find_rival' | 'challenge' | 'tournament' | 'casual';
    preferences: {
      skillRange: { min: number; max: number };
      activityLevel: string;
      rivalryType: string[];
      timezone: string;
      language: string[];
      availability: any[];
    };
    criteria: {
      skillScore: number;
      activityScore: number;
      sportsmanshipScore: number;
      reliabilityScore: number;
      experienceLevel: number;
    };
    urgency: 'low' | 'medium' | 'high';
    maxWaitTime: number;
  };
}

export interface RivalryMatchmakingFoundEvent extends BaseRivalEvent {
  type: 'rivalry_matchmaking_found';
  data: {
    candidateId: string;
    candidateName: string;
    compatibilityScore: number;
    reasons: {
      type: string;
      description: string;
      weight: number;
    }[];
    estimatedIntensity: string;
    predictedDuration: number;
    riskLevel: string;
    recommendations: string[];
    expiresAt: Date;
  };
}

export interface RivalryMatchmakingAcceptedEvent extends BaseRivalEvent {
  type: 'rivalry_matchmaking_accepted';
  data: {
    candidateId: string;
    acceptedAt: Date;
    responseTime: number;
    modifications: {
      settings: any[];
      rules: any[];
      timeline: any[];
    };
    confidence: number;
    excitement: number;
  };
}

export interface RivalryMatchmakingDeclinedEvent extends BaseRivalEvent {
  type: 'rivalry_matchmaking_declined';
  data: {
    candidateId: string;
    declinedAt: Date;
    responseTime: number;
    reason: string;
    feedback?: string;
    alternativeSuggestion?: {
      type: string;
      parameters: any;
    };
  };
}

// System Events
export interface RivalrySystemMaintenanceEvent extends BaseRivalEvent {
  type: 'rivalry_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      matchmaking: boolean;
      matches: boolean;
      tournaments: boolean;
      leaderboards: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}

export interface RivalrySystemErrorEvent extends BaseRivalEvent {
  type: 'rivalry_system_error';
  data: {
    errorType: 'matchmaking_error' | 'match_error' | 'tournament_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId?: string;
      rivalryId?: string;
      matchId?: string;
      tournamentId?: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
  };
}

// Union Type for All Rivalry Events
export type RivalryEventType = 
  | RivalryStartedEvent
  | RivalryAcceptedEvent
  | RivalryDeclinedEvent
  | RivalryEndedEvent
  | RivalryMatchStartedEvent
  | RivalryMatchCompletedEvent
  | RivalryMatchInterruptedEvent
  | RivalryPerformanceMilestoneEvent
  | RivalryStreakUpdatedEvent
  | RivalryRankingChangedEvent
  | RivalryTournamentJoinedEvent
  | RivalryTournamentMatchEvent
  | RivalryTournamentProgressEvent
  | RivalryTrashTalkEvent
  | RivalrySportsmanshipEvent
  | RivalrySocialInteractionEvent
  | RivalryAnalyticsEvent
  | RivalryPerformanceReportEvent
  | RivalryMatchmakingRequestEvent
  | RivalryMatchmakingFoundEvent
  | RivalryMatchmakingAcceptedEvent
  | RivalryMatchmakingDeclinedEvent
  | RivalrySystemMaintenanceEvent
  | RivalrySystemErrorEvent;

// Event Factory Functions
export function createRivalryStartedEvent(
  userId: string,
  rivalId: string,
  rivalryId: string,
  initiatedBy: string,
  rivalryType: string,
  stakes: any,
  context: any
): RivalryStartedEvent {
  return {
    id: generateEventId(),
    type: 'rivalry_started',
    userId,
    rivalId,
    timestamp: new Date(),
    data: {
      rivalryId,
      initiatedBy,
      rivalryType,
      stakes,
      context,
      expectations: {
        duration: stakes.duration || 30,
        intensity: 'moderate',
        frequency: 'weekly',
      },
    },
    metadata: createEventMetadata('rivals'),
  };
}

export function createRivalryMatchStartedEvent(
  userId: string,
  rivalId: string,
  matchId: string,
  rivalryId: string,
  matchType: string,
  format: string,
  settings: any,
  participants: any
): RivalryMatchStartedEvent {
  return {
    id: generateEventId(),
    type: 'rivalry_match_started',
    userId,
    rivalId,
    timestamp: new Date(),
    data: {
      matchId,
      rivalryId,
      matchType,
      format,
      settings,
      participants,
      context: {
        environment: 'standard',
        spectators: 0,
        importance: 'normal',
      },
    },
    metadata: createEventMetadata('rivals'),
  };
}

export function createRivalryMatchCompletedEvent(
  userId: string,
  rivalId: string,
  matchId: string,
  rivalryId: string,
  result: any,
  performance: any,
  impact: any
): RivalryMatchCompletedEvent {
  return {
    id: generateEventId(),
    type: 'rivalry_match_completed',
    userId,
    rivalId,
    timestamp: new Date(),
    data: {
      matchId,
      rivalryId,
      completedAt: new Date(),
      duration: 0, // would be calculated
      result,
      performance,
      impact,
    },
    metadata: createEventMetadata('rivals'),
  };
}

export function createRivalryStreakUpdatedEvent(
  userId: string,
  rivalId: string,
  rivalryId: string,
  streakType: string,
  currentStreak: number,
  previousStreak: number,
  streakDirection: string,
  lastMatch: any
): RivalryStreakUpdatedEvent {
  return {
    id: generateEventId(),
    type: 'rivalry_streak_updated',
    userId,
    rivalId,
    timestamp: new Date(),
    data: {
      rivalryId,
      streakType,
      currentStreak,
      previousStreak,
      streakDirection,
      lastMatch,
      streakHistory: {
        longest: Math.max(currentStreak, previousStreak),
        current: currentStreak,
        average: (currentStreak + previousStreak) / 2,
        total: currentStreak + previousStreak,
      },
      psychological: {
        momentum: streakDirection === 'extended' ? 0.8 : -0.3,
        pressure: currentStreak > 5 ? 0.7 : 0.3,
        confidence: streakDirection === 'extended' ? 0.9 : 0.4,
      },
    },
    metadata: createEventMetadata('rivals'),
  };
}

export function createRivalryRankingChangedEvent(
  userId: string,
  rivalryId: string,
  rankingType: string,
  previousRank: number,
  currentRank: number,
  totalParticipants: number,
  context: any
): RivalryRankingChangedEvent {
  return {
    id: generateEventId(),
    type: 'rivalry_ranking_changed',
    userId,
    timestamp: new Date(),
    data: {
      rivalryId,
      rankingType,
      previousRank,
      currentRank,
      rankChange: currentRank - previousRank,
      totalParticipants,
      percentile: ((totalParticipants - currentRank + 1) / totalParticipants) * 100,
      leaderboard: {
        type: 'global',
        scope: 'all',
        timeframe: 'weekly',
      },
      context,
      implications: {
        qualification: currentRank <= 100,
        seeding: Math.floor(currentRank / 8),
        recognition: currentRank <= 10,
      },
    },
    metadata: createEventMetadata('rivals'),
  };
}

// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation
export function validateRivalryEvent(event: RivalryEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'rivalry_started':
      return validateRivalryStartedEvent(event as RivalryStartedEvent);
    case 'rivalry_match_started':
      return validateRivalryMatchStartedEvent(event as RivalryMatchStartedEvent);
    case 'rivalry_match_completed':
      return validateRivalryMatchCompletedEvent(event as RivalryMatchCompletedEvent);
    case 'rivalry_streak_updated':
      return validateRivalryStreakUpdatedEvent(event as RivalryStreakUpdatedEvent);
    case 'rivalry_ranking_changed':
      return validateRivalryRankingChangedEvent(event as RivalryRankingChangedEvent);
    default:
      return true;
  }
}

function validateRivalryStartedEvent(event: RivalryStartedEvent): boolean {
  const { data } = event;
  return !!(
    data.rivalryId &&
    data.initiatedBy &&
    data.rivalryType &&
    data.stakes &&
    data.context &&
    data.expectations
  );
}

function validateRivalryMatchStartedEvent(event: RivalryMatchStartedEvent): boolean {
  const { data } = event;
  return !!(
    data.matchId &&
    data.rivalryId &&
    data.matchType &&
    data.format &&
    data.settings &&
    data.participants &&
    data.context
  );
}

function validateRivalryMatchCompletedEvent(event: RivalryMatchCompletedEvent): boolean {
  const { data } = event;
  return !!(
    data.matchId &&
    data.rivalryId &&
    data.result &&
    data.performance &&
    data.impact
  );
}

function validateRivalryStreakUpdatedEvent(event: RivalryStreakUpdatedEvent): boolean {
  const { data } = event;
  return !!(
    data.rivalryId &&
    data.streakType &&
    typeof data.currentStreak === 'number' &&
    typeof data.previousStreak === 'number' &&
    data.streakDirection &&
    data.lastMatch &&
    data.streakHistory &&
    data.psychological
  );
}

function validateRivalryRankingChangedEvent(event: RivalryRankingChangedEvent): boolean {
  const { data } = event;
  return !!(
    data.rivalryId &&
    data.rankingType &&
    typeof data.previousRank === 'number' &&
    typeof data.currentRank === 'number' &&
    typeof data.totalParticipants === 'number' &&
    data.leaderboard &&
    data.context &&
    data.implications
  );
}

// Event Serialization
export function serializeRivalryEvent(event: RivalryEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeRivalryEvent(data: string): RivalryEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}
