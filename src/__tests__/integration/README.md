# Integration Tests

Phase 8B — Integration testing setup for VEX application.

## Structure

```
src/__tests__/integration/
├── setup.ts              # Test environment setup
├── helpers.ts            # Integration test utilities
├── factories.ts          # Test data factories
├── session-progression.test.ts   # 8B.1 Session → Progression
├── session-streak.test.ts        # 8B.2 Session → Streak
└── purchase-inventory.test.ts    # 8B.3 Purchase → Inventory
```

## Running Tests

```bash
# Run all integration tests
npm test -- --testPathPattern=integration

# Run specific integration test
npm test -- session-progression.test.ts
```

## Test Categories

### 8B.1 — Session → Progression Integration
Tests the full flow: session completed → XP calculated → progression updated → level up triggered if threshold crossed.

### 8B.2 — Session → Streak Integration  
Tests streak increment logic, qualifying vs non-qualifying sessions, comeback offers, and streak milestone rewards.

### 8B.3 — Purchase → Inventory Integration
Tests gem purchase via RevenueCat (mock webhook), shop item purchase flow, and insufficient funds handling.

## MSW Setup

Mock Service Worker is configured to intercept Supabase calls and provide predictable responses.

## Event Bus Verification

Tests verify that the event bus publishes correct events with expected payloads.
