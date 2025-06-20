/**
 * AddExpenseModal 컴포넌트
 * - Radix UI의 Dialog를 사용하여 지출 등록 모달을 구현
 * - 선택된 모임의 지출을 Firebase Firestore에 등록하고 잔액을 차감
 * - 등록 후 부모로부터 전달받은 콜백(onSuccess, fetchExpenses)을 통해 외부 상태를 갱신
 */

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
import ExpenseForm from "../group/ExpenseForm";

interface Props {
	groupId: string;
	uid: string;
	categories: string[];
	setCategories: React.Dispatch<React.SetStateAction<string[]>>;
	fetchExpenses: () => Promise<void>;
	onClose: () => void;
	showGroupSelector?: boolean;
	onSuccess: () => void;	
}

export default function AddExpenseModal({
	groupId,
	uid,
	categories,
	setCategories,
	fetchExpenses,
	onClose,
	showGroupSelector,
	onSuccess,
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
							// 1. 선택된 모임의 지출 서브컬렉션에 문서 추가
							const expensesRef = collection(db, "groups", selectedGroupId, "expenses");

							await addDoc(expensesRef, {
								date,           // 지출 날짜
								amount,         // 지출 금액
								category,       // 분류
								memo,           // 메모
								author: uid,    // 작성자 uid
								createdAt: new Date(), // 생성 시각
							});

							// 2. 해당 모임의 잔액에서 지출 금액만큼 차감
							const groupRef = doc(db, "groups", selectedGroupId);
							await updateDoc(groupRef, {
								balance: increment(-amount),
							});

							// 3. 외부에서 전달된 fetchExpenses 함수로 지출 목록을 갱신
							await fetchExpenses();

							// 4. 외부에서 전달된 onSuccess 콜백 실행 (e.g. 상태 갱신)
							onSuccess();

							// 5. 모달 닫기
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
