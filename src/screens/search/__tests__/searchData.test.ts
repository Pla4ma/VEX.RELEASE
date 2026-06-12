import { CATEGORIES, RECENT_SEARCHES } from '../searchData';

describe('searchData', () => {
  describe('CATEGORIES', () => {
    it('has 5 categories', () => {
      expect(CATEGORIES).toHaveLength(5);
    });

    it('first category is "all"', () => {
      expect(CATEGORIES[0].id).toBe('all');
      expect(CATEGORIES[0].label).toBe('All');
    });

    it('each category has id, label, and icon', () => {
      for (const cat of CATEGORIES) {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.icon).toBeDefined();
      }
    });

    it('has unique ids', () => {
      const ids = CATEGORIES.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('RECENT_SEARCHES', () => {
    it('has 4 recent searches', () => {
      expect(RECENT_SEARCHES).toHaveLength(4);
    });

    it('all searches are non-empty strings', () => {
      for (const search of RECENT_SEARCHES) {
        expect(typeof search).toBe('string');
        expect(search.length).toBeGreaterThan(0);
      }
    });
  });
});
