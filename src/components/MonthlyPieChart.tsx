import { addMonths, format, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "../lib/firebase";

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
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  const totalAmount = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap: Record<string, number> = {};
  monthlyExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData: CategoryData[] = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / totalAmount) * 100),
  }));

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex flex-[1] justify-center items-center gap-4 mb-4 text-lg font-semibold">
        <button onClick={() => onMonthChange(subMonths(selectedMonth, 1))}>◀</button>
        <span>{format(selectedMonth, "yyyy년 MM월", { locale: ko })}</span>
        <button onClick={() => onMonthChange(addMonths(selectedMonth, 1))}>▶</button>
      </div>
      <div className="flex">
        <div className="w-1/2">
        
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
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-1/2 px-[24px] py-[16px] border rounded-[8px] text-[14px]">
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