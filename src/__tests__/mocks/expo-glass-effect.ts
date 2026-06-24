import React from 'react';
import { View } from 'react-native';

export function GlassView(props: Record<string, unknown>): React.ReactNode {
  return React.createElement(View, props);
}

export function GlassContainer(props: Record<string, unknown>): React.ReactNode {
  return React.createElement(View, props);
}

export function isLiquidGlassAvailable(): boolean {
  return false;
}

export function isGlassEffectAPIAvailable(): boolean {
  return false;
}
