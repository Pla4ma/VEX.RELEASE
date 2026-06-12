import { sizeConfig } from '../TabBar.types';
import { STATUS_CONFIG, getStatusColor, type AsyncStatus } from '../StatusFeedback.types';
import { variantStyles, sizeStyles, getThemeVariantStyles, type CardVariant, type CardSize } from '../InteractiveCardTypes';

describe('TabBar.types', () => {
  describe('sizeConfig', () => {
    it('has configs for sm, md, lg', () => {
      expect(sizeConfig.sm).toBeDefined();
      expect(sizeConfig.md).toBeDefined();
      expect(sizeConfig.lg).toBeDefined();
    });

    it('padding and font size increase with size', () => {
      expect(sizeConfig.sm.fontSize).toBe(12);
      expect(sizeConfig.md.fontSize).toBe(14);
      expect(sizeConfig.lg.fontSize).toBe(16);
    });

    it('each config has paddingVertical, paddingHorizontal, fontSize', () => {
      for (const config of Object.values(sizeConfig)) {
        expect(config.paddingVertical).toBeGreaterThan(0);
        expect(config.paddingHorizontal).toBeGreaterThan(0);
        expect(config.fontSize).toBeGreaterThan(0);
      }
    });
  });
});

describe('StatusFeedback.types', () => {
  describe('STATUS_CONFIG', () => {
    it('has config for all statuses', () => {
      const statuses: AsyncStatus[] = ['idle', 'loading', 'success', 'error', 'retrying', 'offline'];
      for (const status of statuses) {
        expect(STATUS_CONFIG[status]).toBeDefined();
      }
    });
  });

  describe('getStatusColor', () => {
    const mockTheme = {
      colors: {
        primary: { 500: '#FF0000' },
        warning: { dark: '#FFAA00' },
        success: { dark: '#00FF00' },
        error: { dark: '#FF0000' },
        text: { disabled: '#999999' },
      },
    } as any;

    it('returns correct color for each status', () => {
      expect(getStatusColor('loading', mockTheme)).toBe('#FF0000');
      expect(getStatusColor('retrying', mockTheme)).toBe('#FFAA00');
      expect(getStatusColor('success', mockTheme)).toBe('#00FF00');
      expect(getStatusColor('error', mockTheme)).toBe('#FF0000');
      expect(getStatusColor('offline', mockTheme)).toBe('#999999');
      expect(getStatusColor('idle', mockTheme)).toBe('transparent');
    });
  });
});

describe('InteractiveCardTypes', () => {
  describe('variantStyles', () => {
    it('has styles for all variants', () => {
      const variants: CardVariant[] = ['default', 'elevated', 'outlined', 'ghost'];
      for (const variant of variants) {
        expect(variantStyles[variant]).toBeDefined();
      }
    });
  });

  describe('sizeStyles', () => {
    it('has styles for all sizes', () => {
      const sizes: CardSize[] = ['sm', 'md', 'lg'];
      for (const size of sizes) {
        expect(sizeStyles[size]).toBeDefined();
        expect(sizeStyles[size].padding).toBeGreaterThan(0);
        expect(sizeStyles[size].borderRadius).toBeGreaterThan(0);
      }
    });

    it('padding increases with size', () => {
      expect(sizeStyles.sm.padding).toBeLessThan(sizeStyles.md.padding);
      expect(sizeStyles.md.padding).toBeLessThan(sizeStyles.lg.padding);
    });
  });

  describe('getThemeVariantStyles', () => {
    const mockTheme = {
      colors: {
        background: { secondary: '#F5F5F5' },
        text: { primary: '#000000' },
        border: { DEFAULT: '#DDDDDD' },
      },
    } as any;

    it('returns styles for all variants', () => {
      const styles = getThemeVariantStyles(mockTheme);
      const variants: CardVariant[] = ['default', 'elevated', 'outlined', 'ghost'];
      for (const variant of variants) {
        expect(variants[variant]).toBeDefined();
      }
    });

    it('outlined variant uses theme border color', () => {
      const styles = getThemeVariantStyles(mockTheme);
      expect((styles.outlined as any).borderColor).toBe('#DDDDDD');
    });

    it('elevated variant includes shadow', () => {
      const styles = getThemeVariantStyles(mockTheme);
      expect((styles.elevated as any).shadowColor).toBe('#000000');
      expect((styles.elevated as any).elevation).toBe(4);
    });
  });
});
