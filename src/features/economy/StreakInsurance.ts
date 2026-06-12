// ARCH-04: Economy currency system disabled. All functions return stub values.
// Re-enable by implementing StreakInsurance.ts with real Supabase RPCs.
export interface StreakInsuranceStatus {
  isInsured: boolean;
  daysRemaining: number;
  success?: boolean;
  restoredDays?: number;
}

export interface ConsumeInsuranceInput {
  userId: string;
  insuranceId: string;
}

export function getInsuranceStatus(): StreakInsuranceStatus {
  return { isInsured: false, daysRemaining: 0 };
}

export async function consumeInsurance(
  _input: ConsumeInsuranceInput,
): Promise<StreakInsuranceStatus> {
  return {
    isInsured: false,
    daysRemaining: 0,
    success: false,
    restoredDays: 0,
  };
}

export type InsuranceStatus = StreakInsuranceStatus;
