import {
  getCompanionBonuses,
  canUseSpecialAbility,
  useSpecialAbility,
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

describe("Companion Abilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
  });

  describe("getCompanionBonuses", () => {
    it("should return XP boost for level 5+ companion", async () => {
      const level5Profile = createCompanionProfile({
        level: 5,
        xp: 2500,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(level5Profile));
      const bonuses = await getCompanionBonuses(TEST_USER_ID);
      expect(bonuses.xpBoost).toBe(0.05);
    });

    it("should return coin boost for level 10+ companion", async () => {
      const level10Profile = createCompanionProfile({
        level: 10,
        xp: 5000,
        unlockedAbilities: ["xp_boost_5pct", "coin_boost_10pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(level10Profile));
      const bonuses = await getCompanionBonuses(TEST_USER_ID);
      expect(bonuses.coinBoost).toBe(0.1);
    });
  });

  describe("canUseSpecialAbility", () => {
    it("should return true when charge is at 100", async () => {
      const chargedProfile = createCompanionProfile({
        level: 10,
        xp: 5000,
        specialAbilityCharge: 100,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(chargedProfile));
      const canUse = await canUseSpecialAbility(TEST_USER_ID);
      expect(canUse).toBe(true);
    });

    it("should return false when charge is below 100", async () => {
      const unchargedProfile = createCompanionProfile({
        level: 10,
        xp: 5000,
        specialAbilityCharge: 50,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(unchargedProfile));
      const canUse = await canUseSpecialAbility(TEST_USER_ID);
      expect(canUse).toBe(false);
    });
  });

  describe("useSpecialAbility", () => {
    it("should consume charge and return ability effect", async () => {
      const chargedProfile = createCompanionProfile({
        level: 10,
        xp: 5000,
        specialAbilityCharge: 100,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(chargedProfile));
      const result = await useSpecialAbility(TEST_USER_ID);
      expect(result.success).toBe(true);
      expect(result.effect).toBeDefined();
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should throw error when charge is insufficient", async () => {
      const unchargedProfile = createCompanionProfile({
        level: 10,
        xp: 5000,
        specialAbilityCharge: 50,
        unlockedAbilities: ["xp_boost_5pct"],
      });
      mockStorage.getItem.mockResolvedValue(JSON.stringify(unchargedProfile));
      await expect(useSpecialAbility(TEST_USER_ID)).rejects.toThrow(
        "Special ability not charged",
      );
    });
  });
});
