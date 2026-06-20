/**
 * Smoke tests for the Ethereal Sky design tokens.
 * Pure data tokens — should parse, expose expected keys, and
 * keep RGBA strings well-formed.
 */
import {
  etherealSkyGradient,
  etherealGlass,
  etherealCloud,
  etherealButton,
  etherealMedallion,
  etherealOrb,
  etherealCard,
  etherealSkyAccents,
} from '../ethereal-sky';

const RGBA_PATTERN = /^rgba?\(/i;

describe('ethereal-sky tokens', () => {
  it('exposes the dawn sky gradient stops', () => {
    expect(etherealSkyGradient.zenith).toMatch(/^#/);
    expect(etherealSkyGradient.mid).toMatch(/^#/);
    expect(etherealSkyGradient.horizon).toMatch(/^#/);
  });

  it('exposes glass surface rgba strings', () => {
    expect(etherealGlass.fill).toMatch(RGBA_PATTERN);
    expect(etherealGlass.border).toMatch(RGBA_PATTERN);
    expect(etherealGlass.shadow).toMatch(RGBA_PATTERN);
  });

  it('keeps cloud opacity in a tasteful range', () => {
    expect(etherealCloud.layerBack).toBeGreaterThan(0);
    expect(etherealCloud.layerBack).toBeLessThan(0.4);
    expect(etherealCloud.layerFront).toBeGreaterThan(etherealCloud.layerBack);
  });

  it('exposes button + medallion + orb + card colors', () => {
    expect(etherealButton.appleFill).toMatch(RGBA_PATTERN);
    expect(etherealButton.googleFill).toMatch(RGBA_PATTERN);
    expect(etherealMedallion.core).toMatch(RGBA_PATTERN);
    expect(etherealOrb.core).toMatch(/^#/);
    expect(etherealCard.border).toMatch(RGBA_PATTERN);
    expect(etherealSkyAccents.warmCloud).toMatch(/^#/);
  });
});
