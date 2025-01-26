import { create } from 'zustand';
import { FinanceTransaction } from '@/types/finance';
import { fetchTransactions, addTransaction, updateTransaction, deleteTransaction } from '@/api/transaction.api';

interface TransactionState {
  transactions: FinanceTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: FinanceTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchTransactions();
      set({ transactions: response });
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
      const response = await addTransaction(transaction);
      set((state) => ({ transactions: [...state.transactions, response] }));
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
      const response = await updateTransaction(transaction);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transaction.id ? response : t
        ),
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
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete transaction',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
