import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useGroupStore } from "../store/groupStore";

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

  useEffect(() => {
    const fetchAllNotices = async () => {
      const allGroups = [...myGroups, ...joinedGroups];
      if (allGroups.length === 0) {
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

      const sorted = results.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setNotices(sorted);
      setLoading(false);
    };

    fetchAllNotices();
  }, [myGroups, joinedGroups]);

  if (loading) return null;

  if (notices.length === 0) {
    return (
      <div>
        <p className="mt-[36px] mb-[12px] text-center text-gray-500 text-[14px] md:text-[16px]">
          등록된 공지사항이 없습니다.
        </p>
      </div>
    );
  }

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