import { captureSilentFailure } from "../utils/silent-failure";
import type { LocalAuthenticationModule } from "./auth-types";

let LocalAuthentication: LocalAuthenticationModule | null = null;

try {
  LocalAuthentication = require("expo-local-authentication") as LocalAuthenticationModule;
} catch (error) {
  captureSilentFailure(error, {
    feature: "services",
    operation: "network-fallback",
    type: "network",
  });
}

export async function checkLocalBiometricAvailability(): Promise<boolean> {
  if (!LocalAuthentication) {
    return false;
  }
  const available = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return available && enrolled;
}

export async function authenticateLocally(promptMessage: string): Promise<boolean> {
  if (!LocalAuthentication) {
    return false;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "Use passcode",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });
  return result.success;
}
