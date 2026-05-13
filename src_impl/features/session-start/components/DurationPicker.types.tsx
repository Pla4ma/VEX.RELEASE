export interface DurationPickerProps {
    /** Currently selected duration in minutes */
    selectedDuration: number;
    /** Callback when duration changes */
    onDurationChange: (minutes: number) => void;
    /** Current streak multiplier (e.g., 1.5 for 7-day streak) */
    streakMultiplier?: number;
    /** Base XP rate per minute */
    xpPerMinute?: number;
    /** Whether strict mode is enabled (+20% bonus) */
    isStrictMode?: boolean;
    /** Loading state */
    isLoading?: boolean;
}

export type DurationPreset = 15 | 25 | 45 | 60 | 90;
