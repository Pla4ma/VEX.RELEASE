export interface CurrencyGrant {
    userId: string;
    amount: number;
    currency: 'COINS' | 'GEMS' | 'SPECIAL';
    source: 'SESSION_COMPLETE' | 'DAILY_LOGIN' | 'ACHIEVEMENT' | 'PURCHASE' | 'STREAK_BONUS';
    metadata?: Record<string, unknown>;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'GRANT' | 'SPEND' | 'PURCHASE';
    amount: number;
    currency: 'COINS' | 'GEMS' | 'SPECIAL';
    source: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface Wallet {
    userId: string;
    coins: number;
    gems: number;
    special: number;
    lastUpdated: string;
}
