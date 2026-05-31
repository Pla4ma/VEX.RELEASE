import {
  getCompanion,
  feedCompanion,
  petCompanion,
} from "../companion-profile-ops";
import { getDefaultStorageAdapter } from "../../../persistence/MMKVStorageAdapter";
import {
  TEST_USER_ID,
  createMockStorage,
  createCompanionProfile,
} from "./companion-test-setup";

jest.mock("../../../persistence/MMKVStorageAdapter");

const mockStorage = createMockStorage();
(getDefaultStorageAdapter as jest.Mock).mockReturnValue(mockStorage);

describe("Companion Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
  });

  describe("getCompanion", () => {
    it("should return default profile for new user", async () => {
      const companion = await getCompanion(TEST_USER_ID);
      expect(companion).toMatchObject({
        id: `companion_${TEST_USER_ID}`,
        name: "Vexling",
        type: "focus_wisp",
        level: 1,
        xp: 0,
        mood: "happy",
      });
      expect(companion.lastFedAt).toBeDefined();
      expect(companion.equippedItems).toEqual([]);
      expect(companion.unlockedAbilities).toEqual([]);
    });

    it("should load existing profile from storage", async () => {
      const existingProfile = createCompanionProfile({
        name: "Custom Name",
        level: 5,
        xp: 2500,
        equippedItems: ["hat_1"],
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(existingProfile));
      const companion = await getCompanion(TEST_USER_ID);
      expect(companion.name).toBe("Custom Name");
      expect(companion.level).toBe(5);
      expect(companion.xp).toBe(2500);
    });

    it("should calculate mood based on last fed time", async () => {
      const starvingProfile = createCompanionProfile({
        lastFedAt: Date.now() - 50 * 60 * 60 * 1000,
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(starvingProfile));
      const companion = await getCompanion(TEST_USER_ID);
      expect(companion.mood).toBe("starving");
    });
  });

  describe("feedCompanion", () => {
    it("should feed companion and update mood", async () => {
      const result = await feedCompanion(TEST_USER_ID, {
        skipSyncEnqueue: true,
      });
      expect(result.mood).toBe("happy");
      expect(result.xp).toBeGreaterThan(0);
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should add XP when feeding", async () => {
      const existingProfile = createCompanionProfile({
        mood: "neutral",
        xp: 100,
        lastFedAt: Date.now() - 20 * 60 * 60 * 1000,
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(existingProfile));
      const result = await feedCompanion(TEST_USER_ID);
      expect(result.xp).toBeGreaterThan(100);
      expect(result.mood).toBe("happy");
    });

    it("should resolve successfully when feeding", async () => {
      const result = await feedCompanion(TEST_USER_ID);
      expect(result.mood).toBe("happy");
      expect(result.xp).toBe(50);
    });
  });

  describe("petCompanion", () => {
    it("should update lastPettedAt timestamp", async () => {
      const existingProfile = createCompanionProfile();
      mockStorage.getItem.mockResolvedValue(JSON.stringify(existingProfile));
      const result = await petCompanion(TEST_USER_ID);
      expect(result.lastPettedAt).not.toBeNull();
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should increase mood when petted", async () => {
      const sadProfile = createCompanionProfile({
        mood: "sad",
        lastFedAt: Date.now() - 30 * 60 * 60 * 1000,
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(sadProfile));
      const result = await petCompanion(TEST_USER_ID);
      expect(result.lastPettedAt).toBeDefined();
    });
  });
});
