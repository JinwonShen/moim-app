/**
 * 최근 지출 내역을 불러와서 최대 5개까지 출력하는 컴포넌트
 * - groupId에 해당하는 그룹의 expenses 서브컬렉션에서 데이터를 가져옴
 * - 최신순 정렬하여 최대 5개만 화면에 표시
 */

import { format, parseISO } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";

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
      // 데이터 로딩 처리 시작
      setLoading(true);
      // groupId가 없을 경우 초기화 및 리턴
      if (!groupId) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      // Firestore에서 데이터 조회
      const ref = collection(db, "groups", groupId, "expenses");
      const snapshot = await getDocs(ref);

      // 데이터 변환 및 정제
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

      // 날짜순 정렬 및 상위 5개 추출
      const sorted = items
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

      // 상태 업데이트 및 로딩 종료
      setExpenses(sorted);
      setLoading(false);
    };

    fetchExpenses();
  }, [groupId]);

  // loading일 경우 렌더링 생략
  if (loading) return null;

  // groupId가 없거나 지출 내역이 없을 경우 메시지 표시
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
          {/* 리스트 렌더링, 날짜 및 카테고리/메모 출력 */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">
              {format(parseISO(e.date), "yyyy.MM.dd")}
            </span>
            <span>
              [{e.category}] {e.memo || "내용 없음"}
            </span>
          </div>
          {/* 금액을 통화 형식으로 출력 */}
          <div className="text-right font-semibold">
            {e.amount.toLocaleString()}원
          </div>
        </li>
      ))}
    </ul>
  );
}