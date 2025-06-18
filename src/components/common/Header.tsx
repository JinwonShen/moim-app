import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccountBalance } from "../../lib/apis/walletApi";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import NotificationBell from "../modal/NotificationBell";

export default function Header() {
	const user = useAuthStore((state) => state.user);
	const wallet = useWalletStore((state) => state.wallet);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
		}
	}, [user, navigate]);

	useEffect(() => {
		if (user?.uid) {
			fetchAccountBalance(user.uid);
		}
	}, [user?.uid]);

	return (
    <header>
      {user && (
        <div className="lg:max-w-[calc(1180px-237px)] w-full lg:w-[calc(100%-237px)] fixed flex justify-between pl-[40px] pr-[24px] md:pl-[44px] lg:pl-0 pt-[36px] pb-[12px] bg-white z-40">
          <div className="flex">
            <div>
              <img
                src={user?.profileImage || "/default-image.png"}
                alt="프로필 이미지"
                className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-[8px] aspect-square"
              />
            </div>
            <div className="pl-[16px] md:pl-[24px]">
              <h1 className="text-[20px] md:text-[24px] font-bold">
                {user.nickname || "사용자"}님, 안녕하세요 !
              </h1>
              <p className="text-[14px] md:text-[16px]">
                계좌 잔액:{" "}
                {user.account?.balance !== undefined
                  ? `${wallet?.balance.toLocaleString()} 원`
                  : "등록되지 않음"}
              </p>
            </div>
          </div>
          <div>{user?.uid && <NotificationBell />}</div>
        </div>
      )}
    </header>
  );
}
