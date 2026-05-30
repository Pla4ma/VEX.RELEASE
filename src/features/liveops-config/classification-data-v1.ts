import type { FeatureClassificationEntry } from "./final-release-classification";

export const LEGACY: FeatureClassificationEntry[] = [
  {
    systemId: "features_tests",
    folder: "__tests__",
    status: "test_or_legacy",
    routeAllowed: false,
    homeAllowed: false,
    queryAllowed: false,
    subscriptionAllowed: false,
    notificationAllowed: false,
    completionAllowed: false,
    premiumCopyAllowed: false,
    appStoreCopyAllowed: false,
    notes: "Cross-feature test directory.",
  },
];
