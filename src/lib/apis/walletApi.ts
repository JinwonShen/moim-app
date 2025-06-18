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
		const walletRef = doc(db, "groups", groupId, "wallets", uid);
		const snap = await getDoc(walletRef);

		if (snap.exists()) {
			useWalletStore.getState().setWallet({
				uid,
				balance: snap.data().balance ?? 0,
				updatedAt: snap.data().updatedAt,
			});
		} else {
			console.warn("지갑 정보 없음");
		}
	} catch (error) {
		console.error("지감 정보 불러오기 실패", error);
	}
};

export const fetchAccountBalance = async (uid: string) => {
	try {
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		const data = userSnap.data();

		if (!data?.account) throw new Error("계좌 정보 없음");

		useWalletStore.getState().setWallet({
			uid,
			balance: data.account.balance,
			updatedAt: data.account.updatedAt?.toDate?.() ?? new Date(),
		});

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
		// 1️⃣ 개인 계좌 불러오기
		const userRef = doc(db, "users", uid);
		const userSnap = await getDoc(userRef);
		const userData = userSnap.data();

		if (!userData?.account || userData.account.balance < amount) {
			throw new Error("잔액 부족 또는 계좌 정보 없음");
		}

		// 2️⃣ 모임 지갑 불러오기
		const groupWalletRef = doc(db, "groups", groupId, "wallets", uid);
		const groupSnap = await getDoc(groupWalletRef);
		if (!groupSnap.exists()) throw new Error("모임 지갑 없음");

		// 3️⃣ Firestore 업데이트
		await updateDoc(userRef, {
			"account.balance": userData.account.balance - amount,
		});

		// 알림 전송 !
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

		if (owner && groupData?.groupName && userData?.nickname) {
			console.log("✅ 알림 전송 시도");
			await sendGroupNotification(
				groupId,
				"deposit",
				groupData.groupName,
				`${userData.nickname}님이 ${groupData.groupName}에 입금 완료했습니다`,
			);
		}

		await updateDoc(groupWalletRef, {
			balance: increment(amount),
			updatedAt: serverTimestamp(),
		});

		await updateDoc(groupRef, {
			paidParticipants: arrayUnion(uid),
			balance: increment(amount),
		});

		// ✅ walletStore 전역 상태 갱신
		useWalletStore.getState().setWallet({
			uid,
			balance: userData.account.balance - amount,
			updatedAt: new Date(),
		});

		// ✅ authStore 전역 상태 갱신 (UI 반영 위해 추가)
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

		alert("입금이 완료되었습니다.");
	} catch (error) {
		console.error("입금 실패", error);
		alert("입금에 실패했습니다. 다시 시도해주세요.");
	}
};
