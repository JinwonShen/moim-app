/**
 * - 사용자가 만든 모임 또는 참여 중인 모임을 선택하여 월별 지출을 확인할 수 있는 페이지
 * - 기본적으로 가장 최근 진행 중인 모임이 자동 선택됨
 * - 선택된 모임과 월에 따라 달력(MonthlyCalendar)과 지출 내역(ExpenseList)을 렌더링
 * - Zustand 상태(store)를 통해 그룹 데이터를 불러오며, 선택된 그룹과 월은 로컬 상태로 관리됨
 */

import { startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import ExpenseList from "../components/group/ExpenseList";
import MonthlyCalendar from "../components/monthly/MonthlyCalendar";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import type { Group } from "../types/group";

export default function MonthlyExpensePage() {
  const uid = useAuthStore((state) => state.user?.uid);
  const { myGroups, joinedGroups, fetchGroups } = useGroupStore();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // ✅ 현재 월 선택 상태 (기본값: 이번 달)
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));

  // ✅ 로그인된 사용자의 모임 데이터를 불러옴 (내가 만든 모임 + 참여 모임)
  useEffect(() => {
    if (uid) fetchGroups(uid);
  }, [uid]);

  // ✅ 가장 최근 진행 중인 모임을 자동으로 선택
  // - 현재 날짜 기준으로 시작일~종료일 사이에 있는 모임 필터링
  // - 그 중 가장 최근 시작일을 기준으로 정렬하여 선택
  useEffect(() => {
    const now = new Date();
    const progressingGroups = [...myGroups, ...joinedGroups].filter((group) => {
      const start = new Date(group.startDate);
      const end = new Date(group.endDate);
      return now >= start && now <= end;
    });

    if (progressingGroups.length > 0 && !selectedGroupId) {
      const sorted = progressingGroups.sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      setSelectedGroupId(sorted[0].id);
    }
  }, [myGroups, joinedGroups]);

  // ✅ 선택된 모임 ID에 따라 실제 모임 객체를 상태에 설정
  // - 내가 만든 모임 또는 참여 중인 모임에서 검색
  useEffect(() => {
    const found =
      myGroups.find((g) => g.id === selectedGroupId) ||
      joinedGroups.find((g) => g.id === selectedGroupId);
    setSelectedGroup(found ?? null);
  }, [selectedGroupId, myGroups, joinedGroups]);

  // ✅ 모임 ID가 아직 선택되지 않은 경우 로딩 메시지 표시
  if (selectedGroupId === null) {
    return <p className="text-gray-500">모임 데이터를 불러오는 중...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-[12px]">
        <h1 className="text-[16px] md:text-[20px] font-bold">월별 지출 일지</h1>

        {/* ✅ 모임 선택 드롭다운 */}
        <select
          id="group-select"
          value={selectedGroupId ?? ""}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="px-[12px] py-[8px] font-bold"
        >
          <optgroup label="내가 만든 모임">
            {myGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupName}
              </option>
            ))}
          </optgroup>
          <optgroup label="참여 중인 모임">
            {joinedGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupName}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* ✅ 달력 + 지출 내역 리스트 */}
      {selectedGroup && (
        <>
          <MonthlyCalendar
            groupId={selectedGroup.id}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <div className="my-[24px]" />
          <ExpenseList
            groupId={selectedGroup.id}
            selectedMonth={selectedMonth}
          />
        </>
      )}
    </div>
  );
}