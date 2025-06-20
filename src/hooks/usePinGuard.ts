/**
 * 인증된 사용자만 접근 가능한 페이지에서 사용되는 보호 훅.
 * - 로그인이 되어 있지 않으면 로그인 페이지로 이동
 * - PIN 인증이 완료되지 않았다면 PIN 확인 페이지로 이동
 * - 인증 상태는 sessionStorage의 'pin_verified' 키로 판단
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function usePinGuard(redirectPath: string) {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		// ✅ 로그인 여부 확인
		// ❌ 미로그인 시 로그인 페이지로 리디렉션
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		// ✅ PIN 인증 여부 확인
		// ❌ 미인증 시 PIN 확인 페이지로 리디렉션 (이전 위치 정보 포함)
		const verified = sessionStorage.getItem("pin_verified");
		if (!verified) {
			navigate("/pinconfirm", { state: { from: redirectPath } });
		}
	}, [user, navigate, redirectPath]);
}
