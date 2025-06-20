/**
 * GroupCard 컴포넌트
 * - 대시보드 혹은 그룹 리스트에서 사용하는 카드형 UI 컴포넌트
 * - 모임의 이름, 기간, 참여자 수, 예산/잔액 정보를 보여주며, 상태에 따라 다양한 버튼을 렌더링함
 * - 모임장 여부, 입금 여부, 모임 상태에 따라 버튼의 동작이 달라짐
 */

import type { Group } from "../../types/group";

type GroupCardProps = {
	uid?: string;
	group: Group;
	isOwner: boolean;
	onClickDetail: () => void;
	variant?: 'default' | 'dashboard';
	onClickDeposit?: () => void;
	depositDisabled?: boolean;
	hasPaid?: boolean;
	onClickAction?: () => void;
	onClickManage?: () => void;
};

export default function GroupCard(props: GroupCardProps) {
	const { group, isOwner, onClickDetail, ...rest } = props;
	// 현재 시간과 모임의 시작/종료일 비교를 위해 날짜 객체로 변환
	const now = new Date();
	const start = new Date(group.startDate);
	const end = new Date(group.endDate);
	// 모임 상태(모집중/진행중/종료)에 따른 라벨 결정
	const isUpcoming = start > now;
	const isOngoing = now >= start && now <= end;
	const isEnded = now > end;
	const statusLabel = isUpcoming ? "모집중" : isOngoing ? "진행중" : "모임종료";

	// 총 참여자 수 및 입금 완료자 수 계산
	const participantCount = group.participantCount ?? 0;
	const paidCount = group.paidParticipants?.length ?? 0;
	const unpaidCount = Math.max(participantCount - paidCount, 0);

	// 지출 금액 계산 (총 예산 - 잔액)
	const budgetUsed =
  group.expenses && group.expenses.length > 0 && group.balance !== undefined
    ? group.totalBudget - group.balance
    : 0;

	// 카드 UI 렌더링 시작
	return (
		<div className="flex flex-col md:flex-row gap-[12px] md:gap-[24px] p-[20px] md:p-[24px] border rounded-[8px] shadow-sm">
			<div className="flex-shrink-0">
				<span
					className={`text-[14px] font-bold ${
						isEnded ? "text-gray-500" : "text-primary"
					}`}
				>
					{statusLabel}
				</span>
			</div>

			<div className="w-full flex flex-col">
				{/* 상단: 모임명 / 기간 / 인원정보 */}
				<div className="w-full flex flex-col md:flex-row justify-between">
					<div className="flex flex-col flex-1 justify-start mb-2">
						<div className="flex gap-[24px]">
							<h2 className="text-base font-bold">{group.groupName}</h2>
							<span className="pb-1 text-xs text-gray-500 self-end">
								{group.startDate} ~ {group.endDate}
							</span>
						</div>
						<p className="mt-3 text-sm">
							참여자 {participantCount}명 / 미입금 {unpaidCount}명
						</p>
					</div>

					<div className="flex flex-row flex-1 border-t-[1px] pt-[12px] mt-[4px] md:border-0 md:pt-0 md:mt-0">
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

				{/* 하단: 버튼 영역 */}
				<div className="flex gap-3 mt-3 justify-between">
					{/* 모임장인 경우 버튼 조건부 렌더링 */}
					{isOwner ? (
						<>
							{/* 모임장 */}
							{/* 모임장이고 입금하지 않았으며 종료되지 않은 경우 → 입금하기 버튼 */}
							{!rest.hasPaid && !isEnded ? (
								<button
									type="button"
									disabled={isEnded}
									onClick={rest.onClickDeposit}
									className={`flex-1 py-2 rounded-lg text-sm transition-all duration-300 ${
										isEnded ? 'bg-gray-300 text-white cursor-not-allowed' : 'button'
									}`}
								>
									입금하기
								</button>
							) : rest.hasPaid && isUpcoming ? (
								<button
									type="button"
									disabled
									className="flex-1 py-2 bg-gray-300 text-white cursor-not-allowed rounded-lg text-sm transition-all duration-300"
								>
									입금완료
								</button>
							) : /* 모임장이고 입금했으며 진행중인 경우 → 지출등록 버튼 */ rest.hasPaid && isOngoing ? (
								<button
									type="button"
									onClick={rest.onClickAction}
									className="flex-1 py-2 button rounded-lg text-sm transition-all duration-300"
								>
									지출등록
								</button>
							) : (
								<button
									type="button"
									disabled
									className="flex-1 py-2 bg-gray-300 text-white cursor-not-allowed rounded-lg text-sm transition-all duration-300"
								>
									지출등록
								</button>
							)}

							{rest.onClickManage && (
								<button
									type="button"
									disabled={isEnded}
									onClick={rest.onClickManage}
									className={`flex-1 rounded-lg text-[14px] transition-all duration-300 ${
										isEnded ? 'bg-gray-300 text-white cursor-not-allowed' : 'button'
									}`}
								>
									참여자 관리
								</button>
							)}
						</>
					) : (
						<>
							{/* 참여자인 경우 버튼 렌더링 */}
							{/* 참여자이고 입금하지 않은 경우 → 입금하기 버튼 */}
							<span className="flex-1" />
							<button
								type="button"
								disabled={rest.hasPaid}
								onClick={rest.onClickDeposit}
								className={`flex-1 py-2 rounded-lg text-sm transition-all duration-300 ${
									rest.hasPaid
										? 'bg-gray-300 text-white cursor-not-allowed'
										: 'button'
								}`}
							>
								{rest.hasPaid ? '입금완료' : '입금하기'}
							</button>
						</>
					)}
					<button
						type="button"
						onClick={onClickDetail}
						className="flex-1 py-2 button text-[14px] transition-all duration-300"
					>
						상세보기
					</button>
				</div>
			</div>
		</div>
	);
}
