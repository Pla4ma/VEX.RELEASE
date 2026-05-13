export interface BossTimeoutScreenProps {
    /** Boss name */
    bossName: string;
    /** Boss tier */
    bossTier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    /** Boss health when escaped */
    remainingHealth: number;
    /** Boss escape taunt/laugh */
    escapeTaunt?: string;
    /** Next encounter will have increased health percentage */
    nextEncounterHealthBonus?: number;
    /** Consolation rewards */
    consolation: {
        xp: number;
        coins: number;
        message: string;
        };
    /** Days until boss can be challenged again */
    retryCooldownDays: number;
    /** AI coach encouragement message */
    coachMessage: string;
    /** Start a new session */
    onStartSession: () => void;
    /** Go back to home */
    onGoHome: () => void;
}
