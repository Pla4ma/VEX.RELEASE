import { useState } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ExtendedRootStackParams } from "@/navigation/types";
import { capture } from "../../analytics";
import { PurchaseEvents } from "../purchase-events";
import type { PurchasesPackageDisplayInfo } from "../revenuecat-types";
import type { PaywallPlan, PaywallStatusMessage } from "./paywall-data";

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface UsePaywallActionsArgs {
  navigation: NavigationProp;
  source: string;
  isPremium: boolean;
  selectedPlan: PaywallPlan;
  premiumPackages: { annual: PurchasesPackageDisplayInfo | undefined; monthly: PurchasesPackageDisplayInfo | undefined };
  purchase: (pkg: PurchasesPackageDisplayInfo) => Promise<{ success: boolean }>;
  restore: () => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

interface UsePaywallActionsResult {
  statusMessage: PaywallStatusMessage | null;
  setStatusMessage: (msg: PaywallStatusMessage | null) => void;
  handleClose: () => void;
  handlePurchase: () => Promise<void>;
  handleRestore: () => Promise<void>;
}

export function usePaywallActions({
  navigation,
  source,
  isPremium,
  selectedPlan,
  premiumPackages,
  purchase,
  restore,
  refresh,
}: UsePaywallActionsArgs): UsePaywallActionsResult {
  const [statusMessage, setStatusMessage] =
    useState<PaywallStatusMessage | null>(null);

  const handleClose = (): void => {
    capture(PurchaseEvents.PAYWALL_DISMISSED, {
      paywall_source: source,
      gated_feature: "premium_subscription",
    });
    navigation.goBack();
  };

  const handlePurchase = async (): Promise<void> => {
    const selectedPackage =
      selectedPlan === "annual"
        ? premiumPackages.annual
        : premiumPackages.monthly;
    if (!selectedPackage) {
      setStatusMessage({
        tone: "warning",
        title: "Plans loading",
        body: "Premium options are still loading. Please wait a moment.",
      });
      return;
    }

    const result = await purchase(selectedPackage);
    if (result.success) {
      await refresh();
      setStatusMessage({
        tone: "celebration",
        title: "Premium is active",
        body: "Deeper coach memory, reports, and progress intelligence are active.",
      });
      navigation.goBack();
      return;
    }

    setStatusMessage({
      tone: "warning",
      title: "Purchase not completed",
      body: "Purchase didn't go through. Your card was not charged.",
    });
  };

  const handleRestore = async (): Promise<void> => {
    setStatusMessage({
      tone: "info",
      title: "Restoring purchases",
      body: "Checking for existing Premium subscription.",
    });
    const result = await restore();
    await refresh();
    setStatusMessage(
      result.success
        ? {
            tone: "celebration",
            title: "Purchases restored",
            body: isPremium
              ? "Your Premium status is active."
              : "No active subscriptions found.",
          }
        : {
            tone: "warning",
            title: "Restore failed",
            body: "Try again with a stronger connection.",
          },
    );
  };

  return {
    statusMessage,
    setStatusMessage,
    handleClose,
    handlePurchase,
    handleRestore,
  };
}
