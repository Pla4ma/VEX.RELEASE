export interface ChestOpeningOverlayProps {
    /** Modal visibility */
    visible: boolean;
    /** Chest rarity */
    rarity: ChestRarity;
    /** Called when overlay closes */
    onClose: () => void;
    /** Called when chest is opened (to update inventory) */
    onChestOpened: (contents: { xp: number; coins: number; gems?: number; item?: string }) => void;
}
