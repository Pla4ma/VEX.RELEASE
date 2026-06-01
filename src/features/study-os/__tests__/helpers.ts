import {
  buildDayZeroStudyPreview,
  buildFailedGenerationFallbackPlan,
  buildStudyOsHomeSurface,
  buildStudySessionFromBlock,
  completeStudyBlock,
  completeStudyBlockEnhanced,
  computeStudyOsPremiumGate,
  computeStudyOsUnlockGate,
  createPasteStudyPlan,
  generateRecallQuestion,
  getEmptyRecallFallback,
  getManualStudyFallbackMessage,
  getPlannedBlocksFromPlan,
  isContentStudyBackendAvailable,
  shouldGenerateRecall,
} from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

export {
  mockStore,
  buildDayZeroStudyPreview,
  buildFailedGenerationFallbackPlan,
  buildStudyOsHomeSurface,
  buildStudySessionFromBlock,
  completeStudyBlock,
  completeStudyBlockEnhanced,
  computeStudyOsPremiumGate,
  computeStudyOsUnlockGate,
  createPasteStudyPlan,
  generateRecallQuestion,
  getEmptyRecallFallback,
  getManualStudyFallbackMessage,
  getPlannedBlocksFromPlan,
  isContentStudyBackendAvailable,
  shouldGenerateRecall,
};
