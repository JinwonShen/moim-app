import type { Group } from "../types/group";

interface GroupCardProps {
	group: Group;
	isOwner: boolean;
	onClickDetail: () => void;
	onClickAction: () => void;
	onClickManage?: () => void;
}

export default function GroupCard({
	group,
	isOwner,
	onClickDetail,
	onClickAction,
	onClickManage,
}: GroupCardProps) {
	const now = new Date();
	const start = new Date(group.startDate);
	// const end = new Date(group.endDate);

	const isUpcoming = start > now;
	const statusLabel = isUpcoming ? "모집중" : "진행중";

	const participantCount = group.participantCount ?? 0;
	const paidCount = group.paidParticipants?.length ?? 0;
	const unpaidCount = Math.max(participantCount - paidCount, 0);

	const budgetUsed = group.totalBudget - group.balance;

	return (
		<div className="flex gap-6 p-6 border rounded-lg shadow-sm">
			<div className="flex-shrink-0">
				<span className="text-sm font-bold text-primary">{statusLabel}</span>
			</div>

			<div className="w-full flex flex-col">
				{/* 상단: 모임명 / 기간 / 인원정보 */}
				<div className="w-full flex justify-between">
					<div className="flex flex-col flex-1 justify-start mb-2">
						<div className="flex gap-6">
							<h2 className="text-base font-bold">{group.groupName}</h2>
							<span className="pb-1 text-xs text-gray-500 self-end">
								{group.startDate} ~ {group.endDate}
							</span>
						</div>
						<p className="mt-3 text-sm">
							참여자 {participantCount}명 / 미입금 {unpaidCount}명
						</p>
					</div>

					<div className="flex flex-row flex-1">
						<p className="flex-1 text-sm text-gray-600 text-right">
							예산: {group.totalBudget.toLocaleString()}원
						</p>
						<div className="flex-1 flex flex-col">
							<p className="mb-3 text-sm text-gray-600 text-right">
								지출: {budgetUsed.toLocaleString()}원
							</p>
							<p className="text-sm text-gray-600 text-right">
								잔액: {group.balance.toLocaleString()}원
							</p>
						</div>
					</div>
				</div>

				{/* 하단: 버튼 영역 */}
				<div className="flex gap-3 mt-3 justify-between">
					<button
						type="button"
						onClick={onClickDetail}
						className="flex-1 py-2 rounded-lg bg-secondary-100 text-sm transition-all duration-300 hover:bg-primary hover:text-white"
					>
						상세보기
					</button>
					<button
						type="button"
						onClick={() => {
							console.log("📦 지출추가 버튼 클릭됨:", group.groupName);
							onClickAction();
						}}
						className="flex-1 py-2 rounded-lg bg-secondary-100 text-sm transition-all duration-300 hover:bg-primary hover:text-white"
					>
						지출추가
					</button>
					{isOwner && onClickManage && (
						<button
							type="button"
							onClick={onClickManage}
							className="flex-1 py-2 rounded-lg bg-secondary-100 text-sm transition-all duration-300 hover:bg-primary hover:text-white"
						>
							참여자 관리
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
