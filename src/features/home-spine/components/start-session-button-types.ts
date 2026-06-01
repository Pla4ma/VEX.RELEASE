export interface StartSessionButtonProps {
  /** Primary label text */
  label?: string;
  /** Secondary subtitle text */
  subtitle?: string;
  /** Resume state - shows elapsed time if resuming */
  resumeTimeSeconds?: number | null;
  /** Number of squad members currently focusing */
  squadMembersFocusing?: number;
  /** Streak risk level for urgency styling */
  streakRiskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Hours remaining until streak breaks */
  streakHoursRemaining?: number | null;
  /** Loading state while creating session */
  isLoading?: boolean;
  /** Whether user has an active (paused) session */
  hasActiveSession?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
  /** PHASE 7.3: Boss name for Final Strike mode */
  bossName?: string;
  /** PHASE 7.3: Final Strike mode (boss at 1-15% health) */
  isFinalStrike?: boolean;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
