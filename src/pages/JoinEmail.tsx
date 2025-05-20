import { createUserWithEmailAndPassword } from "firebase/auth";
import {
	collection,
	doc,
	getDocs,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
export default function JoinEmail() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [nickname, setNickname] = useState("");
	const [birthdate, setBirthdate] = useState("");
	const [nicknameChecked, setNicknameChecked] = useState(false);

	const handleCheckNickname = async () => {
		if (!nickname) {
			alert("닉네임을 입력해주세요!");
			return;
		}

		const usersRef = collection(db, "users");
		const q = query(usersRef, where("nickname", "==", nickname));
		const snapshot = await getDocs(q);
		if (snapshot.empty) {
			alert("사용 가능한 닉네임입니다.");
			setNicknameChecked(true);
		} else {
			alert("이미 사용중인 닉네임입니다.");
			setNicknameChecked(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.includes("@"))
			return alert("올바른 이메일 형식을 입력해주세요.");
		if (password.length < 6)
			return alert("비밀번호는 최소 6자 이상이어야 합니다.");
		if (password !== confirmPassword)
			return alert("비밀번호가 일치하지 않습니다.");
		if (!nicknameChecked) return alert("닉네임 중복 확인을 해주세요.");
		if (!birthdate) return alert("생년월일을 입력해주세요.");

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);

			await setDoc(doc(db, "users", userCredential.user.uid), {
				email,
				nickname,
				birthdate,
			});
			alert("회원가입이 완료되었습니다.");
			console.log(userCredential.user);
			navigate("/JoinSuccess");
		} catch (error) {
			alert("회원가입에 실패했습니다.");
			console.error(error);
		}
	};

	return (
		<div className="min-h-screen flex justify-center items-center">
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
						className="mb-[8px] h-[48px] bg-secondary-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">비밀번호</span>
					<input
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mb-[8px] h-12 px-4 bg-secondary-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">비밀번호 확인</span>
					<input
						type="password"
						placeholder="비밀번호 확인"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="mb-4 h-12 px-4 bg-secondary-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">생년월일</span>
					<input
						type="date"
						placeholder="비밀번호 확인"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="mb-4 h-12 px-4 bg-secondary-100 pl-[24px] rounded-[8px]"
					/>
				</label>

				<label className="flex flex-col">
					<span className="text-[12px] mb-[4px]">닉네임</span>
					<div className="flex justify-between gap-[8px] mb-[48px]">
						<input
							type="text"
							placeholder="닉네임"
							value={nickname}
							onChange={(e) => setNickname(e.target.value)}
							className="flex-1 h-12 px-4 bg-secondary-100 pl-[24px] rounded-[8px]"
						/>
						<button
							type="button"
							onClick={handleCheckNickname}
							className="px-[29px] bg-secondary-100 hover:bg-secondary-200 rounded-[8px]"
						>
							중복확인
						</button>
					</div>
				</label>

				<button
					type="submit"
					className="w-[375px] h-[48px] bg-secondary-100 hover:bg-secondary-200 rounded-[8px]"
					onClick={handleSubmit}
				>
					회원가입 완료
				</button>
			</form>
		</div>
	);
}
