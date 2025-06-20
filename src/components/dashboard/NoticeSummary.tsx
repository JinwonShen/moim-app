/**
 * 대시보드 내 공지사항 요약 컴포넌트입니다.
 * 사용자가 속한 모든 모임의 최신 공지사항(1건씩)을 가져와 최신순으로 표시합니다.
 * 공지 클릭 시 해당 모임 상세 페이지로 이동합니다.
 */

import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { useGroupStore } from "../../store/groupStore";

interface NoticeItem {
  id: string;
  groupId: string;
  groupName: string;
  content: string;
  createdAt: string;
}

export default function NoticeSummaryList() {
  const { myGroups, joinedGroups } = useGroupStore();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 사용자가 속한 모든 그룹에서 최신 공지사항 1건씩 비동기적으로 가져오기
  useEffect(() => {
    const fetchAllNotices = async () => {
      const allGroups = [...myGroups, ...joinedGroups];
      if (allGroups.length === 0) {
        // 그룹이 없을 경우 바로 로딩 종료
        setLoading(false);
        return;
      }

      const results: NoticeItem[] = [];

      await Promise.all(
        allGroups.map(async (group) => {
          const ref = collection(db, "groups", group.id, "notices");
          const q = query(ref, orderBy("createdAt", "desc"), limit(1));
          const snapshot = await getDocs(q);

          snapshot.forEach((doc) => {
            const data = doc.data();
            // 각 그룹의 공지사항 중 최신 1건만 추출하여 배열에 추가
            results.push({
              id: doc.id,
              groupId: group.id,
              groupName: group.groupName,
              content: data.content || "",
              createdAt: data.createdAt?.toDate?.().toISOString() || "",
            });
          });
        })
      );

      // 모든 공지를 최신순으로 정렬
      const sorted = results.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setNotices(sorted);
      setLoading(false);
    };

    fetchAllNotices();
  }, [myGroups, joinedGroups]);

  if (loading) return null;

  // 공지사항이 하나도 없는 경우 메시지 표시
  if (notices.length === 0) {
    return (
      <div>
        <p className="mt-[36px] mb-[12px] text-center text-gray-500 text-[14px] md:text-[16px]">
          등록된 공지사항이 없습니다.
        </p>
      </div>
    );
  }

  // 공지사항 리스트 렌더링
  return (
    <ul className="text-[14px]">
      {notices.map((notice) => (
        <li
          key={notice.id}
          onClick={() => navigate(`/group/${notice.groupId}`)}
          className="cursor-pointer hover:bg-gray-50 px-[6px] py-[4px] rounded"
        >
          <span className="font-semibold text-primary mr-1">
            [{notice.groupName}]
          </span>
          <span className="text-gray-700">
            {notice.content.length > 40
              ? `${notice.content.slice(0, 40)}...`
              : notice.content}
          </span>
        </li>
      ))}
    </ul>
  );
}