// components/dashboard/DashboardGroupCard.tsx
import type { Group } from "../../types/group";
import { getGroupStatus } from "../../utils/groupStatus";

interface DashboardGroupCardProps {
  group: Group;
  isOwner: boolean;
  userId: string;
  onClickDetail: () => void;
  onClickAction: () => void;
  onClickDeposit?: () => void;
}

export default function DashboardGroupCard({
  group,
  isOwner,
  userId,
  onClickDetail,
  onClickAction,
}: DashboardGroupCardProps) {
  const { status, labelColor, disabled } = getGroupStatus(group.startDate, group.endDate);
  const participantCount = group.participantCount ?? 0;
  const paidCount = group.paidParticipants?.length ?? 0;
  const paidPercent = participantCount > 0 ? Math.floor((paidCount / participantCount) * 100) : 0;
  const totalBudget = group.totalBudget ?? 0;
  const balance = group.balance ?? 0;
  const balancePercent = totalBudget > 0 ? Math.floor((balance / totalBudget) * 100) : 0;
  const eachFee = participantCount > 0 ? Math.floor(totalBudget / participantCount) : 0;
  const paidTotal = eachFee * paidCount;
  const hasPaid = group.paidParticipants?.includes(userId) ?? false;

  return (
    <div>
      <h3 className="text-sm text-gray-600 mb-[8px]">
        {isOwner ? "내가 만든 모임" : "참여 중인 모임"}
      </h3>
      <div className="flex justify-between items-center mb-[4px]">
        <h2 className="text-lg font-bold">{group.groupName}</h2>
        <span className={`text-[12px] px-[12px] py-[7px] rounded-[4px] font-semibold text-white bg-gray-300 ${labelColor}`}>{status}</span>
      </div>
      <p className="text-sm text-gray-500 mb-[12px]">{group.startDate} ~ {group.endDate}</p>
      <hr className="mb-[12px]" />
      <p className="text-sm mb-[4px]">참여자: {participantCount}명 중 {paidCount}명 입금 완료</p>
      <div className="h-[12px] bg-gray-200 rounded-full overflow-hidden mb-[8px]">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${status === "모집중" ? paidPercent : balancePercent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mb-[16px]">
        {status === "모집중" || balancePercent === 100
          ? `예산: ${totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원`
          : `예산: ${totalBudget.toLocaleString()}원 / 잔액: ${balance.toLocaleString()}원`}
      </p>
      <div className="flex gap-[12px]">
        {isOwner ? (
          hasPaid ? (
            <button
              type="button"
              onClick={onClickAction}
              className="w-full py-[8px] button text-[14px] transition-all duration-300"
            >
              입금하기
            </button>
          ) : (
            <button
              type="button"
              onClick={onClickAction}
              className="w-full py-[8px] button text-[14px] transition-all duration-300"
            >
              지출등록
            </button>
          )
        ) : (
          <button
            type="button"
            disabled={disabled || hasPaid}
            onClick={onClickAction}
            className={`w-full py-[10px] rounded-md text-sm transition-all duration-300 ${
              disabled || hasPaid
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
          >
            {hasPaid ? "입금완료" : "입금하기"}
          </button>
        )}
        <button
          type="button"
          onClick={onClickDetail}
          className="w-full py-[8px] button text-[14px] transition-all duration-300"
        >
          모임 상세보기
        </button>
      </div>
    </div>
  );
}