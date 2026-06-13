import {
  MIN_TOUCH_TARGET,
  calculateHitSlop,
  getSquareHitSlop,
  getIconHitSlop,
  getTouchTargetProps,
  getMinTouchTargetStyle,
  auditTouchTarget,
  StandardHitSlops,
} from '../touchTarget';

describe('MIN_TOUCH_TARGET', () => {
  it('equals 44', () => {
    expect(MIN_TOUCH_TARGET).toBe(44);
  });
});

describe('calculateHitSlop', () => {
  it('returns zero hitSlop for elements already at minimum size', () => {
    const result = calculateHitSlop(44, 44);
    expect(result.hitSlop).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    expect(result.needsExpansion).toBe(false);
    expect(result.totalSize).toEqual({ width: 44, height: 44 });
  });

  it('returns zero hitSlop for elements larger than minimum', () => {
    const result = calculateHitSlop(100, 80);
    expect(result.hitSlop).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    expect(result.needsExpansion).toBe(false);
  });

  it('calculates horizontal hitSlop for narrow elements', () => {
    const result = calculateHitSlop(24, 44);
    expect(result.needsExpansion).toBe(true);
    expect(result.hitSlop.left).toBe(10); // (44 - 24) / 2
    expect(result.hitSlop.right).toBe(10);
    expect(result.hitSlop.top).toBe(0);
    expect(result.hitSlop.bottom).toBe(0);
  });

  it('calculates vertical hitSlop for short elements', () => {
    const result = calculateHitSlop(44, 24);
    expect(result.needsExpansion).toBe(true);
    expect(result.hitSlop.top).toBe(10); // (44 - 24) / 2
    expect(result.hitSlop.bottom).toBe(10);
    expect(result.hitSlop.left).toBe(0);
    expect(result.hitSlop.right).toBe(0);
  });

  it('calculates both dimensions for small elements', () => {
    const result = calculateHitSlop(20, 30);
    expect(result.hitSlop.left).toBe(12); // (44 - 20) / 2
    expect(result.hitSlop.right).toBe(12);
    expect(result.hitSlop.top).toBe(7); // (44 - 30) / 2
    expect(result.hitSlop.bottom).toBe(7);
  });

  it('reports totalSize as max of actual and minimum', () => {
    const result = calculateHitSlop(20, 30);
    expect(result.totalSize).toEqual({ width: 44, height: 44 });
  });

  it('respects custom minSize', () => {
    const result = calculateHitSlop(30, 30, { minSize: 48 });
    expect(result.hitSlop.left).toBe(9); // (48 - 30) / 2
    expect(result.hitSlop.top).toBe(9);
  });

  it('handles odd differences (fractional slop)', () => {
    const result = calculateHitSlop(43, 43);
    expect(result.hitSlop.left).toBe(0.5); // (44 - 43) / 2
    expect(result.hitSlop.top).toBe(0.5);
  });
});

describe('getSquareHitSlop', () => {
  it('returns zero for elements at or above minimum', () => {
    expect(getSquareHitSlop(44)).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    expect(getSquareHitSlop(100)).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
  });

  it('calculates equal slop for small squares', () => {
    const result = getSquareHitSlop(24);
    expect(result).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('respects custom minSize', () => {
    const result = getSquareHitSlop(30, 48);
    expect(result.top).toBe(9); // (48 - 30) / 2
  });
});

describe('getIconHitSlop', () => {
  it('uses default icon size of 24', () => {
    const result = getIconHitSlop();
    expect(result).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('calculates for custom icon size', () => {
    const result = getIconHitSlop(16);
    expect(result.top).toBe(14); // (44 - 16) / 2
  });
});

describe('getTouchTargetProps', () => {
  it('returns hitSlop and button accessibility role for small elements', () => {
    const result = getTouchTargetProps({ width: 24, height: 24 });
    expect(result.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
    expect(result.accessibilityRole).toBe('button');
  });

  it('returns zero hitSlop for large elements', () => {
    const result = getTouchTargetProps({ width: 44, height: 44 });
    expect(result.hitSlop).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    expect(result.accessibilityRole).toBe('button');
  });

  it('combines hitSlop with additionalHitSlop', () => {
    const result = getTouchTargetProps({
      width: 24,
      height: 24,
      additionalHitSlop: { top: 5, bottom: 5, left: 5, right: 5 },
    });
    expect(result.hitSlop).toEqual({ top: 15, bottom: 15, left: 15, right: 15 });
  });
});

describe('getMinTouchTargetStyle', () => {
  it('returns minWidth and minHeight at MIN_TOUCH_TARGET', () => {
    const result = getMinTouchTargetStyle();
    expect(result).toEqual({ minWidth: 44, minHeight: 44 });
  });

  it('accepts custom width and height', () => {
    const result = getMinTouchTargetStyle(48, 48);
    expect(result).toEqual({ minWidth: 48, minHeight: 48 });
  });
});

describe('auditTouchTarget', () => {
  it('returns true for elements at minimum size', () => {
    expect(auditTouchTarget('Button', 44, 44)).toBe(true);
  });

  it('returns true for elements above minimum size', () => {
    expect(auditTouchTarget('Button', 100, 100)).toBe(true);
  });

  it('returns false for elements below minimum width', () => {
    expect(auditTouchTarget('SmallButton', 20, 44)).toBe(false);
  });

  it('returns false for elements below minimum height', () => {
    expect(auditTouchTarget('FlatButton', 44, 20)).toBe(false);
  });

  it('returns false for elements below both dimensions', () => {
    expect(auditTouchTarget('TinyButton', 10, 10)).toBe(false);
  });
});

describe('StandardHitSlops', () => {
  it('defines ICON hitSlop', () => {
    expect(StandardHitSlops.ICON).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });

  it('defines SMALL_ICON hitSlop', () => {
    expect(StandardHitSlops.SMALL_ICON).toEqual({ top: 6, bottom: 6, left: 6, right: 6 });
  });

  it('defines TEXT_BUTTON hitSlop', () => {
    expect(StandardHitSlops.TEXT_BUTTON).toEqual({ top: 8, bottom: 8, left: 12, right: 12 });
  });

  it('defines LINK hitSlop', () => {
    expect(StandardHitSlops.LINK).toEqual({ top: 12, bottom: 12, left: 8, right: 8 });
  });
});
