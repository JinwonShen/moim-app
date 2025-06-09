import type { Timestamp } from "firebase/firestore";

export type Expense = {
	id: string;
	category: string;
	description?: string;
	amount: number;
	createdAt: Timestamp; // Firestore Timestamp 또는 Date 객체
};

export type EditedExpense = {
	category: string;
	memo: string;
	amount: string;
	date: string;
};

export type ExpenseListProps = {
	expenses: Expense[];
	isEditMode: boolean;
	categories: string[];
	selectedExpenseIds: string[];
	editingExpenseId: string | null;
	editedExpense: EditedExpense;
	onToggleEditMode: () => void;
	onToggleExpenseSelection: (id: string) => void;
	onChangeField: (field: string, value: string) => void;
	onSaveEditExpense: (id: string) => void;
	onCancelEdit: () => void;
	onClickEdit: (id: string, expense: Expense) => void;
	onBulkDelete: () => void;
};
