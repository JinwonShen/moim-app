import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { useAuthStore } from "../../store/authStore";
import { db } from "../firebase";

export const fetchMyGroups = async () => {
	const user = useAuthStore.getState().user;
	if (!user) return [];

	const q = query(collection(db, "groups"), where("creatorId", "==", user.uid));

	const querySnapShot = await getDocs(q);
	const groups = querySnapShot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));

	return groups;
};

export const fetchJoinedGroups = async () => {
	const user = useAuthStore.getState().user;
	if (!user) return [];

	const participantQuery = query(
		collection(db, "participants"),
		where("userId", "==", user.uid),
	);

	const participantSnapShot = await getDocs(participantQuery);
	const groupIds = participantSnapShot.docs.map((doc) => doc.data().groupId);

	const groupPromises = groupIds.map(async (groupId) => {
		const groupDoc = await getDoc(doc(db, "groups", groupId));
		return {
			id: groupId,
			...groupDoc.data(),
		};
	});

	return await Promise.all(groupPromises);
};
