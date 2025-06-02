import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";
import type { Group } from "../types/group";

type GroupStore = {
	myGroups: Group[];
	joinedGroups: Group[];
	loading: boolean;
	fetchGroups: (uid: string) => Promise<void>;
};

export const useGroupStore = create<GroupStore>((set) => ({
	myGroups: [],
	joinedGroups: [],
	loading: false,

	fetchGroups: async (uid: string) => {
		set({ loading: true });

		try {
			const groupSnapshot = await getDocs(collection(db, "groups"));

			const myGroups: Group[] = [];
			const joinedGroups: Group[] = [];

			for (const docSnap of groupSnapshot.docs) {
				const raw = docSnap.data();
				const groupId = docSnap.id;

				const groupData: Group = {
					...(raw as Omit<Group, "id">),
					id: groupId,
				};

				// 내가 만든 모임
				if (groupData.creatorId === uid) {
					myGroups.push(groupData);
				} else {
					const participantsRef = collection(
						db,
						"groups",
						groupId,
						"participants",
					);
					const participantSnap = await getDocs(participantsRef);

					const matched = participantSnap.docs.find(
						(p) => p.data().uid === uid,
					);
					if (matched) {
						joinedGroups.push(groupData);
					}
				}
			}

			set({ myGroups, joinedGroups });
		} catch (error) {
			console.error("❌ 그룹 데이터 로딩 실패:", error);
		} finally {
			set({ loading: false });
		}
	},
}));
