import type { OfflineQueueEntry } from '../../../lib/offline/queue';
import {
  createStreakRecordProcessor,
  createXpAddProcessor,
} from '../offline-sync-processors';
import { getProgressionService } from '../../../progression/ProgressionService';
import { getStreakService } from '../../../streaks/StreakService';

const mockAddXP = jest.fn<Promise<void>, [number, string, {
  metadata?: Record<string, unknown>;
  sessionId?: string;
  idempotencyKey?: string;
}]>();
const mockRecordSession = jest.fn<Promise<unknown>, [{
  sessionId?: string;
  completedAt?: number;
  duration?: number;
  qualityScore?: number;
  idempotencyKey?: string;
}]>();

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

function queueEntry(
  operation: OfflineQueueEntry['operation'],
  feature: OfflineQueueEntry['feature'],
  payload: Record<string, unknown>,
): OfflineQueueEntry {
  return {
    id: '550e8400-e29b-41d4-a716-446655440099',
    operation,
    feature,
    payload,
    idempotencyKey: `${operation}:550e8400-e29b-41d4-a716-446655440000`,
    createdAt: 1700001800000,
    retryCount: 0,
    maxRetries: 3,
    priority: 'high',
  };
}

describe('session completion offline processors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddXP.mockResolvedValue(undefined);
    mockRecordSession.mockResolvedValue({});
  });

  it('XP_ADD calls addXP with correct args', async () => {
    const entry = queueEntry('XP_ADD', 'progression', {
      userId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 120,
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    await createXpAddProcessor()(entry);

    expect(getProgressionService).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440001',
    );
    expect(mockAddXP).toHaveBeenCalledWith(120, 'SESSION_COMPLETE', {
      metadata: undefined,
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      idempotencyKey: entry.idempotencyKey,
    });
  });

  it('STREAK_RECORD calls recordSession', async () => {
    const entry = queueEntry('STREAK_RECORD', 'streaks', {
      userId: '550e8400-e29b-41d4-a716-446655440001',
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      completedAt: 1700001800000,
    });

    await createStreakRecordProcessor()(entry);

    expect(getStreakService).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440001',
    );
    expect(mockRecordSession).toHaveBeenCalledWith({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      completedAt: 1700001800000,
      duration: undefined,
      qualityScore: undefined,
      idempotencyKey: entry.idempotencyKey,
    });
  });
});
