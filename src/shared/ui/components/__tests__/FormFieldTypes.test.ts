import { sizeConfig, getFieldBorderColor, getFieldMessageColor, type FieldState } from '../FormFieldTypes';

describe('FormFieldTypes', () => {
  describe('sizeConfig', () => {
    it('has configs for sm, md, lg', () => {
      expect(sizeConfig.sm).toBeDefined();
      expect(sizeConfig.md).toBeDefined();
      expect(sizeConfig.lg).toBeDefined();
    });

    it('minHeight increases with size', () => {
      expect(sizeConfig.sm.minHeight).toBe(40);
      expect(sizeConfig.md.minHeight).toBe(48);
      expect(sizeConfig.lg.minHeight).toBe(56);
    });

    it('each config has all required fields', () => {
      for (const config of Object.values(sizeConfig)) {
        expect(config.minHeight).toBeGreaterThan(0);
        expect(config.paddingHorizontal).toBeGreaterThan(0);
        expect(config.paddingVertical).toBeGreaterThan(0);
        expect(config.fontSize).toBeGreaterThan(0);
      }
    });
  });

  describe('getFieldBorderColor', () => {
    const semantic = {
      danger: '#FF0000',
      success: '#00FF00',
      primary: '#0000FF',
      inputBorder: '#CCCCCC',
    };

    it('returns danger color for error state', () => {
      expect(getFieldBorderColor('error', semantic)).toBe('#FF0000');
    });

    it('returns success color for success state', () => {
      expect(getFieldBorderColor('success', semantic)).toBe('#00FF00');
    });

    it('returns primary color for focused state', () => {
      expect(getFieldBorderColor('focused', semantic)).toBe('#0000FF');
    });

    it('returns inputBorder for default state', () => {
      expect(getFieldBorderColor('default', semantic)).toBe('#CCCCCC');
    });

    it('returns inputBorder for loading state', () => {
      expect(getFieldBorderColor('loading', semantic)).toBe('#CCCCCC');
    });

    it('returns inputBorder for disabled state', () => {
      expect(getFieldBorderColor('disabled', semantic)).toBe('#CCCCCC');
    });
  });

  describe('getFieldMessageColor', () => {
    it('returns error color when error is set', () => {
      expect(getFieldBorderColor('error', { danger: '#F00', success: '#0F0', primary: '#00F', inputBorder: '#CCC' })).toBe('#F00');
    });

    it('returns error color when internalError is set', () => {
      expect(getFieldMessageColor(undefined, 'internal error', undefined)).toBe('error.DEFAULT');
    });

    it('returns error color when both error and successMessage are set', () => {
      // error takes priority
      expect(getFieldMessageColor('error text', undefined, 'success text')).toBe('error.DEFAULT');
    });

    it('returns success color when only successMessage is set', () => {
      expect(getFieldMessageColor(undefined, undefined, 'great!')).toBe('success.DEFAULT');
    });

    it('returns text.muted when no error or success', () => {
      expect(getFieldMessageColor(undefined, undefined, undefined)).toBe('text.muted');
    });
  });
});
