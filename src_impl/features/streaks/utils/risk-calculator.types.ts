export interface RiskFactors {
    hoursSinceLastSession: number;
    typicalSessionHour: number;
    currentHour: number;
    historicalPattern: 'CONSISTENT' | 'VARIABLE' | 'DECLINING';
    daysUntilStreakBreak: number;
    recentSessionQuality: number;
    weekendRisk: boolean;
    vacationMode: boolean;
}

export interface RiskAssessment {
    level: RiskLevel;
    score: number;
    factors: RiskFactors;
    recommendation: string;
    urgency: 'NONE' | 'SOON' | 'URGENT' | 'CRITICAL';
    suggestedAction: 'NONE' | 'REMINDER' | 'PUSH' | 'INTERVENTION';
}

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
