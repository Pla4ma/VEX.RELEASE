/**
 * Deep Link Handling System
 *
 * Manages URL routing for external links and deep navigation.
 */

export {
  type DeepLinkPath,
  type DeepLink,
  type ParsedDeepLink,
  DeepLinkUrlSchema,
  parseDeepLink,
  isValidDeepLinkPath,
  generateDeepLink,
  generateInviteLink,
  generateSessionShareLink,
  generateProfileShareLink,
} from './deep-link-paths';

export {
  isDeepLinkDisabled,
  deepLinkToNavigationParams,
  handleDeepLinkWithFallback,
} from './deep-link-handlers';

export { validateInviteCode } from './deep-link-guards';

export { deepLinkToNotificationAction } from './notification-routing';
