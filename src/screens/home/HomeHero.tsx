import React, { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FocusRing } from "../../components/FocusRing";
import { StreakBadge } from "../../components/StreakBadge";
import { Text } from "../../components/primitives/Text";
import { Skeleton } from "../../components/ui/Skeleton";
import { SimpleWalletBadge } from "../../features/economy/components/SimpleWalletBadge";
import { getPremiumCardStyle } from "../../components/premiumStyles";
import { useTheme } from "../../theme";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

const WHITE_MUTED = launchColors.rgb_255_255_255_0_72;
const WHITE_SOFT = launchColors.rgb_255_255_255_0_18;

export function getHeroGradientColors(
  streak: number,
): readonly [string, string] {
  if (streak >= 30) {
    return [launchColors.hex_0d1b2a, launchColors.hex_1b4332];
  }
  if (streak >= 7) {
    return [launchColors.hex_1a0533, launchColors.hex_6b0f1a];
  }
  if (streak >= 1) {
    return [launchColors.hex_0f3460, launchColors.hex_533483];
  }
  return [launchColors.hex_1a1a2e, launchColors.hex_16213e];
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function HomeHero({
  currentStreak,
  isAtRisk,
  isFirstRun,
  isLoading,
  insetsTop,
  todayFocusMinutes,
  progressPercent,
  userId,
  userFirstName,
}: {
  currentStreak: number;
  insetsTop: number;
  isAtRisk: boolean;
  isFirstRun: boolean;
  isLoading: boolean;
  progressPercent: number;
  todayFocusMinutes: number;
  userId?: string;
  userFirstName?: string;
}): JSX.Element {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const gradientColors = useMemo(
    () => getHeroGradientColors(currentStreak),
    [currentStreak],
  );
  return (
    <LinearGradient
      colors={[...gradientColors]}
      style={[
        styles.hero,
        {
          flexDirection: isCompact ? "column" : "row",
          paddingBottom: theme.spacing[6],
          paddingHorizontal: theme.spacing[5],
          paddingTop: insetsTop + theme.spacing[5],
        },
      ]}
    >
      {userId ? (
        <View
          style={{
            position: "absolute",
            top: insetsTop + 16,
            right: theme.spacing[5],
          }}
        >
          <SimpleWalletBadge
            userId={userId}
            streak={currentStreak}
            onPress={() => undefined}
          />
        </View>
      ) : null}
      <View style={[styles.heroColumn, { gap: theme.spacing[3] }]}>
        <Text variant="label" color={WHITE_MUTED} style={styles.eyebrow}>
          VEX
        </Text>
        <Text variant="h2" color={theme.colors.text.inverse}>
          {userFirstName
            ? `Welcome back, ${userFirstName}`
            : "Ready to lock in?"}
        </Text>
        {isLoading ? (
          <View style={{ gap: theme.spacing[2] }}>
            <Skeleton width={80} height={14} />
            <Skeleton width={120} height={48} borderRadius={12} />
            <Skeleton width={104} height={28} borderRadius={14} />
          </View>
        ) : isFirstRun ? (
          <Text variant="body" color={WHITE_MUTED}>
            Start one clean session. VEX will turn it into today&apos;s focus,
            streak, and reward snapshot.
          </Text>
        ) : (
          <>
            <Text variant="label" color={WHITE_MUTED}>
              Today
            </Text>
            <Text color={theme.colors.text.inverse} style={styles.focusValue}>
              {formatMinutes(todayFocusMinutes)}
            </Text>
            <StreakBadge
              days={currentStreak}
              isAtRisk={isAtRisk}
              variant="glass"
            />
          </>
        )}
      </View>
      <View
        style={[
          styles.heroRight,
          {
            alignItems: isCompact ? "stretch" : "center",
            gap: theme.spacing[2],
          },
        ]}
      >
        {isLoading ? (
          <View style={{ alignItems: "center", gap: theme.spacing[2] }}>
            <Skeleton width={132} height={132} variant="circular" />
            <Skeleton width={88} height={14} />
          </View>
        ) : isFirstRun ? (
          <View
            style={[
              styles.onboardPanel,
              getPremiumCardStyle("medium"),
              {
                backgroundColor: WHITE_SOFT,
                borderColor: launchColors.rgb_255_255_255_0_22,
              },
            ]}
          >
            <Text variant="h4" color={theme.colors.text.inverse}>
              Welcome to VEX
            </Text>
            <Text variant="bodySmall" color={WHITE_MUTED}>
              Build your first streak, earn your first XP, and watch this space
              turn into your daily focus snapshot.
            </Text>
          </View>
        ) : (
          <>
            <FocusRing
              progressPercent={progressPercent}
              focusMinutes={todayFocusMinutes}
            />
            <Text variant="label" color={WHITE_MUTED}>
              Daily Goal
            </Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = createSheet({
  eyebrow: { textTransform: "uppercase", letterSpacing: 1.2 },
  focusValue: { fontSize: 42, fontWeight: "800", lineHeight: 48 },
  hero: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    gap: 16,
  },
  heroColumn: { flex: 1 },
  heroRight: { alignItems: "center", justifyContent: "center", minWidth: 148 },
  onboardPanel: { borderWidth: 1, gap: 8, padding: 16 },
});
