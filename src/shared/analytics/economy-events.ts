export const EconomyEvents = {
  REWARD_CLAIMED: "reward_claimed",
  CURRENCY_GRANTED: "currency_granted",
  CURRENCY_SPENT: "currency_spent",
  ITEM_PURCHASED: "item_purchased",
  CURRENCY_EARNED: "currency_earned",
  CURRENCY_CONVERTED: "currency_converted",
  ITEM_CRAFTED: "item_crafted",
  ITEM_USED: "item_used",
  INVENTORY_FULL: "inventory_full",
  SHOP_VIEWED: "shop_viewed",
  OFFER_CLAIMED: "offer_claimed",
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_DISMISSED: "paywall_dismissed",
  OFFERING_LOADED: "offering_loaded",
  OFFERING_LOAD_FAILED: "offering_load_failed",
  OFFERING_EMPTY: "offering_empty",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
  PURCHASE_CANCELLED: "purchase_cancelled",
  RESTORE_STARTED: "restore_started",
  RESTORE_COMPLETED: "restore_completed",
  RESTORE_FAILED: "restore_failed",
  RESTORE_EMPTY: "restore_empty",
  ENTITLEMENT_ACTIVATED: "entitlement_activated",
  ENTITLEMENT_REVOKED: "entitlement_revoked",
  ENTITLEMENT_EXPIRED: "entitlement_expired",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  PREMIUM_REWARD_UNLOCKED: "premium_reward_unlocked",
  PREMIUM_TRIAL_CLAIMED: "premium_trial_claimed",
  PREMIUM_TRIAL_EXPIRED: "premium_trial_expired",
} as const;
export type EconomyEvent = (typeof EconomyEvents)[keyof typeof EconomyEvents];
export type PurchaseEvent = EconomyEvent;

export const RewardEvents = {
  REWARD_CLAIMED: "reward_claimed",
  REWARD_AVAILABLE: "reward_available",
  DAILY_BONUS_CLAIMED: "daily_bonus_claimed",
  STREAK_BONUS_CLAIMED: "streak_bonus_claimed",
  LEVEL_BONUS_CLAIMED: "level_bonus_claimed",
} as const;
export type RewardEvent = (typeof RewardEvents)[keyof typeof RewardEvents];

export const PurchaseFunnelEvents = {
  PAYWALL_VIEWED: "paywall_viewed",
  PACKAGE_SELECTED: "package_selected",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_SUCCEEDED: "purchase_succeeded",
  PURCHASE_FAILED: "purchase_failed",
  PURCHASE_RESTORED: "purchase_restored",
} as const;
export type PurchaseFunnelEvent =
  (typeof PurchaseFunnelEvents)[keyof typeof PurchaseFunnelEvents];
