import { Platform } from "react-native";
import { z, type ZodType } from "zod";
import { CURRENT_CONFIG } from "../constants/app";
import { createDebugger } from "../utils/debug";


export function getApiClient(config?: Partial<ApiConfig>): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}