/**
 * App Store Submission Pack — VEX Phase 14
 *
 * Premium = durable personalization, not game economy.
 * No coins, no gems, no shop, no loot.
 */

export const APP_STORE_METADATA = {
  appName: 'VEX — Focus Score',
  subtitle: 'Focus. Track growth. Go deeper.',
  description:
    'VEX turns focus into a measurable skill. Start a session, earn a grade, watch your Focus Score grow. Your companion evolves with every completed session. VEX Premium adds long memory, advanced focus reports, study import depth, project continuity, calendar intelligence, and private memory console controls — serious productivity tools, not game monetization. No coins, no gems, no chests, no pay-to-win.',
  keywords: ['focus', 'productivity', 'timer', 'deep work', 'habit', 'study', 'calendar', 'memory'],
  supportUrl: 'https://vex.app/support',
  privacyPolicyUrl: 'https://vex.app/privacy',
  ageRating: '4+',
  primaryCategory: 'Productivity',
  secondaryCategory: 'Health & Fitness',
};

export const REVIEW_NOTES = `
Reviewer Instructions:
1. Open the app — you'll see onboarding (skip if already completed).
2. Start a 10-minute focus session from Home.
3. Complete the session (or use the debug skip in Settings > Developer).
4. View your Focus Score change and companion reaction.
5. Navigate to Settings > Account > Delete Account to test account deletion.

Subscriptions:
- Premium adds long memory, advanced focus reports, study import depth, project continuity, calendar intelligence, advanced friction modes, weekly experiments, and private memory console controls.
- Premium appears only after the core focus loop proves useful (40+ sessions).
- No Day 0 paywall. No coins, gems, or consumable purchases.
- Manage subscriptions in iOS Settings > Apple ID > Subscriptions.
- Restore purchases via Settings > Account > Restore Purchases.

Offline Mode:
- Sessions can be started without internet.
- Completed sessions queue locally and sync when reconnected.

Notifications:
- Maximum 2 per day, quiet hours 10 PM – 7 AM.
- Opt-out available in Settings > Notifications.

Demo Account:
- No login required for sandbox testing.
- Use the built-in test account for full feature access.
`;

export const PRIVACY_NUTRITION_LABEL = {
  dataLinkedToUser: [
    'Contact Info (Email)',
    'User Content (Display name, goal)',
    'Identifiers (User ID)',
    'Usage Data (Sessions, Focus Score, streaks)',
    'Purchases (Subscription status)',
  ],
  dataNotLinkedToUser: [
    'Diagnostics (Crash logs, performance)',
  ],
  dataUsedForTracking: [],
  accountDeletion: 'Available in Settings > Account > Delete Account',
};
