import {
	addDoc,
	collection,
	getDocs,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const sendGroupNotification = async (
	groupId: string,
	type: "announcement" | "expense" | "deposit" | "join",
	groupName: string,
	message: string,
) => {
	const participantsRef = collection(db, "groups", groupId, "participants");
	const snapshot = await getDocs(participantsRef);

	const uids = snapshot.docs.map((doc) => doc.data().userId).filter(Boolean);

	await Promise.all(
		uids.map(async (uid) => {
			const ref = collection(db, "notifications", uid, "items");
			await addDoc(ref, {
				type,
				groupId,
				groupName,
				message,
				createdAt: serverTimestamp(),
				read: false,
			});
		}),
	);
};
