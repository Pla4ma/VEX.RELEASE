import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';

export interface ScoreCardProps {
  score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  return (
    <GlassCard glowMint padding={16} radius={24} variant="hero">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          zIndex: 2,
        }}
      >
        <LiquidGlassSphere
          color="cyan"
          icon={
            <Icon color="#0E7490" name="bolt" size="md" strokeWidth="thin" variant="outline" />
          }
          intensity={0.75}
          size={44}
        />
        <Text
          style={{
            color: '#0A1F1A',
            fontSize: 14,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          Focus Score
        </Text>
      </View>

      <Text
        style={{
          color: '#0A1F1A',
          fontSize: 32,
          fontWeight: '800',
          letterSpacing: -1.0,
          lineHeight: 38,
          marginBottom: 4,
          zIndex: 2,
        }}
      >
        {score}
      </Text>

      <Text
        style={{
          color: '#3D5A52',
          fontSize: 12,
          lineHeight: 17,
          marginBottom: 12,
          zIndex: 2,
        }}
      >
        Stable
      </Text>

      <View style={{ maxWidth: 200, zIndex: 2 }}>
        <LiquidButton
          accessibilityHint="Starts a focus session to improve your Focus Score"
          label="Start session"
          onPress={() => {}}
          rightIcon={
            <Icon color="#FFFFFF" name="arrowRight" size="sm" variant="solid" />
          }
          size="sm"
          variant="primary"
        />
      </View>
    </GlassCard>
  );
};

export default ScoreCard;
