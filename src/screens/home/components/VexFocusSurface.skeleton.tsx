import React from 'react';
import { View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';

export function VexFocusSkeleton(): JSX.Element {
  return (
    <GlassCard padding={20} radius={32} variant="hero">
      <View style={{ gap: 12 }}>
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.10)',
            borderRadius: 999,
            height: 12,
            width: 96,
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.10)',
            borderRadius: 14,
            height: 32,
            width: '70%',
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 8,
            height: 14,
            width: '88%',
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 8,
            height: 14,
            width: '72%',
          }}
        />
      </View>
    </GlassCard>
  );
}
