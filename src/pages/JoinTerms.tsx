/**
 * 회원가입 첫 단계인 약관 동의 페이지 컴포넌트.
 * - 필수 항목(이용약관, 만 14세 이상 확인, 개인정보 수집)에 모두 동의해야 다음 단계로 진행 가능
 * - 선택 항목(마케팅 동의)은 필수가 아님
 * - 모든 동의 항목은 상태로 관리되며, '다음' 버튼 클릭 시 검증 처리
 * - 소셜 로그인 페이지로 돌아가는 버튼 포함
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinTerms() {
	const navigate = useNavigate();

	const [terms, setTerms] = useState({
		termsOfUse: false,
		ageCheck: false,
		privacy: false,
		marketing: false,
	});

	const handleChange = (key: keyof typeof terms) => {
		// ✅ 선택한 항목의 체크 상태를 토글
		setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleNext = () => {
		// ✅ 필수 항목 동의 여부 확인
		// ❌ 하나라도 동의하지 않았을 경우 알림 후 중단
		// ✅ 모든 필수 항목 동의 시 다음 단계(휴대폰 인증)로 이동
		if (!terms.termsOfUse || !terms.ageCheck || !terms.privacy) {
			alert("필수 항목에 모두 동의해주세요.");
			return;
		}
		navigate("/joinphone");
	};

	return (
		<div className="min-h-screen px-[24px] md:px-0 flex flex-col justify-center items-center">
			<div className="w-full max-w-[375px]">
				<h2 className="mx-w-[375px] mb-[12px] text-[24px] font-bold">
					약관동의
				</h2>
				<label className="h-[48px] flex items-center">
					<input
						type="checkbox"
						checked={terms.termsOfUse}
						onChange={() => handleChange("termsOfUse")}
					/>
					<span className="pl-[24px] text-[14px]">(필수) 이용약관</span>
				</label>
				<label className="h-[48px] flex items-center">
					<input
						type="checkbox"
						checked={terms.ageCheck}
						onChange={() => handleChange("ageCheck")}
					/>
					<span className="pl-[24px] text-[14px]">
						(필수) 만 14세 이상 확인
					</span>
				</label>
				<label className="h-[48px] flex items-center">
					<input
						type="checkbox"
						checked={terms.privacy}
						onChange={() => handleChange("privacy")}
					/>
					<span className="pl-[24px] text-[14px]">
						(필수) 개인정보 수집 및 이용 동의
					</span>
				</label>
				<label className="h-[48px] flex items-center">
					<input
						type="checkbox"
						checked={terms.marketing}
						onChange={() => handleChange("marketing")}
					/>
					<span className="pl-[24px] text-[14px]">
						(선택) 마케팅 정보 수신 동의
					</span>
				</label>
			</div>
			<button
				type="button"
				className="max-w-[375px] w-full h-[48px] bg-gray-100 hover:bg-primary hover:text-[#ffffff] transition-all duration-300 rounded-[8px] mt-[12px]"
				onClick={handleNext}
			>
				다음
			</button>
			<button
				type="button"
				onClick={() => navigate("/login")}
				className="mt-[24px] text-[14px] no-underline text-center hover:underline"
			>
				소셜 로그인으로 돌아가기
			</button>
		</div>
	);
}
