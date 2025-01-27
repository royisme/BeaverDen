import { Currency } from "../enums";

export enum TransactionDirection {
  INFLOW = "inflow",
  OUTFLOW = "outflow"
}

export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
  TRANSFER_OUT = "transfer_out",
  TRANSFER_IN = "transfer_in",
  REFUND = "refund",
  ADJUSTMENT = "adjustment"
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  RECURRING = "recurring",
  CLEARED = "cleared"
}

export enum TransactionCategory {
  TRANSFER = "transfer",
  PAYMENT = "payment",
  BILL_PAYMENT = "bill_payment",
  UTILITY = "utility",
  GROCERY = "grocery",
  DINING = "dining",
  SHOPPING = "shopping",
  GAS = "gas",
  ENTERTAINMENT = "entertainment",
  OTHER = "other"
}

// 交易分类的详细信息
export interface TransactionCategoryDetail {
  id: string;
  name: string;
  normalizedName?: string;
  parentId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  accountId: string;
  linkedAccountId?: string;
  linkedTransactionId?: string;
  date: string;
  postedDate?: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: TransactionCategory;
  merchant: string;
  description: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  accountId: string;
  linkedAccountId?: string;
  date: string;
  postedDate?: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: TransactionCategory;
  merchant: string;
  description: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
}

export interface ImportBatch {
  id: string;
  userId: string;
  accountId: string;
  fileName: string;
  status: string;
  errorMessage?: string;
  processedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedTransaction {
  transactionDate: string;
  description: string;
  amount: string;
  direction: TransactionDirection;
  category: TransactionCategory;
  cardLast4?: string;
  accountNumber?: string;
}

export interface RawTransaction {
  id: string;
  rowNumber: number;
  rawData: Record<string, any>;
  processedData?: ProcessedTransaction;
  status: string;
  errorMessage?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatchResult {
  batch: ImportBatch;
  results: Array<{
    id: string;
    rowNumber: number;
    processedData: ProcessedTransaction;
  }>;
}

export interface Merchant {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  category?: TransactionCategory;
  categoryId?: string;
  metadata?: Record<string, any>;
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
