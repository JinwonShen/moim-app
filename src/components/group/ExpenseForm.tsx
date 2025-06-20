/**
 * 지출 등록 폼 컴포넌트
 * - 사용자가 날짜, 금액, 분류, 메모 등의 정보를 입력하여 지출 데이터를 등록할 수 있음
 * - props를 통해 등록 이벤트(onSubmit), 성공 콜백(onSuccess), 분류 목록(categories) 제어
 * - 새 분류를 입력하면 기존 분류 목록에 추가됨
 * - showHeader, showBottom 여부에 따라 버튼 표시 조절 가능
 */

import { useState } from "react";

interface ExpenseFormProps {
	onSubmit: (data: {
		date: string;
		amount: number;
		category: string;
		memo: string;
	}) => Promise<void>;
	onSuccess?: () => void;
	categories: string[];
	setCategories: React.Dispatch<React.SetStateAction<string[]>>;
	submitLabel?: string;
	showHeader?: boolean;
	showBottom?: boolean;
}

export default function ExpenseForm({
	onSubmit,
	onSuccess,
	categories,
	setCategories,
	submitLabel = "지출 등록하기",
	showHeader = true,
	showBottom = true,
}: ExpenseFormProps) {
	const [date, setDate] = useState("");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [newCategory, setNewCategory] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		// 폼 제출 시 페이지 리로드 방지
		e.preventDefault();

		// 필수 입력값(날짜, 금액, 분류)이 빠졌는지 확인
		if (!date || !amount || !category) {
			alert("모든 필수 항목을 입력해주세요.");
			return;
		}

		try {
			// onSubmit 콜백 실행: 부모 컴포넌트에 지출 정보 전달
			await onSubmit({
				date,
				amount: Number(amount), // 문자열 입력값을 숫자로 변환
				category,
				memo,
			});

			// 입력 필드 초기화
			setDate("");
			setAmount("");
			setCategory("");
			setMemo("");
			setNewCategory("");

			// 등록 성공 시 onSuccess 콜백 실행 (선택적)
			if (onSuccess) onSuccess();
		} catch (error) {
			// 에러 발생 시 콘솔 출력
			console.error("지출 등록 오류:", error);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-[12px] text-[14px]"
		>
			{showHeader && (
				<div className="flex justify-between items-center">
					<h2 className="text-[16px]">지출 등록</h2>
					<button type="submit" className="button px-[24px] py-[4px]">
						{submitLabel}
					</button>
				</div>
			)}
			<input
				type="date"
				value={date}
				onChange={(e) => setDate(e.target.value)}
				className="border px-2 py-1 rounded"
			/>
			<input
				type="number"
				placeholder="금액 (숫자만 입력)"
				value={amount}
				onChange={(e) => setAmount(e.target.value)}
				className="border px-2 py-1 rounded"
			/>
			<select
				value={category}
				onChange={(e) => setCategory(e.target.value)}
				className="border px-2 py-1 rounded"
			>
				<option value="">분류 선택</option>
				{categories.map((cat) => (
					<option key={cat} value={cat}>
						{cat}
					</option>
				))}
			</select>
			<input
				type="text"
				placeholder="새 분류 입력 후 Enter"
				value={newCategory}
				onChange={(e) => setNewCategory(e.target.value)}
				onKeyDown={(e) => {
					// 사용자가 Enter 키를 누를 때 실행됨
					// 새 분류가 유효하면 카테고리 목록에 추가하고 선택 분류로 설정
					if (e.key === "Enter" && newCategory.trim()) {
						e.preventDefault(); // 폼 제출 방지
						const trimmed = newCategory.trim();
						if (!categories.includes(trimmed)) {
							setCategories((prev) => [...prev, trimmed]); // 분류 목록에 추가
							setCategory(trimmed); // 해당 분류를 선택값으로 설정
						}
						setNewCategory(""); // 입력창 초기화
					}
				}}
				className="border px-2 py-1 rounded"
			/>
			<textarea
				placeholder="메모 입력"
				value={memo}
				onChange={(e) => setMemo(e.target.value)}
				rows={2}
				className="border px-2 py-1 rounded resize-none"
			/>
			{showBottom && (
				<button
					type="submit"
					className="w-full py-[12px] bg-primary border border-primary rounded-[8px] text-white transition-all duration-300 hover:bg-white hover:text-primary"
				>
					{submitLabel}
				</button>
			)}
		</form>
	);
}
