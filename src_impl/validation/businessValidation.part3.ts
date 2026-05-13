

export const validateEducationEnrollment = (enrollment: DynamicValue, _context: BusinessContext): BusinessValidationResult => {
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

export const validateBusinessRules = (
  data: DynamicValue,
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