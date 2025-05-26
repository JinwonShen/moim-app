import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function usePinGuard(redirectPath: string) {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		const verified = sessionStorage.getItem("pin_verified");
		if (!verified) {
			navigate("/pinconfirm", { state: { from: redirectPath } });
		}
	}, [user, navigate, redirectPath]);
}
