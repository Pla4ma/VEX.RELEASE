/**
 * @deprecated BLOCKED by VEX Phase 14 durable personalization strategy.
 *
 * Streak insurance with coins/gambles/comeback-tokens = game-economy fix for
 * a problem that should be solved by recovery planning (premium feature).
 * This component is blocked by feature gate (streak_insurance = deactivated).
 * Kept for archival reference only.
 */
import React, { useMemo } from "react";
import { View, Text, Pressable, Modal, ViewStyle } from "react-native";
import { useTheme } from "@/theme";
import type { StreakRiskAssessment } from "../../features/streaks/streak-insurance";
interface StreakInsuranceModalProps {
  visible: boolean;
  assessment: StreakRiskAssessment | null;
  userCoins: number;
  onClose: () => void;
  onPurchaseInsurance: () => void;
  onStartGamble: (type: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE") => void;
  onUseComebackToken: () => void;
  availableTokens: number;
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
  const insuranceCost = assessment?.insuranceCost || 500;
  const canAffordInsurance = userCoins >= insuranceCost;
  const riskColor = useMemo(() => {
    const level: string = (assessment?.riskLevel as string) ?? "NONE";
    if (level === "CRITICAL") return theme.colors.error.dark;
    if (level === "HIGH") return theme.colors.warning.dark;
    if (level === "MEDIUM" || level === "MODERATE")
      return theme.colors.warning[500];
    return theme.colors.success.dark;
  }, [assessment?.riskLevel, theme]);
  if (!assessment) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {" "}
      <View style={overlayStyle(theme)}>
        {" "}
        <View style={containerStyle(theme)}>
          {" "}
          <View style={[headerStyle, { backgroundColor: riskColor }]}>
            {" "}
            <Text style={headerTitleStyle(theme)}>⚠️ Streak at Risk!</Text>{" "}
            <Text style={streakDaysStyle(theme)}>Streak Protection</Text>{" "}
          </View>
          <View style={riskSectionStyle(theme)}>
            {" "}
            <Text style={riskLabelStyle(theme)}>Risk Level</Text>{" "}
            <Text style={[riskValueStyle(theme), { color: riskColor }]}>
              {assessment.riskLevel}
            </Text>{" "}
            <Text style={riskMessageStyle(theme)}>Protect your progress</Text>{" "}
            <Text style={hoursRemainingStyle(theme)}>
              Select an option below
            </Text>{" "}
          </View>
          <View style={optionsContainerStyle}>
            {" "}
            <Pressable
              onPress={onPurchaseInsurance}
              disabled={!canAffordInsurance}
              style={({ pressed }) => [
                optionRowStyle(theme),
                !canAffordInsurance && { opacity: 0.5 },
                pressed && { opacity: 0.7 },
              ]}
            >
              {" "}
              <View style={optionIconStyle(theme)}>
                {" "}
                <Text style={iconTextStyle}>🛡️</Text>{" "}
              </View>{" "}
              <View style={optionContentStyle}>
                {" "}
                <Text style={optionTitleStyle(theme)}>Buy Insurance</Text>{" "}
                <Text style={optionDescriptionStyle(theme)}>
                  Pay {insuranceCost} coins. If streak breaks, lose only 50%
                  progress.
                </Text>{" "}
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
                  {" "}
                  Cost: {insuranceCost} coins (You have: {userCoins}){" "}
                </Text>{" "}
              </View>{" "}
            </Pressable>
            <Text style={gambleHeaderStyle(theme)}>
              Or Take a Gamble (Risk vs Reward):
            </Text>
            <GambleOption
              type="CONSERVATIVE"
              description="Session grade B+ required, 24h to complete"
              xpBonus="+20% XP"
              onPress={() => onStartGamble("CONSERVATIVE")}
              theme={theme}
            />{" "}
            <GambleOption
              type="MODERATE"
              description="Session grade A+ required, 12h to complete"
              xpBonus="+50% XP"
              onPress={() => onStartGamble("MODERATE")}
              theme={theme}
            />{" "}
            <GambleOption
              type="AGGRESSIVE"
              description="Session grade S required, 6h to complete"
              xpBonus="+100% XP"
              onPress={() => onStartGamble("AGGRESSIVE")}
              theme={theme}
            />
            {availableTokens > 0 && (
              <Pressable
                onPress={onUseComebackToken}
                style={({ pressed }) => [
                  comebackTokenStyle(theme),
                  pressed && { opacity: 0.7 },
                ]}
              >
                {" "}
                <View style={optionIconStyle(theme)}>
                  {" "}
                  <Text style={iconTextStyle}>🔄</Text>{" "}
                </View>{" "}
                <View style={optionContentStyle}>
                  {" "}
                  <Text style={optionTitleStyle(theme)}>
                    Use Comeback Token
                  </Text>{" "}
                  <Text style={optionDescriptionStyle(theme)}>
                    Restore 5 days of streak. You have {availableTokens} tokens
                    available.
                  </Text>{" "}
                </View>{" "}
              </Pressable>
            )}{" "}
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              dismissStyle(theme),
              pressed && { opacity: 0.7 },
            ]}
          >
            {" "}
            <Text style={dismissTextStyle(theme)}>
              Decide Later (Risky!)
            </Text>{" "}
          </Pressable>{" "}
        </View>{" "}
      </View>{" "}
    </Modal>
  );
};
interface GambleOptionProps {
  type: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
  description: string;
  xpBonus: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}
const GAMBLE_COLORS = {
  CONSERVATIVE: (t: ReturnType<typeof useTheme>["theme"]) =>
    t.colors.success.dark,
  MODERATE: (t: ReturnType<typeof useTheme>["theme"]) => t.colors.warning[500],
  AGGRESSIVE: (t: ReturnType<typeof useTheme>["theme"]) => t.colors.error.dark,
};
const GambleOption: React.FC<GambleOptionProps> = ({
  type,
  description,
  xpBonus,
  onPress,
  theme,
}) => {
  const color = GAMBLE_COLORS[type](theme);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        gambleOptionStyle(theme),
        { borderColor: color },
        pressed && { opacity: 0.7 },
      ]}
    >
      {" "}
      <View style={[gambleBadgeStyle, { backgroundColor: color }]}>
        {" "}
        <Text style={gambleTypeTextStyle(theme)}>{type}</Text>{" "}
      </View>{" "}
      <View style={gambleContentStyle}>
        {" "}
        <Text style={gambleDescriptionStyle(theme)}>{description}</Text>{" "}
        <Text style={[xpBonusStyle, { color }]}>{xpBonus}</Text>{" "}
      </View>{" "}
    </Pressable>
  );
};
type Theme = ReturnType<typeof useTheme>["theme"];
const overlayStyle = (t: Theme): ViewStyle => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: t.colors.background.overlay,
});
const containerStyle = (t: Theme): ViewStyle => ({
  backgroundColor: t.colors.background.secondary,
  borderRadius: 16,
  overflow: "hidden",
  maxHeight: "90%",
});
const headerStyle: ViewStyle = { padding: 20, alignItems: "center" };
const headerTitleStyle = (t: Theme) => ({
  fontSize: 20,
  fontWeight: "bold" as const,
  color: t.colors.text.inverse,
});
const streakDaysStyle = (t: Theme) => ({
  fontSize: 16,
  color: t.colors.text.inverse,
  marginTop: 4,
});
const riskSectionStyle = (t: Theme): ViewStyle => ({
  padding: 20,
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: t.colors.border.DEFAULT,
});
const riskLabelStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.tertiary,
  textTransform: "uppercase" as const,
});
const riskValueStyle = (t: Theme) => ({
  fontSize: 24,
  fontWeight: "bold" as const,
  marginTop: 4,
});
const riskMessageStyle = (t: Theme) => ({
  fontSize: 14,
  color: t.colors.text.secondary,
  textAlign: "center" as const,
  marginTop: 8,
});
const hoursRemainingStyle = (t: Theme) => ({
  fontSize: 16,
  fontWeight: "600" as const,
  color: t.colors.text.primary,
  marginTop: 8,
});
const optionsContainerStyle: ViewStyle = { padding: 16 };
const optionRowStyle = (t: Theme): ViewStyle => ({
  flexDirection: "row",
  backgroundColor: t.colors.background.primary,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: t.colors.border.DEFAULT,
});
const optionIconStyle = (t: Theme): ViewStyle => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: t.colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
});
const iconTextStyle = { fontSize: 24 };
const optionContentStyle: ViewStyle = { flex: 1 };
const optionTitleStyle = (t: Theme) => ({
  fontSize: 16,
  fontWeight: "bold" as const,
  color: t.colors.text.primary,
});
const optionDescriptionStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.tertiary,
  marginTop: 4,
});
const costBaseStyle = (t: Theme) => ({
  fontSize: 14,
  fontWeight: "600" as const,
  marginTop: 8,
});
const gambleHeaderStyle = (t: Theme) => ({
  fontSize: 14,
  fontWeight: "600" as const,
  color: t.colors.text.secondary,
  marginTop: 8,
  marginBottom: 12,
});
const gambleOptionStyle = (t: Theme): ViewStyle => ({
  flexDirection: "row",
  backgroundColor: t.colors.background.secondary,
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  borderWidth: 2,
});
const gambleBadgeStyle: ViewStyle = {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  marginRight: 12,
  alignSelf: "center",
};
const gambleTypeTextStyle = (t: Theme) => ({
  fontSize: 12,
  fontWeight: "700" as const,
  color: t.colors.text.inverse,
  textTransform: "uppercase" as const,
});
const gambleContentStyle: ViewStyle = { flex: 1 };
const gambleDescriptionStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.secondary,
});
const xpBonusStyle = { fontSize: 14, fontWeight: "600" as const, marginTop: 4 };
const comebackTokenStyle = (t: Theme): ViewStyle => ({
  flexDirection: "row",
  backgroundColor: t.colors.primary[50],
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  borderWidth: 2,
  borderColor: t.colors.primary[500],
});
const dismissStyle = (t: Theme): ViewStyle => ({
  padding: 16,
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: t.colors.border.DEFAULT,
});
const dismissTextStyle = (t: Theme) => ({
  color: t.colors.text.tertiary,
  fontSize: 14,
});
