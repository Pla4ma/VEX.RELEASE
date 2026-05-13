/**
 * Validation Index
 *
 * Central export point for all validation layers and utilities.
 */

// User validation
export {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validatePhone,
  validateDateOfBirth,
  validateUserRegistration,
  validateUserProfile,
  validateUserPermissions,
  validateUserId,
  type UserValidationResult,
  type UserRegistrationData,
  type UserProfileData,
  type UserPermissionData,
} from './userValidation';

// Authentication validation
export {
  validateLoginCredentials,
  validateSession,
  validateToken,
  validatePasswordReset,
  validateTwoFactor,
  validateRateLimit,
  validateSecurityHeaders,
  validateIPAddress,
  type AuthValidationResult,
  type LoginCredentials,
  type SessionData,
  type TokenData,
  type PasswordResetData,
  type TwoFactorData,
} from './authValidation';

// Data validation
export {
  validateString,
  validateNumber,
  validateBoolean,
  validateDate,
  validateArray,
  validateObject,
  validateEmail as validateEmailData,
  validateURL as validateURLData,
  validateUUID,
  validateJSON,
  validatePhoneNumber,
  validateCreditCard,
  type DataValidationResult,
  type ValidationRule,
  type ValidationSchema,
} from './dataValidation';

// API validation
export {
  validateHTTPMethod,
  validateURL as validateURLAPI,
  validateHeaders,
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
  validateAPIRequest,
  validateAPIResponse,
  validateRateLimit as validateAPIRateLimit,
  type APIValidationResult,
  type APIRequest,
  type APIResponse,
  type APIEndpoint,
} from './apiValidation';

// Form validation
export {
  validateFormField,
  validateForm,
  validateFormState,
  validateFormSubmission,
  validateFieldDependencies,
  validateFormProgress,
  validateMultiStepForm,
  validateDynamicForm,
  type FormValidationResult,
  type FormField,
  type FormConfig,
} from './formValidation';

// Security validation
export {
  validateXSS,
  validateSQLInjection,
  validateCSRF,
  sanitizeInput,
  validateFileUpload,
  validateRateLimit as validateSecurityRateLimit,
  validateIPAddressSecurity,
  validateSecurity,
  type SecurityValidationResult,
  type SecurityConfig,
} from './securityValidation';

// Business validation
export {
  validateECommerceOrder,
  validateFinancialTransaction,
  validateHealthcareAppointment,
  validateRealEstateListing,
  validateEducationEnrollment,
  validateBusinessRules,
  type BusinessValidationResult,
  type BusinessRule,
  type BusinessContext,
} from './businessValidation';

// Performance validation
export {
  validateResponseTime,
  validateThroughput,
  validateCPUUsage,
  validateMemoryUsage,
  validateDiskUsage,
  validateNetworkLatency,
  validateErrorRate,
  validateAvailability,
  validatePerformance,
  defaultThresholds,
  type PerformanceValidationResult,
  type PerformanceMetrics,
  type PerformanceThresholds,
} from './performanceValidation';

// Combined validation utilities
// Validation constants
// Validation error codes
// Validation utilities
export * from "./validationIndex.part1";
export * from "./validationIndex.part2";
