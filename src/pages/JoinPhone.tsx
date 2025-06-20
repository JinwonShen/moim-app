/**
 * 회원가입 두 번째 단계인 휴대폰 인증 페이지 컴포넌트.
 * - 휴대폰 번호 유효성 검사를 통과하면 임시 인증번호(fakeCode)를 발송
 * - 사용자가 입력한 인증번호가 일치하면 인증 완료 및 다음 단계로 이동
 * - 인증 상태는 전역 상태(Zustand)를 통해 관리
 * - 이전 또는 소셜 로그인 페이지로 돌아갈 수 있는 네비게이션 버튼 포함
 */

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
		// ✅ 휴대폰 번호 유효성 검사
		if (!phone.match(/^01[016789]-?\d{3,4}-?\d{4}$/)) {
			alert("유효한 휴대폰 번호를 입력해주세요.");
			return;
		}

		// 📩 인증번호 발송 (현재는 임시 코드 사용)
		const fakeCode = "123456";
		setVerificationCode(fakeCode);
		setCodeSent(true);
		alert(`인증번호가 발송되었습니다. (임시코드: ${fakeCode})`);
	};

	const handleVerify = () => {
		// ✅ 입력된 인증번호가 일치할 경우 인증 처리 및 다음 단계 이동
		if (inputCode === verificationCode) {
			setVerified(true);
			alert("인증이 완료되었습니다.");
			navigate("/joinemail");
		} else {
			// ❌ 인증 실패 시 알림
			alert("인증번호가 일치하지 않습니다. 다시 시도해주세요.");
		}
	};

	return (
		<div className="min-h-screen px-[24px] md:px-0 flex flex-col justify-center items-center">
			<div className="w-full max-w-[375px]">
				<h2 className="mb-[12px] text-[24px] font-bold">
					휴대폰 인증
				</h2>

				<input
					type="tel"
					placeholder="휴대폰 번호 (- 없이)"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className="w-full h-[48px] mb-[8px] bg-gray-100 pl-[24px] rounded-[8px]"
				/>

				<button
					type="button"
					onClick={handleSendCode}
					className="w-full h-[48px] bg-gray-100 hover:bg-primary hover:text-[#ffffff] transition-all duration-300 rounded-[8px]"
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
							className="w-full h-[48px] mt-[8px] mb-[8px] bg-gray-200 pl-[24px] rounded-[8px]"
						/>
						<button
							type="button"
							onClick={handleVerify}
							className="w-full h-[48px] bg-gray-100 hover:bg-primary hover:text-[#ffffff] transition-all duration-300 rounded-[8px]"
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
						onClick={() => navigate("/login")}
						className="mt-[24px] text-[14px] no-underline text-center hover:underline"
					>
						소셜 로그인으로 돌아가기
					</button>
				</div>
			</div>
		</div>
	);
}
