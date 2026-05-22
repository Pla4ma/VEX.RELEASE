# Archived Features Do Not Revive

AI agents must read this file before editing Home, navigation, notification
routing, completion, premium, economy, social, or Boss systems.

## Rule

Do not reintroduce archived systems into public V1 unless the user directly
requests that exact system by name in the current task.

Archived systems must not appear in:

- Home cards, rails, banners, previews, or empty states.
- Navigation stacks, tabs, deep links, or notification routing.
- Session setup or session completion.
- Coach suggestions, companion messages, or AI-generated actions.
- Premium copy, paywalls, rewards, or progression.

## Do Not Touch Unless Directly Requested

- shop
- inventory
- battle pass
- wagers
- rivals
- squads/social
- leaderboards
- premium currency
- advanced economy
- guilds
- community boss
- seasonal/liveops systems

## Boss Boundaries

Boss public V1 is personal focus momentum only.

Allowed:

- My sessions.
- My progress.
- My momentum.
- My creature or boss health for game-like/intense users.
- Subtle momentum visual for calm/study users.

Not allowed:

- squad boss
- community boss
- guild boss
- shop or inventory dependencies
- battle pass dependencies
- premium currency
- wagers
- social pressure

## Premium Boundaries

Premium may deepen the execution system, but it cannot pretend that archived
economy features are valuable public V1 content.

Do not use:

- gems
- chests as monetization
- premium currency drops
- battle pass copy
- fake subscriptions
- fake plan cards

## Navigation And Notification Boundaries

Routes and notifications must resolve to safe intents. Never route directly to
archived systems. If a legacy notification references an archived system, route
to Home or Start Session after FeatureAvailability blocks it.

## Completion Boundaries

Completion must not show archived feature reports. It may show one relevant
optional effect after Coach Presence and progress. It must not show full combat,
guild, economy, shop, inventory, wager, or leaderboard modules.
