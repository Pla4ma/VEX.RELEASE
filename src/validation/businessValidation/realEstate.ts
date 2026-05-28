import type { BusinessContext, BusinessValidationResult } from "./types";

export const validateRealEstateListing = (
  listing: Record<string, unknown>,
  context: BusinessContext,
): BusinessValidationResult => {
  const errors: string[] = [];
  const l = listing as Record<string, unknown>;
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!l.propertyType) {
    errors.push("Property type is required");
  } else {
    const validTypes = [
      "residential",
      "commercial",
      "industrial",
      "land",
      "mixed_use",
    ];
    if (!validTypes.includes(l.propertyType as string)) {
      errors.push("Invalid property type");
    }
  }
  if (!l.address) {
    errors.push("Property address is required");
  }
  const priceVal = l.price as number | undefined;
  if (!priceVal || priceVal <= 0) {
    errors.push("Property price must be positive");
  }
  if (priceVal) {
    if (l.propertyType === "residential") {
      if (priceVal < 50000) {
        warnings.push("Residential property price seems low");
      }
      if (priceVal > 10000000) {
        businessRules.push(
          "High-value residential property - premium services required",
        );
      }
    }
    if (l.propertyType === "commercial") {
      if (priceVal < 100000) {
        warnings.push("Commercial property price seems low");
      }
    }
    const sqFt = l.squareFeet as number | undefined;
    if (sqFt && sqFt > 0) {
      const pricePerSqFt = priceVal / sqFt;
      if (l.propertyType === "residential") {
        if (pricePerSqFt < 50) {
          warnings.push(
            "Price per square foot seems low for residential property",
          );
        }
        if (pricePerSqFt > 1000) {
          warnings.push(
            "Price per square foot seems high for residential property",
          );
        }
      }
    }
  }
  if (!l.squareFeet || (l.squareFeet as number) <= 0) {
    errors.push("Property square footage must be positive");
  }
  if (!l.bedrooms && l.propertyType === "residential") {
    errors.push("Bedroom count required for residential property");
  }
  if (!l.bathrooms && l.propertyType === "residential") {
    errors.push("Bathroom count required for residential property");
  }
  const yearBuilt = l.yearBuilt as number | undefined;
  if (yearBuilt) {
    const currentYear = new Date().getFullYear();
    if (yearBuilt > currentYear) {
      errors.push("Year built cannot be in the future");
    }
    if (yearBuilt < 1800) {
      errors.push("Year built seems too old");
    }
    if (currentYear - yearBuilt > 100) {
      businessRules.push(
        "Historic property - special considerations may apply",
      );
    }
    if (currentYear - yearBuilt < 1) {
      businessRules.push("New construction - builder warranties may apply");
    }
  }
  const descVal = l.description as string | undefined;
  if (!descVal || descVal.length < 50) {
    errors.push("Property description must be at least 50 characters");
  }
  if (descVal && descVal.length > 2000) {
    warnings.push("Property description is very long - consider condensing");
  }
  const images = l.images as unknown[] | undefined;
  if (!images || images.length === 0) {
    warnings.push("Property images are recommended");
    recommendations.push(
      "Add at least 5 high-quality images for better visibility",
    );
  } else if (images.length < 5) {
    recommendations.push(
      "Consider adding more images for better property presentation",
    );
  }
  if (!l.agentId) {
    errors.push("Agent ID is required");
  }
  if (
    l.agentId &&
    context.role === "agent" &&
    l.agentId !== context.permissions[0]
  ) {
    errors.push("Agent can only list their own properties");
  }
  if (!l.status) {
    errors.push("Listing status is required");
  } else {
    const validStatuses = ["active", "pending", "sold", "expired", "withdrawn"];
    if (!validStatuses.includes(l.status as string)) {
      errors.push("Invalid listing status");
    }
  }
  if (priceVal && l.squareFeet) {
    const pricePerSqFt = priceVal / (l.squareFeet as number);
    if (context.region === "urban" && l.propertyType === "residential") {
      if (pricePerSqFt < 200) {
        recommendations.push(
          "Price may be below market average for urban area",
        );
      } else if (pricePerSqFt > 800) {
        recommendations.push(
          "Price may be above market average - ensure premium features are highlighted",
        );
      }
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRules,
    recommendations,
  };
};
