import { executeCoachAction } from '../components/coach-action-navigation';

type Navigation = {
  navigate: jest.Mock;
};

const createNavigation = (): Navigation => ({ navigate: jest.fn() });

describe('coach action navigation', () => {
  it('starts a focused session with a bounded duration', () => {
    const navigation = createNavigation();

    expect(
      executeCoachAction(navigation, {
        type: 'START_SESSION',
        duration: 30,
      }),
    ).toBe(true);
    expect(navigation.navigate).toHaveBeenCalledWith({
      name: 'SessionStack',
      params: {
        params: {
          presetDuration: 1800,
          source: 'rescue',
        },
        screen: 'SessionSetup',
      },
    });
  });

  it('opens progress for review actions', () => {
    const navigation = createNavigation();

    expect(executeCoachAction(navigation, { type: 'REVIEW_PROGRESS' })).toBe(true);
    expect(navigation.navigate).toHaveBeenCalledWith({
      name: 'Main',
      params: { screen: 'Progress' },
    });
  });

  it('rejects malformed or unsupported payloads without navigation', () => {
    const navigation = createNavigation();

    expect(executeCoachAction(navigation, { type: 'not-real' })).toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
