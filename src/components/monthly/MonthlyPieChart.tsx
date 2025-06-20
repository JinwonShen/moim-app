/**
 * MonthlyPieChart 컴포넌트
 * 선택한 월의 지출 데이터를 카테고리별로 집계하여 파이 차트와 리스트 형태로 시각화합니다.
 * Firebase Firestore에서 그룹의 지출 데이터를 불러와 해당 월의 항목만 필터링합니다.
 * 날짜 이동 버튼으로 이전/다음 달 데이터를 확인할 수 있으며, PieChart는 recharts 라이브러리를 사용합니다.
 */

import { addMonths, format, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "../../lib/firebase";

interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
}

interface CategoryData {
  name: string;
  value: number;
  percent?: number;
}

interface CategoryPieChartProps {
  groupId: string;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

export default function CategoryPieChart({ groupId, selectedMonth, onMonthChange }: CategoryPieChartProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    // Firestore에서 해당 그룹의 지출 데이터를 가져옵니다.
    const fetchExpenses = async () => {
      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);
      const items: ExpenseItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          amount: Number(data.amount ?? 0),
          category: data.category ?? "기타",
        };
      });
      setExpenses(items);
    };
    fetchExpenses();
  }, [groupId]);

  const currentMonthStr = format(selectedMonth, "yyyy-MM");
  // 선택한 월의 지출 항목만 필터링합니다.
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  // 해당 월 전체 지출 금액의 합계를 계산합니다.
  const totalAmount = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 카테고리별로 지출 금액을 합산하여 categoryMap에 저장합니다.
  const categoryMap: Record<string, number> = {};
  monthlyExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  // categoryMap을 기반으로 PieChart용 데이터 배열을 생성하고, 퍼센트도 계산합니다.
  const pieData: CategoryData[] = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / totalAmount) * 100),
  }));

  return (
    <div className="flex flex-col gap-[24px]">
      {/* 월 이동 버튼 및 현재 월 표시 */}
      <div className="flex flex-[1] justify-center items-center gap-4 mb-4 text-lg font-semibold">
        <button onClick={() => onMonthChange(subMonths(selectedMonth, 1))}>◀</button>
        <span>{format(selectedMonth, "yyyy년 MM월", { locale: ko })}</span>
        <button onClick={() => onMonthChange(addMonths(selectedMonth, 1))}>▶</button>
      </div>
      <div className="flex flex-col">
        <div className="w-full md:w-1/2">
          {/* 파이 차트 렌더링 */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart className="text-[14px]">
              <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${percent?.toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      {/* 하단 지출 내역 요약 리스트 */}
      <div className="w-full md:w-1/2 px-[24px] py-[16px] border rounded-[8px] text-[14px]">
        <p className="mb-[16px] pb-[12px] border-b-[1px] text-[16px] font-semibold">지출 전체 {totalAmount.toLocaleString()}원</p>
        <ul className="space-y-2">
          {pieData.map((item, index) => (
            <li key={item.name} className="flex justify-between items-center">
              <span className="flex items-center">
                <span
                  className="min-w-[36px] py-[2px] inline-block rounded-sm mr-[8px] text-center text-white"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {item.percent}%
                </span>
                <span>
                  {item.name}
                </span>
              </span>
              <span>
                ({item.value.toLocaleString()}원)
              </span>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}