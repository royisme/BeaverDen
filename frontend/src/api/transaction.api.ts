import { getApiClient } from '@/lib/api-client';
import { 
  FinanceTransaction, 
  ImportBatch, 
  ImportBatchResult 
} from '@/types/transaction/transaction.type';

// 基本 CRUD 操作
export async function fetchTransactions(params?: {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: string;
  skip?: number;
  limit?: number;
}): Promise<FinanceTransaction[]> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get('/transactions', { params });
}

export async function fetchTransaction(id: string): Promise<FinanceTransaction> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get(`/transactions/${id}`);
}

export async function addTransaction(transaction: Omit<FinanceTransaction, 'id'>): Promise<FinanceTransaction> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().post('/transactions', transaction);
}

export async function updateTransaction(transaction: FinanceTransaction): Promise<FinanceTransaction> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().put(`/transactions/${transaction.id}`, transaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().delete(`/transactions/${id}`);
}

// 导入相关操作
export async function createImportBatch(
  file: File,
  accountId: string,
  statementFormat?: string
): Promise<ImportBatch> {
  const apiClient = await getApiClient();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('accountId', accountId);
  if (statementFormat) {
    formData.append('statementFormat', statementFormat);
  }
  return await apiClient.getClient().post('/transactions/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function getImportBatch(batchId: string): Promise<ImportBatch> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get(`/transactions/import/${batchId}`);
}

export async function listImportBatches(params?: {
  accountId?: string;
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<ImportBatch[]> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get('/transactions/import', { params });
}

export async function processImportBatch(
  batchId: string,
  autoCreate: boolean = false
): Promise<ImportBatchResult> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().post(`/transactions/import/${batchId}/process`, {
    autoCreate,
  });
}

export async function confirmImportBatch(
  batchId: string,
  selectedRows?: number[]
): Promise<ImportBatchResult> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().post(`/transactions/import/${batchId}/confirm`, {
    selectedRows,
  });
}

// 分析相关操作
export async function getCategorySummary(params: {
  startDate: string;
  endDate: string;
  accountId?: string;
  transactionType?: string;
}): Promise<Record<string, number>> {
  const apiClient = await getApiClient();
  return await apiClient.getClient().get('/transactions/analysis/category-summary', {
    params,
  });
}
