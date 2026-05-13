export interface TomorrowPreviewProps {
    streakWillContinue: boolean;
    currentStreak: number;
    challengesResetting: string[];
    events: Array<{
        type:
          | "double_xp"
          | "squad_war"
          | "boss_rush"
          | "season_event"
          | "power_hour"
          | "prime_time";
        name: string;
        time?: string;
        }>;
    onPress: () => void;
    bossPreview?: {
        bossName: string;
        healthPercent: number;
        rewardName: string;
        canDefeatTomorrow: boolean;
        } | null;
    streakMilestonePreview?: { days: number; badgeName: string } | null;
    powerHourPreview?: { day: string; time: string } | null;
    rivalPreview?: {
        rivalName: string;
        theirMinutes: number;
        myMinutes: number;
        gap: number;
        } | null;
    dailyChallengesIncomplete?: boolean;
    xpAvailableTomorrow?: number;
}

/**
 * PHASE 7.4: Session Completion Preview
 *
 * Shows exactly ONE exciting thing at end of every session.
 * Sourced from real data via tomorrowPreviewService.
 * Never shows generic fallback.
 */
export interface TomorrowPreviewSessionProps {
    /** The computed preview data from tomorrowPreviewService */
    preview: {
        type:
          | "STREAK_MILESTONE"
          | "BOSS_NEAR_DEATH"
          | "RIVAL_GAP"
          | "POWER_HOUR"
          | "CHALLENGE_RESET"
          | "GENERIC";
        headline: string;
        subtext: string;
        emoji: string;
        actionPrompt?: string;
        };
    /** Optional press handler for details */
    onPress?: () => void;
}
