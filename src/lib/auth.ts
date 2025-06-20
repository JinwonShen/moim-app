/**
 * Firebase 인증 관련 유틸 함수들을 정의한 파일입니다.
 * - 이메일/비밀번호 및 Google 로그인/회원가입을 처리합니다.
 * - 로그인 성공 후 유저 정보를 zustand 상태에 저장하고,
 *   Firestore의 유저 데이터 및 계좌 정보를 불러와 설정합니다.
 * - 로그아웃 시 상태 초기화 및 세션 정보 제거도 수행합니다.
 */

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
	// 이메일과 비밀번호를 사용해 Firebase 인증 로그인 시도
	return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
	// 이메일과 비밀번호를 사용해 Firebase 신규 사용자 회원가입 시도
	return await createUserWithEmailAndPassword(auth, email, password);
};

export async function loginWithGoogle(): Promise<User> {
	// Google OAuth 제공자 인스턴스 생성
	const provider = new GoogleAuthProvider();

	try {
		// 팝업을 통해 Google 로그인 진행
		const result = await signInWithPopup(auth, provider);
		const user = result.user;

		if (!user) throw new Error("사용자 정보가 존재하지 않습니다.");

		// Firestore에서 해당 유저 문서 참조 및 조회
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			// 신규 사용자라면 기본 정보와 초기 계좌 정보 Firestore에 저장
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
			// 기존 사용자라면 별도 처리 없이 로그 출력
			console.log("🔁 기존 사용자: Firestore에 이미 존재함");
		}

		// 로그인된 사용자 정보 반환
		return user;
	} catch (error) {
		// 로그인 실패 시 에러 메시지 출력 및 예외 던짐
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
		// Firestore에서 로그인한 유저 정보 조회
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			// 유저 정보가 없으면 경고 후 로그인 페이지로 리다이렉트
			alert("유저 정보가 존재하지 않습니다.");
			navigate("/login");
			return;
		}

		const data = userSnap.data();
		const hasPin = !!data.pinHash;

		// zustand authStore에 유저 정보 저장
		useAuthStore.getState().setUser({
			uid: user.uid,
			email: user.email ?? "",
			nickname: data.nickname ?? user.displayName ?? "",
			profileImage: data.profileImage ?? "",
			providerId: user.providerData?.[0]?.providerId ?? "unknown",
			account: data.account,
		});

		// Firestore에 저장된 계좌 잔액을 zustand walletStore에 반영
		if (data.account) {
			useWalletStore.getState().setWallet({
				uid: user.uid,
				balance: data.account.balance,
				updatedAt: data.account.updatedAt?.toDate?.() ?? new Date(),
			});
		}

		// PIN 인증 여부에 따라 적절한 페이지로 네비게이션
		if (hasPin) {
			navigate("/PinConfirm");
		} else {
			navigate("/PinRegister");
		}
	} catch (error) {
		// 로그인 후 처리 중 에러 발생 시 로그 출력 및 알림
		console.error("로그인 후 처리 실패:", error);
		alert("로그인 후 처리 중 문제가 발생했습니다.");
	}
};

export const logout = async (navigate: ReturnType<typeof useNavigate>) => {
	try {
		// Firebase 인증 로그아웃 수행
		await signOut(auth);
		// zustand 상태 초기화
		useAuthStore.getState().setUser(null);
		useAuthStore.getState().setVerified(false);
		useWalletStore.getState().clearWallet();
		// 세션 스토리지에서 PIN 인증 정보 제거
		sessionStorage.removeItem("pin_verified");
		// 로그인 페이지로 이동
		navigate("/login");
	} catch (error) {
		// 로그아웃 실패 시 에러 로그 및 알림
		console.error("로그아웃 실패: ", error);
		alert("로그아웃 중 문제가 발생했습니다.");
	}
};
