import type {
  AuthValidationResult,
  SessionData,
  TokenData,
} from "./authValidationTypes";

export const validateSession = (session: SessionData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (!session.sessionId) {
    errors.push("Session ID is required");
  } else if (
    typeof session.sessionId !== "string" ||
    session.sessionId.length < 10
  ) {
    errors.push("Invalid session ID format");
  }
  if (!session.userId) {
    errors.push("User ID is required");
  } else if (typeof session.userId !== "string" || session.userId.length < 1) {
    errors.push("Invalid user ID format");
  }
  if (!session.token) {
    errors.push("Access token is required");
  } else if (typeof session.token !== "string" || session.token.length < 20) {
    errors.push("Invalid token format");
  }
  if (!session.expiresAt) {
    errors.push("Expiration time is required");
  } else if (
    !(session.expiresAt instanceof Date) ||
    isNaN(session.expiresAt.getTime())
  ) {
    errors.push("Invalid expiration date");
  } else {
    const now = new Date();
    if (session.expiresAt <= now) {
      errors.push("Session has expired");
    } else if (session.expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      warnings.push("Session expires soon");
    }
    const sessionDuration = session.expiresAt.getTime() - now.getTime();
    if (sessionDuration > 30 * 24 * 60 * 60 * 1000) {
      securityLevel = "low";
      warnings.push("Long session duration reduces security");
    } else if (sessionDuration < 24 * 60 * 60 * 1000) {
      securityLevel = "high";
    }
  }
  if (session.ipAddress) {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(session.ipAddress)) {
      warnings.push("IP address format is unusual");
    }
  }
  if (session.userAgent) {
    if (session.userAgent.length > 500) {
      warnings.push("User agent string is unusually long");
    }
    const suspiciousAgents = ["bot", "crawler", "scraper", "spider"];
    if (
      suspiciousAgents.some((agent) =>
        session.userAgent!.toLowerCase().includes(agent),
      )
    ) {
      securityLevel = "low";
      warnings.push("Suspicious user agent detected");
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};

export const validateToken = (token: TokenData): AuthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  const now = Math.floor(Date.now() / 1000);
  if (!token.token) {
    errors.push("Token is required");
  } else if (typeof token.token !== "string") {
    errors.push("Token must be a string");
  } else {
    const jwtParts = token.token.split(".");
    if (jwtParts.length !== 3) {
      errors.push("Invalid token format");
    } else {
      try {
        JSON.parse(atob(jwtParts[0]!));
        const payload = JSON.parse(atob(jwtParts[1]!));
        if (!payload.exp) {
          warnings.push("Token has no expiration claim");
        } else {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp <= now) {
            errors.push("Token has expired");
          } else if (payload.exp - now < 300) {
            warnings.push("Token expires soon");
          }
        }
        if (!payload.iat) {
          warnings.push("Token has no issued at claim");
        }
        if (!payload.sub) {
          warnings.push("Token has no subject claim");
        } else if (typeof payload.sub !== "string") {
          errors.push("Invalid subject claim in token");
        }
        if (payload.exp && payload.exp - now > 24 * 60 * 60) {
          securityLevel = "low";
        } else if (payload.exp && payload.exp - now < 60 * 60) {
          securityLevel = "high";
        }
      } catch (error: unknown) {
        errors.push("Token payload is malformed");
      }
    }
  }
  if (!token.type) {
    errors.push("Token type is required");
  } else {
    const validTypes = ["access", "refresh", "reset", "verification"];
    if (!validTypes.includes(token.type)) {
      errors.push("Invalid token type");
    }
  }
  if (
    token.userId &&
    (typeof token.userId !== "string" || token.userId.length < 1)
  ) {
    errors.push("Invalid user ID in token");
  }
  if (token.expiresAt) {
    if (
      !(token.expiresAt instanceof Date) ||
      isNaN(token.expiresAt.getTime())
    ) {
      errors.push("Invalid expiration date");
    } else if (token.expiresAt <= new Date()) {
      errors.push("Token has expired");
    }
  }
  if (token.scopes) {
    if (!Array.isArray(token.scopes)) {
      errors.push("Scopes must be an array");
    } else {
      for (const scope of token.scopes) {
        if (typeof scope !== "string" || scope.length < 1) {
          errors.push("Invalid scope format");
        }
      }
    }
  }
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
