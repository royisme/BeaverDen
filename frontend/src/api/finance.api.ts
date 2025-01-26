import { getApiClient } from '@/lib/api-client';
import { FinanceAccount } from '@/types/finance';

// 定义后端 API 接口的请求和响应类型
interface CreateAccountRequest {
  account_name: string;
  bank_name: string;
  account_type: string;
  currency: string;
  balance: number;
  card_type?: string;
  account_number?: string;
}

export async function fetchAccounts(): Promise<FinanceAccount[]> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get('/finance/accounts');
}

export async function addAccount(account: Omit<FinanceAccount, 'id'>): Promise<FinanceAccount> {
  const apiClient = await getApiClient();
  // 转换为后端期望的格式
  const requestData: CreateAccountRequest = {
    account_name: account.accountName,
    bank_name: account.bankName,
    account_type: account.accountType,
    currency: account.currency,
    balance: account.balance,
    card_type: account.cardType,
    account_number: account.accountNumber
  };
  return await apiClient.getClient().post('/finance/accounts', requestData);
}

export async function updateAccount(account: FinanceAccount): Promise<FinanceAccount> {
  const apiClient = await getApiClient();
  // 转换为后端期望的格式
  const requestData = {
    account_name: account.accountName,
    bank_name: account.bankName,
    account_type: account.accountType,
    currency: account.currency,
    balance: account.balance,
    card_type: account.cardType,
    account_number: account.accountNumber
  };
  return await apiClient.getClient().put(`/finance/accounts/${account.id}`, requestData);
}

export async function deleteAccount(id: string): Promise<void> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().delete(`/finance/accounts/${id}`);
}
