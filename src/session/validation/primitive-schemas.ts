import { z } from 'zod';

export const UUIDSchema = z.string().uuid();
export const TimestampSchema = z.number().min(0);
export const DurationSchema = z.number().min(0).max(86400000);
export const PercentageSchema = z.number().min(0).max(100);
export const PurityLabelSchema = z.enum([
  'Elite',
  'Good',
  'Okay',
  'Distracted',
]);
