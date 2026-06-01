import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';
import { styles } from './PremiumErrorRecovery.styles';

interface ResolvedSuccessCardProps {
  animatedStyle: AnimatedStyle<ViewStyle>;
  successBg: string;
  successColor: string;
}

export const ResolvedSuccessCard: React.FC<ResolvedSuccessCardProps> = ({
  animatedStyle,
  successBg,
  successColor,
}) => (
  <Animated.View style={animatedStyle}>
    <View style={[styles.successCard, { backgroundColor: successBg }]}>
      <Text style={[styles.successIcon, { color: successColor }]}>
        {'\u2713'}
      </Text>
      <Text style={[styles.successText, { color: successColor }]}>
        Problem solved! Back to your journey.
      </Text>
    </View>
  </Animated.View>
);
