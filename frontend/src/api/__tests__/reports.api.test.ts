import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchMonthlySummaryReport, fetchSummaryReport, FetchMonthlySummaryReportParams, MonthlySummaryReportData } from '../reports.api';
import { getApiClient } from '@/lib/api-client';
import { ReportSummary, ReportSummaryItem } from '@/types/finance/report.type';

// Mock the apiClient
vi.mock('@/lib/api-client', () => ({
  getApiClient: vi.fn().mockResolvedValue({
    getClient: vi.fn().mockReturnValue({
      get: vi.fn(),
      post: vi.fn(), // Though not used in these specific functions, good to have
    }),
  }),
}));

describe('reports.api', () => {
  let mockApiClient: any;
  let mockGet: any;

  beforeEach(async () => {
    mockApiClient = await getApiClient();
    mockGet = mockApiClient.getClient().get;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMonthlySummaryReport', () => {
    const mockMonthlyData: MonthlySummaryReportData[] = [
      { month: '2023-01', total_expense: 100, total_income: 200, net_change: 100 },
      { month: '2023-02', total_expense: 150, total_income: 50, net_change: -100 },
    ];

    it('should fetch monthly summary with year only', async () => {
      mockGet.mockResolvedValueOnce(mockMonthlyData);
      const params: FetchMonthlySummaryReportParams = { year: 2023 };
      const result = await fetchMonthlySummaryReport(params);

      expect(mockGet).toHaveBeenCalledWith('/reports/monthly-summary', { params: { year: 2023 } });
      expect(result).toEqual(mockMonthlyData);
    });

    it('should fetch monthly summary with year and month', async () => {
      const singleMonthData = [mockMonthlyData[0]];
      mockGet.mockResolvedValueOnce(singleMonthData);
      const params: FetchMonthlySummaryReportParams = { year: 2023, month: 1 };
      const result = await fetchMonthlySummaryReport(params);

      expect(mockGet).toHaveBeenCalledWith('/reports/monthly-summary', { params: { year: 2023, month: 1 } });
      expect(result).toEqual(singleMonthData);
    });

    it('should fetch monthly summary with year, month, and account_id', async () => {
      const filteredData = [mockMonthlyData[1]];
      mockGet.mockResolvedValueOnce(filteredData);
      const params: FetchMonthlySummaryReportParams = { year: 2023, month: 2, account_id: 'acc123' };
      const result = await fetchMonthlySummaryReport(params);

      expect(mockGet).toHaveBeenCalledWith('/reports/monthly-summary', { params: { year: 2023, month: 2, account_id: 'acc123' } });
      expect(result).toEqual(filteredData);
    });

    it('should handle API error for fetchMonthlySummaryReport', async () => {
      const error = new Error('Network Error');
      mockGet.mockRejectedValueOnce(error);
      const params: FetchMonthlySummaryReportParams = { year: 2023 };

      await expect(fetchMonthlySummaryReport(params)).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledWith('/reports/monthly-summary', { params: { year: 2023 } });
    });
  });

  describe('fetchSummaryReport', () => {
    const mockReportItems: ReportSummaryItem[] = [
      { category_id: 'cat1', category_name: 'Food', total_amount: 150, count: 5, percentage: 60 },
      { category_id: 'cat2', category_name: 'Transport', total_amount: 100, count: 3, percentage: 40 },
    ];
    const mockReportSummary: ReportSummary = {
      total: 250,
      items: mockReportItems,
      period: { start_date: '2023-01-01', end_date: '2023-01-31' },
    };

    it('should fetch summary report with start_date and end_date', async () => {
      mockGet.mockResolvedValueOnce(mockReportSummary);
      const startDate = '2023-01-01T00:00:00.000Z';
      const endDate = '2023-01-31T23:59:59.000Z';
      const result = await fetchSummaryReport(startDate, endDate);

      expect(mockGet).toHaveBeenCalledWith('/reports/summary', {
        params: { start_date: startDate, end_date: endDate, account_id: undefined, transaction_type: undefined },
      });
      expect(result).toEqual(mockReportSummary);
    });

    it('should fetch summary report with all parameters', async () => {
      mockGet.mockResolvedValueOnce(mockReportSummary);
      const startDate = '2023-02-01T00:00:00.000Z';
      const endDate = '2023-02-28T23:59:59.000Z';
      const accountId = 'acc456';
      const transactionType = 'expense';
      const result = await fetchSummaryReport(startDate, endDate, accountId, transactionType);

      expect(mockGet).toHaveBeenCalledWith('/reports/summary', {
        params: { start_date: startDate, end_date: endDate, account_id: accountId, transaction_type: transactionType },
      });
      expect(result).toEqual(mockReportSummary);
    });

    it('should handle API error for fetchSummaryReport', async () => {
      const error = new Error('Server Error');
      mockGet.mockRejectedValueOnce(error);
      const startDate = '2023-03-01T00:00:00.000Z';
      const endDate = '2023-03-31T23:59:59.000Z';

      await expect(fetchSummaryReport(startDate, endDate)).rejects.toThrow('Server Error');
      expect(mockGet).toHaveBeenCalledWith('/reports/summary', {
        params: { start_date: startDate, end_date: endDate, account_id: undefined, transaction_type: undefined },
      });
    });
  });
});

// Helper to run tests if this file is executed directly by some test runners (optional)
if (import.meta.vitest) {
  import.meta.vitest.run();
}
