import {
  navigateToMainStackScreen,
  navigateToMainTab,
} from '../navigation-helpers';

describe('navigation helpers', () => {
  it('routes feature screens through the root navigator from a tab child', () => {
    const childNavigate = jest.fn();
    const rootNavigate = jest.fn();
    const navigation = {
      navigate: childNavigate,
      getParent: () => ({ navigate: rootNavigate }),
    };

    navigateToMainStackScreen(navigation, 'ContentStudy');

    expect(childNavigate).not.toHaveBeenCalled();
    expect(rootNavigate).toHaveBeenCalledWith('ContentStudy');
  });

  it('routes tab changes through the root navigator from a nested screen', () => {
    const childNavigate = jest.fn();
    const rootNavigate = jest.fn();
    const navigation = {
      navigate: childNavigate,
      getParent: () => ({ navigate: rootNavigate }),
    };

    navigateToMainTab(navigation, 'Progress');

    expect(childNavigate).not.toHaveBeenCalled();
    expect(rootNavigate).toHaveBeenCalledWith('Main', {
      params: undefined,
      screen: 'Progress',
    });
  });
});
