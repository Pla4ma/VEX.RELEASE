# VEX Product Constitution

Every AI agent, developer, and product decision must conform to this
constitution. It is the highest authority for what VEX is and is not.

## Core Identity

VEX is the productivity app that changes based on how you work.

VEX learns how you focus and unlocks the right productivity system for you:
Study, Run, Project, or Clean.

## VEX Final Release IS

- Personalized onboarding and adaptive Home
- Study, Run, Project, and Clean user-facing systems
- Focus, study, and deep-work sessions
- AI Coach presence as intelligence layer
- Companion as visual coach
- Progress tracking: streak, XP, level, focus score
- Adaptive Study / Run / Project / Clean execution paths
- Subtle Boss/momentum layer for all users
- Stronger Boss only for users whose personalization supports game-like intensity
- Clean completion reward moment (supports focus, does not distract)
- Notifications for return, comeback, focus, study, and meaningful progress
- Premium only if real, polished, and aligned with deeper personalization

## VEX Final Release IS NOT

- A generic habit tracker
- A pure focus timer
- A pure Study OS
- A pure AI chatbot
- A pure RPG game
- A social competition app
- A shop/economy app
- A battle pass app
- A feature museum
- A dashboard with every system visible

## Feature States

Every feature must be exactly one of:

### FINAL_RELEASE_ACTIVE
User-facing, polished, aligned with VEX identity, tested, correctly gated.
Must not create clutter or feature-museum feeling.

### INTERNAL_CORE_REQUIRED
Required internally for progress/rewards/state. Not user-facing.
Must not expose shop, economy, social, or battle pass UI.

### PROGRESSIVELY_UNLOCKED_ACTIVE
Production-ready, revealed later through personalization/usage stage.
Must not query, subscribe, render, or notify before unlocked.
Must pass FeatureAvailability gates.

### ARCHIVED_OR_DEACTIVATED
Not part of final release. Must not route, render, query, subscribe,
notify, or affect completion. Fully inert at runtime.

### TEST_OR_LEGACY_ONLY
Test-only or historical. Cannot affect runtime behavior.

## Excluded Systems (ARCHIVED_OR_DEACTIVATED)

- shop
- inventory (user-facing shop inventory)
- wallet UI
- coins/gems as spendable economy
- battle pass
- wagers
- squads
- guild
- rivals
- leaderboards
- community boss
- premium chests
- seasonal currency
- seasonal liveops
- advanced economy
- social competition

## Progressive Unlocking Rules

- Day 0: no full boss screen, no social, no shop, no economy, no premium hard sell
- First session complete: proof, Coach Presence, progress, next action
- Sessions 2-4: rhythm and one small future preview
- Sessions 5-7: relevant path, not a wall of locked systems
- Power users: deeper systems appear only through FeatureAvailability

## Hard Rules

1. No excluded system may register routes.
2. No excluded system may render Home cards.
3. No excluded system may trigger notifications.
4. No excluded system may appear in session completion.
5. No excluded system may run active queries or subscriptions.
6. No excluded system may affect loading state.
7. No excluded system may appear in onboarding.
8. No excluded system may appear in Coach recommendations.
9. No excluded system may appear in premium copy.
10. No excluded system may appear in App Store metadata.
11. All progressively unlocked features must be inert before unlock.
12. Home has exactly one primary CTA at all times.

## Premium Honesty

- Free includes: starting sessions, completing sessions, basic progress,
  basic Coach Presence, basic companion, basic Study/Deep Work entry.
- Premium sells: deeper personalization, Deep Coach Memory, Advanced Study OS,
  Progress Intelligence, visual identity, premium session modes.
- Never show fake billing, fake premium, fake plans, or premium currency.
