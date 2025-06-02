import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Header() {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
		}
	}, [user, navigate]);

	return (
		<>
			{user && (
				<div className="fixed w-full flex items-start pt-[36px] pb-[12px] bg-white z-50">
					<div>
						<img
							src={user?.profileImage || "/default-image.png"}
							alt="프로필 이미지"
							className="w-[64px] h-[64px] rounded-[8px]"
						/>
					</div>
					<div className="pl-[24px]">
						<h1 className="text-[24px] font-bold">
							{user.nickname || "사용자"}님, 안녕하세요 !
						</h1>
						<p>
							계좌 잔액:{" "}
							{user.account?.balance !== undefined
								? `${user.account.balance.toLocaleString()} 원`
								: "등록되지 않음"}
						</p>
					</div>
				</div>
			)}
		</>
	);
}
