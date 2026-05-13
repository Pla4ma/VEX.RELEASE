export interface InsurancePricing {
    baseCost: number;
    perDayMultiplier: number;
    maxDays: number;
    minDays: number;
}

export interface GambleConfig {
    requiredGrade: 'S' | 'A' | 'B';
    timeWindowHours: number;
    bonusXpMultiplier: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PurchaseInsuranceResult {
    success: boolean;
    insurance: StreakInsurance | null;
    error: string | null;
    remainingBalance: number;
}

export interface SettleGambleResult {
    success: boolean;
    won: boolean;
    streakSaved: boolean;
    newStreakDays: number;
    xpAwarded: number;
    message: string;
}

export interface StreakRiskAssessment {
    riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    hoursRemaining: number;
    insuranceAvailable: boolean;
    insuranceCost: number;
    gambleAvailable: boolean;
    gambleOptions: ReturnType<typeof getGambleOptions>;
    comebackTokensAvailable: number;
    recommendedAction: 'NONE' | 'INSURANCE' | 'GAMBLE' | 'SESSION_NOW';
}

export type StreakInsurance = z.infer<typeof StreakInsuranceSchema>;
export type StreakGamble = z.infer<typeof StreakGambleSchema>;
export type ComebackToken = z.infer<typeof ComebackTokenSchema>;
