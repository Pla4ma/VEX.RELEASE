/**
 * App Store Submission Pack — VEX Phase 14
 *
 * Identity: VEX is the productivity app that changes based on how you work.
 * Premium = durable intelligence, not game economy.
 */

export const APP_STORE_METADATA = {
  appName: "VEX",
  subtitle: "Focus that adapts to you",
  description:
    "VEX changes based on how you work. Start one focused session, then unlock Study, Run, Project, or Clean systems as VEX learns your rhythm.\n\n" +
    "VEX Premium adds deeper intelligence: imports, review plans, personal bosses, project memory, weekly reports, and private memory controls — durable intelligence that stays useful.",
  keywords: [
    "focus",
    "productivity",
    "adaptive",
    "study",
    "deep work",
    "project",
    "planning",
    "memory",
    "flow",
    "clean",
    "run",
  ],
  supportUrl: "https://vex.app/support",
  privacyPolicyUrl: "https://vex.app/privacy",
  ageRating: "4+",
  primaryCategory: "Productivity",
  secondaryCategory: "Health & Fitness",
};

export const SCREENSHOT_STORY = [
  {
    index: 1,
    title: "VEX adapts to how you work.",
    description: "One adaptive system — not four separate apps.",
  },
  {
    index: 2,
    title: "Get matched to Study, Run, Project, or Clean.",
    description: "Answer a few questions. VEX finds your lane.",
  },
  {
    index: 3,
    title: "Start the right session fast.",
    description: "No dashboard clutter. Just the next move.",
  },
  {
    index: 4,
    title: "Finish and VEX learns what helps.",
    description: "Completion trains your personalization.",
  },
  {
    index: 5,
    title: "Return tomorrow with a better next action.",
    description: "VEX remembers your rhythm and suggests smarter.",
  },
  {
    index: 6,
    title: "Unlock deeper intelligence with Premium.",
    description:
      "Study intelligence, run intelligence, project memory, and focus reports.",
  },
];

export const REVIEW_NOTES = `
Reviewer Instructions:
1. Open the app — onboarding starts with "VEX changes based on how you work."
2. Answer a few questions and accept the recommended mode (or change it).
3. Start a focus session from Home.
4. Complete the session.
5. View completion screen with progress proof, one reflection, and next action.
6. Return Home — see adaptive next-session CTA.
7. Navigate to Settings > Account > Delete Account to test account deletion.

Subscriptions:
- Premium adds durable Study/Run/Project/Clean Intelligence — lane-matched depth.
- Paywall appears only on premium action tap (study import, run modifier, project memory, clean report).
- No paywall before session 5. Paywall eligible at 40+ sessions.
- No coins, gems, chests, battle pass, or consumable purchases.
- Manage subscriptions in iOS Settings > Apple ID > Subscriptions.
- Restore purchases via Settings > Account > Restore Purchases.

Offline Mode:
- Sessions work offline.
- Completed sessions queue locally and sync when reconnected.

Notifications:
- Maximum 2 per day, quiet hours 10 PM – 7 AM.
- Opt-out available in Settings > Notifications.

Demo Account:
- No login required for sandbox testing.
`;

export const PRIVACY_NUTRITION_LABEL = {
  dataLinkedToUser: [
    "Contact Info (Email)",
    "User Content (Display name, goal)",
    "Identifiers (User ID)",
    "Usage Data (Sessions, Focus Score, streaks)",
    "Purchases (Subscription status)",
  ],
  dataNotLinkedToUser: ["Diagnostics (Crash logs, performance)"],
  dataUsedForTracking: [],
  accountDeletion: "Available in Settings > Account > Delete Account",
};
