// src/lib/auth.ts
import type { User as FirebaseUser } from "firebase/auth";
import {
	GoogleAuthProvider,
	type User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { auth, db } from "./firebase";

export const loginWithEmail = async (email: string, password: string) => {
	return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
	return await createUserWithEmailAndPassword(auth, email, password);
};

export async function loginWithGoogle(): Promise<User> {
	const provider = new GoogleAuthProvider();

	try {
		const result = await signInWithPopup(auth, provider);
		const user = result.user;

		if (!user) throw new Error("사용자 정보가 존재하지 않습니다.");

		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			await setDoc(userRef, {
				uid: user.uid,
				nickname: user.displayName ?? "사용자",
				email: user.email ?? "",
				createdAt: serverTimestamp(),
				pinHash: null,
				account: {
					balance: 5_000_000,
					createdAt: new Date(),
				},
			});
			console.log("📌 Firestore에 사용자 정보 및 계좌 저장 완료");
		} else {
			console.log("🔁 기존 사용자: Firestore에 이미 존재함");
		}

		return user;
	} catch (error) {
		if (error instanceof Error) {
			console.error("❌ Google 로그인 실패:", error.message);
			throw new Error(error.message);
		}
		throw new Error("알 수 없는 오류가 발생했습니다.");
	}
}

export const handleLoginSuccess = async (
	user: FirebaseUser,
	navigate: ReturnType<typeof useNavigate>,
) => {
	try {
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			alert("유저 정보가 존재하지 않습니다.");
			navigate("/login");
			return;
		}

		const data = userSnap.data();
		const hasPin = !!data.pinHash;

		useAuthStore.getState().setUser({
			uid: user.uid,
			email: user.email ?? "",
			nickname: data.nickname ?? user.displayName ?? "",
			profileImage: data.profileImage ?? "",
			providerId: user.providerData?.[0]?.providerId ?? "unknown",
			account: data.account,
		});

		// ✅ 개인 account.balance 상태 반영
		if (data.account) {
			useWalletStore.getState().setWallet({
				uid: user.uid,
				balance: data.account.balance,
				updatedAt: data.account.updatedAt?.toDate?.() ?? new Date(),
			});
		}

		if (hasPin) {
			navigate("/PinConfirm");
		} else {
			navigate("/PinRegister");
		}
	} catch (error) {
		console.error("로그인 후 처리 실패:", error);
		alert("로그인 후 처리 중 문제가 발생했습니다.");
	}
};

export const logout = async (navigate: ReturnType<typeof useNavigate>) => {
	try {
		await signOut(auth);
		useAuthStore.getState().setUser(null);
		useAuthStore.getState().setVerified(false);
		useWalletStore.getState().clearWallet();
		sessionStorage.removeItem("pin_verified");
		navigate("/login");
	} catch (error) {
		console.error("로그아웃 실패: ", error);
		alert("로그아웃 중 문제가 발생했습니다.");
	}
};
