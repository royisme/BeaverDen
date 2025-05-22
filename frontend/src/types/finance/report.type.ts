export interface ReportSummaryItem {
  category_id: string;
  category_name: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface ReportSummary {
  total: number;
  items: ReportSummaryItem[];
  period: {
    start_date: string;
    end_date: string;
  };
}
