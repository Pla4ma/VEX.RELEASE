import { act, renderHook } from '@testing-library/react-native';
import { useSquadShare } from '../hooks/useSquadShare';

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn(),
}));

import { useAuthStore } from '@/store';

describe('useSquadShare hook', () => {
  const mockSquad = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Focus Squad',
    focusHours: 12,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockImplementation((selector) =>
      selector({ user: { id: 'user-123' } })
    );
  });

  it('returns squad code when squad and user exist', () => {
    const { result } = renderHook(() => useSquadShare(mockSquad));
    expect(result.current.squadCode).toBe('123e4567');
  });

  it('returns null squad code when squad is null', () => {
    const { result } = renderHook(() => useSquadShare(null));
    expect(result.current.squadCode).toBeNull();
  });

  it('generates share URL correctly', () => {
    const { result } = renderHook(() => useSquadShare(mockSquad));
    const url = result.current.generateShareUrl();
    expect(url).toBe('https://vex.app/squad/123e4567');
  });

  it('returns null share URL when no user', () => {
    (useAuthStore as jest.Mock).mockImplementation((selector) =>
      selector({ user: null })
    );
    const { result } = renderHook(() => useSquadShare(mockSquad));
    expect(result.current.generateShareUrl()).toBeNull();
  });

  it('generates share message correctly', () => {
    const { result } = renderHook(() => useSquadShare(mockSquad));
    const message = result.current.generateShareMessage();
    expect(message).toContain('Focus Squad');
    expect(message).toContain('12h');
    expect(message).toContain('https://vex.app/squad/123e4567');
  });

  it('parses invite URL correctly', () => {
    const { result } = renderHook(() => useSquadShare(mockSquad));
    const code = result.current.parseInviteUrl('https://vex.app/squad/abc12345');
    expect(code).toBe('abc12345');
  });

  it('handles missing user in message generation', () => {
    (useAuthStore as jest.Mock).mockImplementation((selector) =>
      selector({ user: null })
    );
    const { result } = renderHook(() => useSquadShare(mockSquad));
    expect(result.current.generateShareMessage()).toBeNull();
  });
});