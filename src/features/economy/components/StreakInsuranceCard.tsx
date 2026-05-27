import React from "react";
import { View, Text } from "react-native";
import type { InsuranceStatus } from "../StreakInsurance";

type Props = {
  status: InsuranceStatus | null;
  isLoading?: boolean;
  error?: Error | null;
  currentStreakDays?: number;
  gemBalance?: number;
  onPurchase?: () => void;
  isPurchasing?: boolean;
  purchaseError?: Error | null;
};

export function StreakInsuranceCard({
  status,
  isLoading,
  error,
  onPurchase,
}: Props): React.ReactElement {
  const hasStatus = status ?? { isInsured: false, daysRemaining: 0 };
  return (
    <View
      accessibilityLabel="Streak protection status"
      style={{ padding: 12, borderRadius: 8, backgroundColor: "#1a1a2e" }}
    >
      <Text style={{ color: "#aaaacc", fontSize: 13 }}>
        {hasStatus.isInsured
          ? `Protected for ${hasStatus.daysRemaining} days`
          : "Streak protection available"}
      </Text>
    </View>
  );
}
