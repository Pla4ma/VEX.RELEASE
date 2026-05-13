export interface ValidationResult<T> {
    valid: boolean;
    data?: T;
    errors: ValidationError[];
    fraudRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Subscription {
    userId: string;
    subscriptionId: string;
    productId: string;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    startedAt: number;
    expiresAt: number;
    autoRenew: boolean;
    platform: 'ios' | 'android' | 'stripe';
}

export type Purchase = z.infer<typeof PurchaseSchema>;
