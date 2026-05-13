// Login credentials validation
// Session validation
// Token validation
// Password reset validation
// Two-factor authentication validation
// Rate limiting validation
// Security headers validation
// IP address validation for security
// Helper function to check if IP is in range (simplified)
function isIPInRange(ip: string, range: string): boolean {
  // This is a simplified implementation
  // In production, use a proper IP range library
  const [network] = range.split('/');
  return ip.startsWith(network.split('.')[0]);
}

export * from "./authValidation.types";
export * from "./authValidation.part1";
export * from "./authValidation.part2";
export * from "./authValidation.part3";
