export interface ValidationResult<T> {
    valid: boolean;
    data?: T;
    violations: Violation[];
    warnings: Warning[];
    riskScore: number;
}

export interface Violation {
    type: 'RATE_LIMIT' | 'IMPOSSIBLE' | 'SUSPICIOUS' | 'POLICY';
    field: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: Record<string, unknown>;
}

export interface Warning {
    field: string;
    message: string;
    code: string;
}

export type XPTransaction = z.infer<typeof XPTransactionSchema>;
