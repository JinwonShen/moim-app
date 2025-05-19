// src/lib/auth.ts
import { GoogleAuthProvider, type User, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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
				name: user.displayName ?? "",
				email: user.email ?? "",
				createdAt: serverTimestamp(),
				pinHash: null,
				account: null,
			});
			console.log("📌 Firestore에 사용자 정보 저장 완료");
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
