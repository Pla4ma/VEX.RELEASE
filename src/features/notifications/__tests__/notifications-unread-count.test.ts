import * as repository from '../repository';
import { getUnreadNotificationsCount } from '../service';

jest.mock('../repository');
jest.mock('../../events', () => ({ eventBus: { publish: jest.fn() } }));

describe('getUnreadNotificationsCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns unread count for valid user', async () => {
    jest.mocked(repository.fetchUnreadNotificationsCount).mockResolvedValue(5);
    const count = await getUnreadNotificationsCount('user-123');
    expect(count).toBe(5);
    expect(repository.fetchUnreadNotificationsCount).toHaveBeenCalledWith('user-123');
  });

  it('returns 0 when no unread', async () => {
    jest.mocked(repository.fetchUnreadNotificationsCount).mockResolvedValue(0);
    expect(await getUnreadNotificationsCount('user-456')).toBe(0);
  });

  it('rejects empty userId', async () => {
    await expect(getUnreadNotificationsCount('')).rejects.toThrow();
  });

  it('rejects negative count', async () => {
    jest.mocked(repository.fetchUnreadNotificationsCount).mockResolvedValue(-1);
    await expect(getUnreadNotificationsCount('user-1')).rejects.toThrow();
  });

  it('rejects non-integer count', async () => {
    jest.mocked(repository.fetchUnreadNotificationsCount).mockResolvedValue(1.5);
    await expect(getUnreadNotificationsCount('user-1')).rejects.toThrow();
  });

  it('handles large counts', async () => {
    jest.mocked(repository.fetchUnreadNotificationsCount).mockResolvedValue(999);
    expect(await getUnreadNotificationsCount('user-1')).toBe(999);
  });
});
