import { getApiClient } from '@/lib/api-client';
import { FinanceAccount, FinanceTransaction } from '@/types/finance';

export async function fetchAccounts(): Promise<FinanceAccount[]> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().get('/finance/accounts');
  return response.data;
}

export async function addAccount(account: Omit<FinanceAccount, 'id'>): Promise<FinanceAccount> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().post('/finance/accounts', account);
  return response.data;
}

export async function updateAccount(account: FinanceAccount): Promise<FinanceAccount> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().put(`/finance/accounts/${account.id}`, account);
  return response.data;
}

export async function deleteAccount(id: string): Promise<void> {
  const apiClient = await getApiClient();
  await apiClient.getClient().delete(`/finance/accounts/${id}`);
}

export async function fetchTransactions(): Promise<FinanceTransaction[]> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().get('/finance/transactions');
  return response.data;
}

export async function addTransaction(transaction: Omit<FinanceTransaction, 'id'>): Promise<FinanceTransaction> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().post('/finance/transactions', transaction);
  return response.data;
}

export async function updateTransaction(transaction: FinanceTransaction): Promise<FinanceTransaction> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().put(`/finance/transactions/${transaction.id}`, transaction);
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const apiClient = await getApiClient();
  await apiClient.getClient().delete(`/finance/transactions/${id}`);
}
