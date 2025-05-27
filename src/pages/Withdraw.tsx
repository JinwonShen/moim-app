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
				<button type="button" onClick={handleWithdraw} className="button">
					탈퇴하기
				</button>
			</div>
		</div>
	);
}
