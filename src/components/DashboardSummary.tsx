import { format } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "../lib/firebase";

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
        setData([]);
        setLoading(false);
        return;
      }

      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);

      const items: ExpenseItem[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          date: d.date,
          amount: Number(d.amount ?? 0),
          category: d.category ?? "기타",
        };
      });

      setData(items);
      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const monthlyData = data.filter((d) => d.date.startsWith(currentMonth));

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

  const total = monthlyData.reduce((sum, d) => sum + d.amount, 0);
  const categoryMap: Record<string, number> = {};
  monthlyData.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
  });

  const chartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100),
  }));

  const max = chartData.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev,
    chartData[0]
  );
  const min = chartData.reduce((prev, curr) =>
    curr.value < prev.value ? curr : prev,
    chartData[0]
  );

  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row">
        <div className="flex-[1]">
          <ResponsiveContainer width="100%" height={180} style={{ fontSize: "14px" }}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${percent}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
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