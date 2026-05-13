export interface RotatingShopItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    price: {
        gems?: number;
        coins?: number;
        };
    /** Hours remaining in rotation */
    hoursRemaining: number;
    /** Total rotation window in hours */
    rotationDuration: number;
    /** How many times this item appears per month */
    monthlyAppearances: number;
    /** Discount percentage if any */
    discount?: number;
}
