/**
 * 이 훅은 특정 사용자의 알림 데이터를 실시간으로 구독한다.
 * - 사용자의 uid가 주어지면, Firestore의 알림 서브컬렉션(`notifications/{uid}/items`)을 구독한다.
 * - 생성일(createdAt)을 기준으로 내림차순 정렬하여 알림 리스트를 반환한다.
 * - 상태는 notifications 배열로 관리된다.
 */

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
		// ✅ uid가 유효할 경우에만 Firestore 실시간 구독 설정
		// 🔄 알림 문서를 구독하고 상태 업데이트
		// 🔙 컴포넌트 언마운트 시 구독 해제
		if (!uid) return; // ← uid 없으면 실행 자체를 안함

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
