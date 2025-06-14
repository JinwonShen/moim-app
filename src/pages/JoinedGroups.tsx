import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepositModal from "../components/modal/DepositModal";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import type { Group } from "../types/group";

export default function JoinedGroups() {
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const { joinedGroups, fetchGroups } = useGroupStore();
	const [selectedGroupForDeposit, setSelectedGroupForDeposit] =
		useState<Group | null>(null);

	useEffect(() => {
		if (uid) fetchGroups(uid);
	}, [uid, fetchGroups]);

	return (
		<div>
			<h1 className="text-[16px] md:text-[20px] font-bold mb-[12px] pb-[12px] border-b-[1px]">
				참여 중인 모임
			</h1>
			<p className="mb-[12px] md:mb-[24px] text-gray-500 text-[14px] md:text-[16px]">총 모임 {joinedGroups.length}건</p>

			<div className="space-y-4">
				{joinedGroups.map((group) => {
					const now = new Date();
					const start = new Date(group.startDate);
					const end = new Date(group.endDate);
					let statusLabel = "모임종료";
					if (now < start) statusLabel = "모집중";
					else if (now >= start && now <= end) statusLabel = "진행중";
					const isClosed = statusLabel === "모임종료";

					const participantCount = group.participantCount ?? 0;
					const paidCount = group.paidParticipants?.length ?? 0;
					const budgetUsed = group.totalBudget - group.balance;
					const hasPaid = group.paidParticipants?.includes(uid ?? "") ?? false;

					return (
						<div
							key={group.id}
							className="flex flex-col md:flex-row gap-[12px] md:gap-[24px] p-[20px] md:p-[24px] border rounded-[8px] shadow-sm"
						>
							<div className="flex-shrink-0">
								<span className="text-sm font-bold text-primary">
									{statusLabel}
								</span>
							</div>

							<div className="w-full flex flex-col">
								<div className="w-full flex flex-col md:flex-row justify-between">
									<div className="flex flex-col flex-1 justify-start mb-2">
										<div className="flex gap-6">
											<h2 className="text-base font-bold">{group.groupName}</h2>
											<span className="pb-1 text-xs text-gray-500 self-end">
												{group.startDate} ~ {group.endDate}
											</span>
										</div>
										<p className="mt-3 text-sm">
											참여자 {participantCount}명 | 입금완료 {paidCount}명
										</p>
									</div>

									<div className="flex flex-row flex-1 border-t-[1px] pt-[12px] mt-[8px] md:border-0 md:pt-0 md:mt-0">
										<p className="flex-1 text-sm text-gray-600 text-left md:text-right">
											예산: {group.totalBudget.toLocaleString()}원
										</p>
										<div className="flex-1 flex flex-col">
											<p className="mb-3 text-sm text-gray-600 text-left md:text-right">
												지출: {budgetUsed.toLocaleString()}원
											</p>
											<p className="text-sm text-gray-600 text-left md:text-right">
												잔액: {group.balance.toLocaleString()}원
											</p>
										</div>
									</div>
								</div>

								<div className="flex gap-[12px] mt-[12px] justify-between">
									<span className="flex-[1]">{/*  */}</span>
									<button
										type="button"
										disabled={hasPaid || isClosed}
										onClick={() => setSelectedGroupForDeposit(group)}
										className={`flex-[1] py-2 rounded-lg text-sm transition-all duration-300 ${
											hasPaid || isClosed
												? "bg-gray-300 text-white cursor-not-allowed"
												: "button"
										}`}
									>
										{hasPaid ? "입금완료" : isClosed ? "종료됨" : "입금하기"}
									</button>
									<button
										type="button"
										onClick={() => navigate(`/group/${group.id}`)}
										className="flex-[1] button text-[14px] transition-all duration-300"
									>
										상세보기
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{selectedGroupForDeposit && uid && (
				<Dialog.Root
					open={true}
					onOpenChange={(open) => {
						if (!open) setSelectedGroupForDeposit(null);
					}}
				>
					<DepositModal
						open={true}
						onClose={() => setSelectedGroupForDeposit(null)}
						groupId={selectedGroupForDeposit.id}
						creatorId={selectedGroupForDeposit.creatorId}
						groupName={selectedGroupForDeposit.groupName}
						uid={uid}
						onSuccess={() => setSelectedGroupForDeposit(null)}
					/>
				</Dialog.Root>
			)}
		</div>
	);
}
