export interface StudySessionResult {
    sessionId: string;
    duration: number;
    quality: number;
    completed: boolean;
    notes?: string;
}

export type StudyPlan = z.infer<typeof StudyPlanSchema>;
