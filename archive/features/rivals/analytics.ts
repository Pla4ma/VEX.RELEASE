/**
 * Rivals Feature Analytics
 * 
 * Comprehensive analytics tracking for competitive gameplay, rivalries, and leaderboard features.
 */

import { capture } from '../../shared/analytics/analytics-service';

// ============================================================================
// RIVALRY LIFECYCLE ANALYTICS
// ============================================================================

export function trackRivalryStarted(
  userId: string,
  rivalId: string,
  rivalryId: string,
  initiatedBy: string,
  rivalryType: string,
  stakes: {
    type: string;
    amount: number;
    duration?: number;
    conditions: any[];
    rewards: any[];
    penalties: any[];
  },
  context: {
    triggerReason: string;
    previousInteractions: number;
    mutualConsent: boolean;
  }
): void {
  capture('rivals_rivalry_started', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    initiated_by: initiatedBy,
    rivalry_type: rivalryType,
    stakes,
    context,
  });
}

export function trackRivalryAccepted(
  userId: string,
  rivalId: string,
  rivalryId: string,
  acceptedAt: Date,
  responseTime: number,
  modifications: {
    stakes: any[];
    rules: any[];
    timeline: any[];
  },
  motivation: string,
  confidence: number
): void {
  capture('rivals_rivalry_accepted', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    accepted_at: acceptedAt.toISOString(),
    response_time: responseTime,
    modifications,
    motivation,
    confidence,
  });
}

export function trackRivalryDeclined(
  userId: string,
  rivalId: string,
  rivalryId: string,
  declinedAt: Date,
  responseTime: number,
  reason: 'not_interested' | 'stakes_too_high' | 'timing_bad' | 'skill_mismatch' | 'personal',
  message?: string,
  alternativeOffer?: {
    type: string;
    parameters: any;
  }
): void {
  capture('rivals_rivalry_declined', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    declined_at: declinedAt.toISOString(),
    response_time: responseTime,
    reason,
    message,
    alternative_offer: alternativeOffer,
  });
}

export function trackRivalryEnded(
  userId: string,
  rivalId: string,
  rivalryId: string,
  endDate: Date,
  endReason: string,
  endedBy: string,
  mutual: boolean,
  finalMetrics: {
    duration: number;
    totalEvents: number;
    userWins: number;
    rivalWins: number;
    draws: number;
    userScore: number;
    rivalScore: number;
  },
  outcomes: {
    winner?: string;
    sportsmanship: number;
    satisfaction: number;
    rematchInterest: boolean;
  }
): void {
  capture('rivals_rivalry_ended', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    end_date: endDate.toISOString(),
    end_reason: endReason,
    ended_by: endedBy,
    mutual,
    final_metrics: finalMetrics,
    outcomes,
  });
}

// ============================================================================
// MATCH ANALYTICS
// ============================================================================

export function trackRivalryMatchStarted(
  userId: string,
  rivalId: string,
  matchId: string,
  rivalryId: string,
  matchType: string,
  format: string,
  settings: {
    difficulty: string;
    duration: number;
    rules: any[];
    objectives: any[];
  },
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
  },
  context: {
    environment: string;
    spectators: number;
    importance: string;
  }
): void {
  capture('rivals_match_started', {
    user_id: userId,
    rival_id: rivalId,
    match_id: matchId,
    rivalry_id: rivalryId,
    match_type: matchType,
    format,
    settings,
    participants,
    context,
  });
}

export function trackRivalryMatchCompleted(
  userId: string,
  rivalId: string,
  matchId: string,
  rivalryId: string,
  completedAt: Date,
  duration: number,
  result: {
    winner: string;
    loser?: string;
    score: {
      user: number;
      rival: number;
    };
    method: string;
    margin: number;
  },
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
  },
  impact: {
    rivalryMomentum: number;
    userMomentum: number;
    rivalMomentum: number;
    psychologicalImpact: number;
  }
): void {
  capture('rivals_match_completed', {
    user_id: userId,
    rival_id: rivalId,
    match_id: matchId,
    rivalry_id: rivalryId,
    completed_at: completedAt.toISOString(),
    duration,
    result,
    performance,
    impact,
  });
}

export function trackRivalryMatchInterrupted(
  userId: string,
  rivalId: string,
  matchId: string,
  rivalryId: string,
  interruptedAt: Date,
  interruptionReason: 'technical' | 'user_disconnection' | 'mutual_agreement' | 'fair_play_violation',
  interruptionBy: string,
  progress: {
    completion: number;
    currentScore: {
      user: number;
      rival: number;
    };
    timeElapsed: number;
  },
  resolution: {
    rescheduled: boolean;
    newTime?: Date;
    compensation: any[];
  }
): void {
  capture('rivals_match_interrupted', {
    user_id: userId,
    rival_id: rivalId,
    match_id: matchId,
    rivalry_id: rivalryId,
    interrupted_at: interruptedAt.toISOString(),
    interruption_reason: interruptionReason,
    interruption_by: interruptionBy,
    progress,
    resolution: {
      ...resolution,
      new_time: resolution.newTime?.toISOString(),
    },
  });
}

// ============================================================================
// PERFORMANCE ANALYTICS
// ============================================================================

export function trackRivalryPerformanceMilestone(
  userId: string,
  rivalId: string,
  rivalryId: string,
  milestoneType: string,
  achievedAt: Date,
  milestone: {
    type: string;
    value: number;
    description: string;
    significance: string;
  },
  context: {
    matchId?: string;
    situation: string;
    pressure: number;
  },
  impact: {
    morale: number;
    confidence: number;
    strategy: string;
  },
  recognition: {
    achievement: string;
    badge: string;
    celebration: boolean;
  }
): void {
  capture('rivals_performance_milestone', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    milestone_type: milestoneType,
    achieved_at: achievedAt.toISOString(),
    milestone,
    context,
    impact,
    recognition,
  });
}

export function trackRivalryStreakUpdated(
  userId: string,
  rivalId: string,
  rivalryId: string,
  streakType: 'wins' | 'losses' | 'draws' | 'matches',
  currentStreak: number,
  previousStreak: number,
  streakDirection: 'extended' | 'broken' | 'reset',
  lastMatch: {
    matchId: string;
    result: string;
    opponent: string;
    date: Date;
  },
  psychological: {
    momentum: number;
    pressure: number;
    confidence: number;
  }
): void {
  capture('rivals_streak_updated', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    streak_type: streakType,
    current_streak: currentStreak,
    previous_streak: previousStreak,
    streak_direction: streakDirection,
    last_match: {
      ...lastMatch,
      date: lastMatch.date.toISOString(),
    },
    psychological,
  });
}

export function trackRivalryRankingChanged(
  userId: string,
  rivalryId: string,
  rankingType: string,
  previousRank: number,
  currentRank: number,
  totalParticipants: number,
  context: {
    contributingMatch: string;
    performance: number;
    factors: string[];
  },
  implications: {
    qualification: any;
    seeding: any;
    recognition: any;
  }
): void {
  capture('rivals_ranking_changed', {
    user_id: userId,
    rivalry_id: rivalryId,
    ranking_type: rankingType,
    previous_rank: previousRank,
    current_rank: currentRank,
    rank_change: currentRank - previousRank,
    total_participants: totalParticipants,
    percentile: ((totalParticipants - currentRank + 1) / totalParticipants) * 100,
    context,
    implications,
  });
}

// ============================================================================
// TOURNAMENT ANALYTICS
// ============================================================================

export function trackRivalryTournamentJoined(
  userId: string,
  tournamentId: string,
  tournamentName: string,
  tournamentType: string,
  format: string,
  joinedAt: Date,
  entry: {
    seed: number;
    bracket: string;
    division: string;
  },
  expectations: {
    participants: number;
    duration: number;
    difficulty: string;
    prizes: any[];
  },
  rivalry: {
    rivalInTournament: boolean;
    rivalSeed?: number;
    potentialMatchup: number;
  }
): void {
  capture('rivals_tournament_joined', {
    user_id: userId,
    tournament_id: tournamentId,
    tournament_name: tournamentName,
    tournament_type: tournamentType,
    format,
    joined_at: joinedAt.toISOString(),
    entry,
    expectations,
    rivalry,
  });
}

export function trackRivalryTournamentMatch(
  userId: string,
  rivalId: string,
  tournamentId: string,
  matchId: string,
  round: number,
  bracket: string,
  stage: string,
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
  },
  stakes: {
    advancement: boolean;
    elimination: boolean;
    prize: any[];
    ranking: any[];
  },
  context: {
    importance: number;
    spectators: number;
    pressure: number;
  }
): void {
  capture('rivals_tournament_match', {
    user_id: userId,
    rival_id: rivalId,
    tournament_id: tournamentId,
    match_id: matchId,
    round,
    bracket,
    stage,
    participants,
    stakes,
    context,
  });
}

export function trackRivalryTournamentProgress(
  userId: string,
  tournamentId: string,
  stage: string,
  round: number,
  progress: {
    advanced: boolean;
    eliminated: boolean;
    placement: number;
    performance: number;
  },
  statistics: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    points: number;
    differential: number;
  },
  rivalry: {
    rivalProgress: any;
    headToHead: any;
    potentialMeeting: any;
  },
  achievements: {
    milestones: string[];
    records: string[];
    badges: string[];
  }
): void {
  capture('rivals_tournament_progress', {
    user_id: userId,
    tournament_id: tournamentId,
    stage,
    round,
    progress,
    statistics,
    rivalry,
    achievements,
  });
}

// ============================================================================
// SOCIAL ANALYTICS
// ============================================================================

export function trackRivalryTrashTalk(
  userId: string,
  rivalId: string,
  rivalryId: string,
  messageId: string,
  content: string,
  tone: 'friendly' | 'competitive' | 'aggressive' | 'humorous' | 'respectful',
  medium: 'chat' | 'emote' | 'gesture' | 'voice' | 'custom',
  context: {
    timing: string;
    situation: string;
    trigger: string;
  },
  reception: {
    reaction: string;
    response: string;
    impact: number;
  },
  moderation: {
    flagged: boolean;
    warning: boolean;
    penalty: any;
  }
): void {
  capture('rivals_trash_talk', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    message_id: messageId,
    content,
    tone,
    medium,
    context,
    reception,
    moderation,
  });
}

export function trackRivalrySportsmanship(
  userId: string,
  rivalId: string,
  rivalryId: string,
  action: string,
  sportsmanshipType: 'good' | 'poor' | 'excellent' | 'questionable',
  context: {
    matchId?: string;
    timing: string;
    situation: string;
  },
  impact: {
    onRival: number;
    onCommunity: number;
    onReputation: number;
  },
  recognition: {
    points: number;
    badge: string;
    title: string;
  }
): void {
  capture('rivals_sportsmanship', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    action,
    sportsmanship_type: sportsmanshipType,
    context,
    impact,
    recognition,
  });
}

export function trackRivalrySocialInteraction(
  userId: string,
  rivalId: string,
  rivalryId: string,
  interactionType: 'friend_request' | 'message' | 'gift' | 'compliment' | 'invitation',
  interaction: {
    action: string;
    content?: string;
    value?: any;
  },
  context: {
    timing: string;
    motivation: string;
    public: boolean;
  },
  outcome: {
    accepted: boolean;
    response?: string;
    impact: number;
  }
): void {
  capture('rivals_social_interaction', {
    user_id: userId,
    rival_id: rivalId,
    rivalry_id: rivalryId,
    interaction_type: interactionType,
    interaction,
    context,
    outcome,
  });
}

// ============================================================================
// MATCHMAKING ANALYTICS
// ============================================================================

export function trackRivalryMatchmakingRequest(
  userId: string,
  requestType: 'find_rival' | 'challenge' | 'tournament' | 'casual',
  preferences: {
    skillRange: { min: number; max: number };
    activityLevel: string;
    rivalryType: string[];
    timezone: string;
    language: string[];
    availability: any[];
  },
  criteria: {
    skillScore: number;
    activityScore: number;
    sportsmanshipScore: number;
    reliabilityScore: number;
    experienceLevel: number;
  },
  urgency: 'low' | 'medium' | 'high',
  maxWaitTime: number
): void {
  capture('rivals_matchmaking_request', {
    user_id: userId,
    request_type: requestType,
    preferences,
    criteria,
    urgency,
    max_wait_time: maxWaitTime,
  });
}

export function trackRivalryMatchmakingFound(
  userId: string,
  candidateId: string,
  candidateName: string,
  compatibilityScore: number,
  reasons: {
    type: string;
    description: string;
    weight: number;
  }[],
  estimatedIntensity: string,
  predictedDuration: number,
  riskLevel: string,
  recommendations: string[],
  expiresAt: Date
): void {
  capture('rivals_matchmaking_found', {
    user_id: userId,
    candidate_id: candidateId,
    candidate_name: candidateName,
    compatibility_score: compatibilityScore,
    reasons,
    estimated_intensity: estimatedIntensity,
    predicted_duration: predictedDuration,
    risk_level: riskLevel,
    recommendations,
    expires_at: expiresAt.toISOString(),
  });
}

export function trackRivalryMatchmakingAccepted(
  userId: string,
  candidateId: string,
  acceptedAt: Date,
  responseTime: number,
  modifications: {
    settings: any[];
    rules: any[];
    timeline: any[];
  },
  confidence: number,
  excitement: number
): void {
  capture('rivals_matchmaking_accepted', {
    user_id: userId,
    candidate_id: candidateId,
    accepted_at: acceptedAt.toISOString(),
    response_time: responseTime,
    modifications,
    confidence,
    excitement,
  });
}

export function trackRivalryMatchmakingDeclined(
  userId: string,
  candidateId: string,
  declinedAt: Date,
  responseTime: number,
  reason: string,
  feedback?: string,
  alternativeSuggestion?: {
    type: string;
    parameters: any;
  }
): void {
  capture('rivals_matchmaking_declined', {
    user_id: userId,
    candidate_id: candidateId,
    declined_at: declinedAt.toISOString(),
    response_time: responseTime,
    reason,
    feedback,
    alternative_suggestion: alternativeSuggestion,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function trackRivalsDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'rival_detail' | 'tournaments' | 'leaderboards' | 'match_history',
  filters: {
    timeframe: string;
    rivalryType: string[];
    skillLevel: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  }
): void {
  capture('rivals_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function trackRivalsUserProperties(
  userId: string,
  userProperties: {
    totalRivalries: number;
    activeRivalries: number;
    winRate: number;
    averageScore: number;
    bestStreak: number;
    currentStreak: number;
    totalMatches: number;
    sportsmanshipScore: number;
    rank: number;
    tournamentWins: number;
    preferredRivalryType: string;
    skillLevel: number;
  }
): void {
  capture('rivals_user_properties', {
    user_id: userId,
    total_rivalries: userProperties.totalRivalries,
    active_rivalries: userProperties.activeRivalries,
    win_rate: userProperties.winRate,
    average_score: userProperties.averageScore,
    best_streak: userProperties.bestStreak,
    current_streak: userProperties.currentStreak,
    total_matches: userProperties.totalMatches,
    sportsmanship_score: userProperties.sportsmanshipScore,
    rank: userProperties.rank,
    tournament_wins: userProperties.tournamentWins,
    preferred_rivalry_type: userProperties.preferredRivalryType,
    skill_level: userProperties.skillLevel,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackRivalsError(
  userId: string,
  errorType: 'matchmaking_error' | 'match_error' | 'tournament_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId?: string;
    rivalryId?: string;
    matchId?: string;
    tournamentId?: string;
  }
): void {
  capture('rivals_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackRivalsFunnel(
  userId: string,
  step: 'profile_created' | 'first_rivalry' | 'first_match' | 'first_tournament' | 'first_win' | 'champion'
): void {
  capture('rivals_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
