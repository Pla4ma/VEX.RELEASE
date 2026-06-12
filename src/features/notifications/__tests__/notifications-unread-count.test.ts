/**
 * Notifications Service — getUnreadNotificationsCount Tests
 */

import * as repository from '../repository';
import { getUnreadNotificationsCount } from '../service';

jest.mock('../repository');
jest.mock('../../events', () => ({ eventBus: { publish: jest.fn() } }));

const mockedRepo = jest.mocked(repository);

describe('getUnreadNotificationsCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns unread count for valid user', async () => {
    mockedRepo.fetchUnreadNotificationsCount.mockResolvedValue(5);
    const count = await getUnreadNotificationsCount('user-123');
    expect(count).toBe(5);
    expect(mockedRepo.fetchUnreadNotificationsCount).toHaveBeenCalledWith('user-123');
  });

  it('returns 0 when no unread notifications', async () => {
    mockedRepo.fetchUnreadNotificationsCount.mockResolvedValue(0);
    const count = await getUnreadNotificationsCount('user-456');
    expect(count).toBe(0);
  });

  it('validates userId is non-empty string', async () => {
    await expect(getUnreadNotificationsCount('')).rejects.toThrow();
  });

  it('validates count is non-negative integer', async () => {
    mockedRepo.fetchUnreadNotificationsCount.mockResolvedValue(-1);
    await expect(getUnreadNotificationsCount('user-1')).rejects.toThrow();
  });

  it('validates count is an integer', async () => {
    mockedRepo.fetchUnreadNotificationsCount.mockResolvedValue(1.5);
    await expect(getUnreadNotificationsCount('user-1')).rejects.toThrow();
  });

  it('handles large counts', async () => {
    mockedRepo.fetchUnreadNotificationsCount.mockResolvedValue(999);
    const count = await getUnreadNotificationsCount('user-1');
    expect(count).toBe(999);
  });
});
