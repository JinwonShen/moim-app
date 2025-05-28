import { useEffect } from "react";
import FloatingButton from "../components/FloatingButton";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";

export default function Dashboard() {
	const uid = useAuthStore((state) => state.user?.uid);
	const { myGroups, joinedGroups, fetchGroups, loading } = useGroupStore();

	useEffect(() => {
		// 대시보드 진입 시 항상 PIN 인증 상태 제거
		sessionStorage.removeItem("pin_verified");
	}, []);

	useEffect(() => {
		if (uid) fetchGroups(uid);
	}, [uid, fetchGroups]);

	if (loading) return <p>로딩중...</p>;

	return (
		<div className="flex">
			<Sidebar />
			<div className="w-[100vw] pl-[237px] pb-[24px]">
				<Header />
				<main className="flex flex-col flex-wrap flex-1 gap-6 max-h-[900px] pr-[12px] mt-[148px] pb-[24px]">
					{/* 내가 만든 모임 */}
					<section className="w-[calc(50%-12px)] min-h-[150px] max-h-[250px] h-full p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">내가 만든 모임</h2>
						<div>
							{myGroups.length === 0 ? (
								<>
									<p className="font-bold">아직 생성된 모임이 없어요! 👍</p>
									<button type="button" className="button w-full mt-[24px]">
										새 모임 만들기
									</button>
								</>
							) : (
								myGroups.map((group) => (
									<div key={group.id}>{group.groupName}</div>
								))
							)}
						</div>
					</section>

					{/* 참여 중인 모임 */}
					<section className="w-[calc(50%-12px)] min-h-[150px] max-h-[250px] p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">참여 중인 모임</h2>
						<div>
							{joinedGroups.length === 0 ? (
								<>
									<p className="font-bold">아직 참여중인 모임이 없어요! 🙋🏻</p>
									<p className="mt-[36px] mb-[12px] text-center">
										<span className="text-primary">❝</span> 다른 모임에
										참여하려면 초대를 받아야 해요.{" "}
										<span className="text-primary">❞</span>
									</p>
								</>
							) : (
								joinedGroups.map((group) => (
									<div key={group.id}>{group.groupName}</div>
								))
							)}
						</div>
					</section>

					{/* 입금 요청 예약 */}
					<section className="w-[calc(50%-12px)] h-[200px] p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">입금 요청 예약</h2>
						<div>{/* 데이터 연동 예정 */}</div>
					</section>

					{/* 이번 달 지출 */}
					<section className="w-[calc(50%-12px)] h-[250px] p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">이번 달 지출</h2>
						<div>{/* 데이터 연동 예정 */}</div>
					</section>

					{/* 최근 지출 내역 */}
					<section className="w-[calc(50%-12px)] h-[250px] p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">최근 지출 내역</h2>
						<div>{/* 데이터 연동 예정 */}</div>
					</section>

					{/* 공지 알림 */}
					<section className="w-[calc(50%-12px)] h-[250px] p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">공지 & 알림</h2>
						<div>{/* 데이터 연동 예정 */}</div>
					</section>
				</main>

				<FloatingButton />
			</div>
		</div>
	);
}
