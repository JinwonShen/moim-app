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
import { db } from "../lib/firebase";

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
          const monthKey = format(parseISO(dateStr), "yyyy-MM");
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
        }
      });

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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 16 }} tickMargin={12} />
          <YAxis width={100} tickFormatter={(v:number) => `${v.toLocaleString()}원`} tickMargin={8} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()}원`} />
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
