import {
  getRarityColor,
  getRarityLabel,
  getRarityTier,
  compareRarity,
  sortByRarityDesc,
  sortByRarityAsc,
  type ItemRarity,
} from '../rarity';

describe('rarity', () => {
  const allRarities: ItemRarity[] = [
    'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC',
  ];

  describe('getRarityColor', () => {
    it('returns a color string for each rarity', () => {
      for (const rarity of allRarities) {
        const color = getRarityColor(rarity);
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      }
    });

    it('returns COMMON color for unknown rarity', () => {
      const color = getRarityColor('UNKNOWN' as ItemRarity);
      expect(color).toBe(getRarityColor('COMMON'));
    });
  });

  describe('getRarityLabel', () => {
    it('returns human-readable labels', () => {
      expect(getRarityLabel('COMMON')).toBe('Common');
      expect(getRarityLabel('UNCOMMON')).toBe('Uncommon');
      expect(getRarityLabel('RARE')).toBe('Rare');
      expect(getRarityLabel('EPIC')).toBe('Epic');
      expect(getRarityLabel('LEGENDARY')).toBe('Legendary');
      expect(getRarityLabel('MYTHIC')).toBe('Mythic');
    });

    it('returns raw value for unknown rarity', () => {
      expect(getRarityLabel('UNKNOWN' as ItemRarity)).toBe('UNKNOWN');
    });
  });

  describe('getRarityTier', () => {
    it('returns ascending tier numbers', () => {
      expect(getRarityTier('COMMON')).toBe(1);
      expect(getRarityTier('UNCOMMON')).toBe(2);
      expect(getRarityTier('RARE')).toBe(3);
      expect(getRarityTier('EPIC')).toBe(4);
      expect(getRarityTier('LEGENDARY')).toBe(5);
      expect(getRarityTier('MYTHIC')).toBe(6);
    });

    it('returns 0 for unknown rarity', () => {
      expect(getRarityTier('UNKNOWN' as ItemRarity)).toBe(0);
    });
  });

  describe('compareRarity', () => {
    it('returns negative when a < b', () => {
      expect(compareRarity('COMMON', 'RARE')).toBeLessThan(0);
    });

    it('returns positive when a > b', () => {
      expect(compareRarity('LEGENDARY', 'UNCOMMON')).toBeGreaterThan(0);
    });

    it('returns 0 for equal rarities', () => {
      expect(compareRarity('EPIC', 'EPIC')).toBe(0);
    });
  });

  describe('sortByRarityDesc', () => {
    it('sorts items highest rarity first', () => {
      const items = [
        { id: 1, rarity: 'COMMON' as ItemRarity },
        { id: 2, rarity: 'LEGENDARY' as ItemRarity },
        { id: 3, rarity: 'RARE' as ItemRarity },
      ];
      const sorted = sortByRarityDesc(items);
      expect(sorted[0].rarity).toBe('LEGENDARY');
      expect(sorted[1].rarity).toBe('RARE');
      expect(sorted[2].rarity).toBe('COMMON');
    });

    it('does not mutate original array', () => {
      const items = [
        { id: 1, rarity: 'COMMON' as ItemRarity },
        { id: 2, rarity: 'RARE' as ItemRarity },
      ];
      sortByRarityDesc(items);
      expect(items[0].rarity).toBe('COMMON');
    });
  });

  describe('sortByRarityAsc', () => {
    it('sorts items lowest rarity first', () => {
      const items = [
        { id: 1, rarity: 'LEGENDARY' as ItemRarity },
        { id: 2, rarity: 'COMMON' as ItemRarity },
        { id: 3, rarity: 'RARE' as ItemRarity },
      ];
      const sorted = sortByRarityAsc(items);
      expect(sorted[0].rarity).toBe('COMMON');
      expect(sorted[1].rarity).toBe('RARE');
      expect(sorted[2].rarity).toBe('LEGENDARY');
    });
  });
});
