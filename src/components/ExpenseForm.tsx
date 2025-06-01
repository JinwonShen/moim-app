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
}

export default function ExpenseForm({
	onSubmit,
	onSuccess,
	categories,
	setCategories,
	submitLabel = "지출 등록하기",
}: ExpenseFormProps) {
	const [date, setDate] = useState("");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [newCategory, setNewCategory] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!date || !amount || !category) {
			alert("모든 필수 항목을 입력해주세요.");
			return;
		}

		try {
			await onSubmit({
				date,
				amount: Number(amount),
				category,
				memo,
			});
			setDate("");
			setAmount("");
			setCategory("");
			setMemo("");
			setNewCategory("");
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error("지출 등록 오류:", error);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-[12px] text-[14px]"
		>
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
					if (e.key === "Enter" && newCategory.trim()) {
						e.preventDefault();
						const trimmed = newCategory.trim();
						if (!categories.includes(trimmed)) {
							setCategories((prev) => [...prev, trimmed]);
							setCategory(trimmed);
						}
						setNewCategory("");
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
			<button
				type="submit"
				className="w-full py-[12px] bg-primary border border-primary rounded-[8px] text-white transition-all duration-300 hover:bg-white hover:text-primary"
			>
				{submitLabel}
			</button>
		</form>
	);
}
