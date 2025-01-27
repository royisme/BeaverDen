import { Currency } from "../enums";

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
    RBC = "RBC",
    TD = "TD",
    CIBC = "CIBC",
    BMO = "BMO",
    SCOTIABANK = "Scotia Bank",
    AMERICAN_EXPRESS = "AMEX",
    NATIONAL_BANK = "National Bank",
    HSBC_CANADA = "HSBC",
    CANADIAN_TIRE_BANK = "Canadian Tire",
    SIMPLII_FINANCIAL = "Simplii",
    TANGERINE_BANK = "Tangerine",
    EQ_BANK = "EQ Bank",
    LAURENTIAN_BANK = "Laurentian Bank",
    MANULIFE_BANK = "Manulife Bank",
    DUCA_CREDIT_UNION = "DUCA",
    VANCITY = "Vancity",
    COAST_CAPITAL = "Coast Capital",
    DESJARDINS = "Desjardins",
    OTHER = "Other"
}

// 前端使用的账户类型
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
    status?: FinanceAccountStatus;
    userId?: string;
}

// 后端 API 返回的账户类型
export interface BackendFinanceAccount {
    id?: string;
    account_name?: string;
    bank_name?: string;
    account_type?: string;
    currency?: Currency | string;
    balance?: number;
    card_type?: string;
    account_number?: string;
    card_holder?: string;
    expiry_date?: string;
    status?: string;
    user_id?: string;
}
export interface BankTheme {
  background: string;
  textColor: string;
}

export const CardBackgroundThemes: Record<FinanceBankName, BankTheme> = {
  [FinanceBankName.RBC]: {
    background: 'bg-gradient-to-br from-[#0051A5] to-[#00498F]',
    textColor: 'text-white'
  },
  [FinanceBankName.TD]: {
    background: 'bg-gradient-to-br from-[#2C8C28] to-[#1E5B1E]',
    textColor: 'text-white'
  },
  [FinanceBankName.CIBC]: {
    background: 'bg-gradient-to-br from-[#CE0E2D] to-[#B50D26]',
    textColor: 'text-white'
  },
  [FinanceBankName.BMO]: {
    background: 'bg-gradient-to-br from-[#0075BE] to-[#005587]',
    textColor: 'text-white'
  },
  [FinanceBankName.SCOTIABANK]: {
    background: 'bg-gradient-to-br from-[#EC111A] to-[#C60E15]',
    textColor: 'text-white'
  },
  [FinanceBankName.AMERICAN_EXPRESS]: {
    background: 'bg-gradient-to-br from-[#2E77BC] to-[#1C4F7C]',
    textColor: 'text-white'
  },
  [FinanceBankName.NATIONAL_BANK]: {
    background: 'bg-gradient-to-br from-[#DA291C] to-[#B22316]',
    textColor: 'text-white'
  },
  [FinanceBankName.HSBC_CANADA]: {
    background: 'bg-gradient-to-br from-[#DB0011] to-[#B2000E]',
    textColor: 'text-white'
  },
  [FinanceBankName.CANADIAN_TIRE_BANK]: {
    background: 'bg-gradient-to-br from-[#D31245] to-[#B30F3A]',
    textColor: 'text-white'
  },
  [FinanceBankName.SIMPLII_FINANCIAL]: {
    background: 'bg-gradient-to-br from-[#F26E21] to-[#D35D1B]',
    textColor: 'text-white'
  },
  [FinanceBankName.TANGERINE_BANK]: {
    background: 'bg-gradient-to-br from-[#FF6B00] to-[#E65C00]',
    textColor: 'text-white'
  },
  [FinanceBankName.EQ_BANK]: {
    background: 'bg-gradient-to-br from-[#652D90] to-[#4E2270]',
    textColor: 'text-white'
  },
  [FinanceBankName.LAURENTIAN_BANK]: {
    background: 'bg-gradient-to-br from-[#DC4405] to-[#B83804]',
    textColor: 'text-white'
  },
  [FinanceBankName.MANULIFE_BANK]: {
    background: 'bg-gradient-to-br from-[#00A758] to-[#008A48]',
    textColor: 'text-white'
  },
  [FinanceBankName.DUCA_CREDIT_UNION]: {
    background: 'bg-gradient-to-br from-[#0072BC] to-[#005A94]',
    textColor: 'text-white'
  },
  [FinanceBankName.VANCITY]: {
    background: 'bg-gradient-to-br from-[#E31937] to-[#C2152E]',
    textColor: 'text-white'
  },
  [FinanceBankName.COAST_CAPITAL]: {
    background: 'bg-gradient-to-br from-[#00698C] to-[#004D66]',
    textColor: 'text-white'
  },
  [FinanceBankName.DESJARDINS]: {
    background: 'bg-gradient-to-br from-[#008A47] to-[#006D38]',
    textColor: 'text-white'
  },
  [FinanceBankName.OTHER]: {
    background: 'bg-gradient-to-br from-gray-700 to-gray-900',
    textColor: 'text-white'
  }
};
