"use client";

import {
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogTitle,
} from "@radix-ui/react-dialog";
import {
	addDoc,
	collection,
	doc,
	increment,
	updateDoc,
} from "firebase/firestore";
import { useState } from "react";
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
	showGroupSelector?: boolean;
}

export default function AddExpenseModal({
	groupId,
	uid,
	categories,
	setCategories,
	fetchExpenses,
	onClose,
	showGroupSelector,
}: Props) {
	const [selectedGroupId, setSelectedGroupId] = useState(groupId);

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
							className="p-[4px] border rounded-[4px] bg-gray-100 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
						>
							<FiX />
						</button>
					</div>
				</div>

				{showGroupSelector && (
					<div className="mb-4">
						<label className="block mb-1 text-sm font-medium">모임 선택</label>
						<select
							className="w-full border rounded px-3 py-2 text-sm"
							onChange={(e) => setSelectedGroupId(e.target.value)}
							defaultValue={groupId}
						>
							{/* Replace this with actual group list rendering if needed */}
							<option value={groupId}>현재 모임</option>
						</select>
					</div>
				)}

				<ExpenseForm
					onSubmit={async ({ date, amount, category, memo }) => {
						try {
							const expensesRef = collection(db, "groups", selectedGroupId, "expenses");

							// 1. 지출 등록
							await addDoc(expensesRef, {
								date,
								amount,
								category,
								memo,
								author: uid,
								createdAt: new Date(),
							});

							// 2. 잔액 차감
							const groupRef = doc(db, "groups", selectedGroupId);
							await updateDoc(groupRef, {
								balance: increment(-amount),
							});

							// 3. 지출 새로고침 및 모달 닫기
							await fetchExpenses();
							onClose();
						} catch (error) {
							console.error("지출 등록 중 오류 발생:", error);
						}
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
