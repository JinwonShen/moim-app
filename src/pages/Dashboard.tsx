import * as Dialog from "@radix-ui/react-dialog";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from "../components/common/FloatingButton";
import DashboardGroupCard from "../components/dashboard/DashboardGroupCard";
import MonthSummary from "../components/dashboard/DashboardSummary";
import DepositReminder from "../components/dashboard/DepositReminder";
import NoticeSummary from "../components/dashboard/NoticeSummary";
import RecentExpenses from "../components/dashboard/RecentExpenses";
import AddExpenseModal from "../components/modal/AddExpenseModal";
import DepositModal from "../components/modal/DepositModal";
import { useUserGroups } from "../hooks/useGroups";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { useExpenseStore } from "../store/expenseStore";
import type { Group } from "../types/group";
import { getGroupStatus } from "../utils/groupStatus";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const { myGroups, joinedGroups, loading } = useUserGroups(uid ?? "");
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<Group | null>(null);
  const [categories, setCategories] = useState<string[]>(["식비", "교통비", "숙박비", "기타"]);
  const { setRecentExpenses } = useExpenseStore();
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const selectedGroup =
    myGroups.find((group) => group.id === selectedGroupId) ||
    joinedGroups.find((group) => group.id === selectedGroupId);

  const fetchExpenses = async () => {
    if (!myGroups.length) return;
    const groupId = myGroups[0].id;
    if (!groupId) return;

    const expensesRef = collection(db, "groups", groupId, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"), limit(5));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        description: data.memo ?? "",
        category: data.category ?? "",
        amount: Number(data.amount ?? 0),
        createdAt: data.createdAt,
      };
    });
    setRecentExpenses(items);
  };

  useEffect(() => {
    sessionStorage.removeItem("pin_verified");
  }, []);


  useEffect(() => {
    const now = new Date();
    const progressingGroups = [...myGroups, ...joinedGroups].filter((group) => {
      const start = new Date(group.startDate);
      const end = new Date(group.endDate);
      return now >= start && now <= end;
    });
    if (progressingGroups.length > 0 && !selectedGroupId) {
      const sorted = progressingGroups.sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setSelectedGroupId(sorted[0].id);
    }
  }, [myGroups, joinedGroups]);

  if (loading) return <p>로딩중...</p>;

  // Helper: 그룹 우선순위 정렬 및 최상위 그룹 반환
  const getTopPriorityGroup = (groups: typeof myGroups) => {
    const priority = { "진행중": 0, "모집중": 1, "모임종료": 2 };

    return [...groups]
      .sort((a, b) => {
        const statusA = getGroupStatus(a.startDate, a.endDate).status;
        const statusB = getGroupStatus(b.startDate, b.endDate).status;
        if (
          priority[statusA as keyof typeof priority] !==
          priority[statusB as keyof typeof priority]
        ) {
          return (
            priority[statusA as keyof typeof priority] -
            priority[statusB as keyof typeof priority]
          );
        }

        const dateA =
          statusA === "모집중"
            ? new Date(a.startDate).getTime()
            : statusA === "진행중"
            ? new Date(a.startDate).getTime()
            : new Date(a.endDate).getTime();

        const dateB =
          statusB === "모집중"
            ? new Date(b.startDate).getTime()
            : statusB === "진행중"
            ? new Date(b.startDate).getTime()
            : new Date(b.endDate).getTime();

        return dateB - dateA; // 최신 우선
      })[0];
  };

  const topMyGroup = getTopPriorityGroup(myGroups);
  const topJoinedGroup = getTopPriorityGroup(joinedGroups);

  return (
    <div>
      <div>
        <main className="min-h-[750px] max-h-[1000px] flex flex-col md:flex-row flex-1 gap-[24px]">
          <div className="flex flex-col w-full md:w-[calc(50%-12px)] gap-[24px]">
            <section className="min-h-[180px] max-h-[300px] p-[24px] border border-gray-200 rounded-[8px]">
              <div className="flex flex-col gap-[12px]">
                {topMyGroup ? (
                  <DashboardGroupCard
                    group={topMyGroup}
                    isOwner={true}
                    onClickDeposit={() => {
                      if (topMyGroup?.id) {
                        setSelectedGroupId(topMyGroup.id);
                        if (topMyGroup.creatorId === uid && topMyGroup.balance > 0) {
                          setSelectedGroupForExpense(topMyGroup);
                        } else {
                          setDepositOpen(true);
                        }
                      }
                    }}
                    onClickDetail={() => navigate(`/group/${topMyGroup?.id}`)}
                    userId={""}
                    onClickAction={() => setSelectedGroupForExpense(topMyGroup)}
                  />
                ) : (
                  <>
                    <p className="font-bold">👍 현재 진행중이거나 생성된 모임이 없어요!</p>
                    <button type="button" className="button w-full mt-[24px] px-[24px] py-[8px] text-[14px]" onClick={() => navigate("/group/create")}>새 모임 만들기</button>
                  </>
                )}
              </div>
            </section>
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <div>
                {topJoinedGroup ? (
                  <DashboardGroupCard
                    group={topJoinedGroup}
                    isOwner={false}
                    onClickDeposit={() => {
                      setDepositOpen(true);
                      if (topJoinedGroup?.id) setSelectedGroupId(topJoinedGroup.id);
                    }}
                    onClickDetail={() => navigate(`/group/${topJoinedGroup?.id}`)}
                    userId={""}
                    onClickAction={() => setSelectedGroupForExpense(topJoinedGroup)}
                  />
                ) : (
                  <>
                    <p className="font-bold">🙋🏻 현재 진행중이거나 참여중인 모임이 없어요!</p>
                    <p className="mt-[36px] mb-[12px] text-center text-gray-500">다른 모임에 참여하려면 초대를 받아야 해요.</p>
                  </>
                )}
              </div>
            </section>
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <h2 className="text-[14px] mb-[12px]">입금 요청 예약</h2>
              <div><DepositReminder /></div>
            </section>
          </div>
          <div className="flex flex-col gap-[24px] w-full md:w-[calc(50%-12px)] pb-[24px]">
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <h2 className="text-[14px] mb-[12px]">이번 달 지출</h2>
              <div><MonthSummary groupId={selectedGroupId ?? ""} /></div>
            </section>
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <h2 className="text-[14px] mb-[12px]">최근 지출 내역</h2>
              <div><RecentExpenses groupId={selectedGroupId ?? ""} /></div>
            </section>
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <h2 className="text-[14px] mb-[12px]">공지사항</h2>
              <div><NoticeSummary /></div>
            </section>
          </div>
        </main>
        {uid && myGroups[0]?.id && (
          <FloatingButton groupId={myGroups[0].id} uid={uid} categories={categories} setCategories={setCategories} fetchExpenses={fetchExpenses} showGroupSelector={true} />
        )}
        {isDepositOpen && selectedGroupId && user?.uid && selectedGroup && (
          <DepositModal open={isDepositOpen} onClose={() => setDepositOpen(false)} groupId={selectedGroupId} uid={user.uid} creatorId={selectedGroup.creatorId} groupName={selectedGroup.groupName} onSuccess={() => {}} />
        )}
        {selectedGroupForExpense && (
          <Dialog.Root
            open={true}
            onOpenChange={(open) => {
              if (!open) setSelectedGroupForExpense(null);
            }}
          >
            <AddExpenseModal
              groupId={selectedGroupForExpense.id}
              uid={uid ?? "test-uid"}
              categories={categories}
              setCategories={setCategories}
              fetchExpenses={fetchExpenses}
              onClose={() => setSelectedGroupForExpense(null)}
            />
          </Dialog.Root>
        )}
      </div>
    </div>
  );
}
