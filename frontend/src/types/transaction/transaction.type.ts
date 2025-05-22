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
  INCOME = "income",
  INCOME_SALARY = "income_salary",
  INCOME_BONUS = "income_bonus",
  INCOME_INVESTMENT = "income_investment",
  INCOME_REFUND = "income_refund",
  INCOME_OTHER = "income_other",
  TRANSPORT = "transport",
  TRANSPORT_FUEL = "transport_fuel",
  TRANSPORT_PARKING = "transport_parking",
  TRANSPORT_PUBLIC = "transport_public",
  TRANSPORT_TAXI = "transport_taxi",
  TRANSPORT_MAINTENANCE = "transport_maintenance",
  DINING = "dining",
  DINING_RESTAURANT = "dining_restaurant",
  DINING_TAKEOUT = "dining_takeout",
  DINING_CAFE = "dining_cafe",
  SHOPPING = "shopping",
  SHOPPING_GROCERY = "shopping_grocery",
  SHOPPING_CLOTHES = "shopping_clothes",
  SHOPPING_DIGITAL = "shopping_digital",
  SHOPPING_FURNITURE = "shopping_furniture",
  HOUSING = "housing",
  HOUSING_RENT = "housing_rent",
  HOUSING_MORTGAGE = "housing_mortgage",
  HOUSING_UTILITIES = "housing_utilities",
  HOUSING_PROPERTY = "housing_property",
  ENTERTAINMENT = "entertainment",
  ENTERTAINMENT_MOVIE = "entertainment_movie",
  ENTERTAINMENT_GAME = "entertainment_game",
  ENTERTAINMENT_SPORTS = "entertainment_sports",
  HEALTHCARE = "healthcare",
  HEALTHCARE_MEDICAL = "healthcare_medical",
  HEALTHCARE_INSURANCE = "healthcare_insurance",
  EDUCATION = "education",
  EDUCATION_TUITION = "education_tuition",
  EDUCATION_BOOKS = "education_books",
  EDUCATION_COURSE = "education_course",
  TRANSFER = "transfer",
  TRANSFER_IN = "transfer_in",
  TRANSFER_OUT = "transfer_out",
  OTHER = "other"
}

export enum BankStatementFormat {
  CIBC_CREDIT = "cibc_credit",
  CIBC_DEBIT = "cibc_debit",
  RBC_CHECKING = "rbc_checking",
  RBC_CREDIT = "rbc_credit",
  RBC_SAVING = "rbc_saving"
}

export enum ImportBatchStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  ERROR = "error"
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
  status: ImportBatchStatus;
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
  status: ImportBatchStatus;
  errorMessage?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatchResult {
  batch: ImportBatch;
  results: {
    id: string;
    rowNumber: number;
    processedData: ProcessedTransaction;
  }[];
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
