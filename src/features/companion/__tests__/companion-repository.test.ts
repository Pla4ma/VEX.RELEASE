const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
}));

import {
  CompanionRepositoryError,
  getProfile,
  upsertProfile,
  deleteProfile,
} from "../repository";

const userId = "123e4567-e89b-12d3-a456-426614174000";

const dbRow = {
  id: "123e4567-e89b-12d3-a456-426614174222",
  user_id: userId,
  name: "Vexling",
  profile_type: "focus_wisp",
  phase: "EGG",
  level: 1,
  xp: 0,
  total_focus_minutes: 0,
  element: "FLAME",
  element_affinity: 75,
  current_mood: "SLEEPY",
  session_progress: 0,
  purity_score: 85,
  energy_level: 50,
  visual_seed: 42,
  color_hue: 15,
  particle_density: 0.8,
  session_count: 0,
  perfect_sessions: 0,
  longest_focus_streak: 0,
  next_evolution_at: 0,
  special_ability_charge: 0,
  equipped_items: [],
  unlocked_abilities: [],
  last_fed_at: "2026-05-30T12:00:00.000Z",
  last_petted_at: null,
  created_at: "2026-05-30T12:00:00.000Z",
  updated_at: "2026-05-30T12:00:00.000Z",
};

describe("companion repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when no profile exists", async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await getProfile(userId);

    expect(result).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("companion_profiles");
  });

  it("fetches and parses a companion profile row", async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: dbRow, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await getProfile(userId);

    expect(result).not.toBeNull();
    expect(result?.user_id).toBe(userId);
    expect(result?.name).toBe("Vexling");
    expect(result?.phase).toBe("EGG");
    expect(result?.element).toBe("FLAME");
  });

  it("upserts a profile via Supabase", async () => {
    const single = jest.fn().mockResolvedValue({ data: dbRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ upsert });

    const insert = {
      user_id: userId,
      name: "Vexling",
      profile_type: "focus_wisp",
      phase: "EGG" as const,
      level: 1,
      xp: 0,
      total_focus_minutes: 0,
      element: "FLAME" as const,
      element_affinity: 75,
      current_mood: "SLEEPY" as const,
      session_progress: 0,
      purity_score: 85,
      energy_level: 50,
      visual_seed: 42,
      color_hue: 15,
      particle_density: 0.8,
      session_count: 0,
      perfect_sessions: 0,
      longest_focus_streak: 0,
      next_evolution_at: 0,
      special_ability_charge: 0,
      equipped_items: [],
      unlocked_abilities: [],
      last_fed_at: "2026-05-30T12:00:00.000Z",
      last_petted_at: null,
    };

    const result = await upsertProfile(insert);

    expect(result.name).toBe("Vexling");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId }),
      { onConflict: "user_id" },
    );
  });

  it("deletes a companion profile", async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const deleteFn = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ delete: deleteFn });

    await deleteProfile(userId);

    expect(deleteFn).toHaveBeenCalled();
  });

  it("throws CompanionRepositoryError on failure", async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db down" } });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    await expect(getProfile(userId)).rejects.toThrow(
      CompanionRepositoryError,
    );
  });
});
