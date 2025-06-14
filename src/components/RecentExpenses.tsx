import { format, parseISO } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  category: string;
  memo?: string;
}

interface RecentExpensesProps {
  groupId?: string; // ✅ 옵셔널로 변경
}

export default function RecentExpenses({ groupId }: RecentExpensesProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      if (!groupId) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);

      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          amount: Number(data.amount || 0),
          category: data.category || "기타",
          memo: data.memo || "",
        };
      });

      // 최근 날짜순 정렬 후 상위 5개만
      const sorted = items
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

      setExpenses(sorted);
      setLoading(false);
    };

    fetchExpenses();
  }, [groupId]);

  if (loading) return null;

  // ✅ groupId가 없거나 내역이 없을 때
  if (!groupId || expenses.length === 0) {
    return (
      <div>
        <p className="mt-[36px] mb-[12px] text-center  text-gray-500 text-[14px] md:text-[16px]">
          💵 최근 지출 내역이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="text-sm">
      {expenses.map((e) => (
        <li
          key={e.id}
          className="flex justify-between border-b last:border-b-0 py-[8px]"
        >
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">
              {format(parseISO(e.date), "yyyy.MM.dd")}
            </span>
            <span>
              [{e.category}] {e.memo || "내용 없음"}
            </span>
          </div>
          <div className="text-right font-semibold">
            {e.amount.toLocaleString()}원
          </div>
        </li>
      ))}
    </ul>
  );
}