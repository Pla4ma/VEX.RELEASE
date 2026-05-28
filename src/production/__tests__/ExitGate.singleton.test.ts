import { Phase9ExitGate, phase9ExitGate } from "../ExitGate";

describe("Phase9ExitGate", () => {
  let exitGate: Phase9ExitGate;

  beforeEach(() => {
    exitGate = Phase9ExitGate.getInstance();
    jest.clearAllMocks();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = Phase9ExitGate.getInstance();
      const instance2 = Phase9ExitGate.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should export singleton instance", () => {
      expect(phase9ExitGate).toBeInstanceOf(Phase9ExitGate);
    });
  });

  describe("Configuration Management", () => {
    it("should have default configuration", () => {
      const config = exitGate.getConfig();
      expect(config.minimumScores.offlineSync).toBe(85);
      expect(config.minimumScores.errorBoundaries).toBe(90);
      expect(config.minimumScores.accessibility).toBe(85);
      expect(config.minimumScores.performance).toBe(80);
      expect(config.minimumScores.privacy).toBe(95);
      expect(config.minimumScores.paywall).toBe(85);
      expect(config.minimumScores.appStore).toBe(90);
      expect(config.overallMinimumScore).toBe(85);
      expect(config.allowWarnings).toBe(false);
      expect(config.requiredCategories).toHaveLength(7);
    });

    it("should allow configuration updates", () => {
      exitGate.setConfig({ overallMinimumScore: 90, allowWarnings: true });
      const config = exitGate.getConfig();
      expect(config.overallMinimumScore).toBe(90);
      expect(config.allowWarnings).toBe(true);
    });
  });
});
