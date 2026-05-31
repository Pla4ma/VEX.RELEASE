export interface SessionSuggestion {
  id: string;
  icon: string;
  title: string;
  reasoning: string;
  durationMinutes: number;
  mode: 'solo' | 'squad';
  confidence: number; // 0-1
}

export interface SessionSuggestionsProps {
  /** Suggestions from homeSpineService.getRecommendation() */
  suggestions: SessionSuggestion[];
  /** Callback when user selects a suggestion */
  onSelectSuggestion: (suggestion: SessionSuggestion) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state - component hides silently on error */
  error?: Error | null;
  /** Whether expanded (controlled by parent) */
  isExpanded?: boolean;
  /** Toggle expansion */
  onToggleExpand?: () => void;
}
