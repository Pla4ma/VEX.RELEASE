import * as Sentry from '@sentry/react-native';
import { createSessionRecord } from '../../session-history/repository';
import { recordCompletedSession } from '../session-history-service';
import { ledger } from './offline-sync-service.fixtures';

jest.mock('../../session-history/repository', () => ({ createSessionRecord: jest.fn() }));

it('records completed offline sessions with their original timing and focused duration', async (): Promise<void> => {
  const completion = ledger();
  await recordCompletedSession(completion);
  expect(createSessionRecord).toHaveBeenCalledWith(expect.objectContaining({
    sessionId: completion.sessionId,
    userId: completion.userId,
    status: 'completed',
    duration: completion.targetDurationSeconds,
    effectiveDuration: completion.effectiveFocusedSeconds,
    completedAt: new Date(completion.completedAt).toISOString(),
  }));
});

it('reports and propagates persistence failures so the queued completion is retained', async (): Promise<void> => {
  const error = new Error('Network unavailable');
  jest.mocked(createSessionRecord).mockRejectedValueOnce(error);
  await expect(recordCompletedSession(ledger())).rejects.toBe(error);
  expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
    tags: { feature: 'session-history-completion' },
  }));
});
