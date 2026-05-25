# Part File Policy

VEX no longer creates `.part-N.ts` files. Mechanical splitting hides ownership and makes active runtime review harder.

## Rules

- No new files named `*.part-01.ts`, `*.part-02.ts`, or any `.part-N` pattern.
- Active final-release domains migrated away from part files. New content goes into domain-named files.
- Archived/deactivated domains keep their part files frozen. No cleanup unless active runtime imports them.
- No mega-merge of all part files.

## Part File Inventory

### CLEANED — Active Domains (no part files remain)

| Feature | Class | What happened |
|---|---|---|
| session-completion | active final-release | 5 types + 5 analytics part files migrated to domain-named files |
| session-start | active final-release | 6 dead unreferenced part files deleted |
| notifications | active | 1 types part file migrated to domain-named file |
| home-experience | active final-release | never had part files |
| coach-presence | active final-release | never had part files |

### Domain-Named Replacements (session-completion)

| Old part file | New domain file |
|---|---|
| `types.part-01.ts` | `completion-core.ts` |
| `types.part-02.ts` | `completion-experience.ts` |
| `types.part-03.ts` | `completion-analytics-types.ts` |
| `types.part-04.ts` | `completion-benchmark-set.ts` |
| `types.part-05.ts` | `completion-event-types.ts` |
| `analytics.part-01.ts` | `completion-lifecycle-analytics.ts` |
| `analytics.part-02.ts` | `completion-reward-analytics.ts` |
| `analytics.part-03.ts` | `completion-achievement-analytics.ts` |
| `analytics.part-04.ts` | `completion-social-analytics.ts` |
| `analytics.part-05.ts` | `completion-dashboard-analytics.ts` |

### Domain-Named Replacements (notifications)

| Old part file | New domain file |
|---|---|
| `types.part-01.ts` | `notification-event-types.ts` |

### FROZEN — Archived/Deactivated (leave as-is)

| Feature | Part files | Count |
|---|---|---|
| retention | types + analytics | 1 + 5 = 6 |
| session-story | types + analytics | 12 + 6 = 18 |
| shop | types + analytics | 10 + 5 = 15 |
| themes | types + analytics | 9 + 4 = 13 |

## Enforcement

Test at `src/features/liveops-config/__tests__/part-file-policy.test.ts` verifies:
1. No new part files outside known frozen domains
2. Policy doc exists describing freeze and migration
