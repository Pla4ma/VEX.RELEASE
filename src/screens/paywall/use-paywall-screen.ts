import { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { ExtendedRootStackParams } from "../../navigation/types";
import { capture } from "../../shared/analytics";
import {
  usePaywall,
  usePremiumStatus,
  type PurchasesPackageDisplayInfo,
} from "../../shared/monetization";
import {
  PurchaseEvents,
  createPaywallProperties,
} from "../../shared/monetization/purchase-events";
import {
  FEATURE_HIGHLIGHT_MAP,
  buildPackageSelection,
  type PaywallPlanSelection,
} from "./paywall-copy";
import type { PaywallStatusMessage } from "./PaywallStates";

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
export type PaywallRouteParams = ExtendedRootStackParams["Paywall"] & {
  contextBody?: string;
  contextCta?: string;
  contextHeadline?: string;
  lane?: string;
};
type PaywallRouteProp = RouteProp<
  ExtendedRootStackParams & { Paywall: PaywallRouteParams },
  "Paywall"
>;

function isPlanSelection(
  value: PaywallPlanSelection | PurchasesPackageDisplayInfo | undefined,
): value is PaywallPlanSelection {
  return Boolean(value && "packageInfo" in value);
}

export function usePaywallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaywallRouteProp>();
  const { offerings, packages, isLoading, error, purchase, restore, retry } =
    usePaywall();
  const { isPremium, refresh } = usePremiumStatus();
  const [statusMessage, setStatusMessage] =
    useState<PaywallStatusMessage | null>(null);

  const source = route.params?.source ?? "unknown";
  const gatedFeature = route.params?.gatedFeature ?? "premium_access";
  const contextBody = route.params?.contextBody;
  const contextCta = route.params?.contextCta;
  const contextHeadline = route.params?.contextHeadline;
  const lane = route.params?.lane;
  const featureHighlight = FEATURE_HIGHLIGHT_MAP[gatedFeature];
  const hasLivePackages = packages.length > 0;
  const packageSelection = useMemo(
    () => buildPackageSelection(packages),
    [packages],
  );

  useEffect(() => {
    capture(
      PurchaseEvents.PAYWALL_VIEWED,
      createPaywallProperties(
        offerings?.identifier ?? "fallback-offering",
        source,
        packages.map((item) => ({
          identifier: item.identifier,
          hasTrial: Boolean(item.product.introPrice),
        })),
      ),
    );
  }, [offerings?.identifier, packages, source]);

  const handleClose = (): void => {
    capture(PurchaseEvents.PAYWALL_DISMISSED, {
      paywall_source: source,
      gated_feature: gatedFeature,
    });
    navigation.goBack();
  };

  const handlePurchase = async (
    planOrPackage:
      | PaywallPlanSelection
      | PurchasesPackageDisplayInfo
      | undefined,
  ): Promise<void> => {
    setStatusMessage(null);
    const packageInfo = isPlanSelection(planOrPackage)
      ? planOrPackage.packageInfo
      : planOrPackage;

    if (!packageInfo) {
      setStatusMessage({
        tone: "warning",
        title: "Plans are still loading",
        body: "Live purchase options are still being prepared. Give it a moment, then try again.",
      });
      return;
    }

    const result = await purchase(packageInfo);
    if (result.success) {
      await refresh();
      setStatusMessage({
        tone: "celebration",
        title: "Premium is active",
        body: "Your strongest coaching, continuity support, and deeper insights are ready.",
      });
      navigation.goBack();
      return;
    }

    setStatusMessage({
      tone: "warning",
      title: "Purchase did not go through",
      body: "Nothing was charged here in VEX. Please try again, or restore if you already subscribed.",
    });
  };

  const handleRestore = async (): Promise<void> => {
    setStatusMessage({
      tone: "info",
      title: "Checking your purchases",
      body: "We are refreshing your entitlements now.",
    });
    const result = await restore();
    await refresh();
    setStatusMessage(
      result.success
        ? {
            tone: "celebration",
            title: "Purchases restored",
            body: "Your premium entitlements have been refreshed on this device.",
          }
        : {
            tone: "warning",
            title: "Restore did not complete",
            body: "If you already subscribed, try again on a stronger connection or sign in with the same store account.",
          },
    );
  };

  return {
    isPremium,
    isLoading,
    error,
    hasLivePackages,
    statusMessage,
    source,
    gatedFeature,
    contextBody,
    contextCta,
    contextHeadline,
    lane,
    featureHighlight,
    packageSelection,
    offerings,
    setStatusMessage,
    handleClose,
    handlePurchase,
    handleRestore,
    retry,
  };
}
