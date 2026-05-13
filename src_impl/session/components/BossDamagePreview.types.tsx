export interface BossDamagePreviewProps {
    /** Boss name */
    bossName: string;
    /** Current boss health percentage (0-100) */
    currentHealthPercent: number;
    /** Estimated damage this session will deal */
    estimatedDamage: number;
    /** Whether this session will defeat the boss */
    willDefeat: boolean;
    /** Navigate to boss detail screen */
    onPress?: () => void;
    /** Loading state */
    isLoading?: boolean;
}
