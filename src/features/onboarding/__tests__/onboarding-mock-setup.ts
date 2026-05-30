/**
 * Shared mock setup for onboarding tests.
 * Import this file at the top of each split test file.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
  handleSupabaseError: jest.fn((e: unknown) => e),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(() => false),
    getNumber: jest.fn(() => undefined),
  })),
}));

jest.mock("../../../store", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ user: { id: "test-user-id" } })),
  },
}));

jest.mock("../../../constants/haptics", () => ({
  triggerHapticEvent: jest.fn(),
  HapticEvents: { WARNING: "warning" },
}));

jest.mock("@theme/tokens/launch-colors", () => ({
  launchColors: {
    hex_48bb78: "#48bb78",
    hex_4299e1: "#4299e1",
    hex_9f7aea: "#9f7aea",
    hex_e53e3e: "#e53e3e",
    hex_38b2ac: "#38b2ac",
    hex_ed8936: "#ed8936",
  },
}));

jest.mock("../../lane-engine/schemas", () => {
  const { z } = require("zod");
  return {
    LaneSchema: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]),
  };
});
