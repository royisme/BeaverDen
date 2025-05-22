import { z } from "zod";
import { BudgetPeriodType } from "@/types/finance/budget.type";
import { createValidator } from "@/lib/validation";

// Budget schema
export const budgetSchema = z.object({
    id: z.string().optional(),
    name: z.string()
        .min(3, "Budget name must be at least 3 characters")
        .max(50, "Budget name must be at most 50 characters"),
    amount: z.number()
        .min(0.01, "Amount must be greater than 0")
        .max(999999999.99, "Amount must be less than 1 billion")
        .transform(val => Number(val.toFixed(2))),
    periodType: z.enum(Object.values(BudgetPeriodType) as [BudgetPeriodType, ...BudgetPeriodType[]]),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

// Create validators
export const validateBudget = createValidator(budgetSchema);
