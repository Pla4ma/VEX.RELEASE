import type {
  DeepLinkHandlers,
  DeepLinkPath,
  ParsedDeepLink,
} from "./deep-link-types";

import { parseDeepLink } from "./deep-links";
import { deepLinkToNavigationParams } from "./deep-link-routing";

export function generateDeepLink(
  path: DeepLinkPath,
  params?: Record<string, string>,
): string {
  const baseUrl = "vex://";
  const paramString = params
    ? Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")
    : "";

  return paramString ? `${baseUrl}${path}?${paramString}` : `${baseUrl}${path}`;
}

export function generateInviteLink(squadId: string, code: string): string {
  return `https://vex.app/invite/squad/${squadId}?code=${code}`;
}

export function generateSessionShareLink(sessionId: string): string {
  return `https://vex.app/session/${sessionId}`;
}

export function generateProfileShareLink(userId: string): string {
  return `https://vex.app/profile/${userId}`;
}

export function validateInviteCode(code: string): boolean {
  const pattern = /^[A-Z0-9]{8}$/;
  return pattern.test(code);
}

export function handleDeepLinkWithFallback(
  url: string,
  handlers: DeepLinkHandlers,
  featureFlags?: Record<string, boolean>,
): void {
  const result: ParsedDeepLink = parseDeepLink(url);
  if (!result.valid) {
    handlers.onInvalid(result.error ?? "Unknown error");
    return;
  }
  if (!result.link) {
    handlers.onInvalid("No link data");
    return;
  }

  const navParams = deepLinkToNavigationParams(result.link, featureFlags);
  if (!navParams) {
    handlers.onUnsupported(result.link.path);
    return;
  }

  handlers.onValid(result.link);
}
