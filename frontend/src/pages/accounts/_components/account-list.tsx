import { useState } from 'react';
import { FinanceAccount } from '@/types/finance/finance.type';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AccountCard } from './account-card';
import { AccountForm } from './account-form';
import { useFinanceStore } from '@/stores/finance.store';

export function AccountList({ accounts: initialAccounts }: { accounts: FinanceAccount[] }) {
  const { addAccount, updateAccount, deleteAccount } = useFinanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  console.log('accounts', initialAccounts);
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
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="container mx-auto space-y-8 px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Accounts</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
        {initialAccounts.map((account) => (
          <div key={account.id} className="w-full max-w-[340px]">
            <AccountCard
              account={account}
              onEdit={() => {
                setEditingAccount(account);
                setIsFormOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      <AccountForm
        onSubmit={editingAccount ? handleEditAccount : handleAddAccount}
        onCancel={handleCancel}
        onDelete={handleDeleteAccount}
        initialData={editingAccount}
        isNewAccount={!editingAccount}
        open={isFormOpen}
      />
    </div>
  );
}