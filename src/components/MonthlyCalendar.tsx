import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	startOfMonth,
	subMonths
} from "date-fns";
import { ko } from "date-fns/locale/ko";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

interface MonthlyCalendarProps {
  groupId: string;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
}

export default function MonthlyCalendar({
  groupId,
  selectedMonth,
  onMonthChange,
}: MonthlyCalendarProps) {
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
          amount: Number(data.amount || 0),
        };
      });

      setExpenses(items);
    };

    fetchExpenses();
  }, [groupId]);

  const start = startOfMonth(selectedMonth);
  const end = endOfMonth(selectedMonth);
  const days = eachDayOfInterval({ start, end });
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getExpenseTotal = (dateStr: string) =>
    expenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="overflow-hidden mb-6">
      {/* ✅ 상단 달 이동 */}
      <div className="flex justify-center items-center px-4 py-3 bg-white">
        <button
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
          className="px-3 py-1 text-sm rounded hover:bg-gray-100"
        >
          ◀
        </button>
        <h2 className="text-lg font-bold px-[12px]">
          {format(selectedMonth, "yyyy년 MM월", { locale: ko })}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
          className="px-3 py-1 text-sm rounded hover:bg-gray-100"
        >
          ▶
        </button>
      </div>

      {/* ✅ 요일 헤더 */}
      <div className="grid grid-cols-7 text-center bg-gray-50 text-sm font-semibold border border-b-0 rounded-t-[8px]">
        {"일월화수목금토".split("").map((d, i) => (
          <div
            key={d}
            className={`py-2 ${
              i === 0
                ? "text-primary"
                : i === 6
                ? "text-blue-400"
                : "text-gray-700"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ✅ 날짜 셀 */}
      <div className="grid grid-cols-7 auto-rows-[80px] text-sm text-center border rounded-b-[8px]">
        {Array(getDay(start))
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSunday = getDay(day) === 0;
          const isSaturday = getDay(day) === 6;
          const isToday =
            format(day, "yyyy-MM-dd") ===
            format(new Date(), "yyyy-MM-dd");
          const amount = getExpenseTotal(dateStr);

          return (
            <div
              key={dateStr}
              className={`py-[8px] px-[12px] text-[12px] flex flex-col justify-start min-h-[70px]
              ${isToday ? "bg-primary/10 outline outline-primary font-bold" : ""}`}
            >
              <span
                className={`text-left ${
                  isSunday
                    ? "text-primary"
                    : isSaturday
                    ? "text-blue-400"
                    : "text-gray-700"
                }`}
              >
                {day.getDate()}
              </span>
              {amount > 0 && (
                <span className="text-[11px] text-primary">
                  {amount.toLocaleString()}원
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ 하단 총 지출 표시 */}
      <div className="text-right mt-[24px] text-[16px] font-bold">
        총 지출: {totalAmount.toLocaleString()}원
      </div>
    </div>
  );
}