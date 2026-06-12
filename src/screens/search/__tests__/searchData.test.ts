import { CATEGORIES, RECENT_SEARCHES, MOCK_RESULTS } from '../searchData';

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

  describe('MOCK_RESULTS', () => {
    it('has 4 mock results', () => {
      expect(MOCK_RESULTS).toHaveLength(4);
    });

    it('each result has required fields', () => {
      for (const result of MOCK_RESULTS) {
        expect(result.id).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
        expect(result.icon).toBeDefined();
      }
    });

    it('has unique ids', () => {
      const ids = MOCK_RESULTS.map(r => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('has expected types', () => {
      const types = MOCK_RESULTS.map(r => r.type);
      expect(types).toContain('session');
      expect(types).toContain('challenge');
      expect(types).toContain('user');
      expect(types).toContain('content');
    });
  });
});
