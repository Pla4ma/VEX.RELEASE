export interface ComebackContext {
    daysSinceLastSession: number;
    previousStreak: number;
    streakBroken: boolean;
    wasInvitedBack: boolean;
    inviterName?: string;
}

export type ComebackQuestType = 'mini_session' | 'streak_restore' | 'boss_fight' | 'social_reconnect';
export type ComebackQuestStatus = 'active' | 'completed' | 'expired';
export type ComebackQuest = z.infer<typeof ComebackQuestSchema>;
