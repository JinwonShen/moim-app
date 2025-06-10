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
  groupId: string;
}

export default function RecentExpenses({ groupId }: RecentExpensesProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
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
    };

    fetchExpenses();
  }, [groupId]);

  return (
    <div>
      {expenses.length === 0 ? (
        <p className="text-gray-500 text-sm">지출 내역이 없습니다.</p>
      ) : (
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
      )}
    </div>
  );
}