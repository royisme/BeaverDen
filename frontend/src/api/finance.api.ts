import { getApiClient } from '@/lib/api-client';
import { 
    FinanceAccount,
} from '@/types/finance/finance.type';

export async function fetchAccounts(): Promise<FinanceAccount[]> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get('/finance/accounts');
    return response;
}

export async function addAccount(account: Omit<FinanceAccount, 'id'>): Promise<FinanceAccount> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().post('/finance/accounts', account);
    return response;
}

export async function updateAccount(account: FinanceAccount): Promise<FinanceAccount> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().put(`/finance/accounts/${account.id}`, account);
    return response;
}

export async function deleteAccount(id: string): Promise<void> {
    const apiClient = await getApiClient();
    return await apiClient.getClient().delete(`/finance/accounts/${id}`);
}
