import {
  getDataCategories,
  getPiiFields,
  getTrackingFields,
  PRIVACY_INVENTORY,
  type DataCategory,
} from '../PrivacyInventory';

const expectedCategories = [
  'Identifiers',
  'Usage Data',
  'Diagnostics',
  'Purchases',
  'Contact Info',
  'User Content',
  'Notification Tokens',
];

const storageModes: ReadonlyArray<DataCategory['storage']> = [
  'none',
  'device',
  'server',
  'both',
];

describe('PrivacyInventory', () => {
  it('returns the launch privacy categories including notifications and coach memory', () => {
    expect(getDataCategories().map((item) => item.category)).toEqual(expectedCategories);
  });

  it('keeps each category App Store privacy metadata complete', () => {
    getDataCategories().forEach((item) => {
      expect(item.dataTypes.length).toBeGreaterThan(0);
      expect(item.purpose.length).toBeGreaterThan(0);
      expect(typeof item.linkedToUser).toBe('boolean');
      expect(typeof item.usedForTracking).toBe('boolean');
      expect(storageModes).toContain(item.storage);
    });
  });

  it('reports email and push notification token as PII fields', () => {
    expect(getPiiFields()).toEqual(['Email address', 'Push notification token']);
  });

  it('declares no tracking fields for launch', () => {
    expect(getTrackingFields()).toEqual([]);
    expect(PRIVACY_INVENTORY.every((item) => item.usedForTracking === false)).toBe(true);
  });

  it('includes coach conversation history in User Content', () => {
    const userContent = PRIVACY_INVENTORY.find((item) => item.category === 'User Content');
    expect(userContent).toBeDefined();
    expect(userContent!.dataTypes).toContain('Coach conversation history');
    expect(userContent!.dataTypes).toContain('Memory entries');
  });

  it('includes lane recommendation in Usage Data', () => {
    const usageData = PRIVACY_INVENTORY.find((item) => item.category === 'Usage Data');
    expect(usageData).toBeDefined();
    expect(usageData!.dataTypes).toContain('Lane recommendation');
  });

  it('includes Notification Tokens category', () => {
    const notifTokens = PRIVACY_INVENTORY.find((item) => item.category === 'Notification Tokens');
    expect(notifTokens).toBeDefined();
    expect(notifTokens!.dataTypes).toContain('Push notification token');
    expect(notifTokens!.linkedToUser).toBe(true);
    expect(notifTokens!.usedForTracking).toBe(false);
  });
});
