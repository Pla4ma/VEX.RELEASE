export interface PrimeTimeWindow {
    id: string;
    encounterId: string;
    startTime: number;
    endTime: number;
    damageMultiplier: number;
    bonusLootChance: number;
    description: string;
    notificationSent: boolean;
}

export interface PrimeTimeStatus {
    isPrimeTime: boolean;
    activeWindow: PrimeTimeWindow | null;
    nextWindow: PrimeTimeWindow | null;
    damageMultiplier: number;
    bonusLootChance: number;
    timeRemaining: number;
    hoursUntilNext: number | null;
}

export interface PrimeTimeSchedule {
    encounterId: string;
    windows: PrimeTimeWindow[];
    timezone: string;
}

export interface PrimeTimeAnalytics {
    totalWindowsGenerated: number;
    totalWindowsUtilized: number;
    averageDamageDuringPrimeTime: number;
    averageDamageNormalTime: number;
    primeTimeConversionRate: number;
}

export type PrimeTimePattern = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'WEEKEND';
