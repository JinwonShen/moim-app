/**
 * zustand 기반 사용자 인증 상태를 관리하는 store
 * - 현재 로그인한 사용자의 정보를 전역으로 저장 및 접근 가능하게 함
 * - 로그인/로그아웃 및 사용자 상태 초기화 기능 포함
 */

// zustand 라이브러리의 create 함수를 사용하여 store 생성
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";
import type { Group } from "../types/group";

// 사용자 인증 상태를 정의하는 타입 (user 객체 및 관련 액션들 포함)
type GroupStore = {
	myGroups: Group[]; // 현재 로그인한 사용자 정보
	joinedGroups: Group[]; // 현재 로그인한 사용자 정보
	loading: boolean; // 현재 로그인한 사용자 정보
	fetchGroups: (uid: string) => Promise<void>; // 사용자 상태를 설정하는 함수
};

// zustand를 이용하여 인증 상태 전역 관리 store 생성
export const useGroupStore = create<GroupStore>((set) => ({
	myGroups: [], // 초기 상태는 로그인하지 않은 상태
	joinedGroups: [], // 초기 상태는 로그인하지 않은 상태
	loading: false, // 초기 상태는 로그인하지 않은 상태

	fetchGroups: async (uid: string) => {
		set({ loading: true }); // 로그인 시 사용자 정보 설정

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
			set({ loading: false }); // 로그아웃 시 사용자 정보 초기화
		}
	},
}));
