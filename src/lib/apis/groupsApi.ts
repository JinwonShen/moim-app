/**
 * groupsApi.ts
 * 
 * 이 파일은 Firebase Firestore로부터 모임 데이터를 조회하는 API 함수들을 정의합니다.
 * - 특정 groupId로 모임 데이터를 조회 (getGroupById)
 * - 사용자가 만든 모임 목록을 조회 (fetchMyGroups)
 * - 사용자가 참여 중인 모임 목록을 조회 (fetchJoinedGroups)
 */

import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import type { Group } from "../../types/group";
import { db } from "../firebase";

export const getGroupById = async (groupId: string) => {
	// 주어진 groupId로 Firestore에서 단일 모임 문서를 조회합니다.
	// 존재하지 않는 경우 에러를 throw합니다.
	const docRef = doc(db, "groups", groupId);
	const snapshot = await getDoc(docRef);
	if (!snapshot.exists()) throw new Error("모임 정보를 찾을 수 없습니다.");
	return snapshot.data(); // creatorId 포함
};

export const fetchMyGroups = async (uid: string): Promise<Group[]> => {
	// Firestore에서 creatorId가 uid와 일치하는 모임 문서를 쿼리하여 가져옵니다.
	// 각 문서를 Group 타입으로 매핑하여 배열로 반환합니다.
	const q = query(collection(db, "groups"), where("creatorId", "==", uid));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...(doc.data() as Omit<Group, "id">),
	}));
};

export const fetchJoinedGroups = async (uid: string): Promise<Group[]> => {
	// Firestore의 participants 컬렉션에서 userId가 일치하는 참가자 문서를 찾습니다.
	// 해당 참가자가 속한 groupId를 이용하여 각각의 모임 데이터를 병렬로 조회합니다.
	// 존재하지 않는 그룹 데이터는 null로 처리하고, 필터링하여 Group 배열로 반환합니다.
	const participantQuery = query(
		collection(db, "participants"),
		where("userId", "==", uid),
	);

	const participantSnapShot = await getDocs(participantQuery);
	const groupIds = participantSnapShot.docs.map((doc) => doc.data().groupId);

	const groupPromises = groupIds.map(async (groupId) => {
		const groupDoc = await getDoc(doc(db, "groups", groupId));
		const groupData = groupDoc.data();
		if (!groupData) return null;

		return {
			id: groupId,
			...(groupData as Omit<Group, "id">),
		};
	});

	const groups = await Promise.all(groupPromises);
	return groups.filter((g): g is Group => g !== null);
};
