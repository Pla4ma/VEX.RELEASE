import { eventBus } from '../../../events';
import * as repository from '../repository';
import {
  createContract,
  getCompletionRate,
  getContractReminderStage,
  reflectOnContract,
  skipContract,
  getReflectionCopy,
} from '../service';

jest.mock('../repository');
jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));

const userId = '123e4567-e89b-12d3-a456-426614174000';
const sessionId = '123e4567-e89b-12d3-a456-426614174111';
const contractId = '123e4567-e89b-12d3-a456-426614174222';
const now = '2026-05-14T12:00:00.000Z';

const contract = {
  id: contractId,
  sessionId,
  userId,
  taskDescription: 'Draft the report intro',
  completionStatus: null,
  reflectionAt: null,
  createdAt: now,
};

describe('focus-contract service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a contract with a valid task and emits created', async () => {
    jest.mocked(repository.createContract).mockResolvedValue(contract);

    const result = await createContract({ sessionId, taskDescription: ' Draft the report intro ' }, userId);

    expect(result.taskDescription).toBe('Draft the report intro');
    expect(repository.createContract).toHaveBeenCalledWith({
      sessionId,
      userId,
      taskDescription: 'Draft the report intro',
    });
    expect(eventBus.publish).toHaveBeenCalledWith('focus-contract:created', { contractId, sessionId, userId });
  });

  it('rejects empty or oversized contract tasks', async () => {
    await expect(createContract({ sessionId, taskDescription: '' }, userId)).rejects.toThrow();
    await expect(createContract({ sessionId, taskDescription: 'x'.repeat(81) }, userId)).rejects.toThrow();
    expect(repository.createContract).not.toHaveBeenCalled();
  });

  it.each(['done', 'partial', 'not_done'] as const)('reflects %s and emits reflected', async (status) => {
    jest.mocked(repository.reflectOnContract).mockResolvedValue(undefined);

    await reflectOnContract(contractId, status, userId);

    expect(repository.reflectOnContract).toHaveBeenCalledWith(contractId, status);
    expect(eventBus.publish).toHaveBeenCalledWith('focus-contract:reflected', {
      contractId,
      completionStatus: status,
      userId,
    });
  });

  it('emits companion milestone only for done reflection', async () => {
    jest.mocked(repository.reflectOnContract).mockResolvedValue(undefined);

    await reflectOnContract(contractId, 'done', userId);
    await reflectOnContract(contractId, 'partial', userId);

    expect(eventBus.publish).toHaveBeenCalledWith('companion:milestone', {
      userId,
      milestoneType: 'focus_contract_done',
      sourceId: contractId,
    });
    expect(getReflectionCopy('not_done')).toBe('That happens. Next session, try again.');
  });

  it('skips without writing to the repository', async () => {
    await skipContract(sessionId, userId);

    expect(repository.createContract).not.toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith('focus-contract:skipped', { sessionId, userId });
  });

  it('returns completion rate with neutral floor for no contracts', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([]);
    jest.mocked(repository.getContractCompletionRate).mockResolvedValue(0);

    await expect(getCompletionRate(userId, 14)).resolves.toBe(0.5);
  });

  it('returns repository completion rate when contract history exists', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([{ ...contract, completionStatus: 'done' }]);
    jest.mocked(repository.getContractCompletionRate).mockResolvedValue(1);

    await expect(getCompletionRate(userId, 14)).resolves.toBe(1);
  });

  it('shows contract reminders only in early and late progress windows', () => {
    expect(getContractReminderStage(null, 10)).toBeNull();
    expect(getContractReminderStage(contract, 5)).toBeNull();
    expect(getContractReminderStage(contract, 10)).toBe('early');
    expect(getContractReminderStage(contract, 50)).toBeNull();
    expect(getContractReminderStage(contract, 90)).toBe('late');
    expect(getContractReminderStage(contract, 100)).toBe('late');
  });
});
