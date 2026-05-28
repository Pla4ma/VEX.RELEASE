import {
  levelUpCompanion,
  processSessionEvent,
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

describe("Companion Leveling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
  });

  describe("levelUpCompanion", () => {
    it("should calculate correct level from XP", async () => {
      const profileWithXP = createCompanionProfile({ xp: 1200 });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(profileWithXP));
      const result = await levelUpCompanion(TEST_USER_ID);
      expect(result.level).toBe(3);
    });

    it("should unlock abilities at milestone levels", async () => {
      const highXPProfile = createCompanionProfile({ xp: 10000 });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(highXPProfile));
      const result = await levelUpCompanion(TEST_USER_ID);
      expect(result.unlockedAbilities).toContain("xp_boost_5pct");
      expect(result.unlockedAbilities).toContain("coin_boost_10pct");
      expect(result.unlockedAbilities).toContain("streak_protection");
    });
  });

  describe("processSessionEvent", () => {
    it("should add XP for completed session", async () => {
      const existingProfile = createCompanionProfile();
      mockStorage.getItem.mockResolvedValue(JSON.stringify(existingProfile));
      const event = {
        type: "session_complete" as const,
        duration: 25,
        quality: "good" as const,
      };
      const result = await processSessionEvent(TEST_USER_ID, event);
      expect(result.xp).toBeGreaterThan(0);
    });

    it("should charge special ability on streak milestone", async () => {
      const profileWithCharge = createCompanionProfile({
        level: 10,
        xp: 5000,
        specialAbilityCharge: 50,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(profileWithCharge));
      const event = { type: "streak_milestone" as const, streakDays: 7 };
      const result = await processSessionEvent(TEST_USER_ID, event);
      expect(result.specialAbilityCharge).toBeGreaterThan(50);
    });
  });
});
