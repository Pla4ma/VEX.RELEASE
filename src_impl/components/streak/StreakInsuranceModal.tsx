/**
 * Streak Insurance/Gamble Modal
 * Displays risk assessment and purchase options
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '@/theme';
import type { StreakRiskAssessment } from '../../features/streaks/streak-insurance';

interface StreakInsuranceModalProps {
  visible: boolean;
  assessment: StreakRiskAssessment | null;
  userCoins: number;
  onClose: () => void;
  onPurchaseInsurance: () => void;
  onStartGamble: (type: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE') => void;
  onUseComebackToken: () => void;
  availableTokens: number;
}

export const StreakInsuranceModal: React.FC<StreakInsuranceModalProps> = ({ visible, assessment, userCoins, onClose, onPurchaseInsurance, onStartGamble, onUseComebackToken, availableTokens }) => {
  const { theme } = useTheme();
  const insuranceCost = assessment?.insuranceCost || 500;
  const canAffordInsurance = userCoins >= insuranceCost;

  const riskColor = useMemo(() => {
    const level: string = (assessment?.riskLevel as string) ?? 'NONE';
    if (level === 'CRITICAL') {
      return '#E53E3E';
    }
    if (level === 'HIGH') {
      return '#DD6B20';
    }
    if (level === 'MEDIUM' || level === 'MODERATE') {
      return '#D69E2E';
    }
    return '#38A169';
  }, [assessment?.riskLevel]);

  if (!assessment) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={containerStyle}>
          {/* Header */}
          <View style={[headerStyle, { backgroundColor: riskColor }]}>
            <Text style={headerTitleStyle}>⚠️ Streak at Risk!</Text>
            <Text style={streakDaysStyle}>Streak Protection</Text>
          </View>

          {/* Risk Level */}
          <View style={riskSectionStyle}>
            <Text style={riskLabelStyle}>Risk Level</Text>
            <Text style={[riskValueStyle, { color: riskColor }]}>{assessment.riskLevel}</Text>
            <Text style={riskMessageStyle}>Protect your progress</Text>
            <Text style={hoursRemainingStyle}>Select an option below</Text>
          </View>

          {/* Options */}
          <View
            style={{
              padding: 16,
            }}
          >
            {/* Insurance Option */}
            <Pressable
              onPress={onPurchaseInsurance}
              disabled={!canAffordInsurance}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  backgroundColor: '#F7FAFC',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: '#E2E8F0',
                },
                !canAffordInsurance && { opacity: 0.5 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'white',
                  justifyContent: 'center' as const,
                  alignItems: 'center' as const,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                  }}
                >
                  🛡️
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold' as const,
                    color: '#2D3748',
                  }}
                >
                  Buy Insurance
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#718096',
                    marginTop: 4,
                  }}
                >
                  Pay {insuranceCost} coins. If streak breaks, lose only 50% progress.
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600' as const, color: canAffordInsurance ? '#38A169' : '#E53E3E', marginTop: 8 }}>
                  Cost: {insuranceCost} coins (You have: {userCoins})
                </Text>
              </View>
            </Pressable>

            {/* Gamble Options */}
            <Text style={gambleHeaderStyle}>Or Take a Gamble (Risk vs Reward):</Text>

            <GambleOption type="CONSERVATIVE" description="Session grade B+ required, 24h to complete" xpBonus="+20% XP" onPress={() => onStartGamble('CONSERVATIVE')} />

            <GambleOption type="MODERATE" description="Session grade A+ required, 12h to complete" xpBonus="+50% XP" onPress={() => onStartGamble('MODERATE')} />

            <GambleOption type="AGGRESSIVE" description="Session grade S required, 6h to complete" xpBonus="+100% XP" onPress={() => onStartGamble('AGGRESSIVE')} />

            {/* Comeback Tokens */}
            {availableTokens > 0 && (
              <Pressable onPress={onUseComebackToken} style={({ pressed }) => [{ flexDirection: 'row', backgroundColor: '#EBF8FF', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 2, borderColor: '#4299E1' }, pressed && { opacity: 0.7 }]}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center' as const, alignItems: 'center' as const, marginRight: 12 }}>
                  <Text style={{ fontSize: 24 }}>🔄</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' as const, color: '#2D3748' }}>Use Comeback Token</Text>
                  <Text style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Restore 5 days of streak. You have {availableTokens} tokens available.</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Close Button */}
          <Pressable onPress={onClose} style={({ pressed }) => [{ padding: 16, alignItems: 'center' as const, borderTopWidth: 1, borderTopColor: '#E2E8F0' }, pressed && { opacity: 0.7 }]}>
            <Text style={{ color: '#718096', fontSize: 14 }}>Decide Later (Risky!)</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

interface GambleOptionProps {
  type: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  description: string;
  xpBonus: string;
  onPress: () => void;
}

const GambleOption: React.FC<GambleOptionProps> = ({ type, description, xpBonus, onPress }) => {
  const colors = {
    CONSERVATIVE: '#38A169',
    MODERATE: '#D69E2E',
    AGGRESSIVE: '#E53E3E',
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [gambleOptionStyle, { borderColor: colors[type] }, pressed && { opacity: 0.7 }]}>
      <View style={[gambleBadgeStyle, { backgroundColor: colors[type] }]}>
        <Text style={gambleTypeStyle}>{type}</Text>
      </View>
      <View style={gambleContentStyle}>
        <Text style={gambleDescriptionStyle}>{description}</Text>
        <Text style={[xpBonusStyle, { color: colors[type] }]}>{xpBonus}</Text>
      </View>
    </Pressable>
  );
};

const overlayStyle = { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: 'rgba(0, 0, 0, 0.5)' };

const containerStyle = { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' as const, maxHeight: '90%' as const };

const headerStyle = { padding: 20, alignItems: 'center' as const };

const headerTitleStyle = { fontSize: 20, fontWeight: 'bold' as const, color: 'white' };

const streakDaysStyle = { fontSize: 16, color: 'white', marginTop: 4 };

const riskSectionStyle = { padding: 20, alignItems: 'center' as const, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' };

const riskLabelStyle = { fontSize: 12, color: '#718096', textTransform: 'uppercase' as const };

const riskValueStyle = { fontSize: 24, fontWeight: 'bold' as const, marginTop: 4 };

const riskMessageStyle = { fontSize: 14, color: '#4A5568', textAlign: 'center' as const, marginTop: 8 };

const hoursRemainingStyle = { fontSize: 16, fontWeight: '600' as const, color: '#2D3748', marginTop: 8 };

const optionsStyle = { padding: 16 };

const optionStyle = { flexDirection: 'row' as const, backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#E2E8F0' };

const optionDisabledStyle = { opacity: 0.5 };

const optionIconStyle = { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center' as const, alignItems: 'center' as const, marginRight: 12 };

const iconTextStyle = { fontSize: 24 };

const optionContentStyle = { flex: 1 };

const optionTitleStyle = { fontSize: 16, fontWeight: 'bold' as const, color: '#2D3748' };

const optionDescriptionStyle = { fontSize: 12, color: '#718096', marginTop: 4 };

const costStyle = { fontSize: 14, fontWeight: '600' as const, color: '#38A169', marginTop: 8 };

const costErrorStyle = { color: '#E53E3E' };

const gambleHeaderStyle = { fontSize: 14, fontWeight: '600' as const, color: '#4A5568', marginTop: 8, marginBottom: 12 };

const gambleOptionStyle = { flexDirection: 'row' as const, backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 2 };

const gambleBadgeStyle = { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginRight: 12, alignSelf: 'center' as const };

const gambleTypeStyle = { color: 'white', fontSize: 10, fontWeight: 'bold' as const, textTransform: 'uppercase' as const };

const gambleContentStyle = { flex: 1 };

const gambleDescriptionStyle = { fontSize: 12, color: '#4A5568' };

const xpBonusStyle = { fontSize: 12, fontWeight: 'bold' as const, marginTop: 4 };

const tokenOptionStyle = { flexDirection: 'row' as const, backgroundColor: '#EBF8FF', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 2, borderColor: '#4299E1' };

const closeButtonStyle = { padding: 16, alignItems: 'center' as const, borderTopWidth: 1, borderTopColor: '#E2E8F0' };

const closeTextStyle = { color: '#718096', fontSize: 14 };

export * from "./StreakInsuranceModal.types";
export * from "./StreakInsuranceModal.types";
