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

export interface FetchMonthlySummaryReportParams {
  year: number;
  month?: number;
  account_id?: string;
}

export interface MonthlySummaryReportData {
  month: string;
  total_expense: number;
  total_income: number;
  net_change: number;
}

export async function fetchMonthlySummaryReport(
  params: FetchMonthlySummaryReportParams
): Promise<MonthlySummaryReportData[]> {
  const apiClient = await getApiClient();
  const response = await apiClient.getClient().get('/reports/monthly-summary', { params });
  return response;
}
