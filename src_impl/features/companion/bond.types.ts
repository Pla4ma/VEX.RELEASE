export interface BondState {
    level: number;
    trust: number;
    memories: CompanionMemory[];
    lastInteractionAt: number;
    totalInteractions: number;
    longestAbsenceDays: number;
    recoveredFromAbsence: boolean;
}

export interface CompanionMemory {
    id: string;
    type: MemoryType;
    description: string;
    timestamp: number;
    emotionalWeight: number;
}
