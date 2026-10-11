import { updateFocusScoreFromSessionCompletion } from '../update-focus-score.helper';
import { recordSessionFocusScore } from '../session-score-repository';
import { fetchCurrentFocusScore, upsertCurrentFocusScore, appendFocusScoreHistory } from '../repository-focus-score';
import { eventBus } from '../../../events/EventBus';

jest.mock('../session-score-repository', () => ({ recordSessionFocusScore: jest.fn() }));
jest.mock('../repository-focus-score', () => ({ fetchCurrentFocusScore: jest.fn(),
  upsertCurrentFocusScore: jest.fn(), appendFocusScoreHistory: jest.fn() }));
jest.mock('../../focus-contract/service', () => ({ getCompletionSignal: jest.fn(async () => ({ rate: 0, completedContractCount: 0 })) }));
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));
const userId = '550e8400-e29b-41d4-a716-446655440099';
const sessionId = '550e8400-e29b-41d4-a716-446655440000';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(fetchCurrentFocusScore).mockResolvedValue(null);
  jest.mocked(recordSessionFocusScore).mockResolvedValue({ conflict: false, duplicate: false });
});

it('writes score and history through one atomic operation for a completed session', async (): Promise<void> => {
  await updateFocusScoreFromSessionCompletion(userId, { sessionId, grade: 'A', quality: 90 });
  expect(recordSessionFocusScore).toHaveBeenCalledWith(expect.objectContaining({ userId, sessionId }));
  expect(upsertCurrentFocusScore).not.toHaveBeenCalled();
  expect(appendFocusScoreHistory).not.toHaveBeenCalled();
});

it('does not repeat completion events after a committed write response was lost', async (): Promise<void> => {
  jest.mocked(recordSessionFocusScore).mockResolvedValue({ conflict: false, duplicate: true });
  await updateFocusScoreFromSessionCompletion(userId, { sessionId, grade: 'A' });
  expect(eventBus.publish).not.toHaveBeenCalled();
});

it('recalculates after a concurrent session changes the score', async (): Promise<void> => {
  jest.mocked(recordSessionFocusScore).mockResolvedValueOnce({ conflict: true, duplicate: false });
  await updateFocusScoreFromSessionCompletion(userId, { sessionId, grade: 'A' });
  expect(fetchCurrentFocusScore).toHaveBeenCalledTimes(2);
  expect(eventBus.publish).toHaveBeenCalledTimes(1);
});

it('keeps persistent conflicts visible for retry', async (): Promise<void> => {
  jest.mocked(recordSessionFocusScore).mockResolvedValue({ conflict: true, duplicate: false });
  await expect(updateFocusScoreFromSessionCompletion(userId, { sessionId, grade: 'A' })).rejects.toThrow('Retry this session');
  expect(recordSessionFocusScore).toHaveBeenCalledTimes(3);
});
