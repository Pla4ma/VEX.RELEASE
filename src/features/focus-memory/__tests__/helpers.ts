import {
  acceptMemory,
  buildColdStartEvidence,
  buildMemoryEvidence,
  canClaimStrongPattern,
  createMemoryCandidate,
  deleteMemory,
  filterImportMemories,
  findMemoriesForRecommendation,
  generateRecommendationEvidence,
  hasEvidenceConflict,
  listActiveMemories,
  listDeletedMemoryHashes,
  scopeMessageForSource,
  hashEvidence,
  isImportSourceMemory,
} from '../service';
import { contentScopeForSource } from '../expiry';

export const mockStore = new Map<string, string>();

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

jest.mock('../../../utils/uuid', () => {
  let counter = 0;
  return { v4: () => `memory-id-${counter++}` };
});

export const currentTime = 1_780_000_000_000;

export {
  acceptMemory,
  buildColdStartEvidence,
  buildMemoryEvidence,
  canClaimStrongPattern,
  createMemoryCandidate,
  deleteMemory,
  filterImportMemories,
  findMemoriesForRecommendation,
  generateRecommendationEvidence,
  hasEvidenceConflict,
  listActiveMemories,
  listDeletedMemoryHashes,
  scopeMessageForSource,
  contentScopeForSource,
  hashEvidence,
  isImportSourceMemory,
};
