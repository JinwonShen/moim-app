/**
 * 이 컴포넌트는 대시보드 내에서 이번 달 지출 요약을 시각적으로 보여주는 컴포넌트입니다.
 * Firebase Firestore에서 해당 그룹의 지출 데이터를 가져와 PieChart 형태로 시각화하며,
 * 가장 많이/적게 지출된 카테고리 정보도 함께 표시합니다.
 */

import { format } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "../../lib/firebase";

interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  category: string;
}

interface ThisMonthSummaryProps {
  groupId?: string; // ✅ 선택적 props로 수정
}

const COLORS = ["#ff8d8d", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#8884d8"];

export default function MonthSummary({ groupId }: ThisMonthSummaryProps) {
  const [data, setData] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!groupId) {
        // groupId가 없는 경우 데이터 초기화 후 종료
        setData([]);
        setLoading(false);
        return;
      }

      // Firebase에서 해당 그룹의 지출 데이터 가져오기
      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);

      const items: ExpenseItem[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          date: d.date,
          amount: Number(d.amount ?? 0),
          category: d.category ?? "기타", // 카테고리가 없으면 "기타"로 설정
        };
      });

      setData(items);
      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  // 이번 달 지출만 필터링
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const monthlyData = data.filter((d) => d.date.startsWith(currentMonth)); // 이번 달 지출만 필터링

  if (loading) return null;

  if (!groupId || monthlyData.length === 0) {
    return (
      <div>
        <p className="mt-[36px] mb-[12px] text-center text-gray-500 text-[14px] md:text-[16px]">
          💰 이번 달 등록된 지출 내역이 없습니다.
        </p>
      </div>
    );
  }

  // 총 지출 계산
  const total = monthlyData.reduce((sum, d) => sum + d.amount, 0); // 총 지출 계산

  // 카테고리별 금액 합산
  const categoryMap: Record<string, number> = {};
  monthlyData.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
  }); // 카테고리별 금액 합산

  // 차트에 사용할 데이터 가공 및 비율 계산
  const chartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100), // 비율 계산
  }));

  // 가장 많은 지출 카테고리
  const max = chartData.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev,
    chartData[0]
  ); // 가장 많은 지출 카테고리
  // 가장 적은 지출 카테고리
  const min = chartData.reduce((prev, curr) =>
    curr.value < prev.value ? curr : prev,
    chartData[0]
  ); // 가장 적은 지출 카테고리

  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row">
        <div className="flex-[1]">
          {/* 카테고리별 지출 비율을 나타내는 PieChart */}
          <ResponsiveContainer width="100%" height={180} style={{ fontSize: "14px" }}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${percent}%`} // 카테고리 이름과 비율 표시
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> // 색상 적용
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} /> {/* 툴팁 포맷팅 */}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-[1] p-[12px]">
          <p className="text-[16px] font-bold mb-[12px]">총 지출: {total.toLocaleString()}원</p>
          <p className="flex gap-[8px] text-[14px] mb-[4px]">
            <span>가장 많은 지출: </span>
            <span className="flex flex-col font-semibold">
              <span>{max?.name}</span>
              <span>({max?.value.toLocaleString()}원)</span>
            </span>
          </p>
          <p className="flex gap-[8px] text-[14px] mb-[4px]">
            <span>가장 적은 지출: </span>
            <span className="flex flex-col font-semibold">
              <span>{min?.name}</span>
              <span>({min?.value.toLocaleString()}원)</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}