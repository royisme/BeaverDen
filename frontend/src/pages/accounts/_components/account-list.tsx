import { useState } from 'react';
import { FinanceAccount } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AccountCard } from './account-card';
import { AccountForm } from './account-form';
import { useFinanceStore } from '@/stores/finance.store';

export function AccountList({ accounts: initialAccounts }: { accounts: FinanceAccount[] }) {
  const { addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);

  const handleAddAccount = async (newAccount: FinanceAccount) => {
    await addAccount(newAccount);
    setIsFormOpen(false);
  };

  const handleEditAccount = async (updatedAccount: FinanceAccount) => {
    await updateAccount(updatedAccount);
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Accounts</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={() => {
              setEditingAccount(account);
              setIsFormOpen(true);
            }}
          />
        ))}
      </div>
      {isFormOpen && (
        <AccountForm
          onSubmit={editingAccount ? handleEditAccount : handleAddAccount}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAccount(null);
          }}
          onDelete={handleDeleteAccount}
          initialData={editingAccount}
        />
      )}
    </div>
  );
}
  