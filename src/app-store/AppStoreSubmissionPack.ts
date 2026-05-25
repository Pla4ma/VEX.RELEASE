/**
 * App Store Submission Pack
 *
 * Metadata, review notes, and privacy answers for App Store submission.
 */

export const APP_STORE_METADATA = {
  appName: 'VEX — Focus Score',
  subtitle: 'Build focus. Track growth.',
  description:
    'VEX turns focus into a measurable skill. Start a session, earn a grade, watch your Focus Score grow. Your companion evolves with every completed session. Streaks protect your momentum. Comeback quests recover lost days. Premium unlocks deeper insight — never fear.',
  keywords: ['focus', 'productivity', 'timer', 'streak', 'habit', 'study'],
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
- Premium unlocks unlimited AI coach insights and monthly Focus Reports.
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
