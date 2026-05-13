export interface PaywallContext {
    userId: string;
    currentTier: string;
    sessionsCompleted: number;
    lastShownAt?: number;
    selectedTier?: string;
    error?: string;
}

export interface PaywallMachineState {
    state: PaywallState;
    context: PaywallContext;
    canDismiss: boolean;
    canRestore: boolean;
}

export type PaywallState = 'idle' | 'loading' | 'presenting' | 'trial_started' | 'purchasing' | 'success' | 'failed' | 'dismissed' | 'restoring';
export type PaywallEvent = { type: 'TRIGGER'; context: PaywallContext } | { type: 'LOAD' } | { type: 'PRESENT' } | { type: 'START_TRIAL'; tier: string } | { type: 'PURCHASE'; tier: string } | { type: 'PURCHASE_SUCCESS' } | { type: 'PURCHASE_FAILED'; error: string } | { type: 'DISMISS' } | { type: 'RESTORE' } | { type: 'RESTORE_SUCCESS' } | { type: 'RESTORE_FAILED'; error: string };
