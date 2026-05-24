import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { eventBus } from "../../../events";
import { trackCombatAbilityActivated } from "../../../features/boss/analytics";
import {
  BossAttackPatternSchema,
  COMBAT_ABILITIES,
  executeCombatAbility,
  type CombatActionResult,
} from "../../../features/boss/active-combat-system";
import { useTheme } from "../../../theme";
import { useHaptics } from "../../../utils/haptics";
import { useFeatureAccess } from "../../../features/liveops-config";
import { getFeatureAvailability } from "../../../features/liveops-config/feature-availability";
import { BossCombatHUDView } from "./BossCombatHUDView";
import { ATTACK_NAMES, type BossCombatHUDProps } from "./BossCombatHUDConfig";

export function BossCombatHUD({
  encounterId,
  userId,
  isPaused,
  displayPolicy,
  userStreakDays = 0,
  bossHealth = 100,
  bossMaxHealth = 100,
  currentPhase = "CALM",
  currentAttackPattern,
}: BossCombatHUDProps): JSX.Element | null {
  if (!displayPolicy.showBossHUD) {
    return null;
  }

  const featureAccess = useFeatureAccess();
  const bossAvail = getFeatureAvailability(featureAccess.features.boss_tab);
  if (!bossAvail.canRenderEntryPoint || !bossAvail.canQuery) {
    return null;
  }

  const { theme } = useTheme();
  const haptics = useHaptics();
  const [cooldownEnd, setCooldownEnd] = useState<number>(0);
  const [lastResult, setLastResult] = useState<CombatActionResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const cooldownProgress = useSharedValue(0);
  const phaseColors = useMemo(
    () => ({
      CALM: theme.colors.info.DEFAULT,
      AGITATED: theme.colors.warning.DEFAULT,
      ENRAGED: theme.colors.error.DEFAULT,
      DESPERATE: theme.colors.accent.purple,
    }),
    [theme],
  );
  const phaseColor = phaseColors[currentPhase];
  const healthPercent = Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100));
  const availableAbility = useMemo(() => {
    const match = COMBAT_ABILITIES.find(
      (ability) =>
        userStreakDays >= ability.requiresStreak &&
        ability.focusEnergyCost <= 50 &&
        ability.cooldownSeconds <= 15,
    );
    if (match) {
      return match;
    }
    const first = COMBAT_ABILITIES[0];
    if (first === undefined) {
      throw new Error("COMBAT_ABILITIES must not be empty");
    }
    return first;
  }, [userStreakDays]);

  useEffect(() => {
    const now = Date.now();
    cooldownProgress.value =
      cooldownEnd > now ? withTiming(1, { duration: cooldownEnd - now }) : 0;
  }, [cooldownEnd, cooldownProgress]);

  const cooldownStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cooldownProgress.value, [0, 1], [1, 0.5], Extrapolation.CLAMP),
  }));

  const handleActivateAbility = useCallback(() => {
    const now = Date.now();
    if (now < cooldownEnd) {
      haptics.error();
      return;
    }
    haptics.medium();
    const parsedAttackPattern = BossAttackPatternSchema.safeParse(currentAttackPattern);
    const result = executeCombatAbility(
      {
        id: encounterId,
        userId,
        bossId: "active-boss",
        bossName: "Active Boss",
        bossAvatarUrl: null,
        bossMaxHealth,
        bossCurrentHealth: bossHealth,
        currentPhase,
        currentAttackPattern: parsedAttackPattern.success ? parsedAttackPattern.data : null,
        attackPatternStartedAt: null,
        attackPatternDurationMs: 30000,
        userMaxFocusEnergy: 100,
        userCurrentFocusEnergy: 100,
        userFocusEnergyRegenRate: 1,
        availableAbilities: COMBAT_ABILITIES,
        abilityCooldowns: {},
        encounterStartedAt: now,
        expiresAt: now + 3600000,
        lastUserActionAt: null,
        sessionCount: 1,
        totalDamageDealt: 0,
        attacksDodged: 0,
        attacksHit: 0,
        status: "ACTIVE",
      },
      availableAbility.id,
      userStreakDays,
      now,
    );

    if (!result.success) {
      haptics.error();
      return;
    }
    setCooldownEnd(now + availableAbility.cooldownSeconds * 1000);
    haptics.success();
    setLastResult(result);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    eventBus.publish("boss:ability_activated", {
      userId,
      encounterId,
      abilityId: availableAbility.id,
      damageDealt: result.damageDealt,
      bonusDamage: result.comboBonus > 0 ? Math.floor(result.damageDealt * result.comboBonus) : 0,
      timestamp: now,
    });
    trackCombatAbilityActivated(
      userId,
      encounterId,
      availableAbility.id,
      result.damageDealt,
      result.comboBonus > 0,
    );
  }, [
    availableAbility,
    bossHealth,
    bossMaxHealth,
    cooldownEnd,
    currentAttackPattern,
    currentPhase,
    encounterId,
    haptics,
    userId,
    userStreakDays,
  ]);

  const now = Date.now();
  const isOnCooldown = now < cooldownEnd;
  const cooldownRemaining = Math.ceil((cooldownEnd - now) / 1000);

  return (
    <BossCombatHUDView
      phaseColor={phaseColor}
      healthPercent={healthPercent}
      currentPhase={currentPhase}
      currentAttackPattern={currentAttackPattern}
      attackName={ATTACK_NAMES[currentAttackPattern ?? ""] || "Boss attacking"}
      showToast={showToast && lastResult !== null}
      damageDealt={lastResult?.damageDealt ?? 0}
      comboBonus={lastResult?.comboBonus ?? 0}
      cooldownStyle={cooldownStyle}
      isPaused={isPaused}
      isOnCooldown={isOnCooldown}
      cooldownRemaining={cooldownRemaining}
      abilityLabel={availableAbility.name}
      abilityIcon={availableAbility.icon}
      onActivateAbility={handleActivateAbility}
    />
  );
}
