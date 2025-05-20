import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../lib/auth";

export default function EmailLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		try {
			const result = await loginWithEmail(email, password);
			console.log("로그인 성공!", result.user);
			alert("로그인 성공!");
			navigate("/pinregister");
		} catch (error) {
			console.error("로그인 실패: ", error);
			alert("로그인 실패");
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center items-center">
			<div className="w-full max-w-[375px] flex flex-col justify-center items-center">
				<h2 className="mb-[12px]">이메일 로그인</h2>
				<input
					type="email"
					placeholder="이메일을 입력해주세요."
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-[375px] h-[48px] mb-[8px] bg-secondary-100 pl-[24px]"
				/>
				<input
					type="password"
					placeholder="비밀번호를 입력해주세요."
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-[375px] h-[48px] mb-[8px] bg-secondary-100 pl-[24px]"
				/>
				<button
					type="button"
					onClick={handleLogin}
					className="w-[375px] h-[48px] bg-secondary-100 hover:bg-secondary-200 rounded-[8px]"
				>
					로그인
				</button>
			</div>
		</div>
	);
}
