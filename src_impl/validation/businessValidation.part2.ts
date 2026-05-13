

export const validateHealthcareAppointment = (appointment: DynamicValue, context: BusinessContext): BusinessValidationResult => {
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

export const validateRealEstateListing = (listing: DynamicValue, context: BusinessContext): BusinessValidationResult => {
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