import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupStore } from "../store/groupStore";

export default function DepositReminder() {
  const navigate = useNavigate();
  const { myGroups } = useGroupStore();

  const [targetGroup, setTargetGroup] = useState<null | (typeof myGroups)[0]>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const now = new Date();

    const upcoming = myGroups
      .filter((group) => {
        if (!group.depositDeadline) return false;

        const deadline = parseISO(group.depositDeadline);
        if (!isValid(deadline)) return false;

        const dDay = differenceInCalendarDays(deadline, now);
        return dDay >= 0 && dDay <= 5;
      })
      .sort(
        (a, b) =>
          new Date(a.depositDeadline!).getTime() -
          new Date(b.depositDeadline!).getTime()
      );

    if (upcoming.length > 0) {
      setTargetGroup(upcoming[0]);
    }

    setChecked(true);
  }, [myGroups]);

  // ✅ 로딩 중
  if (!checked) return null;

  // ✅ 입금 요청 대상 모임 없음
  if (!targetGroup || !targetGroup.depositDeadline) {
    return (
      <div>
        <p className="mt-[36px] mb-[12px] text-center text-gray-500 text-[14px] md:text-[16px]">
          📭 현재 입금 요청이 필요한 모임이 없습니다.
        </p>
      </div>
    );
  }

  const dDay = differenceInCalendarDays(
    parseISO(targetGroup.depositDeadline),
    new Date()
  );

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <p className="text-base font-semibold text-primary mb-1">
        {targetGroup.groupName}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        마감일: D-{dDay} | 금액:{" "}
        {targetGroup.eachAmount
          ? `${targetGroup.eachAmount.toLocaleString()}원`
          : "미입력"}
      </p>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
          onClick={() => {
            alert("입금 요청 메시지를 보낼 수 있어요!");
          }}
        >
          메시지 보내기
        </button>
        <button
          className="px-3 py-1 text-sm bg-primary text-white rounded hover:opacity-90"
          onClick={() => navigate(`/group/${targetGroup.id}`)}
        >
          상세보기
        </button>
      </div>
    </div>
  );
}