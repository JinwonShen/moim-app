import type { Timestamp } from "firebase/firestore";

// 개별 지출 항목을 나타내는 타입
export type Expense = {
	id: string; // 지출 항목의 고유 ID
	category: string; // 지출 분류 (예: 식비, 교통비 등)
	description?: string; // 지출에 대한 설명 (선택 사항)
	amount: number; // 지출 금액
	createdAt: Timestamp; // 생성 시각 (Firestore Timestamp 객체)
};

// 수정 중인 지출 항목의 임시 상태를 위한 타입
export type EditedExpense = {
	category: string; // 카테고리(분류)
	memo: string; // 메모/설명
	amount: string; // 금액 (문자열로 입력)
	date: string; // 날짜 (문자열)
};

// ExpenseList 컴포넌트에서 사용하는 props의 타입
export type ExpenseListProps = {
	expenses: Expense[]; // 지출 항목 배열
	isEditMode: boolean; // 편집 모드 여부
	categories: string[]; // 사용 가능한 지출 카테고리 목록
	selectedExpenseIds: string[]; // 선택된 지출 항목들의 ID (일괄 삭제 등)
	editingExpenseId: string | null; // 현재 수정 중인 지출 항목 ID
	editedExpense: EditedExpense; // 수정 중인 임시 지출 항목 상태
	onToggleEditMode: () => void; // 편집 모드 토글 핸들러
	onToggleExpenseSelection: (id: string) => void; // 항목 선택/해제 핸들러
	onChangeField: (field: string, value: string) => void; // 입력 필드 변경 핸들러
	onSaveEditExpense: (id: string) => void; // 수정 저장 핸들러
	onCancelEdit: () => void; // 수정 취소 핸들러
	onClickEdit: (id: string, expense: Expense) => void; // 수정 시작 핸들러
	onBulkDelete: () => void; // 선택 항목 일괄 삭제 핸들러
};
