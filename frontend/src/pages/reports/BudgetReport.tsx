import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAllBudgetsUsage } from '@/api/budget.api';
import { BudgetUsage } from '@/types/finance/budget.type';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BudgetReport: React.FC = () => {
  const [budgetsUsage, setBudgetsUsage] = useState<BudgetUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadBudgetsUsage = async () => {
      try {
        setLoading(true);
        const data = await fetchAllBudgetsUsage();
        setBudgetsUsage(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load budget data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBudgetsUsage();
  }, [toast]);

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage > 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const chartData = budgetsUsage.map(item => ({
    name: item.budget.name,
    budget: item.budget.amount,
    spent: item.usage.totalSpent,
    remaining: item.usage.remaining > 0 ? item.usage.remaining : 0,
    overspent: item.usage.remaining < 0 ? Math.abs(item.usage.remaining) : 0,
  }));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Budget Report</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading budget data...</p>
        </div>
      ) : budgetsUsage.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <h3 className="text-lg font-medium">No budgets found</h3>
            <p className="text-muted-foreground mt-2">
              Create budgets to track your spending
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual Spending</CardTitle>
              <CardDescription>
                Comparison of budgeted amounts and actual spending
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="spent" name="Spent" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetsUsage.map((budgetUsage) => (
              <Card key={budgetUsage.budget.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{budgetUsage.budget.name}</CardTitle>
                  <CardDescription>
                    {budgetUsage.period.currentPeriod} ({formatDate(budgetUsage.period.startDate)} - {formatDate(budgetUsage.period.endDate)})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {formatCurrency(budgetUsage.usage.totalSpent)} of {formatCurrency(budgetUsage.budget.amount)}
                      </span>
                      <span className={`text-sm font-medium ${budgetUsage.usage.isOverBudget ? 'text-red-500' : ''}`}>
                        {budgetUsage.usage.percentageUsed.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(budgetUsage.usage.percentageUsed, 100)} 
                      className={`h-2 ${getProgressColor(budgetUsage.usage.percentageUsed, budgetUsage.usage.isOverBudget)}`} 
                    />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                        <div className="font-medium">{formatCurrency(budgetUsage.budget.amount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Spent</div>
                        <div className="font-medium">{formatCurrency(budgetUsage.usage.totalSpent)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Remaining</div>
                        <div className={`font-medium ${budgetUsage.usage.isOverBudget ? 'text-red-500' : ''}`}>
                          {formatCurrency(budgetUsage.usage.remaining)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className={`font-medium ${budgetUsage.usage.isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                          {budgetUsage.usage.isOverBudget ? 'Over Budget' : 'On Track'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetReport;
