/**
 * Streak Events
 */

export interface StreakEventDefinitions {
  'streak:apply_bonus': { userId: string; bonus: number };
  'streak:comeback': {
    userId: string;
    previousStreak: number;
    comebackDay: number;
  };
  'streak:broken': {
    userId: string;
    previousStreak: number;
    wasComeback: boolean;
    diedAt?: number;
  };
  'streak:funeral_shown': {
    userId: string;
    previousStreak: number;
    diedAt: number;
  };
  'streak:funeral_ready': {
    userId: string;
    previousStreak: number;
    diedAt: number;
  };
  'streak:show_risk_banner': {
    userId?: string;
    priority?: 'low' | 'normal' | 'high';
  };
  'streak:milestone': {
    userId: string;
    streak: number;
    milestone: number;
  };
  'streak:updated': { userId: string; state: { currentStreak: number } };
  'streak:frozen': { userId: string; frozenUntil: number; duration: number };
  'streak:restored': { userId: string; restoredTo: number };
  'social:streak_milestone': {
    userId: string;
    streak: number;
    milestone: number;
  };
  'streak:session_completed': {
    userId: string;
    streakDay: number;
    sessionId: string;
  };
  'streaks:add_shield': {
    userId: string;
    shieldType: string;
    duration: number;
  };
  'streak:insurance_awarded': {
    userId: string;
    insuranceId: string;
    source: string;
  };
  'streak:insurance_used': {
    userId: string;
    insuranceId: string;
    streakDays: number;
    source: string;
  };
  'streak:recovery_started': {
    userId: string;
    previousStreak: number;
    daysAbsent: number;
    bonusMultiplier?: number;
    recoveryQuests: unknown[];
  };
  'streak:recovery_complete': {
    userId: string;
    finalStreak: number;
    targetDays: number;
    recoveryDays?: number;
    success: boolean;
  };
  'streak:milestone_achieved': {
    userId: string;
    days: number;
    milestone: number;
    name?: string;
    timestamp: number;
  };
  'streak:repair_quest_created': {
    userId: string;
    questId: string;
    daysToRecover: number;
    deadline: number;
  };
  'streak:repair_quest_started': {
    userId: string;
    questId: string;
    sessionId: string;
  };
  'streak:repaired': {
    userId: string;
    questId: string;
    daysRecovered: number;
  };
  'streak:repair_quest_expired': {
    userId: string;
    questId: string;
    daysLost: number;
  };
  'streak:recovery_plan_created': { userId?: string; planId?: string };
  'streak:insurance_remaining': {
    userId?: string;
    insuranceId?: string;
    streakDays?: number;
    source?: string;
    remainingInsurance?: number;
  };
  'streak:risk_updated': {
    userId: string;
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    hoursRemaining: number;
  };
  'streak:risk': {
    userId: string;
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    hoursRemaining: number;
    streakDays?: number;
  };
  'creature:revived': {
    userId: string;
    cost: number;
    streakPreserved: number;
  };
  'creature:evolved': {
    userId: string;
    creatureId: string;
    newLevel: number;
  };
  'creature:died': {
    userId: string;
    creatureId: string;
    streakLost: number;
  };
  'creature:crying': {
    userId: string;
    creatureId: string;
    sadnessLevel: number;
  };
  'creature:risk_increased': {
    userId: string;
    creatureId: string;
    riskLevel: string;
  };
}
