import { create } from 'zustand';
import { FinanceAccount, FinanceAccountStatus, FinanceAccountType, FinanceBankName, FinanceTransaction } from '@/types/finance';
import { fetchAccounts, addAccount, updateAccount, deleteAccount, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } from '@/api/finance.api';

interface FinanceState {
  accounts: FinanceAccount[];
  transactions: FinanceTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<FinanceAccount, 'id'>) => Promise<void>;
  updateAccount: (account: FinanceAccount) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: FinanceTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await fetchAccounts();
      set({ accounts });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await addAccount(account);
      set((state) => ({ accounts: [...state.accounts, newAccount] }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add account',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAccount = await updateAccount(account);
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === account.id ? updatedAccount : a)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update account',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteAccount(id);
      set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await fetchTransactions();
      set({ transactions });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await addTransaction(transaction);
      set((state) => ({ transactions: [...state.transactions, newTransaction] }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add transaction',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await updateTransaction(transaction);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === transaction.id ? updatedTransaction : t)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update transaction',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTransaction(id);
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete transaction',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
