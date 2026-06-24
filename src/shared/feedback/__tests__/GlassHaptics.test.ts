import { glassHaptics } from '../GlassHaptics';

describe('glassHaptics', () => {
  it('tabPress does not throw', async () => {
    await glassHaptics.tabPress();
  });

  it('selectedPill does not throw', async () => {
    await glassHaptics.selectedPill();
  });

  it('heroPress does not throw', async () => {
    await glassHaptics.heroPress();
  });

  it('sheetSnap does not throw', async () => {
    await glassHaptics.sheetSnap();
  });

  it('primaryAction does not throw', async () => {
    await glassHaptics.primaryAction();
  });

  it('completion does not throw', async () => {
    await glassHaptics.completion();
  });

  it('disabled does not throw', async () => {
    await glassHaptics.disabled();
  });
});
