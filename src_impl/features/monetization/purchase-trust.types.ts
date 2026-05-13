export interface PurchaseVerification {
    verified: boolean;
    transactionId: string;
    productId: string;
    tier: string;
    purchaseDate: number;
    expiryDate?: number;
    isTrial: boolean;
    platform: 'ios' | 'android' | 'web';
}

export interface TrustSignalConfig {
    id: TrustSignal;
    icon: string;
    title: string;
    description: string;
    priority: number;
}

export type TrustSignal = 'secure_payment' | 'money_back_guarantee' | 'no_hidden_fees' | 'cancel_anytime' | 'encrypted_transaction' | 'verified_reviews';
export type PurchaseReceipt = z.infer<typeof PurchaseReceiptSchema>;
