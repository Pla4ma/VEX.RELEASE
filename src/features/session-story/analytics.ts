/**
 * Session Story Feature Analytics
 * 
 * Comprehensive analytics tracking for narrative generation, storytelling, and session chronicles features.
 */

import { capture } from '../../shared/analytics/analytics-service';

// ============================================================================
// STORY LIFECYCLE ANALYTICS
// ============================================================================

export function trackStoryGenerated(
  userId: string,
  sessionId: string,
  storyId: string,
  generationType: 'automatic' | 'manual' | 'hybrid' | 'template',
  generationTime: number,
  narrative: {
    title: string;
    genre: string;
    theme: string;
    tone: string;
    length: string;
  },
  structure: {
    chapters: number;
    scenes: number;
    characters: number;
    events: number;
    choices: number;
  },
  personalization: {
    adapted: boolean;
    userElements: string[];
    preferences: string[];
    history: string[];
  }
): void {
  capture('session_story_generated', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    generation_type: generationType,
    generation_time: generationTime,
    narrative,
    structure,
    personalization,
  });
}

export function trackStoryStarted(
  userId: string,
  sessionId: string,
  storyId: string,
  startType: 'beginning' | 'resume' | 'jump_in' | 'preview',
  chapter: number,
  scene: number,
  context: {
    previousSession?: string;
    bookmark?: string;
    progress: number;
  },
  expectations: {
    estimatedDuration: number;
    difficulty: string;
    engagement: string;
    outcomes: string[];
  }
): void {
  capture('session_story_started', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    start_type: startType,
    chapter,
    scene,
    context,
    expectations,
  });
}

export function trackStoryProgressed(
  userId: string,
  sessionId: string,
  storyId: string,
  progressType: 'chapter' | 'scene' | 'event' | 'milestone' | 'choice',
  previousProgress: {
    chapter: number;
    scene: number;
    percentage: number;
  },
  currentProgress: {
    chapter: number;
    scene: number;
    percentage: number;
  },
  content: {
    title: string;
    description: string;
    significance: string;
    impact: string;
  },
  engagement: {
    timeSpent: number;
    interactions: number;
    choices: number;
    skips: number;
  }
): void {
  capture('session_story_progressed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    progress_type: progressType,
    previous_progress: previousProgress,
    current_progress: currentProgress,
    content,
    engagement,
  });
}

export function trackStoryCompleted(
  userId: string,
  sessionId: string,
  storyId: string,
  completedAt: Date,
  completionType: 'natural' | 'skipped' | 'abandoned' | 'timeout',
  totalDuration: number,
  finalProgress: {
    chaptersCompleted: number;
    totalChapters: number;
    scenesCompleted: number;
    totalScenes: number;
    percentage: number;
  },
  outcomes: {
    ending: string;
    achievements: string[];
    unlocks: string[];
    rewards: any[];
  },
  performance: {
    engagement: number;
    satisfaction: number;
    comprehension: number;
    retention: number;
  }
): void {
  capture('session_story_completed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    completed_at: completedAt.toISOString(),
    completion_type: completionType,
    total_duration: totalDuration,
    final_progress: finalProgress,
    outcomes,
    performance,
  });
}

// ============================================================================
// NARRATIVE ANALYTICS
// ============================================================================

export function trackNarrativeBranchTaken(
  userId: string,
  sessionId: string,
  storyId: string,
  branchId: string,
  branchType: 'choice' | 'consequence' | 'random' | 'conditional',
  takenAt: Date,
  decision: {
    option: string;
    reasoning: string;
    confidence: number;
    timeSpent: number;
  },
  context: {
    chapter: number;
    scene: number;
    situation: string;
    characters: string[];
    stakes: string;
  },
  consequences: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    hidden: string[];
  },
  alternatives: {
    notTaken: string[];
    unavailable: string[];
    future: string[];
  }
): void {
  capture('session_story_narrative_branch_taken', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    branch_id: branchId,
    branch_type: branchType,
    taken_at: takenAt.toISOString(),
    decision,
    context,
    consequences,
    alternatives,
  });
}

export function trackNarrativeCharacterIntroduced(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  characterName: string,
  characterType: 'protagonist' | 'antagonist' | 'supporting' | 'npc' | 'mentor' | 'companion',
  introducedAt: Date,
  introduction: {
    method: string;
    context: string;
    significance: string;
    role: string;
  },
  characteristics: {
    personality: string[];
    appearance: string;
    background: string;
    motivations: string[];
    conflicts: string[];
  },
  relationships: {
    withUser: string;
    withOthers: Record<string, string>;
    dynamics: string[];
  }
): void {
  capture('session_story_narrative_character_introduced', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    character_name: characterName,
    character_type: characterType,
    introduced_at: introducedAt.toISOString(),
    introduction,
    characteristics,
    relationships,
  });
}

export function trackNarrativeTwistRevealed(
  userId: string,
  sessionId: string,
  storyId: string,
  twistId: string,
  twistType: 'plot' | 'character' | 'world' | 'motivation' | 'identity' | 'time',
  revealedAt: Date,
  revelation: {
    method: string;
    timing: string;
    buildup: string;
    payoff: string;
  },
  impact: {
    shock: number;
    surprise: number;
    satisfaction: number;
    confusion: number;
  },
  context: {
    expectations: string[];
    clues: string[];
    misdirection: string[];
    foreshadowing: string[];
  },
  aftermath: {
    understanding: number;
    acceptance: number;
    reevaluation: number;
    speculation: string[];
  }
): void {
  capture('session_story_narrative_twist_revealed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    twist_id: twistId,
    twist_type: twistType,
    revealed_at: revealedAt.toISOString(),
    revelation,
    impact,
    context,
    aftermath,
  });
}

// ============================================================================
// CHOICE ANALYTICS
// ============================================================================

export function trackStoryChoicePresented(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  presentedAt: Date,
  choice: {
    title: string;
    description: string;
    context: string;
    stakes: string;
  },
  options: {
    id: string;
    text: string;
    description: string;
    consequences: string[];
    requirements: string[];
    hints: string[];
  }[],
  constraints: {
    timeLimit?: number;
    requirements: string[];
    restrictions: string[];
    penalties: string[];
  },
  guidance: {
    hints: string[];
    recommendations: string[];
    warnings: string[];
  }
): void {
  capture('session_story_choice_presented', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    presented_at: presentedAt.toISOString(),
    choice,
    options,
    constraints,
    guidance,
  });
}

export function trackStoryChoiceMade(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  optionId: string,
  madeAt: Date,
  decisionTime: number,
  reasoning: {
    factors: string[];
    priorities: string[];
    emotions: string[];
    logic: string;
  },
  context: {
    information: string[];
    uncertainty: number;
    pressure: number;
    influence: string[];
  },
  confidence: {
    level: number;
    justification: string;
    doubts: string[];
  }
): void {
  capture('session_story_choice_made', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    option_id: optionId,
    made_at: madeAt.toISOString(),
    decision_time: decisionTime,
    reasoning,
    context,
    confidence,
  });
}

export function trackStoryChoiceConsequence(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  optionId: string,
  consequenceId: string,
  triggeredAt: Date,
  consequence: {
    type: 'immediate' | 'delayed' | 'conditional' | 'cumulative';
    description: string;
    severity: string;
    duration: string;
    scope: string;
  },
  effects: {
    narrative: string[];
    character: string[];
    world: string[];
    user: string[];
    future: string[];
  },
  visibility: {
    obvious: boolean;
    hidden: boolean;
    discovered: boolean;
    hinted: boolean;
  }
): void {
  capture('session_story_choice_consequence', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    option_id: optionId,
    consequence_id: consequenceId,
    triggered_at: triggeredAt.toISOString(),
    consequence,
    effects,
    visibility,
  });
}

// ============================================================================
// CHARACTER ANALYTICS
// ============================================================================

export function trackCharacterRelationshipChanged(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  relationshipType: string,
  changeType: 'improved' | 'deteriorated' | 'transformed' | 'revealed' | 'ended',
  changedAt: Date,
  previousState: {
    level: number;
    nature: string;
    dynamics: string[];
  },
  currentState: {
    level: number;
    nature: string;
    dynamics: string[];
  },
  catalyst: {
    event: string;
    choice: string;
    action: string;
    revelation: string;
  },
  implications: {
    story: string[];
    character: string[];
    user: string[];
    future: string[];
  }
): void {
  capture('session_story_character_relationship_changed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    relationship_type: relationshipType,
    change_type: changeType,
    changed_at: changedAt.toISOString(),
    previous_state: previousState,
    current_state: currentState,
    catalyst,
    implications,
  });
}

export function trackCharacterDevelopment(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  developmentType: 'growth' | 'regression' | 'transformation' | 'revelation' | 'redemption',
  developedAt: Date,
  development: {
    aspect: string;
    change: string;
    significance: string;
    permanence: string;
  },
  catalyst: {
    events: string[];
    choices: string[];
    interactions: string[];
    revelations: string[];
  },
  impact: {
    character: string[];
    relationships: string[];
    story: string[];
    user: string[];
  },
  future: {
    potential: string[];
    limitations: string[];
    opportunities: string[];
  }
): void {
  capture('session_story_character_development', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    development_type: developmentType,
    developed_at: developedAt.toISOString(),
    development,
    catalyst,
    impact,
    future,
  });
}

// ============================================================================
// WORLD ANALYTICS
// ============================================================================

export function trackWorldElementDiscovered(
  userId: string,
  sessionId: string,
  storyId: string,
  elementId: string,
  elementType: 'location' | 'lore' | 'history' | 'culture' | 'technology' | 'magic' | 'secret',
  discoveredAt: Date,
  discovery: {
    method: string;
    context: string;
    significance: string;
    surprise: number;
  },
  element: {
    name: string;
    description: string;
    properties: string[];
    connections: string[];
    importance: string;
  },
  implications: {
    understanding: string[];
    navigation: string[];
    interaction: string[];
    story: string[];
  }
): void {
  capture('session_story_world_element_discovered', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    element_id: elementId,
    element_type: elementType,
    discovered_at: discoveredAt.toISOString(),
    discovery,
    element,
    implications,
  });
}

export function trackWorldStateChanged(
  userId: string,
  sessionId: string,
  storyId: string,
  stateId: string,
  changeType: 'environmental' | 'political' | 'social' | 'magical' | 'technological' | 'temporal',
  changedAt: Date,
  change: {
    description: string;
    magnitude: string;
    scope: string;
    permanence: string;
  },
  causes: {
    events: string[];
    choices: string[];
    characters: string[];
    natural: string[];
  },
  effects: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    cascading: string[];
  },
  playerImpact: {
    access: string[];
    restrictions: string[];
    opportunities: string[];
    dangers: string[];
  }
): void {
  capture('session_story_world_state_changed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    state_id: stateId,
    change_type: changeType,
    changed_at: changedAt.toISOString(),
    change,
    causes,
    effects,
    player_impact,
  });
}

// ============================================================================
// ACHIEVEMENT ANALYTICS
// ============================================================================

export function trackStoryAchievementUnlocked(
  userId: string,
  sessionId: string,
  storyId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'completion' | 'exploration' | 'choice' | 'relationship' | 'discovery' | 'mastery',
  progress: {
    current: number;
    required: number;
    percentage: number;
  },
  criteria: {
    type: string;
    condition: string;
    value: any;
    met: boolean;
  }[],
  rarity: string,
  points: number,
  rewards: {
    experience: number;
    currency: number;
    items: any[];
    titles: string[];
    unlocks: string[];
  },
  recognition: {
    badge: string;
    celebration: boolean;
    shareable: boolean;
    public: boolean;
  }
): void {
  capture('session_story_achievement_unlocked', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    achievement_id: achievementId,
    achievement_name: achievementName,
    achievement_type: achievementType,
    progress,
    criteria,
    rarity,
    points,
    rewards,
    recognition,
  });
}

export function trackStoryMilestoneReached(
  userId: string,
  sessionId: string,
  storyId: string,
  milestoneId: string,
  milestoneType: 'chapter' | 'plot' | 'character' | 'world' | 'choice' | 'time',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  improvement: number,
  significance: 'personal' | 'story' | 'session' | 'global',
  recognition: {
    badge: string;
    title: string;
    celebration: boolean;
    shareable: boolean;
  },
  rewards: {
    experience: number;
    currency: number;
    items: any[];
    unlocks: string[];
  }
): void {
  capture('session_story_milestone_reached', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    milestone_id: milestoneId,
    milestone_type: milestoneType,
    milestone_name: milestoneName,
    value,
    target,
    previous_record: previousRecord,
    improvement,
    significance,
    recognition,
    rewards,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function trackStoryDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'story_detail' | 'choices' | 'characters' | 'world',
  filters: {
    timeframe: string;
    genre: string[];
    theme: string[];
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
  capture('session_story_dashboard_viewed', {
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

export function trackStoryUserProperties(
  userId: string,
  userProperties: {
    totalStories: number;
    completedStories: number;
    averageCompletion: number;
    averageEngagement: number;
    totalChoices: number;
    averageTimePerStory: number;
    preferredGenre: string;
    preferredTheme: string;
    favoriteCharacterType: string;
    achievementCount: number;
    totalMilestones: number;
    storyComplexityPreference: string;
  }
): void {
  capture('session_story_user_properties', {
    user_id: userId,
    total_stories: userProperties.totalStories,
    completed_stories: userProperties.completedStories,
    average_completion: userProperties.averageCompletion,
    average_engagement: userProperties.averageEngagement,
    total_choices: userProperties.totalChoices,
    average_time_per_story: userProperties.averageTimePerStory,
    preferred_genre: userProperties.preferredGenre,
    preferred_theme: userProperties.preferredTheme,
    favorite_character_type: userProperties.favoriteCharacterType,
    achievement_count: userProperties.achievementCount,
    total_milestones: userProperties.totalMilestones,
    story_complexity_preference: userProperties.storyComplexityPreference,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackStoryError(
  userId: string,
  errorType: 'generation_error' | 'progression_error' | 'choice_error' | 'analytics_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    sessionId: string;
    storyId?: string;
  }
): void {
  capture('session_story_error', {
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

export function trackStoryFunnel(
  userId: string,
  step: 'story_generated' | 'story_started' | 'first_choice' | 'chapter_completed' | 'story_completed' | 'achievement_unlocked'
): void {
  capture('session_story_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
