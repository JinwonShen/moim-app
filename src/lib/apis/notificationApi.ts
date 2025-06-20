// 🔔 알림 API
// 이 파일은 Firestore를 통해 그룹 참여자들에게 알림을 전송하는 기능을 제공합니다.
// 모임에 새로운 공지사항, 지출, 입금 요청, 참여 요청 등의 이벤트 발생 시
// 해당 그룹의 모든 참여자에게 개별적으로 알림 문서를 생성하여 저장합니다.

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
	// 그룹의 participants 서브컬렉션 참조 가져오기
	const participantsRef = collection(db, "groups", groupId, "participants");

	// 참여자 문서 전체 조회
	const snapshot = await getDocs(participantsRef);

	// 참여자 userId 목록 필터링 (null/undefined 제외)
	const uids = snapshot.docs.map((doc) => doc.data().userId).filter(Boolean);

	// 각 참여자에게 알림 문서 추가
	await Promise.all(
		uids.map(async (uid) => {
			const ref = collection(db, "notifications", uid, "items"); // 알림 저장 위치
			await addDoc(ref, {
				type, // 알림 종류 (announcement | expense | deposit | join)
				groupId,
				groupName,
				message,
				createdAt: serverTimestamp(), // 서버 시간 기준 타임스탬프
				read: false, // 기본적으로 읽지 않은 상태로 저장
			});
		}),
	);
};
