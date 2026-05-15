import React from "react";
import { ScrollView } from "react-native";
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Box } from "../../components/primitives/Box";
import { Button } from "../../components/primitives/Button";
import { Text } from "../../components/primitives/Text";

import { SessionStartStatusCard } from "../../features/session-start/components/SessionStartStatusCard";
import { SessionStakesBriefing } from "../../features/session-start/components/SessionStakesBriefing";
import type { SessionDifficulty } from "../../features/session-start/components/DifficultySelector";
import { useSessionStartController } from "../../features/session-start/hooks";
import { SessionMode } from "../../session/modes";
import { ThemeShopModal } from "../../features/themes/ThemeShopModal";
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from "../../navigation/types";
import type { ActiveStudyPlan } from "../../features/content-study/hooks";
import { SessionQuickStartCard } from "./SessionQuickStartCard";
import { SessionContractInput } from "./components/SessionContractInput";
import { SessionSetupCustomizationSection } from "./components/SessionSetupCustomizationSection";
import { SessionSetupDifficultyCard } from "./components/SessionSetupDifficultyCard";
import { SessionSetupFooter } from "./components/SessionSetupFooter";
import { SessionSetupHeader } from "./components/SessionSetupHeader";
import { SessionSetupInsuranceCard } from "./components/SessionSetupInsuranceCard";
import { SessionSetupStudyPlanCard } from "./components/SessionSetupStudyPlanCard";
import { useSessionSetupStakes } from "./hooks/useSessionSetupStakes";
import { useInsuranceStatus, useBalance } from "../../features/economy/hooks";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;
type SessionSetupRouteProp = RouteProp<SessionStackParams, "SessionSetup">;

export const SessionSetupScreen = withScreenErrorBoundary(
  function _SessionSetupScreen(): React.JSX.Element {
    const navigation = useNavigation<SessionNavigationProp>();
    const route = useRoute<SessionSetupRouteProp>();
    const [contractText, setContractText] = React.useState("");
    const controller = useSessionStartController({
      navigation,
      routeParams: route.params,
      focusContractText: contractText.trim().length >= 3 ? contractText : null,
    });

    const [selectedDifficulty, setSelectedDifficulty] =
      React.useState<SessionDifficulty>("FOCUSED");
    const [insurancePromptDismissed, setInsurancePromptDismissed] =
      React.useState(false);
    const { status: insuranceStatus } = useInsuranceStatus(
      controller.userId ?? undefined,
    );
    const { data: coinBalance } = useBalance(controller.userId ?? "", "COINS");
    const shouldShowInsurancePrompt = React.useMemo(() => {
      const streakDays = controller.streak?.currentDays ?? 0;
      const hasInsurance = insuranceStatus?.hasActiveInsurance ?? false;
      return streakDays >= 3 && !hasInsurance && !insurancePromptDismissed;
    }, [
      controller.streak?.currentDays,
      insuranceStatus?.hasActiveInsurance,
      insurancePromptDismissed,
    ]);

    const stakes = useSessionSetupStakes({
      currentStreakDays: controller.streak?.currentDays ?? null,
      selectedDurationSeconds: controller.selectedDurationSeconds,
      userId: controller.userId || "",
    });

    const handleStudyPlanSelect = (studyPlan: ActiveStudyPlan) => {
      // Auto-select STUDY mode
      controller.setupState.setSelectedSessionMode(SessionMode.STUDY);
      // Set custom duration from study plan
      controller.setupState.setCustomDuration(studyPlan.remainingMinutes);
      // Expand customization to show the selection
      controller.setupState.setShowCustomization(true);
    };

    if (!controller.userId) {
      return (
        <Box
          flex={1}
          bg="background.primary"
          justifyContent="center"
          alignItems="center"
          p="lg"
        >
          <Text variant="h4" color="error.DEFAULT" mb="md">
            Not authenticated
          </Text>
          <Button
            variant="primary"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
          >
            Go Back
          </Button>
        </Box>
      );
    }

    return (
      <Box flex={1} bg="background.primary">
        <SessionSetupHeader
          durationSeconds={controller.selectedDurationSeconds}
          mode={controller.setupState.selectedSessionMode}
          onBack={() => navigation.goBack()}
          userId={controller.userId}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <SessionStartStatusCard
            offlineMessage={controller.offlineMessage}
            routeWarningMessage={controller.parsedRoute.warningMessage}
            startErrorMessage={controller.startError}
            onDismissStartError={controller.clearStartError}
          />

          <SessionSetupStudyPlanCard
            studyPlan={controller.activeStudyPlan.data ?? null}
            onSelect={handleStudyPlanSelect}
          />

          <SessionQuickStartCard
            ctaLabel={controller.sessionSummary.ctaLabel}
            customizationLabel={controller.sessionSummary.customizationLabel}
            currentThemeName={controller.selectedTheme.name}
            durationMinutes={Math.round(
              controller.selectedDurationSeconds / 60,
            )}
            heroBody={controller.sessionHero.body}
            heroEyebrow={controller.sessionHero.eyebrow}
            heroTitle={controller.sessionHero.title}
            hasCustomizations={controller.setupState.showCustomization}
            isStarting={controller.isStarting}
            onCustomize={() =>
              controller.setupState.setShowCustomization((current) => !current)
            }
            onStart={() => void controller.handleStartSession()}
            presetName={controller.setupState.selectedPreset.name}
            smartSuggestion={controller.setupState.smartSuggestion}
            subtitle={controller.sessionSummary.subtitle}
            contractInput={
              <SessionContractInput
                disabled={controller.isStarting}
                onChangeText={setContractText}
                value={contractText}
              />
            }
          />
          <Box px="lg" mt="md">
            <SessionStakesBriefing
              bossStake={stakes.bossStake}
              streakStake={stakes.streakStake}
              challengeStake={stakes.challengeStake}
              rivalStake={stakes.rivalStake}
              onStakePress={(stakeId) => {
                if (stakeId === "boss") {
                  navigation.navigate("Boss");
                }
                if (stakeId === "streak") {
                  navigation.navigate("Main", { screen: "Progress" });
                }
                if (stakeId === "challenge") {
                  navigation.navigate("Challenges");
                }
                if (stakeId === "rival") {
                  navigation.navigate("Main", { screen: "Home" });
                }
              }}
            />
          </Box>

          <SessionSetupInsuranceCard
            coinBalance={coinBalance ?? 0}
            navigation={navigation}
            setShopTheme={controller.setShopTheme}
            shouldShow={shouldShowInsurancePrompt}
            streakDays={controller.streak?.currentDays ?? 0}
            onDismiss={() => setInsurancePromptDismissed(true)}
          />

          <SessionSetupDifficultyCard
            disabled={controller.isStarting}
            selected={selectedDifficulty}
            selectedDurationSeconds={controller.selectedDurationSeconds}
            onChange={setSelectedDifficulty}
          />

          <SessionSetupCustomizationSection
            controller={controller}
            routeParams={route.params}
          />

          <Box height={120} />
        </ScrollView>

        {controller.setupState.showCustomization ? (
          <SessionSetupFooter
            breakDurationSeconds={
              controller.setupState.selectedPreset.breakDuration
            }
            durationMinutes={Math.round(
              controller.selectedDurationSeconds / 60,
            )}
            intervalCount={controller.setupState.selectedPreset.intervals}
            isStarting={controller.isStarting}
            onStart={() => void controller.handleStartSession()}
            selectedSessionMode={controller.setupState.selectedSessionMode}
            selectedThemeLabel={
              controller.selectedThemeOwned
                ? controller.selectedTheme.name
                : null
            }
          />
        ) : null}

        <ThemeShopModal
          userId={controller.userId}
          isVisible={controller.shopTheme !== null}
          theme={controller.shopTheme}
          streak={controller.streak ?? null}
          onClose={() => controller.setShopTheme(null)}
          onPurchased={controller.setupState.setSelectedThemeId}
          onGetCoins={() => controller.setShopTheme(null)}
        />
      </Box>
    );
  },
  "Session Setup",
);

export default SessionSetupScreen;
