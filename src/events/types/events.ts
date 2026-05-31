/**
 * Events Event Definitions
 */

export interface EventsEventDefinitions {
  'events:reward_earned': {
    userId: string;
    eventId: string;
    rewardType: string;
    amount: number;
  };
  // Retention Engine Events
  EVENT_CREATED: {
    eventId: string;
    type: string;
    name: string;
    startAt: number;
    endAt: number;
  };
  EVENT_JOINED: {
    userId: string;
    eventId: string;
  };
  EVENT_MILESTONE_REACHED: {
    userId: string;
    eventId: string;
    milestone: number;
  };
  EVENT_TIER_REACHED: {
    userId: string;
    eventId: string;
    tier: number;
  };
  EVENT_REWARDS_CLAIMED: {
    userId: string;
    eventId: string;
    rewards: unknown[];
  };
}
