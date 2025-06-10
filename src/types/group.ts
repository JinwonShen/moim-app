import type { Timestamp } from "firebase/firestore";

export type Group = {
	id: string; // Firestore 문서 ID (자동 생성됨, 수동으로 삽입)
	groupName: string; // 모임 이름
	description: string; // 모임 설명
	creatorId: string; // 모임을 생성한 사용자의 uid
	createdAt: Timestamp; // 모임 생성 시각 (serverTimestamp)
	participants: string[]; // 참가자 닉네임 목록
	paidParticipants: string[]; // 입금 완료한 참가자의 uid 목록
	participantCount: number; // 참가자 수 (참여자 수 + 모임장 포함)
	startDate: string; // 모임 시작일 (YYYY-MM-DD 형식)
	endDate: string; // 모임 종료일 (YYYY-MM-DD 형식)
	dueDate: string; // 입금 마감일 (YYYY-MM-DD 형식)
	depositDeadline: string; // "2025-06-15" 형식
	eachAmount?: number;     // 1인당 입금 금액
	totalBudget: number; // 총 예산 (모임장 지정)
	balance: number; // 현재 잔액 (입금 누적액 또는 지출 차감 후 금액)
};
