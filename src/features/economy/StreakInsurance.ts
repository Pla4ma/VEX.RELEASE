export interface StreakInsuranceStatus {
  isInsured: boolean;
  daysRemaining: number;
  success?: boolean;
  restoredDays?: number;
}

export function getInsuranceStatus(): StreakInsuranceStatus {
  return { isInsured: false, daysRemaining: 0 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function consumeInsurance(_input: any): Promise<StreakInsuranceStatus> {
  return Promise.resolve({ isInsured: false, daysRemaining: 0, success: false, restoredDays: 0 });
}

export type InsuranceStatus = StreakInsuranceStatus;
