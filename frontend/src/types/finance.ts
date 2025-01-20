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




export interface BankTheme {
  background: string;
  textColor: string;
}

export interface FinanceTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description: string;
  type: 'Income' | 'Expense' | 'Transfer';
}

export interface Merchant {
  id: string;
  name: string;
  normalizedName: string;
  categoryId?: string;
  metadata?: Record<string, any>;
}

