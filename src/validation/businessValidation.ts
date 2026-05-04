/**
 * Business Validation Layer
 * 
 * Comprehensive validation for business logic, rules, constraints,
 * and domain-specific requirements across different business contexts.
 */

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
  severity: 'error' | 'warning' | 'info';
  validator: (data: any, context?: any) => boolean;
  message: string;
}

export interface BusinessContext {
  domain: string;
  role: string;
  permissions: string[];
  environment: 'development' | 'staging' | 'production';
  region?: string;
  currency?: string;
}

// E-commerce business validation
export const validateECommerceOrder = (order: any, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Order structure validation
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  // Customer validation
  if (!order.customer) {
    errors.push('Customer information is required');
  } else {
    if (!order.customer.email) {
      errors.push('Customer email is required');
    }

    if (!order.customer.shippingAddress) {
      errors.push('Shipping address is required');
    }

    if (!order.customer.billingAddress && order.paymentMethod !== 'cash') {
      warnings.push('Billing address recommended for payment processing');
    }
  }

  // Payment validation
  if (!order.paymentMethod) {
    errors.push('Payment method is required');
  } else {
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'];
    if (!validPaymentMethods.includes(order.paymentMethod)) {
      errors.push('Invalid payment method');
    }
  }

  // Items validation
  let totalAmount = 0;
  let totalWeight = 0;

  if (order.items) {

    for (const item of order.items) {
      if (!item.productId) {
        errors.push('Item product ID is required');
      }

      if (!item.quantity || item.quantity <= 0) {
        errors.push('Item quantity must be positive');
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push('Item unit price must be positive');
      }

      if (item.quantity > 100) {
        warnings.push(`Large quantity for item ${item.productId}: ${item.quantity}`);
      }

      totalAmount += item.quantity * item.unitPrice;
      totalWeight += (item.weight || 0) * item.quantity;
    }

    // Order amount validation
    if (order.totalAmount && Math.abs(order.totalAmount - totalAmount) > 0.01) {
      errors.push('Order total amount does not match calculated total');
    }

    // Large order validation
    if (totalAmount > 10000) {
      businessRules.push('Large order detected - requires manager approval');
      recommendations.push('Consider splitting large orders into multiple shipments');
    }

    // Weight validation for shipping
    if (totalWeight > 50) {
      warnings.push('Order weight exceeds standard shipping limits');
      recommendations.push('Consider freight shipping for heavy orders');
    }
  }

  // Shipping validation
  if (order.shippingMethod) {
    const validShippingMethods = ['standard', 'express', 'overnight', 'freight'];
    if (!validShippingMethods.includes(order.shippingMethod)) {
      errors.push('Invalid shipping method');
    }

    if (order.shippingMethod === 'overnight' && totalWeight > 10) {
      errors.push('Overnight shipping not available for orders over 10kg');
    }
  }

  // Discount validation
  if (order.discountCode) {
    if (!order.discountAmount || order.discountAmount <= 0) {
      errors.push('Discount amount must be positive when discount code is provided');
    }

    if (order.discountAmount > totalAmount * 0.5) {
      businessRules.push('Discount exceeds 50% of order total');
      warnings.push('Large discount applied - review required');
    }
  }

  // Business hours validation
  const now = new Date();
  const hour = now.getHours();
  
  if (order.shippingMethod === 'overnight' && (hour < 9 || hour > 17)) {
    warnings.push('Overnight shipping ordered outside business hours');
    recommendations.push('Order may be processed next business day');
  }

  // Inventory validation (simulated)
  if (order.items) {
    for (const item of order.items) {
      if (item.quantity > 10) {
        businessRules.push(`High quantity for ${item.productId} - check inventory`);
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

// Financial business validation
export const validateFinancialTransaction = (transaction: any, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Transaction basic validation
  if (!transaction.type) {
    errors.push('Transaction type is required');
  } else {
    const validTypes = ['deposit', 'withdrawal', 'transfer', 'payment', 'refund'];
    if (!validTypes.includes(transaction.type)) {
      errors.push('Invalid transaction type');
    }
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Transaction amount must be positive');
  }

  if (transaction.amount > 1000000) {
    businessRules.push('Large transaction amount detected - compliance review required');
    warnings.push('Transaction exceeds standard limits');
  }

  // Account validation
  if (!transaction.fromAccount) {
    errors.push('Source account is required');
  }

  if (transaction.type === 'transfer' && !transaction.toAccount) {
    errors.push('Destination account is required for transfers');
  }

  // Currency validation
  if (transaction.currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(transaction.currency)) {
      errors.push('Invalid currency');
    }
  } else if (context.currency) {
    transaction.currency = context.currency;
    warnings.push('Using default currency from context');
  }

  // Daily limits validation
  if (transaction.amount > 10000) {
    businessRules.push('Transaction exceeds daily limit');
    recommendations.push('Consider breaking into smaller transactions');
  }

  // AML (Anti-Money Laundering) checks
  if (transaction.amount > 50000) {
    businessRules.push('High-value transaction - AML check required');
    warnings.push('Transaction requires compliance review');
  }

  // Frequency validation
  if (transaction.frequency === 'recurring') {
    if (!transaction.interval || !transaction.endDate) {
      errors.push('Recurring transactions require interval and end date');
    }

    if (transaction.interval === 'daily' && transaction.amount > 1000) {
      warnings.push('High-frequency recurring transaction detected');
    }
  }

  // Business hours validation
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  if (transaction.amount > 50000 && (hour < 9 || hour > 17 || dayOfWeek === 0 || dayOfWeek === 6)) {
    businessRules.push('Large transaction outside business hours');
    warnings.push('Transaction will be reviewed next business day');
  }

  // International transaction validation
  if (transaction.toAccount && transaction.toAccount.country !== transaction.fromAccount.country) {
    businessRules.push('International transaction detected');
    warnings.push('International transfers may have additional fees');

    if (transaction.amount > 10000) {
      businessRules.push('International transaction exceeds reporting threshold');
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

// Healthcare business validation
export const validateHealthcareAppointment = (appointment: any, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Patient validation
  if (!appointment.patientId) {
    errors.push('Patient ID is required');
  }

  if (!appointment.patientInfo) {
    errors.push('Patient information is required');
  } else {
    if (!appointment.patientInfo.dateOfBirth) {
      errors.push('Patient date of birth is required');
    }

    if (!appointment.patientInfo.insurance && context.environment === 'production') {
      warnings.push('Patient insurance information not provided');
    }
  }

  // Provider validation
  if (!appointment.providerId) {
    errors.push('Provider ID is required');
  }

  if (!appointment.specialty) {
    errors.push('Medical specialty is required');
  } else {
    const validSpecialties = ['general', 'cardiology', 'dermatology', 'pediatrics', 'orthopedics', 'neurology'];
    if (!validSpecialties.includes(appointment.specialty.toLowerCase())) {
      warnings.push('Unusual medical specialty specified');
    }
  }

  // DateTime validation
  if (!appointment.dateTime) {
    errors.push('Appointment date and time are required');
  } else {
    const appointmentDate = new Date(appointment.dateTime);
    const now = new Date();

    if (appointmentDate <= now) {
      errors.push('Appointment cannot be in the past');
    }

    // Business hours validation
    const hour = appointmentDate.getHours();
    const dayOfWeek = appointmentDate.getDay();

    if (hour < 8 || hour > 18 || dayOfWeek === 0) {
      errors.push('Appointment must be during business hours (Mon-Fri, 8AM-6PM)');
    }

    // Advance booking validation
    const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAppointment > 90) {
      warnings.push('Appointment booked far in advance');
    }

    if (daysUntilAppointment < 1) {
      businessRules.push('Same-day appointment - urgent care review');
    }
  }

  // Duration validation
  if (!appointment.duration) {
    errors.push('Appointment duration is required');
  } else {
    if (appointment.duration < 15) {
      errors.push('Minimum appointment duration is 15 minutes');
    }

    if (appointment.duration > 240) {
      warnings.push('Extended appointment duration - may require special scheduling');
    }

    // Specialty-specific duration validation
    if (appointment.specialty === 'general' && appointment.duration > 60) {
      warnings.push('General appointments typically 30-60 minutes');
    }
  }

  // Type validation
  if (!appointment.type) {
    errors.push('Appointment type is required');
  } else {
    const validTypes = ['new_patient', 'follow_up', 'urgent', 'consultation', 'procedure'];
    if (!validTypes.includes(appointment.type)) {
      errors.push('Invalid appointment type');
    }
  }

  // Insurance validation
  if (appointment.patientInfo?.insurance) {
    if (!appointment.patientInfo.insurance.provider) {
      errors.push('Insurance provider name is required');
    }

    if (!appointment.patientInfo.insurance.policyNumber) {
      errors.push('Insurance policy number is required');
    }

    // Coverage validation
    if (appointment.specialty && appointment.patientInfo.insurance.coverage) {
      const isCovered = appointment.patientInfo.insurance.coverage.includes(appointment.specialty);
      if (!isCovered) {
        warnings.push('Specialty may not be covered by insurance');
        recommendations.push('Verify coverage with patient');
      }
    }
  }

  // Medical history validation
  if (appointment.type === 'new_patient' && !appointment.medicalHistory) {
    businessRules.push('New patient requires medical history review');
    recommendations.push('Schedule additional time for medical history collection');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRules,
    recommendations,
  };
};

// Real estate business validation
export const validateRealEstateListing = (listing: any, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Property basic validation
  if (!listing.propertyType) {
    errors.push('Property type is required');
  } else {
    const validTypes = ['residential', 'commercial', 'industrial', 'land', 'mixed_use'];
    if (!validTypes.includes(listing.propertyType)) {
      errors.push('Invalid property type');
    }
  }

  if (!listing.address) {
    errors.push('Property address is required');
  }

  if (!listing.price || listing.price <= 0) {
    errors.push('Property price must be positive');
  }

  // Price validation
  if (listing.price) {
    if (listing.propertyType === 'residential') {
      if (listing.price < 50000) {
        warnings.push('Residential property price seems low');
      }

      if (listing.price > 10000000) {
        businessRules.push('High-value residential property - premium services required');
      }
    }

    if (listing.propertyType === 'commercial') {
      if (listing.price < 100000) {
        warnings.push('Commercial property price seems low');
      }
    }

    // Price per square foot validation
    if (listing.squareFeet && listing.squareFeet > 0) {
      const pricePerSqFt = listing.price / listing.squareFeet;
      
      if (listing.propertyType === 'residential') {
        if (pricePerSqFt < 50) {
          warnings.push('Price per square foot seems low for residential property');
        }

        if (pricePerSqFt > 1000) {
          warnings.push('Price per square foot seems high for residential property');
        }
      }
    }
  }

  // Property details validation
  if (!listing.squareFeet || listing.squareFeet <= 0) {
    errors.push('Property square footage must be positive');
  }

  if (!listing.bedrooms && listing.propertyType === 'residential') {
    errors.push('Bedroom count required for residential property');
  }

  if (!listing.bathrooms && listing.propertyType === 'residential') {
    errors.push('Bathroom count required for residential property');
  }

  // Year built validation
  if (listing.yearBuilt) {
    const currentYear = new Date().getFullYear();
    
    if (listing.yearBuilt > currentYear) {
      errors.push('Year built cannot be in the future');
    }

    if (listing.yearBuilt < 1800) {
      errors.push('Year built seems too old');
    }

    if (currentYear - listing.yearBuilt > 100) {
      businessRules.push('Historic property - special considerations may apply');
    }

    if (currentYear - listing.yearBuilt < 1) {
      businessRules.push('New construction - builder warranties may apply');
    }
  }

  // Listing details validation
  if (!listing.description || listing.description.length < 50) {
    errors.push('Property description must be at least 50 characters');
  }

  if (listing.description && listing.description.length > 2000) {
    warnings.push('Property description is very long - consider condensing');
  }

  // Images validation
  if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
    warnings.push('Property images are recommended');
    recommendations.push('Add at least 5 high-quality images for better visibility');
  } else if (listing.images.length < 5) {
    recommendations.push('Consider adding more images for better property presentation');
  }

  // Agent validation
  if (!listing.agentId) {
    errors.push('Agent ID is required');
  }

  if (listing.agentId && context.role === 'agent' && listing.agentId !== context.permissions[0]) {
    errors.push('Agent can only list their own properties');
  }

  // Status validation
  if (!listing.status) {
    errors.push('Listing status is required');
  } else {
    const validStatuses = ['active', 'pending', 'sold', 'expired', 'withdrawn'];
    if (!validStatuses.includes(listing.status)) {
      errors.push('Invalid listing status');
    }
  }

  // Market analysis
  if (listing.price && listing.squareFeet) {
    const pricePerSqFt = listing.price / listing.squareFeet;
    
    // Regional market comparison (simplified)
    if (context.region === 'urban' && listing.propertyType === 'residential') {
      if (pricePerSqFt < 200) {
        recommendations.push('Price may be below market average for urban area');
      } else if (pricePerSqFt > 800) {
        recommendations.push('Price may be above market average - ensure premium features are highlighted');
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

// Education business validation
export const validateEducationEnrollment = (enrollment: any, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Student validation
  if (!enrollment.studentId) {
    errors.push('Student ID is required');
  }

  if (!enrollment.studentInfo) {
    errors.push('Student information is required');
  } else {
    if (!enrollment.studentInfo.dateOfBirth) {
      errors.push('Student date of birth is required');
    }

    if (!enrollment.studentInfo.grade) {
      errors.push('Student grade level is required');
    }

    // Age validation for grade level
    if (enrollment.studentInfo.dateOfBirth && enrollment.studentInfo.grade) {
      const now = new Date();
      const birthDate = new Date(enrollment.studentInfo.dateOfBirth);
      const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      const grade = parseInt(enrollment.studentInfo.grade);
      const expectedAge = grade + 5; // Simplified: grade 1 = age 6

      if (Math.abs(age - expectedAge) > 3) {
        warnings.push('Student age seems unusual for grade level');
      }
    }
  }

  // Course validation
  if (!enrollment.courses || !Array.isArray(enrollment.courses) || enrollment.courses.length === 0) {
    errors.push('At least one course must be selected');
  } else {
    let totalCredits = 0;

    for (const course of enrollment.courses) {
      if (!course.courseId) {
        errors.push('Course ID is required');
      }

      if (!course.credits || course.credits <= 0) {
        errors.push('Course credits must be positive');
      }

      totalCredits += course.credits;

      // Prerequisite validation
      if (course.prerequisites && enrollment.studentInfo.completedCourses) {
        const hasPrerequisites = course.prerequisites.every((prereq: string) => 
          enrollment.studentInfo.completedCourses.includes(prereq)
        );

        if (!hasPrerequisites) {
          errors.push(`Student lacks prerequisites for course ${course.courseId}`);
        }
      }
    }

    // Credit load validation
    if (totalCredits < 12) {
      warnings.push('Student is enrolled in less than full-time credit load');
    }

    if (totalCredits > 21) {
      businessRules.push('Heavy course load - academic advisor approval required');
      warnings.push('Student may be overloaded with courses');
    }
  }

  // Semester validation
  if (!enrollment.semester) {
    errors.push('Semester is required');
  } else {
    const validSemesters = ['fall', 'spring', 'summer', 'winter'];
    if (!validSemesters.includes(enrollment.semester.toLowerCase())) {
      errors.push('Invalid semester');
    }
  }

  if (!enrollment.year) {
    errors.push('Academic year is required');
  } else {
    const currentYear = new Date().getFullYear();
    if (enrollment.year < currentYear - 1 || enrollment.year > currentYear + 2) {
      warnings.push('Academic year seems unusual');
    }
  }

  // Tuition validation
  if (enrollment.tuition) {
    if (enrollment.tuition <= 0) {
      errors.push('Tuition amount must be positive');
    }

    // Financial aid validation
    if (enrollment.financialAid && enrollment.financialAid > enrollment.tuition) {
      warnings.push('Financial aid exceeds tuition amount');
    }
  }

  // Payment validation
  if (!enrollment.paymentMethod) {
    warnings.push('Payment method not specified');
  } else {
    const validMethods = ['full_payment', 'payment_plan', 'financial_aid', 'scholarship'];
    if (!validMethods.includes(enrollment.paymentMethod)) {
      errors.push('Invalid payment method');
    }
  }

  // Parent/guardian validation for minors
  if (enrollment.studentInfo && enrollment.studentInfo.dateOfBirth) {
    const now = new Date();
    const birthDate = new Date(enrollment.studentInfo.dateOfBirth);
    const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age < 18 && !enrollment.guardianInfo) {
      errors.push('Guardian information required for minor students');
    }
  }

  // Special accommodations validation
  if (enrollment.specialNeeds) {
    if (!enrollment.accommodations) {
      warnings.push('Special needs indicated but no accommodations specified');
      recommendations.push('Contact disability services for accommodation planning');
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

// General business rule engine
export const validateBusinessRules = (
  data: any,
  rules: BusinessRule[],
  context?: BusinessContext
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
          case 'error':
            errors.push(rule.message);
            break;
          case 'warning':
            warnings.push(rule.message);
            break;
          case 'info':
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
