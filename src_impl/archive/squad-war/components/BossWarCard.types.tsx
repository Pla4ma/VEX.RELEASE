export interface BossWarCardProps {
    /** Boss name */
    bossName: string;
    /** Boss tier */
    bossTier: 'NORMAL' | 'ELITE' | 'LEGENDARY';
    /** Boss health remaining (0-100%) */
    bossHealthPercent: number;
    /** Hours remaining in war */
    hoursRemaining: number;
    /** Squad damage dealt so far */
    squadDamage: number;
    /** Your contribution */
    userContribution: number;
    /** Number of squad members participating */
    participantCount: number;
    /** Called when user taps to join war */
    onJoinWar: () => void;
    /** Called when user taps to view details */
    onViewDetails?: () => void;
    /** Loading state */
    isLoading?: boolean;
}
