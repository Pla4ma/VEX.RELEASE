export interface PaywallEventProperties {
    offering_id: string;
    paywall_source: string;
    number_of_packages: number;
    has_free_trial: boolean;
}

export interface PurchaseEventProperties {
    package_id: string;
    offering_id: string;
    product_id: string;
    price: number;
    currency: string;
    is_restore: boolean;
    has_intro_offer: boolean;
    intro_price?: number;
    success: boolean;
    error_code?: string;
    error_message?: string;
    user_id: string;
    timestamp: number;
}

export interface EntitlementEventProperties {
    entitlement_id: string;
    is_active: boolean;
    source: 'purchase' | 'restore' | 'initial' | 'expiration';
    will_renew?: boolean;
    expiration_date?: string;
    product_id?: string;
}

export interface OfferingEventProperties {
    offering_id: string;
    package_count: number;
    available_package_types: string[];
    has_lifetime: boolean;
    has_subscription: boolean;
    error_code?: string;
}

export interface RestoreEventProperties {
    found_entitlements: boolean;
    entitlement_count: number;
    success: boolean;
    error_code?: string;
    error_message?: string;
}
