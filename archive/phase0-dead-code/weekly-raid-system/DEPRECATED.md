# Archived Weekly Raid System

Archived during Phase 0 hygiene because the weekly raid subsystem was feature-flagged off, not imported by the live boss flow, oversized, and failing typed event contracts.

Replacement path: keep the core boss loop live through `src/features/boss/service.ts`, `src/session/integration/SessionBossIntegration.ts`, and the active boss UI. Reintroduce squad raids only after squads are simplified and the event schema is owned by the squad/boss feature boundary.
