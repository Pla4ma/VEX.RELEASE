const mockRpc = jest.fn();
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockGetUser = jest.fn();

jest.mock("../repository", () => {
  const actual = jest.requireActual("../repository");
  return {
    ...actual,
    getSupabase: jest.fn(() => ({
      from: jest.fn(() => ({
        upsert: mockUpsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })),
      rpc: mockRpc,
      auth: {
        getUser: mockGetUser,
      },
    })),
  };
});

import { RepositoryError } from "../repository";
import {
  getOrCreateWallet,
  getWalletSummary,
  getBalance,
} from "../service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getOrCreateWallet", () => {
  it("returns wallet coins and gems on success", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 150,
        gems: 7,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const wallet = await getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001");
    expect(wallet.coins).toBe(150);
    expect(wallet.gems).toBe(7);
  });

  it("throws RepositoryError on supabase error", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "duplicate key", code: "23505" },
    });

    await expect(
      getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001"),
    ).rejects.toThrow(RepositoryError);
  });

  it("throws on invalid wallet data (schema validation)", async () => {
    mockSingle.mockResolvedValue({
      data: { invalid: true },
      error: null,
    });

    await expect(
      getOrCreateWallet("550e8400-e29b-41d4-a716-446655440001"),
    ).rejects.toThrow();
  });
});

describe("getWalletSummary", () => {
  it("returns {coins:0, gems:0} when no user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const summary = await getWalletSummary();
    expect(summary).toEqual({ coins: 0, gems: 0 });
  });

  it("returns wallet when user exists", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440001" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 200,
        gems: 15,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const summary = await getWalletSummary();
    expect(summary.coins).toBe(200);
    expect(summary.gems).toBe(15);
  });
});

describe("getBalance", () => {
  it("returns coins from wallet", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        coins: 500,
        gems: 20,
        created_at: 1000,
        updated_at: 1000,
      },
      error: null,
    });

    const balance = await getBalance("550e8400-e29b-41d4-a716-446655440001");
    expect(balance).toBe(500);
  });
});
