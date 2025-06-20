/**
 * - 사용자가 만든 모임과 참여 중인 모임 중 하나를 선택하여 월별 통계를 시각적으로 확인
 * - 선택된 모임과 월에 따라 카테고리별 파이 차트, 시간순 선형 차트, 지출 리스트를 표시
 * - 기본 선택은 진행 중인 모임 중 가장 최근 시작된 모임을 우선 적용
 * - Zustand로부터 그룹 상태를 받아오며, 선택 상태는 useState로 관리됨
 */

import { startOfMonth } from "date-fns";
import { useState } from "react";
import ExpenseList from "../components/group/ExpenseList";
import MonthlyLineGraph from "../components/monthly/MonthlyLineChart";
import CategoryPieChart from "../components/monthly/MonthlyPieChart";
import { useGroupStore } from "../store/groupStore";

export default function MonthlyGraphPage() {
  const { myGroups, joinedGroups } = useGroupStore();
  const allGroups = [...myGroups, ...joinedGroups];

  // ✅ 현재 날짜 기준으로 진행 중인 모임 필터링
  const progressing = allGroups.filter((group) => {
    const now = new Date();
    return new Date(group.startDate) <= now && new Date(group.endDate) >= now;
  });

  // ✅ 진행 중인 모임 중 가장 최근에 시작된 모임을 기본값으로 설정
  const defaultGroup = progressing.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )[0];

  const [selectedGroupId, setSelectedGroupId] = useState(
    defaultGroup?.id ?? allGroups[0]?.id ?? ""
  );
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));

  // ✅ 선택된 그룹 ID에 해당하는 실제 그룹 객체를 조회
  const selectedGroup = allGroups.find((g) => g.id === selectedGroupId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[16px] md:text-[20px] font-bold">월별 지출 그래프</h1>
        <select
          className="border rounded px-3 py-2"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
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

      {/* <div className="flex items-center justify-center gap-4 text-[16px] font-bold mb-6">
        <button onClick={() => setSelectedMonth((prev) => subMonths(prev, 1))}>
          ◀
        </button>
        <h2>{format(selectedMonth, "yyyy년 MM월", { locale: ko })}</h2>
        <button onClick={() => setSelectedMonth((prev) => addMonths(prev, 1))}>
          ▶
        </button>
      </div> */}

      {selectedGroup && (
        <>
          <CategoryPieChart
            groupId={selectedGroup.id}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <MonthlyLineGraph groupId={selectedGroup.id} />
          <ExpenseList
            groupId={selectedGroup.id}
            selectedMonth={selectedMonth}
          />
        </>
      )}
    </div>
  );
}
