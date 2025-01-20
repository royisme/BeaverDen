import { z } from "zod";
import { Currency } from "@/types/enums";
import { FinanceAccountType, FinanceAccountCardType, FinanceBankName } from "@/types/finance";
import { createValidator } from "@/lib/validation";
// Account schema
export const accountSchema = z.object({
    id: z.string().optional(),
    accountName: z.string().min(3, "Account name must be at least 3 characters").max(50, "Account name must be at most 50 characters"),
    accountNumber: z.string().regex(/^\d{10,20}$/, "Account number must be 10-20 digits").optional(),
    bankName: z.enum(Object.values(FinanceBankName) as [FinanceBankName, ...FinanceBankName[]]),
    accountType: z.enum(Object.values(FinanceAccountType) as [FinanceAccountType, ...FinanceAccountType[]]),
    currency: z.enum(Object.values(Currency) as [Currency, ...Currency[]]),
    cardType: z.enum(Object.values(FinanceAccountCardType) as [FinanceAccountCardType, ...FinanceAccountCardType[]]).optional(),
    balance: z.number().min(0, "Balance must be a positive number"),
  });

export type FinanceAccountFormData = z.infer<typeof accountSchema>;
// Create validators
export const validateAccount = createValidator(accountSchema);