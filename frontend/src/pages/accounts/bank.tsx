import { useEffect, useState } from "react"
import { FinanceAccount, FinanceAccountType, FinanceBankName, FinanceAccountStatus, FinanceAccountCardType } from "@/types/finance"

import { AccountList } from "@/pages/accounts/_components/account-list"
import { useFinanceStore } from "@/stores/finance.store"
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountForm } from "@/pages/accounts/_components/account-form";

export default function AccountPage(): React.ReactNode {
  const { accounts, fetchAccounts, addAccount } = useFinanceStore();
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onAddAccount = () => {
    setEditingAccount(null)
    setIsFormOpen(true)
  };

  const handleAddAccount = (account: FinanceAccount) => {
    addAccount(account)
    setIsFormOpen(false)
  };

  return (
    <div className="container mx-auto p-4">
      {accounts.length > 0 ? (
        <AccountList accounts={accounts} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-3xl font-bold mb-3 text-gray-800">Welcome to Your Financial Hub</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Start your journey to financial clarity by adding your first account. It's quick, easy, and secure.
        </p>
        <Button onClick={onAddAccount} size="lg" className="font-semibold px-8 py-6 text-lg">
          Add Your First Account
        </Button>
        <p className="mt-6 text-sm text-gray-500">
          You can add checking, savings, credit cards, investments, and more.
        </p>
      </div>
      )}
        {isFormOpen && (
        <AccountForm
          onSubmit={handleAddAccount}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingAccount(null)
          }}
          onDelete={() => {}}
          initialData={null}
          isNewAccount={true} // Pass isNewAccount based on whether it's a new account or an edit
        />
      )}
    </div>
  )
}

