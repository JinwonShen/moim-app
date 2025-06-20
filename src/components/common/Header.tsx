/**
 * - 로그인된 사용자에게 인사 메시지와 계좌 잔액 정보를 표시
 * - 프로필 이미지, 닉네임, 계좌 상태 출력
 * - NotificationBell을 통해 실시간 알림 표시
 * - 로그인 상태가 아니면 로그인 페이지로 리디렉션
 * - Zustand 상태(authStore, walletStore)를 사용하여 사용자 정보와 지갑 정보 관리
 */

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
		// ✅ 로그인 여부 확인
		// - 로그인되지 않은 경우 알림 후 로그인 페이지로 리디렉션
		if (!user) {
			alert("로그인이 필요합니다.");
			navigate("/login");
		}
	}, [user, navigate]);

	useEffect(() => {
		// ✅ 계좌 잔액 정보 불러오기
		// - 로그인된 사용자의 uid가 있을 경우 fetchAccountBalance 호출
		if (user?.uid) {
			fetchAccountBalance(user.uid);
		}
	}, [user?.uid]);

	return (
    <header>
      {/* ✅ 사용자 정보 렌더링: 프로필 이미지, 인사 메시지, 계좌 잔액 표시 */}
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
          {/* ✅ 실시간 알림 벨(NotificationBell)은 로그인된 사용자(uid)에게만 표시 */}
          <div>{user?.uid && <NotificationBell />}</div>
        </div>
      )}
    </header>
  );
}
