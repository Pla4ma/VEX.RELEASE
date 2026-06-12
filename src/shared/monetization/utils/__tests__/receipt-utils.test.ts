import {
  verifyReceiptSignature,
  parseReceipt,
} from '../utils/receipt-utils';

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

describe('receipt-utils', () => {
  describe('verifyReceiptSignature', () => {
    it('validates iOS receipt format', () => {
      const validIos = 'A'.repeat(101);
      expect(verifyReceiptSignature(validIos, 'ios')).toBe(true);
    });

    it('rejects short iOS receipt', () => {
      expect(verifyReceiptSignature('abc', 'ios')).toBe(false);
    });

    it('rejects iOS receipt with invalid chars', () => {
      expect(verifyReceiptSignature('!!!' + 'A'.repeat(100), 'ios')).toBe(false);
    });

    it('validates Android receipt with orderId and purchaseToken', () => {
      const validAndroid = JSON.stringify({ orderId: 'GPA.123', purchaseToken: 'tok-abc' });
      expect(verifyReceiptSignature(validAndroid, 'android')).toBe(true);
    });

    it('rejects Android receipt missing orderId', () => {
      const invalid = JSON.stringify({ purchaseToken: 'tok-abc' });
      expect(verifyReceiptSignature(invalid, 'android')).toBe(false);
    });

    it('rejects Android receipt missing purchaseToken', () => {
      const invalid = JSON.stringify({ orderId: 'GPA.123' });
      expect(verifyReceiptSignature(invalid, 'android')).toBe(false);
    });

    it('rejects invalid JSON for Android', () => {
      expect(verifyReceiptSignature('not-json', 'android')).toBe(false);
    });

    it('validates Stripe receipt format', () => {
      expect(verifyReceiptSignature('pi_123456789012345678901234', 'stripe')).toBe(true);
    });

    it('rejects short Stripe receipt', () => {
      expect(verifyReceiptSignature('pi_short', 'stripe')).toBe(false);
    });

    it('rejects Stripe receipt without pi_ prefix', () => {
      expect(verifyReceiptSignature('ch_123456789012345678901234', 'stripe')).toBe(false);
    });

    it('returns false for unknown platform', () => {
      expect(verifyReceiptSignature('anything', 'unknown')).toBe(false);
    });
  });

  describe('parseReceipt', () => {
    it('parses Android receipt as JSON', () => {
      const receipt = JSON.stringify({ orderId: 'GPA.123', purchaseToken: 'tok-abc' });
      const result = parseReceipt(receipt, 'android');
      expect(result).toEqual({ orderId: 'GPA.123', purchaseToken: 'tok-abc' });
    });

    it('parses Stripe receipt as JSON', () => {
      const receipt = JSON.stringify({ id: 'pi_123', amount: 999 });
      const result = parseReceipt(receipt, 'stripe');
      expect(result).toEqual({ id: 'pi_123', amount: 999 });
    });

    it('wraps iOS receipt in raw object', () => {
      const result = parseReceipt('base64data', 'ios');
      expect(result).toEqual({ raw: 'base64data' });
    });

    it('returns null for invalid JSON on Android', () => {
      const result = parseReceipt('not-json', 'android');
      expect(result).toBeNull();
    });

    it('returns null for unknown platform', () => {
      const result = parseReceipt('data', 'unknown');
      expect(result).toBeNull();
    });
  });
});
