export interface BossDefeatedScreenProps {
    /** Boss name */
    bossName: string;
    /** Boss tier/rarity */
    bossTier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    /** Total damage dealt to boss */
    totalDamage: number;
    /** Number of sessions contributed */
    sessionsContributed: number;
    /** Time taken to defeat (in hours) */
    timeTaken: number;
    /** Squad contributors (if squad boss) */
    contributors?: Array<{
        userId: string;
        name: string;
        damage: number;
        avatarUrl?: string;
        }>;
    /** Defeat rewards */
    rewards: {
        xp: number;
        coins: number;
        gems?: number;
        item?: string;
        };
    /** Continue to next screen */
    onContinue: () => void;
    /** Share defeat moment */
    onShare?: () => void;
}
