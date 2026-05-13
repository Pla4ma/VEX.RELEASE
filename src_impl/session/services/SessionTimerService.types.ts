export interface TickHandler {
    (payload: { sessionId: string; timestamp: number; deltaMs: number }): void;
}

export interface TimerConfig {
    tickIntervalMs: number;
    warningThresholds: number[];
    autoCompleteOnZero: boolean;
    trackBackgroundTime: boolean;
}
