import { Currency } from "./enums";

export enum FinanceAccountStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DELETED = "deleted",
    LOCKED = "locked",
    INACTIVE = "inactive"
}

export enum FinanceAccountType {
    CHEQUING = 'Chequing',
    SAVINGS = 'Savings',
    CREDIT_CARD = 'CreditCard',
    CASH = 'Cash',
    INVESTMENT = 'Investment'
}

export enum FinanceAccountCardType {
    VISA = 'Visa',
    MASTERCARD = 'MasterCard',
    AMEX = 'Amex',
    DISCOVER = 'Discover',
    JCB = 'JCB',
    DINERS = 'Diners',
    UNIONPAY = 'UnionPay',
    OTHER = 'Other'
}

export enum FinanceBankName {
    RBC = "RBC Royal Bank",
    TD = "TD Canada Trust",
    CIBC = "CIBC",
    BMO = "BMO Bank of Montreal",
    SCOTIABANK = "Scotiabank",
    AMERICAN_EXPRESS = "American Express",
    NATIONAL_BANK = "National Bank",
    HSBC_CANADA = "HSBC Canada",
    CANADIAN_TIRE_BANK = "Canadian Tire Bank",
    SIMPLII_FINANCIAL = "Simplii Financial",
    TANGERINE_BANK = "Tangerine Bank",
    EQ_BANK = "EQ Bank",
    LAURENTIAN_BANK = "Laurentian Bank",
    MANULIFE_BANK = "Manulife Bank",
    DUCA_CREDIT_UNION = "DUCA Credit Union",
    VANCITY = "Vancity",
    COAST_CAPITAL = "Coast Capital",
    DESJARDINS = "Desjardins",
    OTHER = "Other"
}

export interface FinanceAccount {
    id: string;
    accountName: string;
    bankName: FinanceBankName;
    institutionNumber?: string;
    transitNumber?: string;
    accountNumber?: string;
    cardLastFour?: string;
    cardHolder?: string;
    expiryDate?: string;
    cardType?: FinanceAccountCardType;
    accountType: FinanceAccountType;
    currency: Currency;
    balance: number;
    status?: FinanceAccountStatus | FinanceAccountStatus.ACTIVE;
}

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
  PAYROLL = "payroll",
  OTHER = "other"
}

export enum BankStatementFormat {
  CSV = "csv",
  // OFX = "ofx",
  // QFX = "qfx",
  // PDF = "pdf",
  EXCEL = "excel"
}

export interface FinanceTransaction {
  id: string;
  accountId: string;
  linkedAccountId?: string;  // 用于转账交易
  linkedTransactionId?: string;  // 用于转账交易的关联交易ID
  date: string;
  postedDate?: string;  // 银行过账日期
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: TransactionCategory;
  merchant: string;
  description: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  metadata?: Record<string, any>;  // 存储原始交易数据或其他元数据
  createdAt: string;
  updatedAt: string;
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

export interface BankTheme {
  background: string;
  textColor: string;
}

export interface Merchant {
  id: string;
  name: string;
  normalizedName: string;
  categoryId?: string;
  metadata?: Record<string, any>;
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

export interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}
