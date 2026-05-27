/**
 * String Utilities
 *
 * String manipulation and formatting helpers.
 */

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 */
export function titleCase(str: string): string {
  if (!str) {
    return "";
  }
  return str
    .split(" ")
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Remove whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, "");
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Camel case to kebab case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Kebab case to camel case
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^./, (char) => char.toLowerCase());
}

/**
 * Generate random string
 */
export function randomString(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Mask string (e.g., credit card)
 */
export function maskString(str: string, visible = 4, mask = "*"): string {
  if (str.length <= visible) {
    return str;
  }
  const maskedLength = str.length - visible;
  return mask.repeat(maskedLength) + str.slice(-visible);
}

/**
 * Extract initials from name
 */
export function getInitials(name: string): string {
  if (!name) {
    return "";
  }
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}
