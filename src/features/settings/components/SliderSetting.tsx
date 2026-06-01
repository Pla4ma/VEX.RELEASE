/**
 * Slider Setting Component
 * Setting row with increment/decrement buttons
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';


interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function SliderSetting({
  label,
  value,
  min,
  max,
  onChange,
}: SliderSettingProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.sliderButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onChange(Math.max(min, value - 0.1))}
          accessibilityLabel="Decrease value"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.sliderButtonText}>-</Text>
        </Pressable>
        <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.sliderButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onChange(Math.min(max, value + 0.1))}
          accessibilityLabel="Increase value"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    color: '#111827',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 16,
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
});
