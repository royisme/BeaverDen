import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFormData } from '@/types/transaction/transaction.type';
import { toast } from '@/hooks/use-toast';

export default function NewTransactionPage() {
  const navigate = useNavigate();
  const { createTransaction } = useTransactions();

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await createTransaction(data);
      toast({
        title: 'Success',
        description: 'Transaction has been created',
      });
      navigate('/app/transaction');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">New Transaction</h1>
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/transaction')}
      />
    </div>
  );
}
