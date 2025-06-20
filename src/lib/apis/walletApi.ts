/**
 * 이 파일은 모임 지갑 관련 Firebase Firestore 연동 API 함수들을 정의한다.
 * 주요 기능:
 * - 개인 및 모임 지갑 데이터 불러오기
 * - 입금 처리 로직 및 알림 전송
 * - 상태 스토어 업데이트 (walletStore, authStore)
 */

import {
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import type { Participant } from "../../types/participant";
import { db } from "../firebase";
import { sendGroupNotification } from "./notificationApi";

export const fetchWallet = async (groupId: string, uid: string) => {
	try {
		// 🔍 지정된 그룹과 유저 ID로 지갑 문서 참조
		const walletRef = doc(db, "groups", groupId, "wallets", uid);
		const snap = await getDoc(walletRef);

		// 📄 문서가 존재할 경우, 전역 상태 업데이트
		if (snap.exists()) {
			useWalletStore.getState().setWallet({
				uid,
				balance: snap.data().balance ?? 0,
				updatedAt: snap.data().updatedAt,
			});
		} else {
			// ⚠️ 문서가 없을 경우 콘솔 경고
			console.warn("지갑 정보 없음");
		}
	} catch (error) {
		console.error("지감 정보 불러오기 실패", error);
	}
};

export const fetchAccountBalance = async (uid: string) => {
	try {
		// 🔍 사용자 문서 참조
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		const data = userSnap.data();

		// 🏦 계좌 정보 유무 확인
		if (!data?.account) throw new Error("계좌 정보 없음");

		// ✅ 전역 상태 업데이트
		useWalletStore.getState().setWallet({
			uid,
			balance: data.account.balance,
			updatedAt: data.account.updatedAt?.toDate?.() ?? new Date(),
		});

		// 🔁 balance 반환
		return data.account.balance;
	} catch (error) {
		console.error("계좌 잔액 로딩 실패:", error);
		throw error;
	}
};

export const depositToGroup = async (
	groupId: string,
	uid: string,
	amount: number,
) => {
	try {
		// 1️⃣ 사용자 계좌 정보 로딩 및 잔액 확인
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		const userData = userSnap.data();

		if (!userData?.account || userData.account.balance < amount) {
			throw new Error("잔액 부족 또는 계좌 정보 없음");
		}

		// 2️⃣ 그룹 지갑 정보 확인
		const groupWalletRef = doc(db, "groups", groupId, "wallets", uid);
		const groupSnap = await getDoc(groupWalletRef);
		if (!groupSnap.exists()) throw new Error("모임 지갑 없음");

		// 3️⃣ 사용자 계좌에서 금액 차감
		await updateDoc(userRef, {
			"account.balance": userData.account.balance - amount,
		});

		// 📢 모임장에게 알림 전송 준비
		const participantsRef = collection(db, "groups", groupId, "participants");
		const participantSnap = await getDocs(participantsRef);

		const participants: Participant[] = participantSnap.docs.map((doc) => ({
			...(doc.data() as Omit<Participant, "uid">),
			uid: doc.id,
		}));

		const groupRef = doc(db, "groups", groupId);

		const owner = participants.find((p) => p.isOwner);
		const groupInfoSnap = await getDoc(groupRef);
		const groupData = groupInfoSnap.data();
		console.log("👑 찾은 모임장:", owner?.uid); // 👈 여기를 꼭 찍어봐!

		// 🔔 알림 전송
		if (owner && groupData?.groupName && userData?.nickname) {
			console.log("✅ 알림 전송 시도");
			await sendGroupNotification(
				groupId,
				"deposit",
				groupData.groupName,
				`${userData.nickname}님이 ${groupData.groupName}에 입금 완료했습니다`,
			);
		}

		// 💰 그룹 지갑 및 그룹 문서 업데이트
		await updateDoc(groupWalletRef, {
			balance: increment(amount),
			updatedAt: serverTimestamp(),
		});

		await updateDoc(groupRef, {
			paidParticipants: arrayUnion(uid),
			balance: increment(amount),
		});

		// ♻️ 상태 스토어(walletStore, authStore) 업데이트
		useWalletStore.getState().setWallet({
			uid,
			balance: userData.account.balance - amount,
			updatedAt: new Date(),
		});

		const prevUser = useAuthStore.getState().user;

		if (prevUser) {
			useAuthStore.getState().setUser({
				...prevUser,
				account: {
					bank: userData.bank,
					balance: userData.account.balance - amount,
					number: userData.account.number,
					updatedAt: new Date(),
				},
			});
		}

		// ✅ 입금 완료 알림
		alert("입금이 완료되었습니다.");
	} catch (error) {
		console.error("입금 실패", error);
		alert("입금에 실패했습니다. 다시 시도해주세요.");
	}
};
