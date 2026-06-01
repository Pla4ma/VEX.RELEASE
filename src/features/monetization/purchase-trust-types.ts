import { z } from 'zod';

const PurchaseTierSchema = z.enum(['free', 'plus', 'premium']);
const PurchasePlatformSchema = z.enum(['ios', 'android', 'web']);

export const PurchaseReceiptSchema = z.object({
  transactionId: z.string().min(1),
  productId: z.string().min(1),
  tier: PurchaseTierSchema,
  purchaseDate: z.number(),
  expiryDate: z.number().optional(),
  isTrial: z.boolean(),
  platform: PurchasePlatformSchema,
  receiptData: z.string().min(1),
});

export const PurchaseVerificationSchema = z.object({
  verified: z.boolean(),
  transactionId: z.string(),
  productId: z.string(),
  tier: PurchaseTierSchema,
  purchaseDate: z.number(),
  expiryDate: z.number().optional(),
  isTrial: z.boolean(),
  platform: PurchasePlatformSchema,
  errorReason: z.string().optional(),
});

export type PurchaseReceipt = z.infer<typeof PurchaseReceiptSchema>;
export type PurchaseVerification = z.infer<typeof PurchaseVerificationSchema>;

export type TrustSignal =
  | 'secure_payment'
  | 'money_back_guarantee'
  | 'no_hidden_fees'
  | 'cancel_anytime'
  | 'encrypted_transaction'
  | 'verified_reviews';

export interface TrustSignalConfig {
  id: TrustSignal;
  icon: string;
  title: string;
  description: string;
  priority: number;
}

export class PurchaseTrustError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PurchaseTrustError';
  }
}

export const TRUST_SIGNALS: TrustSignalConfig[] = [
  {
    id: 'secure_payment',
    icon: 'shield-check',
    title: 'Secure Payment',
    description: 'Protected by App Store and Play billing.',
    priority: 1,
  },
  {
    id: 'cancel_anytime',
    icon: 'x-circle',
    title: 'Cancel Anytime',
    description: 'Manage subscriptions from your store account.',
    priority: 2,
  },
  {
    id: 'money_back_guarantee',
    icon: 'refresh-cw',
    title: '7-Day Guarantee',
    description: 'Refund support follows store policy.',
    priority: 3,
  },
  {
    id: 'no_hidden_fees',
    icon: 'eye',
    title: 'No Hidden Fees',
    description: 'The store checkout shows the final price.',
    priority: 4,
  },
];
