import { captureSilentFailure } from "../../../utils/silent-failure";

export function verifyReceiptSignature(
  receipt: string,
  platform: string,
): boolean {
  if (platform === "ios") {
    return /^[A-Za-z0-9+/=]+$/.test(receipt) && receipt.length > 100;
  }
  if (platform === "android") {
    try {
      const parsed = JSON.parse(receipt);
      return !!(parsed.orderId && parsed.purchaseToken);
    } catch (error) {
      captureSilentFailure(error, {
        feature: "shared",
        operation: "safe-fallback",
        type: "data",
      });
      return false;
    }
  }
  if (platform === "stripe") {
    return /^pi_[a-zA-Z0-9]{24,}$/.test(receipt);
  }
  return false;
}

export function parseReceipt(
  receipt: string,
  platform: string,
): Record<string, unknown> | null {
  try {
    if (platform === "android" || platform === "stripe") {
      return JSON.parse(receipt);
    }
    if (platform === "ios") {
      return { raw: receipt };
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: "shared",
      operation: "safe-fallback",
      type: "data",
    });
    return null;
  }
  return null;
}
