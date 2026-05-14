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
];

const storageModes: ReadonlyArray<DataCategory['storage']> = [
  'none',
  'device',
  'server',
  'both',
];

describe('PrivacyInventory', () => {
  it('returns the launch privacy categories', () => {
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

  it('reports email as the only current PII field', () => {
    expect(getPiiFields()).toEqual(['Email address']);
  });

  it('declares no tracking fields for launch', () => {
    expect(getTrackingFields()).toEqual([]);
    expect(PRIVACY_INVENTORY.every((item) => item.usedForTracking === false)).toBe(true);
  });
});
