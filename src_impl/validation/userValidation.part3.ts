

export const validateUserPermissions = (data: UserPermissionData): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.permissions || data.permissions.length === 0) {
    warnings.push('User has no permissions assigned');
  }

  if (!data.roles || data.roles.length === 0) {
    warnings.push('User has no roles assigned');
  }

  if (!data.accessLevel) {
    errors.push('Access level is required');
  }

  const validAccessLevels = ['guest', 'user', 'moderator', 'admin', 'super_admin'];
  if (data.accessLevel && !validAccessLevels.includes(data.accessLevel)) {
    errors.push('Invalid access level');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateUserId = (userId: string): UserValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!userId) {
    errors.push('User ID is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof userId !== 'string') {
    errors.push('User ID must be a string');
  }

  if (userId.length < 1) {
    errors.push('User ID cannot be empty');
  }

  if (userId.length > 100) {
    errors.push('User ID is too long');
  }

  // Check for valid UUID format or custom ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customIdRegex = /^[a-zA-Z0-9_-]+$/;

  if (!uuidRegex.test(userId) && !customIdRegex.test(userId)) {
    warnings.push('User ID format is unusual');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};