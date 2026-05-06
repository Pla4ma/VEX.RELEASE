import { supabase } from "../../../config/supabase";
import {
  createMemory,
  getMemoriesByUser,
  markMemoryReferenced,
} from "../repository/memories";

jest.mock("../../../config/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const userId = "123e4567-e89b-12d3-a456-426614174000";
const memoryId = "123e4567-e89b-12d3-a456-426614174001";
const row = {
  id: memoryId,
  user_id: userId,
  type: "STUDY_PATTERN",
  title: "Evening focus",
  description: "Strong sessions after 8 PM",
  occurred_at: "2026-05-05T20:00:00.000Z",
  metadata: { confidence: 0.8 },
  referenced_count: 0,
  last_referenced_at: null,
  created_at: "2026-05-05T20:00:00.000Z",
  updated_at: "2026-05-05T20:00:00.000Z",
};

function setupBuilder(singleResponse: unknown, orderResponse?: unknown): {
  update: jest.Mock;
} {
  const builder = {
    insert: jest.fn(() => builder),
    select: jest.fn(() => builder),
    single: jest.fn(() => singleResponse),
    eq: jest.fn(() => builder),
    order: jest.fn(() => orderResponse ?? singleResponse),
    update: jest.fn(() => builder),
  };
  jest.mocked(supabase.from).mockReturnValue(builder);
  return { update: builder.update };
}

describe("coach memories repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates and validates a memory row", async () => {
    setupBuilder({ data: row, error: null });

    const memory = await createMemory(
      userId,
      "STUDY_PATTERN",
      "Evening focus",
      "Strong sessions after 8 PM",
      { confidence: 0.8 },
    );

    expect(memory).toMatchObject({
      id: memoryId,
      userId,
      type: "STUDY_PATTERN",
    });
  });

  it("throws on invalid Supabase response shape", async () => {
    setupBuilder({ data: { ...row, id: "not-a-uuid" }, error: null });

    await expect(
      createMemory(userId, "STUDY_PATTERN", "Evening", "Strong", {}),
    ).rejects.toThrow();
  });

  it("throws on Supabase create error", async () => {
    setupBuilder({ data: null, error: { message: "insert failed" } });

    await expect(
      createMemory(userId, "STUDY_PATTERN", "Evening", "Strong", {}),
    ).rejects.toThrow("Failed to create memory");
  });

  it("returns user memories in repository order", async () => {
    setupBuilder({ data: [row], error: null }, { data: [row], error: null });

    await expect(getMemoriesByUser(userId)).resolves.toHaveLength(1);
  });

  it("increments referenced count with an explicit update", async () => {
    const { update } = setupBuilder({ data: row, error: null });

    await markMemoryReferenced(memoryId);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ referenced_count: 1 }),
    );
  });
});
