import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TransactionList } from './_components/transaction-list';
import { Plus, Upload } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

export default function TransactionPage() {
  const navigate = useNavigate();
  const { transactions, isLoading } = useTransactions();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">View and manage all transactions</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/app/payments/import')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => navigate('/app/payments/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      <TransactionList
        transactions={transactions || []}
        isLoading={isLoading}
      />
    </div>
  );
}
