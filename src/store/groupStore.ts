// src/store/groupStore.ts

import { create } from "zustand";
import { fetchJoinedGroups, fetchMyGroups } from "../lib/api/groups";
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
			const [myGroups, joinedGroups]: [Group[], Group[]] = await Promise.all([
				fetchMyGroups(uid),
				fetchJoinedGroups(uid),
			]);

			set({ myGroups, joinedGroups });
		} catch (error) {
			console.error("그룹 데이터 로딩 실패: ", error);
		} finally {
			set({ loading: false });
		}
	},
}));
