import { getApiClient } from '@/lib/api-client';
import { CategoryRule } from '@/types/transaction/category-rule.type';

export async function fetchCategoryRules(): Promise<CategoryRule[]> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get('/category-rules');
    return response;
}

export async function fetchCategoryRule(id: string): Promise<CategoryRule> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().get(`/category-rules/${id}`);
    return response;
}

export async function createCategoryRule(rule: Omit<CategoryRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CategoryRule> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().post('/category-rules', rule);
    return response;
}

export async function updateCategoryRule(id: string, rule: Partial<CategoryRule>): Promise<CategoryRule> {
    const apiClient = await getApiClient();
    const response = await apiClient.getClient().put(`/category-rules/${id}`, rule);
    return response;
}

export async function deleteCategoryRule(id: string): Promise<void> {
    const apiClient = await getApiClient();
    return await apiClient.getClient().delete(`/category-rules/${id}`);
}
