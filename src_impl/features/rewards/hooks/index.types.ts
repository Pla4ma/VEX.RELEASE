export interface DailyLoginReward {
    dayNumber: number;
    type: 'COINS' | 'GEMS' | 'XP_BOOST' | 'STREAK_SHIELD' | 'CHEST';
    amount: number;
    label: string;
    icon: string;
}
