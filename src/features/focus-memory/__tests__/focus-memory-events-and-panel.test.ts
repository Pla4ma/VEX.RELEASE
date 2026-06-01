/**
 * Tests for focus-memory events.ts and memory-panel-types.ts
 */
import { mockStore, currentTime } from './helpers';
import { FocusMemoryEventSchema } from '../events';
import {
  MemoryPanelItemSchema,
  WHAT_VEX_LEARNED_MIN_SESSIONS,
} from '../memory-panel-types';

describe('focus-memory events and panel types tests', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('FocusMemoryEventSchema', () => {
    it('validates a memory_candidate_created event', () => {
      const event = FocusMemoryEventSchema.parse({
        type: 'memory_candidate_created',
        memory: {
          id: 'mem-1',
          userId: 'user-1',
          type: 'best_time_window',
          summary: 'Morning focus',
          source: 'behavior',
          confidence: 0.8,
          accepted: false,
          deletedAt: null,
          expiresAt: currentTime + 30 * 86400000,
          evidenceHash: null,
          createdAt: currentTime,
          updatedAt: currentTime,
        },
      });
      expect(event.type).toBe('memory_candidate_created');
    });

    it('rejects unknown event types', () => {
      expect(() =>
        FocusMemoryEventSchema.parse({
          type: 'unknown_event',
          memory: {
            id: 'mem-1',
            userId: 'user-1',
            type: 'best_time_window',
            summary: 'Morning focus',
            source: 'behavior',
            confidence: 0.8,
            accepted: false,
            deletedAt: null,
            expiresAt: null,
            evidenceHash: null,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        }),
      ).toThrow();
    });
  });

  describe('MemoryPanelItemSchema', () => {
    it('validates a valid panel item', () => {
      const item = MemoryPanelItemSchema.parse({
        id: 'panel-1',
        observation: 'You focus better in the morning.',
        evidence: 'session_completion',
        confidence: 0.85,
        source: 'session_completion',
        type: 'best_time_window',
        isHidden: false,
        createdAt: currentTime,
      });
      expect(item.id).toBe('panel-1');
      expect(item.isHidden).toBe(false);
    });

    it('rejects panel item with empty observation', () => {
      expect(() =>
        MemoryPanelItemSchema.parse({
          id: 'panel-1',
          observation: '',
          evidence: 'session_completion',
          confidence: 0.85,
          source: 'session_completion',
          type: 'best_time_window',
          isHidden: false,
          createdAt: currentTime,
        }),
      ).toThrow();
    });
  });

  describe('WHAT_VEX_LEARNED_MIN_SESSIONS', () => {
    it('equals 3', () => {
      expect(WHAT_VEX_LEARNED_MIN_SESSIONS).toBe(3);
    });
  });
});
