export interface FailureContext {
    userId: string;
    streakDaysBeforeBreak: number;
    breakReason?: 'MISSED_DAY' | 'SESSION_ABANDONED' | 'LOW_QUALITY' | 'USER_INITIATED';
    daysSinceBreak: number;
    previousComebackCount: number;
}

export interface SupportMessage {
    day: 1 | 2 | 3;
    content: string;
    actionItem: string;
    tone: 'EMPATHETIC' | 'CONSTRUCTIVE' | 'MOTIVATIONAL';
    shouldSend: boolean;
}

export interface SupportSequence {
    userId: string;
    startedAt: number;
    messages: SupportMessage[];
    currentDay: 1 | 2 | 3;
    completed: boolean;
}
