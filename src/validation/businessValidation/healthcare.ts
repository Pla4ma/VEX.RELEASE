import type { BusinessContext, BusinessValidationResult } from "./types";

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
