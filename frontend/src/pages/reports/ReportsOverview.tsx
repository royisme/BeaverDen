import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { fetchSummaryReport } from '@/api/reports.api';
import { fetchAccounts } from '@/api/finance.api';
import { ReportSummary } from '@/types/finance/report.type';
import { FinanceAccount } from '@/types/finance/finance.type';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FF6B6B', '#6A7FDB', '#61DAFB', '#FF9AA2'
];

const ReportsOverview: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('expense');
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts();
        setAccounts(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load accounts",
          variant: "destructive",
        });
      }
    };

    loadAccounts();
  }, [toast]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await fetchSummaryReport(
          startDate.toISOString(),
          endDate.toISOString(),
          accountId || undefined,
          transactionType || undefined
        );
        setReportData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [startDate, endDate, accountId, transactionType, toast]);

  const chartData = reportData?.items.map(item => ({
    name: item.category_name,
    value: Math.abs(item.total_amount),
    percentage: item.percentage
  })) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <Link to="/app/reports/monthly-summary">
          <Button variant="outline">View Monthly Summary</Button>
        </Link>
      </div>

      {/* Existing Category Summary Report Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Category Summary Report</CardTitle>
          <CardDescription>Filters for category-based transaction summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <DatePicker date={startDate} setDate={setStartDate} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account</label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Transaction Type</label>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="">All Types</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading report data...</p>
        </div>
      ) : !reportData || reportData.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <h3 className="text-lg font-medium">No data available</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or date range
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Pie Chart Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {transactionType === 'expense' ? 'Expense' : transactionType === 'income' ? 'Income' : 'Transaction'} Breakdown
                </CardTitle>
                <CardDescription>
                  {formatDate(reportData.period.start_date)} - {formatDate(reportData.period.end_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(name) => `Category: ${name}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Summary Table Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Detailed Summary</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(reportData.total)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.items.map((item) => (
                      <TableRow key={item.category_id}>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Math.abs(item.total_amount))}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {/* End of Existing Category Summary Report Section */}
    </div>
  );
};

export default ReportsOverview;
