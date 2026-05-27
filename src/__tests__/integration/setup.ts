/**
 * Integration Test Setup
 *
 * Phase 8B — MSW (Mock Service Worker) configuration for integration tests
 */

import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Define handlers for Supabase API mocking
const handlers = [
  // Mock Supabase auth
  http.post("*/auth/v1/token*", () => {
    return HttpResponse.json({
      access_token: "mock-token",
      user: { id: "test-user-id", email: "test@example.com" },
    });
  }),

  // Mock Supabase sessions table
  http.post("*/rest/v1/sessions", () => {
    return HttpResponse.json({
      id: "session-1",
      user_id: "test-user-id",
      status: "active",
      created_at: new Date().toISOString(),
    });
  }),

  http.patch("*/rest/v1/sessions*", () => {
    return HttpResponse.json({
      id: "session-1",
      status: "completed",
      xp_earned: 250,
      coins_earned: 10,
    });
  }),

  // Mock Supabase wallet table
  http.get("*/rest/v1/wallets*", () => {
    return HttpResponse.json([
      {
        id: "wallet-1",
        user_id: "test-user-id",
        coins: 1000,
        gems: 50,
        seasonal: {},
      },
    ]);
  }),

  http.patch("*/rest/v1/wallets*", () => {
    return HttpResponse.json({
      id: "wallet-1",
      coins: 900,
      gems: 50,
    });
  }),

  // Mock Supabase streaks table
  http.get("*/rest/v1/streaks*", () => {
    return HttpResponse.json([
      {
        id: "streak-1",
        user_id: "test-user-id",
        current_days: 5,
        longest_days: 10,
        last_qualifying_session_at: new Date(
          Date.now() - 24 * 60 * 60 * 1000,
        ).toISOString(),
        timezone: "UTC",
        shields_available: 1,
        grace_period_used: false,
      },
    ]);
  }),

  http.patch("*/rest/v1/streaks*", () => {
    return HttpResponse.json({
      id: "streak-1",
      current_days: 6,
      longest_days: 10,
    });
  }),

  // Mock Supabase progression table
  http.get("*/rest/v1/progression*", () => {
    return HttpResponse.json([
      {
        id: "prog-1",
        user_id: "test-user-id",
        level: 5,
        xp: 450,
        xp_to_next_level: 500,
      },
    ]);
  }),

  http.patch("*/rest/v1/progression*", () => {
    return HttpResponse.json({
      id: "prog-1",
      level: 5,
      xp: 700, // XP increased
      xp_to_next_level: 500,
    });
  }),

  // Mock Supabase inventory table
  http.get("*/rest/v1/inventory*", () => {
    return HttpResponse.json([]);
  }),

  http.post("*/rest/v1/inventory", () => {
    return HttpResponse.json({
      id: "inv-1",
      user_id: "test-user-id",
      item_id: "item-1",
      quantity: 1,
    });
  }),

  // Mock RevenueCat webhook
  http.post("*/webhook/revenuecat", () => {
    return HttpResponse.json({ received: true });
  }),

  // Mock Supabase RPC functions
  http.post("*/rest/v1/rpc/get_or_create_wallet", () => {
    return HttpResponse.json({
      id: "wallet-1",
      user_id: "test-user-id",
      coins: 1000,
      gems: 50,
    });
  }),

  http.post("*/rest/v1/rpc/record_session", () => {
    return HttpResponse.json({
      session_id: "session-1",
      xp_earned: 250,
      streak_updated: true,
      new_streak: 6,
    });
  }),
];

export const server = setupServer(...handlers);

// Vitest lifecycle hooks
export function setupIntegrationTests() {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}

export { http, HttpResponse };
