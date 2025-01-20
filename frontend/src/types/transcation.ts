export enum TransactionType {
    INCOME = 'Income',
    EXPENSE = 'Expense',
    TRANSFER = 'Transfer'
}



export interface TransactionCategory {
    id: string;
    name: string;
    normalizedName?: string;
    parentId?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export enum MerchantCategory {
    GROCERY = 'Grocery',
    RESTAURANT = 'Restaurant',
    SHOPPING = 'Shopping',
    UTILITIES = 'Utilities',
    ENTERTAINMENT = 'Entertainment',
    OTHER = 'Other'
}


export interface Merchant {
    id: string;
    userId: string;
    name: string;
    normalizedName: string;
    category?: MerchantCategory;
    createdAt: string;
    updatedAt: string;
}

export interface MerchantAlias {
    id: string;
    merchantId: string;
    alias: string;
    source: string;
    confidenceScore: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    accountId: string;
    date: string;
    amount: number;
    categoryId: string; // Link to TransactionCategory
    merchant: string;
    description: string;
    type: TransactionType;
    createdAt: string;
    updatedAt: string;
}