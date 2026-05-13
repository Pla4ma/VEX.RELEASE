export interface FunnelStep {
    name: string;
    event: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
}

export interface Funnel {
    id: string;
    name: string;
    steps: FunnelStep[];
    totalConversionRate: number;
    averageTimeToConvert: number;
}

export interface Cohort {
    id: string;
    startDate: string;
    size: number;
    retention: {
        day1: number; // percentage
        day7: number;
        day30: number;
        day90: number;
        };
    ltv: number;
}

export interface RetentionData {
    cohorts: Cohort[];
    averageRetention: {
        day1: number;
        day7: number;
        day30: number;
        day90: number;
        };
}

export interface RevenueMetrics {
    totalRevenue: number;
    arpu: number;
    arppu: number;
    conversionRate: number;
    ltv: {
        average: number;
        median: number;
        p90: number; // 90th percentile
        };
    mrr: number;
    churnRate: number;
}

export interface PurchaseEvent {
    userId: string;
    productId: string;
    amount: number;
    currency: string;
    timestamp: number;
    isSubscription: boolean;
    subscriptionPeriod?: 'monthly' | 'yearly';
}

export interface MetricAlert {
    id: string;
    metric: string;
    threshold: number;
    operator: '>' | '<' | '=';
    currentValue: number;
    severity: 'WARNING' | 'CRITICAL';
    triggeredAt: number;
}

export interface AlertRule {
    id: string;
    name: string;
    metric: string;
    threshold: number;
    operator: '>' | '<' | '=';
    duration: number;
    severity: 'WARNING' | 'CRITICAL';
    notifyChannels: string[];
}
