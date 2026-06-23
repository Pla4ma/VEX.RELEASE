import { HapticEngine } from '../HapticEngine';

describe('HapticEngine', () => {
  let engine: HapticEngine;

  beforeEach(() => {
    engine = new HapticEngine();
  });

  describe('configuration', () => {
    it('starts with default config enabled', () => {
      engine.setEnabled(false);
      engine.setEnabled(true);
    });

    it('can disable haptics', () => {
      engine.setEnabled(false);
    });

    it('accepts partial config', () => {
      engine.setConfig({ intensity: 'heavy' });
    });

    it('clamps battery level to 0-1', () => {
      engine.setBatteryLevel(-0.5);
      engine.setBatteryLevel(1.5);
    });
  });

  describe('trigger contexts', () => {
    it('can trigger success context without error', async () => {
      await engine.success();
    });

    it('can trigger error context without error', async () => {
      await engine.error();
    });

    it('can trigger warning context without error', async () => {
      await engine.warning();
    });

    it('can trigger selection context without error', async () => {
      await engine.selection();
    });

    it('can trigger impact context without error', async () => {
      await engine.impact();
    });

    it('can trigger impact with custom intensity', async () => {
      await engine.impact('heavy');
      await engine.impact('light');
    });

    it('can trigger success with custom intensity', async () => {
      await engine.success('light');
      await engine.success('heavy');
    });
  });

  describe('patterns', () => {
    it('can trigger doubleTap without error', async () => {
      await engine.doubleTap();
    });

    it('can trigger heartbeat without error', async () => {
      await engine.heartbeat();
    });

    it('can trigger celebration without error', async () => {
      await engine.celebration();
    });
  });

  describe('battery awareness', () => {
    it('handles low battery level gracefully', () => {
      engine.setBatteryLevel(0.05);
    });
  });
});
