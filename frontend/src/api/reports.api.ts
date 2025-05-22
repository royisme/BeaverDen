import { getApiClient } from '@/lib/api-client';
import { ReportSummary } from '@/types/finance/report.type';

export async function fetchSummaryReport(
  startDate: string,
  endDate: string,
  accountId?: string,
  transactionType?: string
): Promise<ReportSummary> {
  const apiClient = await getApiClient();
  const params = {
    start_date: startDate,
    end_date: endDate,
    account_id: accountId,
    transaction_type: transactionType
  };
  
  const response = await apiClient.getClient().get('/reports/summary', { params });
  return response;
}
