# VEX Stack And Non-Negotiable Rules

VEX is a production Expo React Native app in C:\Users\jonat\CascadeProjects\vex-app-old.

Stack policy:
- Expo SDK 54 managed workflow.
- TypeScript strict with noImplicitAny, strictNullChecks, noUncheckedIndexedAccess.
- TanStack Query v5 for server state only.
- Zustand for persistent client state only.
- Zod schemas are source of truth; infer types with z.infer.
- React Navigation v6 fully typed.
- Reanimated 3 only. Never use Animated from react-native.
- Supabase Postgres/Auth/Realtime/Storage.
- MMKV for non-sensitive storage. SecureStore only via existing SecureStorage wrapper for secrets.
- Sentry captures unexpected errors.
- RevenueCat only through shared monetization layer.
- Design tokens from src/theme/tokens or src_impl/theme/tokens only. No hardcoded UI values.

No new libraries without explicit user instruction.
