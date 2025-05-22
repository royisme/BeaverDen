import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchBudgetUsage, deleteBudget } from '@/api/budget.api';
import { BudgetUsage } from '@/types/finance/budget.type';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const BudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budgetUsage, setBudgetUsage] = useState<BudgetUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const loadBudgetUsage = async () => {
      try {
        setLoading(true);
        const data = await fetchBudgetUsage(id);
        setBudgetUsage(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load budget details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBudgetUsage();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteBudget(id);
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      navigate('/budgets');
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <p>Loading budget details...</p>
      </div>
    );
  }

  if (!budgetUsage) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Budget not found</h3>
          <Button className="mt-4" onClick={() => navigate('/budgets')}>
            Back to Budgets
          </Button>
        </div>
      </div>
    );
  }

  const { budget, period, usage } = budgetUsage;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{budget.name}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/budgets')}>
            Back
          </Button>
          <Button onClick={() => navigate(`/budgets/edit/${budget.id}`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>{period.currentPeriod}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {formatCurrency(usage.totalSpent)} of {formatCurrency(budget.amount)}
                </span>
                <span className={`text-sm font-medium ${usage.isOverBudget ? 'text-red-500' : ''}`}>
                  {usage.percentageUsed.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(usage.percentageUsed, 100)} 
                className={`h-3 ${getProgressColor(usage.percentageUsed, usage.isOverBudget)}`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Spent</div>
                <div className="text-2xl font-bold">{formatCurrency(usage.totalSpent)}</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className={`text-2xl font-bold ${usage.isOverBudget ? 'text-red-500' : ''}`}>
                  {formatCurrency(usage.remaining)}
                </div>
              </div>
            </div>

            {usage.isOverBudget && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                <div className="font-medium">Over Budget!</div>
                <div className="text-sm">
                  You've exceeded your budget by {formatCurrency(Math.abs(usage.remaining))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Budget Amount</div>
              <div className="font-medium">{formatCurrency(budget.amount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Period Type</div>
              <div className="font-medium capitalize">{budget.periodType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Period</div>
              <div className="font-medium">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </div>
            </div>
            {budget.category && (
              <div>
                <div className="text-sm text-muted-foreground">Category</div>
                <div className="font-medium">{budget.category}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{formatDate(budget.createdAt)}</div>
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete Budget</Button>
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
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BudgetDetail;
