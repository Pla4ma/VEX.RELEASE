import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useTheme } from '../../../theme';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface EarnMoreSheetProps {
  visible: boolean;
  onClose: () => void;
}

const EARNING_TIPS = [
  { label: 'Finish a 25m session', reward: '+50 coins', icon: '⏱️' },
  { label: 'Maintain a 7-day streak', reward: '+200 coins', icon: '🔥' },
  { label: 'Help defeat the weekly boss', reward: '+100 coins', icon: '👹' },
] as const;

export function EarnMoreSheet({ visible, onClose }: EarnMoreSheetProps): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleStartSession = () => {
    onClose();
    navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <Pressable
        onPress={onClose}
        style={{
          backgroundColor: theme.colors.background.overlay,
          flex: 1,
          justifyContent: 'flex-end',
        }}

      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control">
        <Pressable
          onPress={() => undefined}
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderTopLeftRadius: theme.borderRadius['3xl'],
            borderTopRightRadius: theme.borderRadius['3xl'],
            gap: theme.spacing[4],
            padding: theme.spacing[5],
            paddingBottom: theme.spacing[8],
          }}

        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <View style={{ gap: theme.spacing[2] }}>
            <Text color={theme.colors.primary[500]} variant="label">
              Earn more coins
            </Text>
            <Text variant="h3">Build your wallet by focusing</Text>
            <Text color={theme.colors.text.secondary} variant="body">
              Coins grow naturally as you complete sessions and keep your momentum alive.
            </Text>
          </View>

          <View style={{ gap: theme.spacing[3] }}>
            {EARNING_TIPS.map((tip) => (
              <View
                key={tip.label}
                style={{
                  backgroundColor: theme.colors.background.primary,
                  borderColor: theme.colors.border.DEFAULT,
                  borderRadius: theme.borderRadius.xl,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: theme.spacing[3],
                  padding: theme.spacing[4],
                }}
              >
                <Text fontSize={22}>{tip.icon}</Text>
                <View style={{ flex: 1, gap: theme.spacing[1] }}>
                  <Text variant="body">{tip.label}</Text>
                  <Text color={theme.colors.primary[500]} variant="label">
                    {tip.reward}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Button fullWidth onPress={handleStartSession}
  accessibilityLabel="Start a session now button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Start a session now
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
