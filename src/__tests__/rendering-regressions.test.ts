import { getIcon } from '../icons/IconRegistry';
import { darkColors } from '../theme/tokens/dark-palette';
import { lightColors } from '../theme/tokens/primary-palette';

describe('rendering regressions', () => {
  it('registers every icon used by error and back-navigation states', () => {
    expect(getIcon('exclamation-circle')).toEqual(
      expect.objectContaining({ name: 'exclamation-circle', outline: expect.any(String) }),
    );
    expect(getIcon('arrow-left')).toEqual(
      expect.objectContaining({ name: 'arrow-left', outline: expect.any(String) }),
    );
  });

  it('uses a distinct dark palette with readable primary text', () => {
    expect(darkColors).not.toBe(lightColors);
    expect(darkColors.background.primary).not.toBe(lightColors.background.primary);
    expect(darkColors.text.primary).not.toBe(lightColors.text.primary);
    expect(darkColors.semantic.textMuted).not.toBe(lightColors.semantic.textMuted);
  });
});
