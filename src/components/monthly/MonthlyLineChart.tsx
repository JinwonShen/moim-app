/**
 * 월별 지출 합계를 선형 그래프로 시각화하는 컴포넌트입니다.
 * Firestore에서 해당 모임의 지출 데이터를 불러와,
 * 월 단위로 합산한 뒤 recharts를 사용하여 그래프로 렌더링합니다.
 */

import { format, parseISO } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../lib/firebase";

interface LineGraphProps {
  groupId: string;
}

export default function MonthlyLineGraph({ groupId }: LineGraphProps) {
  const [monthlyTotals, setMonthlyTotals] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);

      const monthlyMap = new Map<string, number>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const dateStr = data.date;
        const amount = Number(data.amount || 0);

        if (dateStr) {
          // ISO 형식의 날짜 문자열을 파싱한 뒤 "yyyy-MM" 형태로 월 키 생성
          const monthKey = format(parseISO(dateStr), "yyyy-MM");
          // 해당 월의 총 지출액을 누적
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
        }
      });

      // 월별 데이터를 정렬 후 배열 형태로 변환하여 상태에 저장
      const sorted = Array.from(monthlyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, total]) => ({ month, total }));

      setMonthlyTotals(sorted);
    };

    fetchData();
  }, [groupId]);

  return (
    <div className="mt-[48px]">
      <ResponsiveContainer width="100%" height={300} className="text-[14px]">
        <LineChart data={monthlyTotals}>
          {/* 배경 그리드 표시 */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* X축: 월 */}
          <XAxis dataKey="month" tick={{ fontSize: 16 }} tickMargin={12} />
          {/* Y축: 금액, 천 단위 콤마 + '원' 표시 */}
          <YAxis width={100} tickFormatter={(v:number) => `${v.toLocaleString()}원`} tickMargin={8} />
          {/* 툴팁 포맷 설정 */}
          <Tooltip formatter={(v: number) => `${v.toLocaleString()}원`} />
          {/* 선 그래프: 총합 지출 데이터 */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="#ff8d8d"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
