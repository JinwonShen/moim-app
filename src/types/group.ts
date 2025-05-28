import type { Timestamp } from "firebase/firestore";

export type Group = {
	id: string;
	groupName: string;
	description: string;
	creatorId: string;
	createdAt: Timestamp; // or Timestamp
	participants?: string[]; // optional
};
