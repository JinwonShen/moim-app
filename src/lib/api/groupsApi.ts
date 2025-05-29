// src/lib/api/groups.ts

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

export const fetchMyGroups = async (uid: string): Promise<Group[]> => {
	const q = query(collection(db, "groups"), where("creatorId", "==", uid));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...(doc.data() as Omit<Group, "id">),
	}));
};

export const fetchJoinedGroups = async (uid: string): Promise<Group[]> => {
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
