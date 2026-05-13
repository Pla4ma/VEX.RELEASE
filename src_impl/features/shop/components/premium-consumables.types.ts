/**
 * Effect handlers for when these consumables are used
 * These would be wired up to the actual game systems
 */
export interface ConsumableEffectHandlers {
    applyVoidFragment: (userId: string) => Promise<boolean>;
    applyFocusCrystal: (userId: string) => Promise<boolean>;
    applyChainBreaker: (userId: string, chainProgress: number) => Promise<boolean>;
}
