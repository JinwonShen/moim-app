import {
	type Timestamp,
	collection,
	onSnapshot,
	orderBy,
	query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

interface NotificationItem {
	id: string;
	type: string;
	groupId: string;
	groupName: string;
	message: string;
	createdAt: Timestamp;
	read: boolean;
}

export const useNotifications = (uid: string | undefined) => {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);

	useEffect(() => {
		if (!uid) return; // ← uid 없으면 실행 자체를 안함
		console.log("👤 현재 로그인된 유저 UID:", uid);

		const ref = collection(db, "notifications", uid, "items");
		const q = query(ref, orderBy("createdAt", "desc"));

		const unsubscribe = onSnapshot(q, (snapshot) => {
			console.log("🔔 알림 스냅샷 수신됨", snapshot.docs.length);
			const list = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as NotificationItem[];
			setNotifications(list);
		});

		return () => unsubscribe();
	}, [uid]);

	return notifications;
};
