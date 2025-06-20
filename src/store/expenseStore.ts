/** 
 * 이 파일은 Zustand를 사용하여 '최근 지출 목록'을 전역 상태로 관리하는 스토어입니다.
 * 최근 지출 내역은 대시보드 및 지출 통계 등 다양한 화면에서 참조되며,
 * setRecentExpenses를 통해 상태를 업데이트하고, clearExpenses로 초기화할 수 있습니다.
 */
import type { Timestamp } from "firebase/firestore";
import { create } from "zustand";

// 개별 지출 항목의 타입 정의
type Expense = {
	id: string; // 지출 항목의 고유 ID
	author: string; // 작성자 UID 또는 이름
	description: string; // 지출 설명
	category: string; // 지출 분류 (식비, 교통비 등)
	amount: number; // 지출 금액
	createdAt: Timestamp; // 지출 등록 시각 (Firebase Timestamp)
};

// Zustand 스토어를 위한 상태 및 액션 타입 정의
type ExpenseStore = {
	recentExpenses: Expense[]; // 최근 지출 목록
	setRecentExpenses: (items: Expense[]) => void; // 지출 목록 설정 함수
	clearExpenses: () => void; // 지출 목록 초기화 함수
};

// Zustand 스토어 생성: 지출 상태를 전역으로 관리
export const useExpenseStore = create<ExpenseStore>((set) => ({
	recentExpenses: [],
	setRecentExpenses: (items) => set({ recentExpenses: items }),
	clearExpenses: () => set({ recentExpenses: [] }),
}));
