import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchAllBudgetsUsage, deleteBudget } from '@/api/budget.api';
import { BudgetUsage } from '@/types/finance/budget.type';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const BudgetsList: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBudgetsUsage();
      setBudgets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      loadBudgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage > 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button onClick={() => navigate('/budgets/new')}>Create Budget</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No budgets found</h3>
          <p className="text-muted-foreground mt-2">Create your first budget to start tracking your spending</p>
          <Button className="mt-4" onClick={() => navigate('/budgets/new')}>Create Budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budgetUsage) => (
            <Card key={budgetUsage.budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{budgetUsage.budget.name}</CardTitle>
                <CardDescription>{budgetUsage.period.currentPeriod}</CardDescription>
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
                  <div className="flex justify-between text-sm">
                    <span>Remaining: {formatCurrency(budgetUsage.usage.remaining)}</span>
                    <span className={budgetUsage.usage.isOverBudget ? 'text-red-500 font-medium' : ''}>
                      {budgetUsage.usage.isOverBudget ? 'Over budget!' : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/budgets/${budgetUsage.budget.id}`)}>
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the budget.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(budgetUsage.budget.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetsList;
