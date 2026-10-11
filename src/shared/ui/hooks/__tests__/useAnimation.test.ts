import { useStaggeredAnimation as getStaggeredAnimation } from '../useAnimation';

describe('useAnimation', () => {
  describe('useStaggeredAnimation', () => {
    it('returns array of indices', () => {
      const result = getStaggeredAnimation(5);
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns empty array for 0 items', () => {
      const result = getStaggeredAnimation(0);
      expect(result).toEqual([]);
    });

    it('returns single element for 1 item', () => {
      const result = getStaggeredAnimation(1);
      expect(result).toEqual([0]);
    });

    it('returns correct length', () => {
      for (let i = 0; i < 10; i++) {
        expect(getStaggeredAnimation(i)).toHaveLength(i);
      }
    });
  });
});
