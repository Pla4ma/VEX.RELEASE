/**
 * App Store Submission Pack — VEX Phase 13
 *
 * Identity: VEX is the productivity app that changes based on how you work.
 * Premium = durable personalization, not game economy.
 */

export const APP_STORE_METADATA = {
  appName: 'VEX',
  subtitle: 'Focus that adapts to you',
  description:
    'VEX learns how you work, then unlocks the right productivity system for your brain — Study, Run, Project, or Clean.\n\n' +
    'Start with one focused session. VEX observes your rhythm, recommends your best lane, and adapts as you go. Each session builds your Focus Score and shapes what VEX suggests next.\n\n' +
    'VEX Premium adds long memory, advanced focus reports, study import depth, project continuity, calendar intelligence, and private memory console controls — durable intelligence that stays useful, not game monetization.',
  keywords: ['focus', 'productivity', 'study', 'deep work', 'project', 'planning', 'memory', 'flow'],
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
- Premium adds deep coach memory, advanced Study/Run/Project/Clean systems, progress intelligence, and private memory console controls.
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
