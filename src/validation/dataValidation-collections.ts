import type {
  DataValidationResult,
  ValidationRule,
  ValidationSchema,
} from "./dataValidation-types";
import { validateBoolean, validateDate } from "./dataValidation-scalars";
import { validateNumber, validateString } from "./dataValidation-primitives";

export const validateArray = (
  value: unknown,
  rules: Partial<ValidationRule> & { itemRules?: ValidationRule } = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedValue = value;
  if (!Array.isArray(value)) {
    if (value === null || value === undefined) {
      if (rules.required) {
        errors.push("Value is required");
      }
    } else {
      errors.push("Value must be an array");
    }
    return { isValid: false, errors, warnings };
  }
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.push(`Array must have at least ${rules.minLength} items`);
  }
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push(`Array must have no more than ${rules.maxLength} items`);
    sanitizedValue = value.slice(0, rules.maxLength);
    warnings.push("Array was truncated to maximum length");
  }
  if (rules.itemRules) {
    sanitizedValue = (sanitizedValue as unknown[]).map(
      (item: unknown, index: number) => {
        let itemResult: DataValidationResult;
        switch (rules.itemRules!.type) {
          case "string":
            itemResult = validateString(item, rules.itemRules);
            break;
          case "number":
            itemResult = validateNumber(item, rules.itemRules);
            break;
          case "boolean":
            itemResult = validateBoolean(item, rules.itemRules);
            break;
          case "date":
            itemResult = validateDate(item, rules.itemRules);
            break;
          default:
            itemResult = { isValid: true, errors: [], warnings: [] };
        }
        if (!itemResult.isValid) {
          errors.push(`Item ${index}: ${itemResult.errors.join(", ")}`);
        }
        warnings.push(...itemResult.errors.map((err) => `Item ${index}: ${err}`));
        return itemResult.sanitizedData !== undefined
          ? itemResult.sanitizedData
          : item;
      },
    );
  }
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      errors.push(customError);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedValue,
  };
};

export const validateObject = (
  value: unknown,
  schema: ValidationSchema,
  options: { strict?: boolean; allowUnknown?: boolean } = {},
): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedObject: Record<string, unknown> = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push("Value must be an object");
    return { isValid: false, errors, warnings };
  }
  const obj = value as Record<string, unknown>;
  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = obj[fieldName];
    let fieldResult: DataValidationResult;
    switch (rules.type) {
      case "string":
        fieldResult = validateString(fieldValue, rules);
        break;
      case "number":
        fieldResult = validateNumber(fieldValue, rules);
        break;
      case "boolean":
        fieldResult = validateBoolean(fieldValue, rules);
        break;
      case "date":
        fieldResult = validateDate(fieldValue, rules);
        break;
      case "array":
        fieldResult = validateArray(fieldValue, rules);
        break;
      case "object":
        fieldResult = validateObject(fieldValue, rules.schema || {}, options);
        break;
      default:
        fieldResult = { isValid: true, errors: [], warnings: [] };
    }
    if (!fieldResult.isValid) {
      errors.push(...fieldResult.errors.map((err) => `${fieldName}: ${err}`));
    }
    warnings.push(...fieldResult.warnings.map((warn) => `${fieldName}: ${warn}`));
    if (fieldResult.sanitizedData !== undefined) {
      sanitizedObject[fieldName] = fieldResult.sanitizedData;
    } else if (fieldValue !== undefined) {
      sanitizedObject[fieldName] = fieldValue;
    }
  }
  for (const [fieldName, rules] of Object.entries(schema)) {
    if (rules.required && !(fieldName in obj)) {
      errors.push(`${fieldName} is required`);
    }
  }
  if (options.strict || !options.allowUnknown) {
    for (const fieldName of Object.keys(obj)) {
      if (!schema[fieldName]) {
        if (options.strict) {
          errors.push(`Unknown field: ${fieldName}`);
        } else {
          warnings.push(`Unknown field: ${fieldName}`);
          sanitizedObject[fieldName] = obj[fieldName];
        }
      }
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedObject,
  };
};
