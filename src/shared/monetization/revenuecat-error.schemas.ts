import { z } from 'zod';
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';

export const PurchasesErrorSchema = z.object({
  code: z.enum(PURCHASES_ERROR_CODE).optional(),
  message: z.string().optional(),
});
