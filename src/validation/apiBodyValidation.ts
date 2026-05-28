import type { APIValidationResult } from "./apiTypes";

const checkRequestBodyDepth = (
  obj: unknown,
  depth: number,
  maxDepth: number,
  currentDepth: { value: number },
): boolean => {
  if (depth > maxDepth) return false;
  if (typeof obj !== "object" || obj === null) return true;
  currentDepth.value = Math.max(currentDepth.value, depth);
  return Object.values(obj).every((value) =>
    checkRequestBodyDepth(value, depth + 1, maxDepth, currentDepth),
  );
};

const checkLargeArrays = (
  obj: unknown,
  warnings: string[],
  path: string = "",
): void => {
  if (Array.isArray(obj)) {
    if (obj.length > 1000) {
      warnings.push(`Large array detected at ${path}: ${obj.length} items`);
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      checkLargeArrays(value, warnings, path ? `${path}.${key}` : key);
    }
  }
};

export const validateRequestBody = (
  body: unknown,
  contentType?: string,
  maxSize?: number,
): APIValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityLevel: "low" | "medium" | "high" = "medium";
  if (body === null || body === undefined) {
    return { isValid: true, errors, warnings, securityLevel };
  }
  const maxAllowedSize = maxSize || 1048576;
  if (JSON.stringify(body).length > maxAllowedSize) {
    errors.push(`Request body too large (maximum ${maxAllowedSize} bytes)`);
    return { isValid: false, errors, warnings, securityLevel };
  }
  if (contentType) {
    const mainType = contentType.split(";")[0]!.toLowerCase();
    if (mainType.includes("application/json")) {
      if (typeof body !== "object") {
        errors.push("Body must be an object for JSON content type");
      } else {
        const currentDepth = { value: 0 };
        if (!checkRequestBodyDepth(body, 0, 10, currentDepth)) {
          errors.push("Request body nesting too deep (maximum 10 levels)");
        }
        if (currentDepth.value > 5) {
          warnings.push("Request body has deep nesting");
        }
      }
    }
  }
  const bodyString = JSON.stringify(body).toLowerCase();
  const sqlPatterns = [
    "union select",
    "select from",
    "insert into",
    "update set",
    "delete from",
    "drop table",
    "exec(",
    "script>",
    "javascript:",
    "<script",
  ];
  for (const pattern of sqlPatterns) {
    if (bodyString.includes(pattern)) {
      errors.push(`Potential injection detected: ${pattern}`);
      securityLevel = "low";
      break;
    }
  }
  checkLargeArrays(body, warnings);
  return { isValid: errors.length === 0, errors, warnings, securityLevel };
};
