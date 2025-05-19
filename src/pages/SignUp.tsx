import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../lib/firebase";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [pw, setPw] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				pw,
			);
			const user = userCredential.user;

			await updateProfile(user, { displayName: name });

			// Firestore에 유저 정보 저장
			await setDoc(doc(db, "users", user.uid), {
				uid: user.uid,
				name,
				email,
				createdAt: serverTimestamp(), // new Date() 대신 serverTimestamp() 사용 권장
				pinHash: null,
				account: null,
			});

			alert("회원가입 완료!");
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("알 수 없는 오류가 발생했습니다.");
			}
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>회원가입</h2>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="이름"
			/>
			<input
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="이메일"
			/>
			<input
				value={pw}
				onChange={(e) => setPw(e.target.value)}
				type="password"
				placeholder="비밀번호"
			/>
			<button type="submit">가입하기</button>
			{error && <p>{error}</p>}
		</form>
	);
}
