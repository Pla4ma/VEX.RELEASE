import React from 'react';
import { View } from 'react-native';
import type { CompanionElement } from '../../../features/onboarding/types';
import { lightColors } from '@/theme/tokens/colors';


interface ElementVisualProps {
  element: CompanionElement;
  color: string;
}

export function ElementVisual({
  element,
  color,
}: ElementVisualProps): JSX.Element {
  const visuals: Record<CompanionElement, JSX.Element> = {
    FLAME: (
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 8,
            height: 20,
            backgroundColor: color,
            borderRadius: 4,
            marginBottom: -8,
          }}
        />
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            borderRadius: 10,
          }}
        />
      </View>
    ),
    WAVE: (
      <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <View
          style={{
            width: 4,
            height: 24,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 4,
            height: 20,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 4,
            height: 24,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      </View>
    ),
    TERRA: (
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 24,
            height: 8,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 20,
            height: 16,
            backgroundColor: color,
            borderRadius: 4,
            marginTop: -4,
          }}
        />
      </View>
    ),
    ZEPHYR: (
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 28,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
        <View
          style={{
            width: 20,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
        <View
          style={{
            width: 28,
            height: 4,
            backgroundColor: color,
            borderRadius: 2,
            marginVertical: 2,
          }}
        />
      </View>
    ),
    VOID: (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: lightColors.text.inverse,
            position: 'absolute',
          }}
        />
      </View>
    ),
    LUMINA: (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: color,
            position: 'absolute',
            opacity: 0.5,
          }}
        />
      </View>
    ),
  };
  return visuals[element];
}
