# Part File Policy

VEX no longer creates `.part-N.ts` files. Mechanical splitting hides ownership and makes active runtime review harder.

Rules:
- Do not add new files named `*.part-01.ts`, `*.part-02.ts`, or similar.
- When an active final-release domain is touched, migrate the touched surface to domain-named modules.
- Archived/deactivated domains do not need cleanup unless active runtime imports them.
- Do not merge every existing part file in one refactor.

Current audit:

| Feature | Existing part files | Class | Action |
| --- | ---: | --- | --- |
| session-completion | types, analytics | active final-release | migrate touched types/analytics to domain names before future edits |
| session-start | types | active final-release | migrate touched types to domain names before future edits |
| notifications | types | progressive active | migrate notification runtime types when touched |
| retention | types, analytics | progressive active | migrate only active imported surfaces |
| session-story | types, analytics | archived/deactivated | leave unless imported by active runtime |
| shop | types, analytics | archived/deactivated | leave frozen |
| themes | types, analytics | archived/deactivated | leave frozen |

Migration plan:
- `session-completion`: split by completion summary, rewards, analytics events, and recovery state.
- `session-start`: split by setup config, readiness, environment, and start events.
- `notifications`: split by delivery, routing, preferences, and campaigns.
