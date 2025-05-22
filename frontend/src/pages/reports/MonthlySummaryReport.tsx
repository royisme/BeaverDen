import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMonthlySummaryReport, FetchMonthlySummaryReportParams, MonthlySummaryReportData } from '@/api/reports.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years

const MonthlySummaryReport: React.FC = () => {
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number | undefined>(undefined);
  // TODO: Add account selection if needed in the future

  const params: FetchMonthlySummaryReportParams = { year, month };

  const { data, error, isLoading, refetch } = useQuery<MonthlySummaryReportData[], Error>({
    queryKey: ['monthlySummaryReport', params],
    queryFn: () => fetchMonthlySummaryReport(params),
    enabled: false, // Don't fetch automatically on mount
  });

  const handleFetchReport = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Consumption Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={month ? String(month) : ''} onValueChange={(value) => setMonth(value ? Number(value) : undefined)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleFetchReport}>Fetch Report</Button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        
        {data && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Total Expense</TableHead>
                <TableHead>Net Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((summary) => (
                <TableRow key={summary.month}>
                  <TableCell>{summary.month}</TableCell>
                  <TableCell>{summary.total_income.toFixed(2)}</TableCell>
                  <TableCell>{summary.total_expense.toFixed(2)}</TableCell>
                  <TableCell>{summary.net_change.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryReport;
