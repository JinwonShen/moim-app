"use client";

import {
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogTitle,
} from "@radix-ui/react-dialog";
import { addDoc, collection } from "firebase/firestore";
import { FiX } from "react-icons/fi";
import { db } from "../../lib/firebase";
import ExpenseForm from "../ExpenseForm";

interface Props {
	groupId: string;
	uid: string;
	categories: string[];
	setCategories: React.Dispatch<React.SetStateAction<string[]>>;
	fetchExpenses: () => Promise<void>;
	onClose: () => void;
}

export default function AddExpenseModal({
	groupId,
	uid,
	categories,
	setCategories,
	fetchExpenses,
	onClose,
}: Props) {
	return (
		<DialogOverlay className="fixed inset-0 bg-black/30 z-50">
			<DialogContent
				className="fixed top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2 
          w-[90vw] max-w-[500px] max-h-[90vh] 
          bg-white p-6 rounded-lg shadow-lg 
          z-50 overflow-y-auto"
			>
				<div className="flex justify-between items-center mb-[12px]">
					<div className="flex items-end">
						<DialogTitle className="text-[20px] font-bold">
							지출 등록
						</DialogTitle>
						<DialogDescription className="ml-[12px] pb-[4px] text-[14px]">
							모임 지출 등록
						</DialogDescription>
					</div>
					<div className="flex justify-between items-center">
						<button
							type="button"
							onClick={onClose}
							className="p-[4px] border rounded-[4px] bg-secondary-100 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
						>
							<FiX />
						</button>
					</div>
				</div>

				<ExpenseForm
					onSubmit={async ({ date, amount, category, memo }) => {
						const expensesRef = collection(db, "groups", groupId, "expenses");
						await addDoc(expensesRef, {
							date,
							amount,
							category,
							memo,
							author: uid,
							createdAt: new Date(),
						});
						await fetchExpenses();
						onClose(); // 등록 후 모달 닫기
					}}
					showHeader={false}
					onSuccess={onClose}
					categories={categories}
					setCategories={setCategories}
				/>
			</DialogContent>
		</DialogOverlay>
	);
}
