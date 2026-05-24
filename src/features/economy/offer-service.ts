/**
 * Offer Service
 * Limited-time offers and promotions
 */

import * as repository from './repository';
import * as analytics from './analytics';
import {
  CheckOfferEligibilityInputSchema,
  type CheckOfferEligibilityInput,
  type LimitedOffer,
  type UserOfferClaim,
} from './schemas';

/**
 * Get active offers for a user
 */
export async function getActiveOffers(userLevel: number): Promise<LimitedOffer[]> {
  return repository.fetchActiveOffers(userLevel);
}

/**
 * Check if user is eligible for an offer
 */
export async function checkOfferEligibility(
  input: CheckOfferEligibilityInput
): Promise<{ eligible: boolean; reason: string | null }> {
  const validated = CheckOfferEligibilityInputSchema.parse(input);

  const offer = await repository.fetchOfferById(validated.offerId);

  if (!offer) {
    return { eligible: false, reason: 'Offer not found' };
  }

  if (offer.status !== 'ACTIVE') {
    return { eligible: false, reason: 'Offer not active' };
  }

  const now = Date.now();
  if (now < offer.startAt || now > offer.endAt) {
    return { eligible: false, reason: 'Offer expired' };
  }

  if (validated.userLevel < offer.minLevel) {
    return { eligible: false, reason: `Requires level ${offer.minLevel}` };
  }

  if (offer.maxLevel && validated.userLevel > offer.maxLevel) {
    return { eligible: false, reason: `Maximum level ${offer.maxLevel} exceeded` };
  }

  const missingRequired = offer.requiredItems.filter(
    itemId => !validated.ownedItemIds.includes(itemId)
  );
  if (missingRequired.length > 0) {
    return { eligible: false, reason: 'Missing required items' };
  }

  const hasExcluded = offer.excludedItems.some(
    itemId => validated.ownedItemIds.includes(itemId)
  );
  if (hasExcluded) {
    return { eligible: false, reason: 'Already owns excluded items' };
  }

  const existingClaim = await repository.checkUserOfferClaim(validated.offerId, validated.userId);
  if (existingClaim) {
    return { eligible: false, reason: 'Already claimed' };
  }

  if (offer.maxPurchases && offer.currentPurchases >= offer.maxPurchases) {
    return { eligible: false, reason: 'Sold out' };
  }

  return { eligible: true, reason: null };
}

/**
 * Claim an offer
 */
export async function claimOffer(
  offerId: string,
  userId: string,
  purchaseId: string
): Promise<UserOfferClaim> {
  const claim = await repository.createUserOfferClaim({
    offerId,
    userId,
    purchaseId,
    claimedAt: Date.now(),
  });

  await repository.incrementOfferPurchases(offerId);
  analytics.trackOfferClaimed(userId, offerId, purchaseId);

  return claim;
}
