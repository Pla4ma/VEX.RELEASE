export interface UseCoachRecommendationReturn {
    recommendation: CoachRecommendation | null;
    isLoading: boolean;
    refresh: () => void;
    getPersonaName: () => string;
}
