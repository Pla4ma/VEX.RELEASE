import { useStaggeredAnimation } from '../useAnimation';

describe('useAnimation', () => {
  describe('useStaggeredAnimation', () => {
    it('returns array of indices', () => {
      const result = useStaggeredAnimation(5);
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns empty array for 0 items', () => {
      const result = useStaggeredAnimation(0);
      expect(result).toEqual([]);
    });

    it('returns single element for 1 item', () => {
      const result = useStaggeredAnimation(1);
      expect(result).toEqual([0]);
    });

    it('returns correct length', () => {
      for (let i = 0; i < 10; i++) {
        expect(useStaggeredAnimation(i)).toHaveLength(i);
      }
    });
  });
});
