import {
  ContentStudyEligibilityResponseSchema,
  type ContentStudyEligibility,
} from './schemas';
import { fetchContentStudyEligibility } from './repository';

export async function getContentStudyEligibility(): Promise<ContentStudyEligibility> {
  const response = await fetchContentStudyEligibility();
  return ContentStudyEligibilityResponseSchema.parse(response);
}
