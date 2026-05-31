/**
 * @deprecated BLOCKED by VEX Phase 14 durable personalization strategy.
 *
 * Streak insurance with coins/gambles/comeback-tokens = game-economy fix for
 * a problem that should be solved by recovery planning (premium feature).
 * This component is blocked by feature gate (streak_insurance = deactivated).
 * Kept for archival reference only.
 */
import React, { useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '@/theme';
import type { StreakInsuranceModalProps, Theme } from './StreakInsuranceModal/types';
import { GambleOption } from './StreakInsuranceModal/GambleOption';
import {
  overlayStyle,
  containerStyle,
  headerStyle,
  headerTitleStyle,
  streakDaysStyle,
  riskSectionStyle,
  riskLabelStyle,
  riskValueStyle,
  riskMessageStyle,
  hoursRemainingStyle,
  optionsContainerStyle,
  optionRowStyle,
  optionIconStyle,
  iconTextStyle,
  optionContentStyle,
  optionTitleStyle,
  optionDescriptionStyle,
  costBaseStyle,
  gambleHeaderStyle,
  comebackTokenStyle,
  dismissStyle,
  dismissTextStyle,
} from './StreakInsuranceModal/styles';

function getRiskColor(level: string, theme: Theme): string {
  if (level === 'CRITICAL') {return theme.colors.error.dark;}
  if (level === 'HIGH') {return theme.colors.warning.dark;}
  if (level === 'MEDIUM' || level === 'MODERATE')
    {return theme.colors.warning[500];}
  return theme.colors.success.dark;
}

export const StreakInsuranceModal: React.FC<StreakInsuranceModalProps> = ({
  visible,
  assessment,
  userCoins,
  onClose,
  onPurchaseInsurance,
  onStartGamble,
  onUseComebackToken,
  availableTokens,
}) => {
  const { theme } = useTheme();
  const insuranceCost = assessment?.insuranceCost ?? 500;
  const canAffordInsurance = userCoins >= insuranceCost;
  const riskColor = useMemo(
    () => getRiskColor(assessment?.riskLevel ?? 'NONE', theme),
    [assessment?.riskLevel, theme],
  );

  if (!assessment) {return null;}

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={overlayStyle(theme)}>
        <View style={containerStyle(theme)}>
          <View style={[headerStyle, { backgroundColor: riskColor }]}>
            <Text style={headerTitleStyle(theme)}>⚠️ Streak at Risk!</Text>
            <Text style={streakDaysStyle(theme)}>Streak Protection</Text>
          </View>
          <View style={riskSectionStyle(theme)}>
            <Text style={riskLabelStyle(theme)}>Risk Level</Text>
            <Text style={[riskValueStyle(theme), { color: riskColor }]}>
              {assessment.riskLevel}
            </Text>
            <Text style={riskMessageStyle(theme)}>Protect your progress</Text>
            <Text style={hoursRemainingStyle(theme)}>
              Select an option below
            </Text>
          </View>
          <View style={optionsContainerStyle}>
            <Pressable
              onPress={onPurchaseInsurance}
              disabled={!canAffordInsurance}
              accessibilityLabel={`Buy streak insurance for ${insuranceCost} coins`}
              accessibilityRole="button"
              accessibilityHint="Protects your streak from breaking completely"
              style={({ pressed }) => [
                optionRowStyle(theme),
                !canAffordInsurance && { opacity: 0.5 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={optionIconStyle(theme)}>
                <Text style={iconTextStyle}>🛡️</Text>
              </View>
              <View style={optionContentStyle}>
                <Text style={optionTitleStyle(theme)}>Buy Insurance</Text>
                <Text style={optionDescriptionStyle(theme)}>
                  Pay {insuranceCost} coins. If streak breaks, lose only 50%
                  progress.
                </Text>
                <Text
                  style={[
                    costBaseStyle(theme),
                    {
                      color: canAffordInsurance
                        ? theme.colors.success.dark
                        : theme.colors.error.dark,
                    },
                  ]}
                >
                  Cost: {insuranceCost} coins (You have: {userCoins})
                </Text>
              </View>
            </Pressable>
            <Text style={gambleHeaderStyle(theme)}>
              Or Take a Gamble (Risk vs Reward):
            </Text>
            <GambleOption
              type="CONSERVATIVE"
              description="Session grade B+ required, 24h to complete"
              xpBonus="+20% XP"
              onPress={() => onStartGamble('CONSERVATIVE')}
              theme={theme}
            />
            <GambleOption
              type="MODERATE"
              description="Session grade A+ required, 12h to complete"
              xpBonus="+50% XP"
              onPress={() => onStartGamble('MODERATE')}
              theme={theme}
            />
            <GambleOption
              type="AGGRESSIVE"
              description="Session grade S required, 6h to complete"
              xpBonus="+100% XP"
              onPress={() => onStartGamble('AGGRESSIVE')}
              theme={theme}
            />
            {availableTokens > 0 && (
              <Pressable
                onPress={onUseComebackToken}
                accessibilityLabel="Use comeback token"
                accessibilityRole="button"
                accessibilityHint="Restores 5 days of streak progress"
                style={({ pressed }) => [
                  comebackTokenStyle(theme),
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={optionIconStyle(theme)}>
                  <Text style={iconTextStyle}>🔄</Text>
                </View>
                <View style={optionContentStyle}>
                  <Text style={optionTitleStyle(theme)}>
                    Use Comeback Token
                  </Text>
                  <Text style={optionDescriptionStyle(theme)}>
                    Restore 5 days of streak. You have {availableTokens} tokens
                    available.
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Decide later about streak protection"
            accessibilityRole="button"
            accessibilityHint="Closes the streak protection dialog without taking action"
            style={({ pressed }) => [
              dismissStyle(theme),
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={dismissTextStyle(theme)}>
              Decide Later (Risky!)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
