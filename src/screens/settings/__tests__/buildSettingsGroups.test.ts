import { buildSettingsGroups } from '../buildSettingsGroups';
import type { BuildSettingsGroupsParams } from '../buildSettingsGroups';

function createParams(
  overrides: Partial<BuildSettingsGroupsParams> = {},
): BuildSettingsGroupsParams {
  return {
    streakReminders: true,
    setStreakReminders: jest.fn(),
    bossAlerts: false,
    setBossAlerts: jest.fn(),
    squadNotifications: false,
    setSquadNotifications: jest.fn(),
    rivalNotifications: false,
    setRivalNotifications: jest.fn(),
    coachMessages: true,
    setCoachMessages: jest.fn(),
    achievementUnlocks: true,
    setAchievementUnlocks: jest.fn(),
    soundEffects: true,
    setSoundEffects: jest.fn(),
    haptics: true,
    setHaptics: jest.fn(),
    analyticsEnabled: true,
    setAnalyticsEnabled: jest.fn(),
    mode: 'system',
    handleThemeChange: jest.fn(),
    navigation: {
      navigate: jest.fn(),
    } as unknown as BuildSettingsGroupsParams['navigation'],
    openSupport: jest.fn(),
    openPrivacyPolicy: jest.fn(),
    openTerms: jest.fn(),
    navigateToCoach: jest.fn(),
    navigateToNotifications: jest.fn(),
    navigateToAppearance: jest.fn(),
    navigateToPrivacy: jest.fn(),
    navigateToAccount: jest.fn(),
    navigateToLaneMode: jest.fn(),
    navigateToDataExport: jest.fn(),
    ...overrides,
  };
}

describe('buildSettingsGroups', () => {
  it('should return all expected setting groups', () => {
    const groups = buildSettingsGroups(createParams());
    const titles = groups.map((g) => g.title);
    expect(titles).toEqual([
      'Profile',
      'Coach',
      'Notifications',
      'Appearance',
      'Privacy',
      'Data',
      'About',
    ]);
  });

  it('should include Data group with export item', () => {
    const groups = buildSettingsGroups(createParams());
    const dataGroup = groups.find((g) => g.title === 'Data');
    expect(dataGroup).toBeDefined();
    expect(dataGroup!.items).toHaveLength(1);
    expect(dataGroup!.items[0].id).toBe('data-export');
    expect(dataGroup!.items[0].title).toBe('Export My Data');
    expect(dataGroup!.items[0].type).toBe('link');
  });

  it('should call navigateToDataExport when export item is pressed', () => {
    const navigateToDataExport = jest.fn();
    const groups = buildSettingsGroups(createParams({ navigateToDataExport }));
    const dataGroup = groups.find((g) => g.title === 'Data');
    const exportItem = dataGroup!.items[0];
    exportItem.onPress?.();
    expect(navigateToDataExport).toHaveBeenCalledTimes(1);
  });

  it('should include Data group between Privacy and About', () => {
    const groups = buildSettingsGroups(createParams());
    const titles = groups.map((g) => g.title);
    const privacyIndex = titles.indexOf('Privacy');
    const dataIndex = titles.indexOf('Data');
    const aboutIndex = titles.indexOf('About');
    expect(dataIndex).toBe(privacyIndex + 1);
    expect(aboutIndex).toBe(dataIndex + 1);
  });
});
