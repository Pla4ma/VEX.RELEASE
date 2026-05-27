export interface BusinessValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  businessRules: string[];
  recommendations: string[];
}
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  validator: (data: unknown, context?: unknown) => boolean;
  message: string;
}
export interface BusinessContext {
  domain: string;
  role: string;
  permissions: string[];
  environment: "development" | "staging" | "production";
  region?: string;
  currency?: string;
}
export const validateECommerceOrder = (
  order: Record<string, unknown>,
  _context: BusinessContext,
): BusinessValidationResult => {
  const o = order as Record<
    string,
    | Record<string, unknown>
    | Array<Record<string, unknown>>
    | string
    | number
    | boolean
    | null
    | undefined
  >;
  const customer = o.customer as Record<string, unknown> | undefined;
  const items = (o.items as Array<Record<string, unknown>>) ?? [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!items || items.length === 0) {
    errors.push("Order must contain at least one item");
  }
  if (!customer) {
    errors.push("Customer information is required");
  } else {
    if (!customer.email) {
      errors.push("Customer email is required");
    }
    if (!customer.shippingAddress) {
      errors.push("Shipping address is required");
    }
    if (!customer.billingAddress && order.paymentMethod !== "cash") {
      warnings.push("Billing address recommended for payment processing");
    }
  }
  if (!order.paymentMethod) {
    errors.push("Payment method is required");
  } else {
    const validPaymentMethods = [
      "credit_card",
      "debit_card",
      "paypal",
      "cash",
      "bank_transfer",
    ];
    if (!validPaymentMethods.includes(order.paymentMethod as string)) {
      errors.push("Invalid payment method");
    }
  }
  let totalAmount = 0;
  let totalWeight = 0;
  if (items) {
    for (const item of items) {
      if (!item.productId) {
        errors.push("Item product ID is required");
      }
      if (!item.quantity || (item.quantity as number) <= 0) {
        errors.push("Item quantity must be positive");
      }
      if (!item.unitPrice || (item.unitPrice as number) <= 0) {
        errors.push("Item unit price must be positive");
      }
      if ((item.quantity as number) > 100) {
        warnings.push(
          `Large quantity for item ${item.productId}: ${item.quantity}`,
        );
      }
      totalAmount += (item.quantity as number) * (item.unitPrice as number);
      totalWeight += ((item.weight as number) || 0) * (item.quantity as number);
    }
    if (
      order.totalAmount &&
      Math.abs((order.totalAmount as number) - totalAmount) > 0.01
    ) {
      errors.push("Order total amount does not match calculated total");
    }
    if (totalAmount > 10000) {
      businessRules.push("Large order detected - requires manager approval");
      recommendations.push(
        "Consider splitting large orders into multiple shipments",
      );
    }
    if (totalWeight > 50) {
      warnings.push("Order weight exceeds standard shipping limits");
      recommendations.push("Consider freight shipping for heavy orders");
    }
  }
  if (order.shippingMethod) {
    const validShippingMethods = [
      "standard",
      "express",
      "overnight",
      "freight",
    ];
    if (!validShippingMethods.includes(order.shippingMethod as string)) {
      errors.push("Invalid shipping method");
    }
    if (order.shippingMethod === "overnight" && totalWeight > 10) {
      errors.push("Overnight shipping not available for orders over 10kg");
    }
  }
  if (order.discountCode) {
    if (!order.discountAmount || (order.discountAmount as number) <= 0) {
      errors.push(
        "Discount amount must be positive when discount code is provided",
      );
    }
    if ((order.discountAmount as number) > totalAmount * 0.5) {
      businessRules.push("Discount exceeds 50% of order total");
      warnings.push("Large discount applied - review required");
    }
  }
  const now = new Date();
  const hour = now.getHours();
  if (order.shippingMethod === "overnight" && (hour < 9 || hour > 17)) {
    warnings.push("Overnight shipping ordered outside business hours");
    recommendations.push("Order may be processed next business day");
  }
  if (items) {
    for (const item of items) {
      if ((item.quantity as number) > 10) {
        businessRules.push(
          `High quantity for ${item.productId} - check inventory`,
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
export const validateFinancialTransaction = (
  transaction: Record<string, unknown>,
  context: BusinessContext,
): BusinessValidationResult => {
  const t = transaction as Record<string, unknown>;
  const txAmount = t.amount as number | undefined;
  const fromAccount = t.fromAccount as Record<string, unknown> | undefined;
  const toAccount = t.toAccount as Record<string, unknown> | undefined;
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!t.type) {
    errors.push("Transaction type is required");
  } else {
    const validTypes = [
      "deposit",
      "withdrawal",
      "transfer",
      "payment",
      "refund",
    ];
    if (!validTypes.includes(t.type as string)) {
      errors.push("Invalid transaction type");
    }
  }
  if (!txAmount || txAmount <= 0) {
    errors.push("Transaction amount must be positive");
  }
  if (txAmount && txAmount > 1000000) {
    businessRules.push(
      "Large transaction amount detected - compliance review required",
    );
    warnings.push("Transaction exceeds standard limits");
  }
  if (!fromAccount) {
    errors.push("Source account is required");
  }
  if (t.type === "transfer" && !toAccount) {
    errors.push("Destination account is required for transfers");
  }
  if (t.currency) {
    const validCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
    if (!validCurrencies.includes(t.currency as string)) {
      errors.push("Invalid currency");
    }
  } else if (context.currency) {
    t.currency = context.currency;
    warnings.push("Using default currency from context");
  }
  if (txAmount && txAmount > 10000) {
    businessRules.push("Transaction exceeds daily limit");
    recommendations.push("Consider breaking into smaller transactions");
  }
  if (txAmount && txAmount > 50000) {
    businessRules.push("High-value transaction - AML check required");
    warnings.push("Transaction requires compliance review");
  }
  if (t.frequency === "recurring") {
    if (!t.interval || !t.endDate) {
      errors.push("Recurring transactions require interval and end date");
    }
    if (t.interval === "daily" && txAmount && txAmount > 1000) {
      warnings.push("High-frequency recurring transaction detected");
    }
  }
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  if (
    txAmount &&
    txAmount > 50000 &&
    (hour < 9 || hour > 17 || dayOfWeek === 0 || dayOfWeek === 6)
  ) {
    businessRules.push("Large transaction outside business hours");
    warnings.push("Transaction will be reviewed next business day");
  }
  if (toAccount && toAccount.country !== fromAccount?.country) {
    businessRules.push("International transaction detected");
    warnings.push("International transfers may have additional fees");
    if (txAmount && txAmount > 10000) {
      businessRules.push(
        "International transaction exceeds reporting threshold",
      );
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
export const validateHealthcareAppointment = (
  appointment: Record<string, unknown>,
  context: BusinessContext,
): BusinessValidationResult => {
  const a = appointment as Record<string, unknown>;
  const patientInfo = a.patientInfo as Record<string, unknown> | undefined;
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!a.patientId) {
    errors.push("Patient ID is required");
  }
  if (!patientInfo) {
    errors.push("Patient information is required");
  } else {
    if (!patientInfo.dateOfBirth) {
      errors.push("Patient date of birth is required");
    }
    if (!patientInfo.insurance && context.environment === "production") {
      warnings.push("Patient insurance information not provided");
    }
  }
  if (!a.providerId) {
    errors.push("Provider ID is required");
  }
  if (!a.specialty) {
    errors.push("Medical specialty is required");
  } else {
    const validSpecialties = [
      "general",
      "cardiology",
      "dermatology",
      "pediatrics",
      "orthopedics",
      "neurology",
    ];
    if (!validSpecialties.includes((a.specialty as string).toLowerCase())) {
      warnings.push("Unusual medical specialty specified");
    }
  }
  if (!a.dateTime) {
    errors.push("Appointment date and time are required");
  } else {
    const appointmentDate = new Date(a.dateTime as string);
    const now = new Date();
    if (appointmentDate <= now) {
      errors.push("Appointment cannot be in the past");
    }
    const hour = appointmentDate.getHours();
    const dayOfWeek = appointmentDate.getDay();
    if (hour < 8 || hour > 18 || dayOfWeek === 0) {
      errors.push(
        "Appointment must be during business hours (Mon-Fri, 8AM-6PM)",
      );
    }
    const daysUntilAppointment = Math.ceil(
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilAppointment > 90) {
      warnings.push("Appointment booked far in advance");
    }
    if (daysUntilAppointment < 1) {
      businessRules.push("Same-day appointment - urgent care review");
    }
  }
  if (!a.duration) {
    errors.push("Appointment duration is required");
  } else {
    if ((a.duration as number) < 15) {
      errors.push("Minimum appointment duration is 15 minutes");
    }
    if ((a.duration as number) > 240) {
      warnings.push(
        "Extended appointment duration - may require special scheduling",
      );
    }
    if (a.specialty === "general" && (a.duration as number) > 60) {
      warnings.push("General appointments typically 30-60 minutes");
    }
  }
  if (!a.type) {
    errors.push("Appointment type is required");
  } else {
    const validTypes = [
      "new_patient",
      "follow_up",
      "urgent",
      "consultation",
      "procedure",
    ];
    if (!validTypes.includes(a.type as string)) {
      errors.push("Invalid appointment type");
    }
  }
  if (patientInfo?.insurance) {
    const insurance = patientInfo.insurance as Record<string, unknown>;
    if (!insurance.provider) {
      errors.push("Insurance provider name is required");
    }
    if (!insurance.policyNumber) {
      errors.push("Insurance policy number is required");
    }
    if (a.specialty && insurance.coverage) {
      const isCovered = (insurance.coverage as string[]).includes(
        a.specialty as string,
      );
      if (!isCovered) {
        warnings.push("Specialty may not be covered by insurance");
        recommendations.push("Verify coverage with patient");
      }
    }
  }
  if (a.type === "new_patient" && !a.medicalHistory) {
    businessRules.push("New patient requires medical history review");
    recommendations.push(
      "Schedule additional time for medical history collection",
    );
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRules,
    recommendations,
  };
};
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
export const validateEducationEnrollment = (
  enrollment: Record<string, unknown>,
  _context: BusinessContext,
): BusinessValidationResult => {
  const errors: string[] = [];
  const e = enrollment as Record<string, unknown>;
  const studentInfo = e.studentInfo as Record<string, unknown> | undefined;
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!e.studentId) {
    errors.push("Student ID is required");
  }
  if (!studentInfo) {
    errors.push("Student information is required");
  } else {
    if (!studentInfo.dateOfBirth) {
      errors.push("Student date of birth is required");
    }
    if (!studentInfo.grade) {
      errors.push("Student grade level is required");
    }
    if (studentInfo.dateOfBirth && studentInfo.grade) {
      const now = new Date();
      const birthDate = new Date(studentInfo.dateOfBirth as string);
      const age = Math.floor(
        (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      const grade = parseInt(studentInfo.grade as string);
      const expectedAge = grade + 5;
      if (Math.abs(age - expectedAge) > 3) {
        warnings.push("Student age seems unusual for grade level");
      }
    }
  }
  const courses = e.courses as Array<Record<string, unknown>> | undefined;
  if (!courses || courses.length === 0) {
    errors.push("At least one course must be selected");
  } else {
    let totalCredits = 0;
    for (const course of courses) {
      if (!course.courseId) {
        errors.push("Course ID is required");
      }
      if (!course.credits || (course.credits as number) <= 0) {
        errors.push("Course credits must be positive");
      }
      totalCredits += course.credits as number;
      if (course.prerequisites && studentInfo?.completedCourses) {
        const completedCourses = studentInfo.completedCourses as string[];
        const hasPrerequisites = (course.prerequisites as string[]).every(
          (prereq: string) => completedCourses.includes(prereq),
        );
        if (!hasPrerequisites) {
          errors.push(
            `Student lacks prerequisites for course ${course.courseId}`,
          );
        }
      }
    }
    if (totalCredits < 12) {
      warnings.push("Student is enrolled in less than full-time credit load");
    }
    if (totalCredits > 21) {
      businessRules.push(
        "Heavy course load - academic advisor approval required",
      );
      warnings.push("Student may be overloaded with courses");
    }
  }
  if (!e.semester) {
    errors.push("Semester is required");
  } else {
    const validSemesters = ["fall", "spring", "summer", "winter"];
    if (!validSemesters.includes((e.semester as string).toLowerCase())) {
      errors.push("Invalid semester");
    }
  }
  const yearVal = e.year as number | undefined;
  if (!yearVal) {
    errors.push("Academic year is required");
  } else {
    const currentYear = new Date().getFullYear();
    if (yearVal < currentYear - 1 || yearVal > currentYear + 2) {
      warnings.push("Academic year seems unusual");
    }
  }
  const tuitionVal = e.tuition as number | undefined;
  if (tuitionVal) {
    if (tuitionVal <= 0) {
      errors.push("Tuition amount must be positive");
    }
    const financialAidVal = e.financialAid as number | undefined;
    if (financialAidVal && financialAidVal > tuitionVal) {
      warnings.push("Financial aid exceeds tuition amount");
    }
  }
  if (!e.paymentMethod) {
    warnings.push("Payment method not specified");
  } else {
    const validMethods = [
      "full_payment",
      "payment_plan",
      "financial_aid",
      "scholarship",
    ];
    if (!validMethods.includes(e.paymentMethod as string)) {
      errors.push("Invalid payment method");
    }
  }
  if (studentInfo && studentInfo.dateOfBirth) {
    const now = new Date();
    const birthDate = new Date(studentInfo.dateOfBirth as string);
    const age = Math.floor(
      (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    if (age < 18 && !e.guardianInfo) {
      errors.push("Guardian information required for minor students");
    }
  }
  if (e.specialNeeds) {
    if (!e.accommodations) {
      warnings.push("Special needs indicated but no accommodations specified");
      recommendations.push(
        "Contact disability services for accommodation planning",
      );
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
export const validateBusinessRules = (
  data: unknown,
  rules: BusinessRule[],
  context?: BusinessContext,
): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  for (const rule of rules) {
    try {
      const isValid = rule.validator(data, context);
      if (!isValid) {
        switch (rule.severity) {
          case "error":
            errors.push(rule.message);
            break;
          case "warning":
            warnings.push(rule.message);
            break;
          case "info":
            businessRules.push(rule.message);
            break;
        }
      }
    } catch (error) {
      warnings.push(`Error validating rule ${rule.id}: ${error}`);
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
