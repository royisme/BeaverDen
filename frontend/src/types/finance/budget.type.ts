export interface Budget {
    id: string;
    name: string;
    amount: number;
    periodType: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetFormData {
    id?: string;
    name: string;
    amount: number;
    periodType: string;
    category?: string;
    startDate?: string;
    endDate?: string;
}

export interface BudgetPeriod {
    startDate: string;
    endDate: string;
    currentPeriod: string;
}

export interface BudgetUsageStats {
    totalSpent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
}

export interface BudgetUsage {
    budget: Budget;
    period: BudgetPeriod;
    usage: BudgetUsageStats;
}

export enum BudgetPeriodType {
    MONTHLY = "monthly",
    WEEKLY = "weekly",
    YEARLY = "yearly",
    CUSTOM = "custom"
}

export const BudgetPeriodTypeLabels: Record<BudgetPeriodType, string> = {
    [BudgetPeriodType.MONTHLY]: "Monthly",
    [BudgetPeriodType.WEEKLY]: "Weekly",
    [BudgetPeriodType.YEARLY]: "Yearly",
    [BudgetPeriodType.CUSTOM]: "Custom"
};
