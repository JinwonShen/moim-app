import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function JoinPhone() {
	const navigate = useNavigate();
	const [phone, setPhone] = useState("");
	const [codeSent, setCodeSent] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [inputCode, setInputCode] = useState("");

	// 상태 가져오기
	const setVerified = useAuthStore((state) => state.setVerified);

	const handleSendCode = () => {
		if (!phone.match(/^01[016789]-?\d{3,4}-?\d{4}$/)) {
			alert("유효한 휴대폰 번호를 입력해주세요.");
			return;
		}

		const fakeCode = "123456";
		setVerificationCode(fakeCode);
		setCodeSent(true);
		alert(`인증번호가 발송되었습니다. (임시코드: ${fakeCode})`);
	};

	const handleVerify = () => {
		if (inputCode === verificationCode) {
			setVerified(true);
			alert("인증이 완료되었습니다.");
			navigate("/JoinEmail");
		} else {
			alert("인증번호가 일치하지 않습니다. 다시 시도해주세요.");
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center items-center">
			<div className="w-full max-w-[375px]">
				<h2 className="mx-w-[375px] mb-[12px] text-[24px] font-bold">
					휴대폰 인증
				</h2>

				<input
					type="tel"
					placeholder="휴대폰 번호 (- 없이)"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className="w-[375px] h-[48px] mb-[8px] bg-secondary-100 pl-[24px] rounded-[8px]"
				/>

				<button
					type="button"
					onClick={handleSendCode}
					className="w-[375px] h-[48px] bg-secondary-100 hover:bg-secondary-200 rounded-[8px]"
				>
					인증번호 발송
				</button>

				{codeSent && (
					<>
						<input
							type="text"
							placeholder="인증번호 입력"
							value={inputCode}
							onChange={(e) => setInputCode(e.target.value)}
							className="w-[375px] h-[48px] mt-[8px] mb-[8px] bg-secondary-200 pl-[24px] rounded-[8px]"
						/>
						<button
							type="button"
							onClick={handleVerify}
							className="w-[375px] h-[48px] bg-secondary-100 hover:bg-secondary-200 rounded-[8px]"
						>
							인증하기
						</button>
					</>
				)}

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
						onClick={() => navigate("/")}
						className="mt-[24px] text-[14px] no-underline text-center hover:underline"
					>
						소셜 로그인으로 돌아가기
					</button>
				</div>
			</div>
		</div>
	);
}
