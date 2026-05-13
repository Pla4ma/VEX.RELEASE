/**
 * User Validation Layer
 *
 * Comprehensive validation for user-related data including authentication,
 * profile information, permissions, and user management operations.
 */
export interface UserValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface UserRegistrationData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
}

export interface UserProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    preferences?: {
        theme?: string;
        language?: string;
        notifications?: boolean;
        };
}

export interface UserPermissionData {
    userId: string;
    permissions: string[];
    roles: string[];
    accessLevel: string;
}
