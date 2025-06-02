import type { Timestamp } from "firebase/firestore";

export type Group = {
	id: string;
	groupName: string;
	description: string;
	creatorId: string;
	createdAt: Timestamp;
	participants: string[];
	paidParticipants: string[]; // ← 추가됨
	participantCount: number;
	startDate: string;
	endDate: string;
	dueDate: string;
	totalBudget: number;
	balance: number;
};
