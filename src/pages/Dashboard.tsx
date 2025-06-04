import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from "../components/FloatingButton";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DepositModal from "../components/modal/DepositModal";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { useExpenseStore } from "../store/expenseStore";
import { useGroupStore } from "../store/groupStore";

export default function Dashboard() {
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const { myGroups, joinedGroups, fetchGroups, loading } = useGroupStore();
	const [categories, setCategories] = useState<string[]>([
		"식비",
		"커피",
		"교통비",
		"숙박비",
		"엑티비티",
		"기타",
	]);
	const { setRecentExpenses } = useExpenseStore();
	const [isDepositOpen, setDepositOpen] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const user = useAuthStore((state) => state.user);

	const fetchExpenses = async () => {
		if (!myGroups.length) return; // 또는 if (!myGroups[0]) return;

		const groupId = myGroups[0].id;
		if (!groupId) return; // 혹시라도 id가 undefined인 경우 방지

		const expensesRef = collection(db, "groups", groupId, "expenses");

		const q = query(expensesRef, orderBy("createdAt", "desc"), limit(5));
		const snapshot = await getDocs(q);
		const items = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				author: data.author,
				description: data.memo ?? "",
				category: data.category ?? "",
				amount: Number(data.amount ?? 0),
				createdAt: data.createdAt,
			};
		});

		setRecentExpenses(items);
	};

	useEffect(() => {
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
					<section className="w-[calc(50%-12px)] min-h-[150px] max-h-[300px] h-full p-[24px] border border-secondary-200 rounded-[8px]">
						<h2 className="text-[14px] mb-[12px]">내가 만든 모임</h2>
						<div className="flex flex-col gap-[12px]">
							{myGroups.length === 0 ? (
								<>
									<p className="font-bold">아직 생성된 모임이 없어요! 👍</p>
									<button
										type="button"
										className="button w-full mt-[24px] px-[24px] py-[8px] text-[14px]"
										onClick={() => navigate("/group/create")}
									>
										새 모임 만들기
									</button>
								</>
							) : (
								myGroups.map((group) => {
									const now = new Date();
									const start = new Date(group.startDate);
									const isUpcoming = start > now;
									const status = isUpcoming ? "모집중" : "진행중";

									const participantCount = group.participantCount ?? 0;
									const paidCount = group.paidParticipants?.length ?? 0;
									const paidPercent = participantCount
										? Math.floor((paidCount / participantCount) * 100)
										: 0;

									const budgetUsed = group.totalBudget - group.balance;
									const usedPercent = Math.floor(
										(budgetUsed / group.totalBudget) * 100 || 0,
									);

									const eachFee =
										participantCount > 0
											? Math.floor(group.totalBudget / participantCount)
											: 0;
									const paidTotal = eachFee * paidCount;

									return (
										<div key={group.id} className="flex flex-col">
											<div className="flex justify-between items-center mb-[8px]">
												<h3 className="text-[16px] font-bold">
													{group.groupName}
												</h3>
												<span
													className={`text-[12px] px-[12px] py-[7px] rounded-[4px] font-semibold ${status === "모집중" ? "text-primary bg-white border border-primary" : "text-white bg-primary"}`}
												>
													{status}
												</span>
											</div>
											<p className="text-[12px] text-gray-500 pb-[8px] border-b-[2px]">
												{group.startDate} ~ {group.endDate}
											</p>
											<p className="text-[14px] py-[8px]">
												참여자: {participantCount}명 중 {paidCount}명 입금 완료
											</p>
											<div className="h-[12px] bg-gray-200 rounded-full">
												<div
													className="h-full bg-primary rounded-full"
													style={{
														width: `${isUpcoming ? paidPercent : usedPercent}%`,
													}}
												/>
											</div>
											<p className="pt-[8px] pb-[16px] text-[12px] text-gray-600">
												{isUpcoming
													? `예산: ${group.totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원`
													: `예산: ${group.totalBudget.toLocaleString()}원 / 잔액: ${group.balance.toLocaleString()}원`}
											</p>
											<div className="flex gap-[8px]">
												<button
													type="button"
													className="w-full py-[8px] border rounded-[8px] border-white bg-primary text-white text-[14px] hover:bg-white hover:text-primary hover:border-primary transition-all duration-300"
													onClick={() => {
														setDepositOpen(true);
														if (group.id) {
															setSelectedGroupId(group.id);
														}
													}}
												>
													입금하기
												</button>
												<button
													type="button"
													className="w-full py-[8px] border rounded-[8px] border-white bg-primary text-white text-[14px] hover:bg-white hover:text-primary hover:border-primary transition-all duration-300"
													onClick={() => navigate(`/group/${group.id}`)}
												>
													모임 상세보기
												</button>
											</div>
										</div>
									);
								})
							)}
						</div>
					</section>

					{/* 참여 중인 모임 */}
					<section className="w-[calc(50%-12px)] min-h-[150px] p-[24px] border border-secondary-200 rounded-[8px]">
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
								joinedGroups.map((group) => {
									const now = new Date();
									const start = new Date(group.startDate);
									const isUpcoming = start > now;
									const status = isUpcoming ? "모집중" : "진행중";

									const participantCount = group.participantCount ?? 0;
									const paidCount = group.paidParticipants?.length ?? 0;
									const paidPercent =
										participantCount > 0
											? Math.floor((paidCount / participantCount) * 100)
											: 0;

									const totalBudget = group.totalBudget ?? 0;
									const balance = group.balance ?? 0;
									const budgetUsed = totalBudget - balance;
									const usedPercent =
										totalBudget > 0
											? Math.floor((budgetUsed / totalBudget) * 100)
											: 0;

									const eachFee =
										participantCount > 0
											? Math.floor(totalBudget / participantCount)
											: 0;
									const paidTotal = eachFee * paidCount;

									return (
										<div key={group.id} className="flex flex-col">
											<div className="flex justify-between items-center mb-[8px]">
												<h3 className="text-[16px] font-bold">
													{group.groupName}
												</h3>
												<span
													className={`text-[12px] px-[12px] py-[7px] rounded-[4px] font-semibold ${
														status === "모집중"
															? "text-primary bg-white border border-primary"
															: "text-white bg-primary"
													}`}
												>
													{status}
												</span>
											</div>
											<p className="text-[12px] text-gray-500 pb-[8px] border-b-[2px]">
												{group.startDate} ~ {group.endDate}
											</p>
											<p className="text-[14px] py-[8px]">
												참여자: {participantCount}명 중 {paidCount}명 입금 완료
											</p>
											<div className="h-[12px] bg-gray-200 rounded-full">
												<div
													className="h-full bg-primary rounded-full"
													style={{
														width: `${isUpcoming ? paidPercent : usedPercent}%`,
													}}
												/>
											</div>
											<p className="pt-[8px] pb-[16px] text-[12px] text-gray-600">
												{isUpcoming
													? `예산: ${totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원`
													: `예산: ${totalBudget.toLocaleString()}원 / 잔액: ${balance.toLocaleString()}원`}
											</p>
											<div className="flex gap-[8px]">
												<button
													type="button"
													className="w-full py-[8px] border rounded-[8px] border-white bg-primary text-white text-[14px] hover:bg-white hover:text-primary hover:border-primary transition-all duration-300"
													onClick={() => {
														setDepositOpen(true);
														if (group.id) setSelectedGroupId(group.id);
													}}
												>
													입금하기
												</button>
												<button
													type="button"
													className="w-full py-[8px] border rounded-[8px] border-white bg-primary text-white text-[14px] hover:bg-white hover:text-primary hover:border-primary transition-all duration-300"
													onClick={() => navigate(`/group/${group.id}`)}
												>
													모임 상세보기
												</button>
											</div>
										</div>
									);
								})
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

				{uid && myGroups[0]?.id && (
					<FloatingButton
						groupId={myGroups[0].id}
						uid={uid}
						categories={categories}
						setCategories={setCategories}
						fetchExpenses={fetchExpenses}
					/>
				)}
				{isDepositOpen && selectedGroupId && user?.uid && (
					<DepositModal
						open={isDepositOpen}
						onClose={() => setDepositOpen(false)}
						groupId={selectedGroupId}
						uid={user.uid}
					/>
				)}
			</div>
		</div>
	);
}
