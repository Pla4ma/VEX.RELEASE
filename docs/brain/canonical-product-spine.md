# Canonical Product Spine

VEX is a premium focus app first.

## Primary user journey

1. `Home`
2. `Start Session`
3. `Active Session`
4. `Session Complete`
5. `Return Reason`

## Product rules

- Every surface must strengthen one step of the primary journey or be visually secondary.
- New users should mainly experience the `CORE` tier.
- Engagement systems unlock only after the focus loop feels valuable.
- Expansion systems stay hidden until the user has already built momentum.

## Domain ownership

- `src/session`: canonical focus loop and session orchestration
- `src/features/liveops-config`: canonical feature exposure and product tiering
- `src/shared/monetization`: canonical premium entitlement and paywall messaging

## Deprecated growth pattern

Do not introduce new user-facing systems into the first-week journey unless they improve:

- session start speed
- session completion confidence
- daily return motivation
