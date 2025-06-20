/**
 * 입금 마감일이 5일 이내로 다가온 모임을 확인하여, 
 * 사용자에게 입금 요청 알림 메시지를 보낼 수 있는 카드 형태의 UI를 제공합니다.
 * 가장 가까운 마감일을 가진 모임 하나만 표시하며,
 * 메시지 전송 및 상세보기 기능 버튼을 제공합니다.
 */

import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupStore } from "../../store/groupStore";

export default function DepositReminder() {
  const navigate = useNavigate();
  const { myGroups } = useGroupStore();

  const [targetGroup, setTargetGroup] = useState<null | (typeof myGroups)[0]>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 현재 시각을 기준으로 입금 마감일이 5일 이내인 모임들을 필터링
    const now = new Date();

    const upcoming = myGroups
      .filter((group) => {
        // 입금 마감일이 존재하지 않는 경우 제외
        if (!group.depositDeadline) return false;

        const deadline = parseISO(group.depositDeadline);
        // 잘못된 날짜 형식은 제외
        if (!isValid(deadline)) return false;

        const dDay = differenceInCalendarDays(deadline, now);
        // 오늘 기준으로 0~5일 이내 마감일만 포함
        return dDay >= 0 && dDay <= 5;
      })
      .sort(
        // 마감일이 빠른 순으로 정렬
        (a, b) =>
          new Date(a.depositDeadline!).getTime() -
          new Date(b.depositDeadline!).getTime()
      );

    // 가장 빠른 마감일을 가진 모임 하나만 선택
    if (upcoming.length > 0) {
      setTargetGroup(upcoming[0]);
    }

    // 필터링 체크 완료
    setChecked(true);
  }, [myGroups]);

  // 아직 useEffect 내 로직 실행 전에는 렌더링하지 않음
  if (!checked) return null;

  // 입금 마감일이 임박한 모임이 없을 경우 안내 메시지 출력
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

  // 입금 마감일이 임박한 모임 정보로 알림 카드 UI 렌더링
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
            // TODO: 추후 실제 입금 요청 알림 전송 기능으로 대체 예정
            alert("입금 요청 메시지를 보낼 수 있어요!");
          }}
        >
          메시지 보내기
        </button>
        <button
          className="px-3 py-1 text-sm bg-primary text-white rounded hover:opacity-90"
          onClick={() => {
            // 해당 모임 상세 페이지로 이동
            navigate(`/group/${targetGroup.id}`);
          }}
        >
          상세보기
        </button>
      </div>
    </div>
  );
}