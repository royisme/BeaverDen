export enum MatchType {
    EXACT = "exact",
    CONTAINS = "contains",
    REGEX = "regex"
}

export enum MatchField {
    DESCRIPTION = "description",
    MERCHANT = "merchant"
}

export interface CategoryRule {
    id: string;
    userId: string;
    categoryId: string;
    field: MatchField;
    pattern: string;
    matchType: MatchType;
    isActive: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryRuleFormData {
    categoryId: string;
    field: MatchField;
    pattern: string;
    matchType: MatchType;
    isActive: boolean;
    priority: number;
}
