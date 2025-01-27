// 账户类型映射
export const AccountTypeConfig = {
  displayToBackend: {
    'Chequing': 'checking',
    'Savings': 'savings',
    'Credit Card': 'credit',
    'Investment': 'investment',
    'Cash': 'cash',
    'Other': 'other'
  },
  backendToDisplay: {
    'checking': 'Chequing',
    'savings': 'Savings',
    'credit': 'Credit Card',
    'investment': 'Investment',
    'cash': 'Cash',
    'other': 'Other'
  }
} as const;

// 卡类型映射
export const CardTypeConfig = {
  displayToBackend: {
    'Visa': 'visa',
    'MasterCard': 'mastercard',
    'Amex': 'amex',
    'Debit': 'debit',
    'Other': 'other'
  },
  backendToDisplay: {
    'visa': 'Visa',
    'mastercard': 'MasterCard',
    'amex': 'Amex',
    'debit': 'Debit',
    'other': 'Other'
  }
} as const;

// 银行名称映射
export const BankNameConfig = {
  displayToBackend: {
    'RBC Royal Bank': 'RBC',
    'TD Canada Trust': 'TD',
    'CIBC': 'CIBC',
    'BMO Bank of Montreal': 'BMO',
    'Scotiabank': 'Scotia Bank',
    'HSBC Canada': 'HSBC',
    'Tangerine Bank': 'Tangerine',
    'Simplii Financial': 'Simplii',
    'Other': 'Other'
  },
  backendToDisplay: {
    'RBC': 'RBC Royal Bank',
    'TD': 'TD Canada Trust',
    'CIBC': 'CIBC',
    'BMO': 'BMO Bank of Montreal',
    'Scotia Bank': 'Scotiabank',
    'HSBC': 'HSBC Canada',
    'Tangerine': 'Tangerine Bank',
    'Simplii': 'Simplii Financial',
    'Other': 'Other'
  }
} as const;

import { FinanceAccountType, FinanceBankName, FinanceAccountCardType } from '@/types/finance/finance.type';

// 从前端枚举到后端值的映射
export const AccountTypeBackendValues = {
    [FinanceAccountType.CHEQUING]: 'checking',
    [FinanceAccountType.SAVINGS]: 'savings',
    [FinanceAccountType.CREDIT_CARD]: 'credit',
    [FinanceAccountType.INVESTMENT]: 'investment',
    [FinanceAccountType.CASH]: 'cash'
} as const;

export const BankNameBackendValues = {
    [FinanceBankName.RBC]: 'RBC',
    [FinanceBankName.TD]: 'TD',
    [FinanceBankName.CIBC]: 'CIBC',
    [FinanceBankName.BMO]: 'BMO',
    [FinanceBankName.SCOTIABANK]: 'Scotia',
    [FinanceBankName.AMERICAN_EXPRESS]: 'AMEX',
    [FinanceBankName.NATIONAL_BANK]: 'NBC',
    [FinanceBankName.HSBC_CANADA]: 'HSBC',
    [FinanceBankName.CANADIAN_TIRE_BANK]: 'CT',
    [FinanceBankName.SIMPLII_FINANCIAL]: 'Simplii',
    [FinanceBankName.TANGERINE_BANK]: 'Tangerine',
    [FinanceBankName.EQ_BANK]: 'EQ',
    [FinanceBankName.LAURENTIAN_BANK]: 'Laurentian',
    [FinanceBankName.MANULIFE_BANK]: 'Manulife',
    [FinanceBankName.DUCA_CREDIT_UNION]: 'DUCA',
    [FinanceBankName.VANCITY]: 'Vancity',
    [FinanceBankName.COAST_CAPITAL]: 'Coast',
    [FinanceBankName.DESJARDINS]: 'Desjardins',
    [FinanceBankName.OTHER]: 'Other'
} as const;

export const CardTypeBackendValues = {
    [FinanceAccountCardType.VISA]: 'visa',
    [FinanceAccountCardType.MASTERCARD]: 'mastercard',
    [FinanceAccountCardType.AMEX]: 'amex',
    [FinanceAccountCardType.DISCOVER]: 'discover',
    [FinanceAccountCardType.JCB]: 'jcb',
    [FinanceAccountCardType.DINERS]: 'diners',
    [FinanceAccountCardType.UNIONPAY]: 'unionpay',
    [FinanceAccountCardType.OTHER]: 'other'
} as const;

// 从后端值到前端枚举的映射
export const BackendToAccountType = Object.entries(AccountTypeBackendValues).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key as FinanceAccountType }), 
    {} as Record<string, FinanceAccountType>
);

export const BackendToBankName = Object.entries(BankNameBackendValues).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key as FinanceBankName }), 
    {} as Record<string, FinanceBankName>
);

export const BackendToCardType = Object.entries(CardTypeBackendValues).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key as FinanceAccountCardType }), 
    {} as Record<string, FinanceAccountCardType>
);

// 类型定义
export type BackendAccountType = keyof typeof AccountTypeConfig.backendToDisplay;
export type DisplayAccountType = keyof typeof AccountTypeConfig.displayToBackend;
export type BackendCardType = keyof typeof CardTypeConfig.backendToDisplay;
export type DisplayCardType = keyof typeof CardTypeConfig.displayToBackend;
export type BackendBankName = keyof typeof BankNameConfig.backendToDisplay;
export type DisplayBankName = keyof typeof BankNameConfig.displayToBackend;
