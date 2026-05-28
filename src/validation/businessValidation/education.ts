import type { BusinessContext, BusinessValidationResult } from "./types";

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
