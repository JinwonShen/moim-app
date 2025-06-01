import type { Timestamp } from "firebase/firestore";
import { create } from "zustand";

type Expense = {
	id: string;
	author: string;
	description: string;
	category: string;
	amount: number;
	createdAt: Timestamp;
};

type ExpenseStore = {
	recentExpenses: Expense[];
	setRecentExpenses: (items: Expense[]) => void;
	clearExpenses: () => void;
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
	recentExpenses: [],
	setRecentExpenses: (items) => set({ recentExpenses: items }),
	clearExpenses: () => set({ recentExpenses: [] }),
}));
