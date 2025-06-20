/****
 * 회원가입 세 번째 단계인 이메일/비밀번호/닉네임/생년월일 입력 페이지 컴포넌트.
 * - 비밀번호는 영문 대소문자, 숫자, 특수문자 포함 8자 이상 조건 유효성 검사
 * - 닉네임은 최소 2자 이상이며, 중복 확인 기능 포함
 * - 모든 조건이 만족되면 Firebase를 통해 계정 생성 및 Firestore에 사용자 정보 저장
 * - 회원가입 성공 시 전역 상태 저장 후 PIN 등록 페이지로 이동
 */

import type { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
	collection,
	doc,
	getDocs,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export default function JoinEmail() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordTouched, setPasswordTouched] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [confirmTouched, setConfirmTouched] = useState(false);
	const [confirmError, setConfirmError] = useState("");
	const [nickname, setNickname] = useState("");
	const [nicknameCheckedValue, setNicknameCheckedValue] = useState("");
	const [birthdate, setBirthdate] = useState("");
	const [nicknameChecked, setNicknameChecked] = useState(false);
	const [isChecking, setIsChecking] = useState(false);

	const verified = useAuthStore((state) => state.verified);
	const setUser = useAuthStore((state) => state.setUser);

	useEffect(() => {
		if (!verified) {
			alert("휴대폰 인증이 필요합니다.");
			navigate("/joinphone");
		}
	}, [verified, navigate]);

	// 중복확인 로직
	const handleCheckNickname = async () => {
		// ✅ 닉네임 유효성 검사 (입력 여부 및 길이 체크)
		if (!nickname) {
			alert("닉네임을 입력해주세요!");
			return;
		}
		if (nickname.length < 2) {
			alert("닉네임은 최소 2자 이상이어야 합니다.");
			return;
		}

		setIsChecking(true); // 로딩 시작

		try {
			// 🔄 Firebase에서 닉네임 중복 여부 확인
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("nickname", "==", nickname));
			const snapshot = await getDocs(q);

			// ✅ 사용 가능 여부에 따라 상태 업데이트
			if (snapshot.empty) {
				alert("사용 가능한 닉네임입니다.");
				setNicknameChecked(true);
				setNicknameCheckedValue(nickname);
			} else {
				alert("이미 사용중인 닉네임입니다.");
				setNicknameChecked(false);
				setNicknameCheckedValue("");
			}
		} catch (err) {
			console.error("닉네임 중복 확인 에러:", err);
			alert("중복 확인 중 오류가 발생했습니다.");
		} finally {
			setIsChecking(false); // ✅ 로딩 종료
		}
	};

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNickname(e.target.value);
		setNicknameChecked(false); // 닉네임이 바뀌면 다시 확인 필요
	};

	// 비밀번호 로직(8자리 이상의 영문 대소문자, 특수문자 포함)
	// ✅ 비밀번호 조건 유효성 검사 정규식
	const validatePassword = (pw: string) => {
		const regex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-]).{8,}$/;
		return regex.test(pw);
	};

	// ✅ 비밀번호 입력 시 유효성 체크 및 에러 메시지 처리
	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPassword(value);
		setPasswordTouched(true);
		if (!validatePassword(value)) {
			setPasswordError(
				"비밀번호는 최소 8자 이상, 1개 이상의 문자, 숫자, 특수문자를 포함해야 합니다.",
			);
		} else {
			setPasswordError("");
		}
	};

	// ✅ 비밀번호 확인값이 원본 비밀번호와 일치하는지 확인
	const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setConfirmPassword(value);
		setConfirmTouched(true);
		if (password !== value) {
			setConfirmError("비밀번호가 일치하지 않습니다.");
		} else {
			setConfirmError("");
		}
	};

	// form 형식 체크 로직
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// ✅ 각 입력값 유효성 검사 및 중복 확인
		if (!email.includes("@"))
			return alert("올바른 이메일 형식을 입력해주세요.");
		if (password.length < 6)
			return alert("비밀번호는 최소 6자 이상이어야 합니다.");
		if (password !== confirmPassword)
			return alert(
				"비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.",
			);
		if (password !== confirmPassword)
			return alert("비밀번호가 일치하지 않습니다.");
		if (!birthdate) return alert("생년월일을 입력해주세요.");
		if (!nicknameChecked || nickname !== nicknameCheckedValue) {
			return alert("닉네임 중복 확인을 해주세요.");
		}

		try {
			// 🔐 Firebase Authentication으로 계정 생성
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);

			const user = userCredential.user;

			if (!user) {
				alert("유저 정보를 가져오지 못했습니다.");
				return;
			}

			// 🗂️ Firestore에 사용자 정보 저장
			await setDoc(doc(db, "users", userCredential.user.uid), {
				email,
				nickname,
				birthdate,
				profileImage: "/default-image.png",
			});

			// 🧠 Zustand 상태 저장소에 유저 정보 저장
			setUser({
				uid: userCredential.user.uid,
				email: email,
				nickname: nickname,
				profileImage: "/default-image.png",
				providerId: "password",
				account: undefined,
			});

			// ✅ 완료 후 PIN 등록 페이지로 이동
			alert("회원가입이 완료되었습니다.");
			console.log(userCredential.user);
			navigate("/pinregister");
		} catch (error) {
			// 🚨 에러 처리 (이메일 중복, 기타 실패)
			const firebaseError = error as FirebaseError;

			if (firebaseError.code === "auth/email-already-in-use") {
				alert("이미 사용 중인 이메일입니다.");
			} else {
				alert("회원가입에 실패했습니다.");
				console.error(error);
			}
		}
	};

	return (
		<div className="min-h-screen px-[24px] md:px-0 flex justify-center items-center">
			<form className="w-full max-w-[375px] flex flex-col">
				<div className="mb-[24px]">
					<h2 className="text-[24px] font-bold">필수 정보 입력</h2>
					<span>가입을 위해 필수 정보를 입력해주세요.</span>
				</div>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">이메일</span>
					<input
						type="email"
						placeholder="이메일"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mb-[8px] h-[48px] bg-gray-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">비밀번호</span>
					<input
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={handlePasswordChange}
						className={`mb-[8px] h-12 px-4 bg-gray-100 pl-[24px] rounded-[8px] ${
							passwordTouched && passwordError ? "border border-red-500" : ""
						} `}
					/>
					{passwordTouched && passwordError && (
						<span className="text-red-500 text-[12px]">{passwordError}</span>
					)}
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">비밀번호 확인</span>
					<input
						type="password"
						placeholder="비밀번호 확인"
						value={confirmPassword}
						onChange={handleConfirmChange}
						className={`mb-4 h-12 px-4 bg-gray-100 pl-[24px] rounded-[8px] ${
							confirmTouched && confirmError ? "border border-red-500" : ""
						}`}
					/>
					{confirmTouched && confirmError && (
						<span className="text-red-500 text-[12px]">{confirmError}</span>
					)}
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">생년월일</span>
					<input
						type="date"
						value={birthdate}
						onChange={(e) => setBirthdate(e.target.value)}
						className="mb-4 h-12 px-4 bg-gray-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">닉네임</span>
					<div className="flex justify-between gap-[8px] mb-[48px]">
						<input
							type="text"
							placeholder="닉네임"
							value={nickname}
							onChange={handleNicknameChange}
							className="flex-1 h-12 px-4 bg-gray-100 pl-[24px] rounded-[8px]"
						/>
						<button
							type="button"
							onClick={handleCheckNickname}
							disabled={isChecking}
							className="px-[29px] bg-gray-100 hover:bg-primary hover:text-[#ffffff] transition-all duration-300 rounded-[8px]"
						>
							{isChecking ? "확인중..." : "중복확인"}
						</button>
					</div>
				</label>

				<button
					type="submit"
					className="w-full h-[48px] bg-gray-100 hover:bg-primary hover:text-[#ffffff] transition-all duration-300 rounded-[8px]"
					onClick={handleSubmit}
				>
					회원가입 완료
				</button>

				<div className="flex justify-between">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="mt-[24px] text-[14px] no-underline text-center hover:underline"
					>
						이전으로
					</button>
					<button
						type="button"
						onClick={() => navigate("/login")}
						className="mt-[24px] text-[14px] no-underline text-center hover:underline"
					>
						소셜 로그인으로 돌아가기
					</button>
				</div>
			</form>
		</div>
	);
}
