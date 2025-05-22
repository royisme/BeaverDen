import { getApiClient } from '@/lib/api-client';
import { Budget, BudgetUsage } from '@/types/finance/budget.type';

export async function fetchBudgets(): Promise<Budget[]> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get('/budgets/budgets');
    return response;
}

export async function fetchBudget(id: string): Promise<Budget> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get(`/budgets/budgets/${id}`);
    return response;
}

export async function createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().post('/budgets/budgets', budget);
    return response;
}

export async function updateBudget(budget: Budget): Promise<Budget> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().put(`/budgets/budgets/${budget.id}`, budget);
    return response;
}

export async function deleteBudget(id: string): Promise<void> {
    const apiClient = await getApiClient();
    return await apiClient.getClient().delete(`/budgets/budgets/${id}`);
}

export async function fetchBudgetUsage(id: string): Promise<BudgetUsage> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get(`/reports/budget-usage/${id}`);
    return response;
}

export async function fetchAllBudgetsUsage(): Promise<BudgetUsage[]> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get('/reports/budget-usage');
    return response;
}
