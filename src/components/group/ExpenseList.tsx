/**
 * ExpenseList 컴포넌트
 * - 특정 모임(groupId)에서 지정한 월(selectedMonth)에 해당하는 지출 데이터를 Firestore에서 가져와 렌더링합니다.
 * - 지출 내역은 날짜순으로 정렬되며, 페이지네이션을 지원합니다.
 * - 총 지출 금액도 함께 계산 및 출력합니다.
 */

import { format, isSameMonth, parseISO } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";

interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category?: string;
  memo?: string;
}

interface ExpenseListProps {
  groupId: string;
  selectedMonth: Date;
}

export default function ExpenseList({ groupId, selectedMonth }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Firestore에서 해당 모임의 지출 데이터를 가져와 상태로 저장
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
          category: data.category ?? "",
          memo: data.memo ?? "",
        };
      });

      // 정리된 지출 데이터를 상태에 저장
      setExpenses(items);
      setCurrentPage(1); // 그룹 변경 시 초기 페이지로
    };

    fetchExpenses();
  }, [groupId]);

  // 선택된 월과 일치하는 지출 항목만 필터링
  const filtered = expenses.filter((e) =>
    isSameMonth(parseISO(e.date), selectedMonth)
  );
  // 날짜 기준 오름차순 정렬
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  // 페이지네이션 처리 관련 변수 설정
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sorted.slice(startIndex, startIndex + itemsPerPage);
  // 전체 지출 금액 계산 (월 필터와는 별개로 전체 합산)
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mt-[48px] mb-[12px]">
				<h2 className="text-[16px] md:text-[20px] font-bold">
        {format(selectedMonth, "yyyy년 MM월")} 지출 내역
				</h2>
				<div className="text-right text-[16px] font-bold">
					총 지출: {totalAmount.toLocaleString()}원
				</div>
			</div>

      <ul className="w-full border rounded-[8px]">
        {/* 헤더 타이틀 */}
        <li className="grid grid-cols-4 px-[12px] py-[8px] text-[14px] font-semibold text-gray-700 border-b rounded-t-[8px] bg-gray-100">
          <span>날짜</span>
          <span>분류</span>
          <span>내용</span>
          <span className="text-right">금액</span>
        </li>

        {/* 항목 또는 비어있을 때 메시지 */}
        {currentItems.length === 0 ? (
          <li className="col-span-4 text-center text-gray-500 py-4">
            해당 월에 등록된 지출이 없습니다.
          </li>
        ) : (
          currentItems.map((item, index) => (
            <li
              key={item.id}
              className={`grid grid-cols-4 px-[12px] py-[8px] text-sm items-center ${
                index !== currentItems.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="text-gray-500">
                {format(parseISO(item.date), "yy.MM.dd")}
              </span>
              <span>{item.category}</span>
              <span className="truncate">{item.memo}</span>
              <span className="text-right font-semibold">
                {item.amount.toLocaleString()}원
              </span>
            </li>
          ))
        )}
      </ul>

      {/* 페이지네이션 버튼 UI 렌더링 */}
      {totalPages >= 1 && (
        <div className="flex justify-center gap-2 mt-[12px] text-[14px]">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-[8px] py-[4px] rounded disabled:opacity-40"
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-[12px] py-[4px] rounded ${
                currentPage === i + 1
                  ? "bg-gray-100 border-primary"
                  : "hover:bg-primary"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-[8px] py-[4px] rounded disabled:opacity-40"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}