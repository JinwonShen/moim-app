/**
 * 사용자 PIN 인증 페이지 컴포넌트.
 * - 6자리 PIN 번호를 입력받아 Firebase에서 해시값과 비교 후 인증 처리
 * - 인증 성공 시 sessionStorage에 인증 상태 저장 후 페이지 이동
 * - 인증 목적에 따라 (mode: changePin | deleteUser | default) 분기 처리
 * - 인증 실패 또는 에러 발생 시 에러 메시지 출력
 */

import bcrypt from "bcryptjs";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export default function PinConfirm() {
	const [pin, setPin] = useState<string[]>([]);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const location = useLocation();
	const redirecTo = location.state?.from || "";
	const mode = location.state?.mode;

	// ✅ 로그인 여부 확인 - 비로그인 시 로그인 페이지로 이동
	useEffect(() => {
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
		}
	}, [user, navigate]);

	const handleClick = (digit: string) => {
		if (pin.length < 6) setPin([...pin, digit]);
	};

	const handleDelete = () => {
		setPin(pin.slice(0, -1));
	};

	// ✅ 입력된 PIN을 Firebase에 저장된 해시와 비교하여 인증 처리
	// - 인증 성공 시 목적에 맞는 페이지로 이동 (handleSuccess 호출)
	// - 인증 실패 시 에러 메시지 출력 및 PIN 초기화
	const handleSubmit = async () => {
		if (!user || pin.length !== 6) {
			console.log("user 없음 또는 핀 길이 부족", user, pin);
			return;
		}

		try {
			const userDoc = await getDoc(doc(db, "users", user.uid));
			const pinHash = userDoc.data()?.pinHash;

			console.log("불러온 PIN 해시:", pinHash);
			if (!pinHash) {
				setError("등록된 PIN 정보가 없습니다.");
				return;
			}

			const finalPin = pin.join("");
			const isMatch = await bcrypt.compare(finalPin, pinHash);
			console.log("비교 결과:", isMatch);

			if (isMatch) {
				console.log("✅ PIN 인증 성공, 이동 대상:", redirecTo);
				sessionStorage.setItem("pin_verified", "true");

				handleSuccess();
				// if (redirecTo) {
				// 	setTimeout(() => {
				// 		navigate(redirecTo);
				// 	}, 0);
				// } else {
				// 	navigate("/dashboard");
				// }
			} else {
				setError("PIN이 일치하지 않습니다.");
				setPin([]);
			}
		} catch (err) {
			console.error("PIN 확인 오류:", err);
			setError("오류가 발생했습니다. 다시 시도해주세요.");
		}
	};

	// ✅ 인증 성공 후 목적에 따라 라우팅 처리
	// - PIN 변경: /pinregister
	// - 회원 탈퇴: /withdraw
	// - 기본: redirecTo 또는 /dashboard
	const handleSuccess = () => {
		if (mode === "changePin") {
			navigate("/pinregister", {
				state: { from: "/mypage", mode: "changePin" },
			});
		} else if (mode === "deleteUser") {
			navigate("/withdraw");
		} else {
			navigate(redirecTo || "/dashboard");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-[300px] md:max-w-[375px]">
				<h2 className="mb-[24px] text-[20px] md:mb-[48px] md:text-[24px] font-bold">
					등록한 PIN을 입력해주세요
				</h2>

				<div className="mb-[36px] md:mb-[60px] flex justify-center gap-[12px]">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={`pin-${i}-${pin[i] ?? "empty"}`}
							className={`w-[16px] h-[16px] rounded-full border-2 ${
								pin[i] ? "bg-primary border-primary" : "border-primary"
							}`}
						/>
					))}
				</div>

				<div className="w-full max-w-[375px] grid grid-cols-3 gap-[8px]">
					{[..."123456789"].map((num) => (
						<button
							type="button"
							key={num}
							onClick={() => handleClick(num)}
							className="h-[48px] text-xl bg-gray-100 rounded hover:bg-gray-200"
						>
							{num}
						</button>
					))}
					<button
						type="button"
						onClick={handleDelete}
						className="h-12 text-xl bg-gray-100 rounded hover:bg-gray-200"
					>
						←
					</button>
					<button
						type="button"
						onClick={() => handleClick("0")}
						className="h-12 text-xl bg-gray-100 rounded hover:bg-gray-200"
					>
						0
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={pin.length !== 6}
						className={`h-12 text-l rounded ${
							pin.length === 6
								? "bg-gray-300 hover:bg-primary transition-all duration-300 hover:text-[#ffffff]"
								: "bg-gray-300 text-gray-400 cursor-not-allowed"
						}`}
					>
						확인
					</button>
				</div>

				{error && (
					<p className="text-red-500 text-center mt-4 text-sm">{error}</p>
				)}
			</div>
		</div>
	);
}
