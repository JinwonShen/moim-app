/**
 * 사용자 회원 탈퇴 페이지 컴포넌트.
 * - 현재 로그인된 사용자의 인증 상태를 확인한 후 회원 탈퇴 처리
 * - 비밀번호 로그인 사용자는 재인증 과정을 거친 후 Firebase 사용자 및 Firestore 문서 삭제
 * - 전역 상태 초기화 및 인증 세션 제거
 * - 탈퇴 완료 시 로그인 페이지로 이동
 */

import {
	EmailAuthProvider,
	deleteUser,
	reauthenticateWithCredential,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export default function Withdraw() {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	// ✅ 회원 탈퇴 처리 함수
	// - 사용자 인증 확인 및 탈퇴 의사 재확인
	// - 비밀번호 로그인 사용자는 재인증 절차 수행
	// - Firestore 사용자 문서 및 Firebase 계정 삭제
	// - 상태 초기화 후 로그인 페이지로 이동
	const handleWithdraw = async () => {
		if (!user || !auth.currentUser) {
			alert("사용자 정보가 유효하지 않습니다.");
			return;
		}

		const confirm = window.confirm("moim 회원을 탈퇴하시겠습니까?");
		if (!confirm) return;

		try {
			if (user.providerId === "password") {
				const password = prompt("현재 비밀번호를 입력해주세요.");
				if (!password) return;

				const credential = EmailAuthProvider.credential(user.email, password);
				await reauthenticateWithCredential(auth.currentUser, credential);
			}

			await deleteDoc(doc(db, "users", user.uid));
			await deleteUser(auth.currentUser);

			useAuthStore.getState().setUser(null);
			useAuthStore.getState().setVerified(false);
			sessionStorage.removeItem("pin_verified");

			alert("회원 탈퇴가 완료되었습니다.");
			navigate("/login");
		} catch (error) {
			console.error("회원 탈퇴 실패: ", error);
			alert("회원 탈퇴 중 문제가 발생했습니다.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-bold mb-4">회원 탈퇴</h2>
				<p className="mb-6">
					정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
				</p>
				<button
					type="button"
					onClick={handleWithdraw}
					className="px-[24px] py-[4px] border rounded-[4px] bg-gray-100 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
				>
					탈퇴하기
				</button>
			</div>
		</div>
	);
}
