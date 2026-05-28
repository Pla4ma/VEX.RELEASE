# VEX — Project Context for Kanban Workers

## What is VEX
Expo React Native productivity app that adapts to how you work. Four lanes: Study, Run, Project, Clean. Learns user rhythm, unlocks systems progressively.

## Repo
- Path: /root/projects/VEX.RELEASE
- **Branch: `hermes-vex-work`** — NEVER push to `main`
- User decides what gets merged

## Git Workflow (MANDATORY)
1. `git checkout hermes-vex-work && git pull origin hermes-vex-work`
2. Do your work
3. Run ALL verification gates (see below)
4. `git add -A && git commit -m "type(scope): description" && git push origin hermes-vex-work`
5. NEVER push to `main`

## Safety Scripts (MANDATORY — NEVER SKIP)
Every task MUST use these scripts:

### Pre-Work (run BEFORE starting)
```bash
cd /root/projects/VEX.RELEASE
bash .hermes/scripts/pre-work.sh
```
Creates a safety snapshot you can rollback to if things go wrong.

### Post-Work (run AFTER completing work)
```bash
bash .hermes/scripts/post-work.sh
```
Runs ALL quality gates. If ANY fail, auto-reverts to safety snapshot.

### Completion Verification (run BEFORE marking done)
```bash
bash .hermes/scripts/verify-completion.sh
```
Verifies ACTUAL work was done, not just claimed. Checks:
- Files were actually changed
- Changes are meaningful (not just whitespace/comments)
- Commits were made
- Code was pushed
- All quality gates pass

**ONLY after verify-completion.sh passes can you mark the task as done.**

### Scope Check (run during work)
```bash
bash .hermes/scripts/scope-check.sh
```
Verifies files being edited are in scope of the task.

### Rollback (if something goes wrong)
```bash
bash .hermes/scripts/rollback.sh --yes
```
Reverts to the safety snapshot.

## Completion Rules (NEVER VIOLATE)
- **NEVER mark a task as complete if verify-completion.sh hasn't passed**
- **NEVER fake completion** — if the work isn't done, BLOCK and report
- **NEVER stop early** — if the task isn't fully done, keep working
- **NEVER claim "done" without actual commits pushed to GitHub**
- **If you can't complete a task, BLOCK with a clear reason** — don't pretend

## Stack (exact versions, no substitutions)
- Expo SDK 56 (managed workflow)
- TypeScript 6.0.3 — strict: true, noImplicitAny, strictNullChecks, noUncheckedIndexedAccess
- TanStack Query v5 — server state ONLY
- Zustand — persistent client state ONLY
- Zod — schemas are source of truth, types inferred via z.infer<>
- React Navigation v6 — fully typed, all routes in RootStackParamList
- Reanimated 3 — ONLY animation library. Never import Animated from react-native.
- Supabase — Postgres + Auth + Realtime + Storage
- MMKV — non-sensitive fast storage
- expo-secure-store — auth tokens/secrets only via SecureStorage wrapper
- Sentry — unexpected errors
- RevenueCat — purchases via shared/monetization/ layer only
- Design tokens: src/theme/tokens/ — never hardcode values

## Architecture (MANDATORY)
Every feature in features/<name>/ with exactly:
- types.ts — domain types only
- schemas.ts — Zod schemas, types inferred
- repository.ts — ALL Supabase queries HERE ONLY
- service.ts — ALL business logic HERE ONLY
- hooks.ts — TanStack Query + Zustand wiring
- store.ts — Zustand slice (only if persistent state needed)
- events.ts — EventBus definitions
- analytics.ts — Sentry breadcrumbs + PostHog tracking
- components/ — UI rendering only, zero business logic
- __tests__/ — unit + integration tests

Data flow: Component → Hook → Service → Repository → Supabase

## Hard Limits (NON-NEGOTIABLE)
- 200 lines max per file — split before exceeding
- No `any`, `@ts-nocheck`, `@ts-ignore`
- No console.log — use logger or Sentry breadcrumbs
- No TODO in shipped code
- No StyleSheet.create — use inline styles with theme tokens
- No FlatList — use FlashList with estimatedItemSize
- No AsyncStorage — use MMKV or SecureStorage
- No raw fetch() — use existing API client
- No hardcoded colors/spacing/font sizes
- No stubs that look complete
- No happy-path-only implementations

## Verification Gates (ALL must pass before pushing)
```bash
cd /root/projects/VEX.RELEASE
npm run typecheck -- --pretty false
npm test -- --passWithNoTests
# File size audit
find src/features/<name> -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
# Banned pattern audit
rg "console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|StyleSheet\.create|FlatList|AsyncStorage|fetch\(" src
```

## State Management (3 layers, never mixed)
| Type | Tool | Where |
|------|------|-------|
| Server state | TanStack Query | hooks.ts → service.ts → repository.ts |
| Global client | Zustand | store.ts — auth, prefs, offline queue |
| Local UI | useState | Components — open/closed, drafts only |

## Error Handling (every async path)
- try/catch with typed error (never catch (e: any))
- User-facing error state in UI
- Retry for network operations
- Sentry.captureException() for unexpected errors
- Parse data at Zod boundaries

## UI States (ALL required)
Every data-driven component needs: Loading (skeleton), Error (VEX voice + retry), Empty (illustrated + CTA), Success, Offline (banner), Optimistic (immediate update)

## Key Paths
- Features: src/features/
- Shared: src/shared/
- Theme/tokens: src/theme/tokens/
- Navigation types: src/navigation/types.ts
- Supabase types: src/types/supabase.ts
- Tests: __tests__/ per feature, e2e/ for end-to-end
