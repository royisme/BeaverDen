import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFormData } from '@/types/finance';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateTransaction, useTransaction } = useTransactions();

  // Get transaction details
  const { data: transaction, isLoading } = useTransaction(id!);

  const handleSubmit = async (data: TransactionFormData) => {
    if (!id) return;
    
    try {
      await updateTransaction({ id, data });
      toast({
        title: 'Success',
        description: 'Transaction has been updated',
      });
      navigate('/app/transaction');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Transaction</h1>
      <TransactionForm
        initialData={transaction}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transaction')}
      />
    </div>
  );
}
