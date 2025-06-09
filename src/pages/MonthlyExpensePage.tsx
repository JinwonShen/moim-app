import { startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import ExpenseList from "../components/ExpenseList";
import MonthlyCalendar from "../components/MonthlyCalendar";
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

	useEffect(() => {
  if (uid) fetchGroups(uid);
}, [uid]);

  // ✅ 가장 최근 진행 중인 모임 자동 선택
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

  // ✅ 선택된 모임 객체 설정
  useEffect(() => {
    const found =
      myGroups.find((g) => g.id === selectedGroupId) ||
      joinedGroups.find((g) => g.id === selectedGroupId);
    setSelectedGroup(found ?? null);
  }, [selectedGroupId, myGroups, joinedGroups]);

  // ✅ 로딩 상태
  if (selectedGroupId === null) {
    return <p className="text-gray-500">모임 데이터를 불러오는 중...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-[12px]">
        <h1 className="text-[20px] font-bold">월별 지출 일지</h1>

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
          <ExpenseList
            groupId={selectedGroup.id}
            selectedMonth={selectedMonth}
          />
        </>
      )}
    </div>
  );
}