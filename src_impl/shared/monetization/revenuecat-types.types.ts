export interface RevenueCatConfig {
    iosApiKey: string;
    androidApiKey: string;
    appUserId?: string;
    observerMode?: boolean;
    userDefaultsSuiteName?: string;
    usesStoreKit2IfAvailable?: boolean;
}

export interface PurchaseResult {
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: Error;
    errorCode?: string;
}

export interface OfferingsResult {
    success: boolean;
    offerings?: PurchasesOfferings;
    currentOffering?: PurchasesOffering | null;
    error?: Error;
}

export interface CustomerInfoResult {
    success: boolean;
    customerInfo?: CustomerInfo;
    entitlements: EntitlementInfo[];
    error?: Error;
}

export interface EntitlementInfo {
    identifier: string;
    isActive: boolean;
    willRenew: boolean;
    periodType?: string;
    latestPurchaseDate: string;
    originalPurchaseDate: string;
    expirationDate: string | null;
    store: string;
    productIdentifier: string;
    isSandbox: boolean;
    unsubscribeDetectedAt: string | null;
    billingIssueDetectedAt: string | null;
}

export interface PurchasesPackageDisplayInfo {
    identifier: string;
    packageType: string;
    product: {
        identifier: string;
        description: string;
        title: string;
        price: number;
        priceString: string;
        currencyCode: string;
        introPrice?: {
          price: number;
          priceString: string;
          period: string;
          cycles: number;
          periodUnit: string;
          periodNumberOfUnits: number;
        } | null;
        discounts?: Array<{
          identifier: string;
          price: number;
          priceString: string;
          cycles: number;
          period: string;
          periodUnit: string;
          periodNumberOfUnits: number;
        }>;
        };
}

export interface PurchasesOfferingDisplayInfo {
    identifier: string;
    serverDescription: string;
    metadata: Record<string, unknown>;
    packages: PurchasesPackageDisplayInfo[];
    lifetime?: PurchasesPackageDisplayInfo | null;
    annual?: PurchasesPackageDisplayInfo | null;
    sixMonth?: PurchasesPackageDisplayInfo | null;
    threeMonth?: PurchasesPackageDisplayInfo | null;
    twoMonth?: PurchasesPackageDisplayInfo | null;
    monthly?: PurchasesPackageDisplayInfo | null;
    weekly?: PurchasesPackageDisplayInfo | null;
}

export interface RevenueCatError extends Error {
    code: RevenueCatErrorCode;
    message: string;
    name: 'RevenueCatError';
    underlyingError?: Error;
}

export interface PurchaseAnalyticsProperties {
    package_id?: string;
    offering_id?: string;
    product_id?: string;
    price?: number;
    currency?: string;
    error_code?: string;
    error_message?: string;
    restore?: boolean;
}

export interface EntitlementAnalyticsProperties {
    entitlement_id: string;
    is_active: boolean;
    source?: 'purchase' | 'restore' | 'initial';
}

export interface UseRevenueCatState {
    isInitialized: boolean;
    isReady: boolean;
    status: RevenueCatStatus;
    offerings: PurchasesOfferingDisplayInfo | null;
    availablePackages: PurchasesPackageDisplayInfo[];
    hasOfferings: boolean;
    customerInfo: CustomerInfo | null;
    activeEntitlements: EntitlementInfo[];
    isPremium: boolean;
    isLoadingOfferings: boolean;
    isLoadingCustomer: boolean;
    isPurchasing: boolean;
    isRestoring: boolean;
    offeringsError: RevenueCatError | null;
    customerError: RevenueCatError | null;
    purchaseError: RevenueCatError | null;
    refreshOfferings: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
    purchasePackage: (packageInfo: PurchasesPackageDisplayInfo) => Promise<PurchaseResult>;
    restorePurchases: () => Promise<PurchaseResult>;
    identifyUser: (userId: string) => Promise<boolean>;
    logoutUser: () => Promise<boolean>;
    retry: () => Promise<void>;
}
