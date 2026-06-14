import { FABActionSchema, FABConfigSchema } from '../schemas';

describe('FAB schemas', () => {
  describe('FABActionSchema', () => {
    const validAction = {
      id: 'action-1',
      label: 'New Session',
      icon: 'plus',
      color: '#00ff00',
      priority: 50,
    };

    it('accepts valid action', () => {
      const result = FABActionSchema.safeParse(validAction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('action-1');
        expect(result.data.priority).toBe(50);
      }
    });

    it('applies default priority', () => {
      const { priority, ...action } = validAction;
      const result = FABActionSchema.safeParse(action);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(50);
      }
    });

    it('accepts optional color', () => {
      const { color, ...action } = validAction;
      const result = FABActionSchema.safeParse(action);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBeUndefined();
      }
    });

    it('rejects missing required fields', () => {
      expect(FABActionSchema.safeParse({}).success).toBe(false);
      expect(FABActionSchema.safeParse({ id: '1' }).success).toBe(false);
      expect(FABActionSchema.safeParse({ id: '1', label: 'Test' }).success).toBe(false);
    });

    it('rejects priority out of range', () => {
      expect(FABActionSchema.safeParse({ ...validAction, priority: -1 }).success).toBe(false);
      expect(FABActionSchema.safeParse({ ...validAction, priority: 101 }).success).toBe(false);
    });
  });

  describe('FABConfigSchema', () => {
    it('accepts valid config', () => {
      const validConfig = {
        actions: [
          { id: '1', label: 'A', icon: 'a', priority: 10 },
          { id: '2', label: 'B', icon: 'b', priority: 20 },
        ],
        visible: true,
        animateOnEnter: false,
      };
      const result = FABConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('applies default visible', () => {
      const result = FABConfigSchema.safeParse({ actions: [] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visible).toBe(true);
        expect(result.data.animateOnEnter).toBe(true);
      }
    });

    it('rejects invalid actions array', () => {
      const result = FABConfigSchema.safeParse({ actions: [{ id: '1' }] });
      expect(result.success).toBe(false);
    });
  });
});