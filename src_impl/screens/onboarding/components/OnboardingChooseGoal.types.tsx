export interface OnboardingGoal {
    id: OnboardingGoalType;
    icon: string;
    title: string;
    description: string;
}

export type OnboardingGoalType = 'deep-work' | 'build-habit' | 'get-done' | 'beat-procrastination';
