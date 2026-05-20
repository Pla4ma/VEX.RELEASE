# VEX Architecture Flow

Mandatory feature layout is features/<name>/ with:
- types.ts for domain types only.
- schemas.ts for Zod schemas only.
- repository.ts for all Supabase queries and only Supabase queries.
- service.ts for business logic only.
- hooks.ts for TanStack Query/Zustand wiring only.
- store.ts only if persistent client state is needed.
- events.ts for EventBus definitions/handlers.
- analytics.ts for Sentry breadcrumbs/PostHog event tracking only.
- components/ for UI rendering only.
- __tests__/ for unit/integration tests.

Data flow must be Component -> Hook -> Service -> Repository -> Supabase.
Never place Supabase access in components or hooks. Never place business logic/calculations in JSX. Never call useQuery directly in components.
