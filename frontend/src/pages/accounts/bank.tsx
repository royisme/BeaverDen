import { useEffect, useState } from "react"
import { FinanceAccount } from "@/types/finance/finance.type"
import { AccountList } from "@/pages/accounts/_components/account-list"
import { useFinanceStore } from "@/stores/finance.store"
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountForm } from "@/pages/accounts/_components/account-form";

export default function AccountPage(): React.ReactNode {
  const { accounts, fetchAccounts, addAccount } = useFinanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleAddAccount = async (account: FinanceAccount) => {
    try {
      setError(null);
      await addAccount(account);
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="text-destructive mb-4">⚠️ {error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

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
          <Button onClick={() => setIsFormOpen(true)} size="lg" className="font-semibold px-8 py-6 text-lg">
            Add Your First Account
          </Button>
          <p className="mt-6 text-sm text-gray-500">
            You can add checking, savings, credit cards, investments, and more.
          </p>
        </div>
      )}

      <AccountForm
        onSubmit={handleAddAccount}
        onCancel={() => setIsFormOpen(false)}
        onDelete={() => {}}
        initialData={null}
        isNewAccount={true}
        open={isFormOpen}
      />
    </div>
  );
}
