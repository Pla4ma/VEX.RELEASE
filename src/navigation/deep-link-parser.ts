import * as Sentry from "@sentry/react-native";

import { createDebugger } from "../utils/debug";

import {
  DeepLinkUrlSchema,
  type DeepLink,
  type DeepLinkPath,
  type ParsedDeepLink,
  VALID_DEEP_LINK_PATHS,
} from "./deep-link-types";

const debug = createDebugger("navigation:deep-links");

type NormalizedDeepLinkSource = { host: string; path: string };

function normalizeDeepLinkSource(
  scheme: string,
  host: string,
  path: string,
): NormalizedDeepLinkSource | null {
  if (scheme === "vex") {
    if (host === "session") {
      return { host: "", path: `session/${path}`.replace(/\/$/, "") };
    }
    return { host: "", path: [host, path].filter(Boolean).join("/") };
  }

  if (scheme === "https") {
    return { host, path };
  }

  return null;
}

export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "");
    const host = parsed.hostname;
    const pathname = parsed.pathname.replace(/^\//, "");

    const queryParams: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const normalized = normalizeDeepLinkSource(scheme, host, pathname);
    if (!normalized) {
      return { valid: false, error: "Invalid URL structure" };
    }

    const validated = DeepLinkUrlSchema.safeParse({
      scheme,
      host: normalized.host,
      path: normalized.path,
      queryParams,
    });

    if (!validated.success) {
      return { valid: false, error: "Invalid URL structure" };
    }

    const pathSegments = normalized.path.split("/").filter(Boolean);
    const path = pathSegments[0] as DeepLinkPath | undefined;
    if (!path || !VALID_DEEP_LINK_PATHS.includes(path)) {
      return { valid: false, error: `Unknown path: ${normalized.path}` };
    }

    const params: Record<string, string> = {};
    if (pathSegments.length === 2 && path === "profile") {
      params.userId = pathSegments[1] ?? "";
    } else {
      for (let i = 1; i < pathSegments.length; i += 2) {
        const key = pathSegments[i];
        const value = pathSegments[i + 1] ?? "";
        if (key) {
          params[key] = value;
        }
      }
    }

    const link: DeepLink = {
      path,
      params: { ...params, ...queryParams },
      query: queryParams,
    };

    debug.info("Parsed deep link: %s -> %s", url, path);
    return { valid: true, link };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "deep-links", operation: "parseDeepLink" },
    });
    debug.info("Failed to parse deep link: %s", url);
    return { valid: false, error: "Invalid URL format" };
  }
}
