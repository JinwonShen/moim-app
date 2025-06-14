import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MonthSummary from "../components/DashboardSummary";
import DepositReminder from "../components/DepositReminder";
import FloatingButton from "../components/FloatingButton";
import DepositModal from "../components/modal/DepositModal";
import NoticeSummary from "../components/NoticeSummary";
import RecentExpenses from "../components/RecentExpenses";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { useExpenseStore } from "../store/expenseStore";
import { useGroupStore } from "../store/groupStore";
import { getGroupStatus } from "../utils/groupStatus";

export default function Dashboard() {
  const navigate = useNavigate();
  const uid = useAuthStore((state) => state.user?.uid);
  const { myGroups, joinedGroups, fetchGroups, loading } = useGroupStore();
  const [categories, setCategories] = useState<string[]>(["식비", "커피", "교통비", "숙박비", "엑티비티", "기타"]);
  const { setRecentExpenses } = useExpenseStore();
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
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
    if (uid) fetchGroups(uid as string);
  }, [uid, fetchGroups]);

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
              <h2 className="text-[14px] mb-[12px]">내가 만든 모임</h2>
              <div className="flex flex-col gap-[12px]">
                {topMyGroup ? (
                  [topMyGroup].map((group) => {
                    const { status, labelColor, disabled } = getGroupStatus(String(group.startDate), String(group.endDate));
                    const participantCount = group.participantCount ?? 0;
                    const paidCount = group.paidParticipants?.length ?? 0;
                    const paidPercent = participantCount > 0 ? Math.floor((paidCount / participantCount) * 100) : 0;
                    const totalBudget = group.totalBudget ?? 0;
                    const balance = group.balance ?? 0;
                    const balancePercent = totalBudget > 0 ? Math.floor((balance / totalBudget) * 100) : 0;
                    const eachFee = participantCount > 0 ? Math.floor(totalBudget / participantCount) : 0;
                    const paidTotal = eachFee * paidCount;
                    const hasPaid = user?.uid ? group.paidParticipants?.includes(user.uid) : false;

                    return (
                      <div key={group.id} className="flex flex-col">
                        <div className="flex justify-between items-center mb-[8px]">
                          <h3 className="text-[16px] font-bold">{group.groupName}</h3>
                          <span className={`text-[12px] px-[12px] py-[7px] rounded-[4px] font-semibold ${labelColor}`}>{status}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 pb-[8px] border-b-[2px]">{group.startDate} ~ {group.endDate}</p>
                        <p className="text-[14px] py-[8px]">참여자: {participantCount}명 중 {paidCount}명 입금 완료</p>
                        <div className="h-[12px] bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${status === "모집중" ? paidPercent : balancePercent}%` }} />
                        </div>
                        <p className="pt-[8px] pb-[16px] text-[12px] text-gray-600">
                          {status === "모집중" || balancePercent === 100 ? `예산: ${totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원` : `예산: ${totalBudget.toLocaleString()}원 / 잔액: ${balance.toLocaleString()}원`}
                        </p>
                        <div className="flex gap-[8px]">
                          <button
                            type="button"
                            disabled={disabled || hasPaid}
                            onClick={() => {
                              setDepositOpen(true);
                              if (group.id) setSelectedGroupId(group.id);
                            }}
                            className={`w-full py-[8px] rounded-lg text-sm transition-all duration-300 ${
                              disabled || hasPaid
                                ? "bg-gray-300 text-white cursor-not-allowed"
                                : "button"
                            }`}
                          >
                            {hasPaid ? "입금완료" : "입금하기"}
                          </button>
                          <button type="button" className="w-full py-[8px] button text-[14px] transition-all duration-300" onClick={() => navigate(`/group/${group.id}`)}>모임 상세보기</button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <p className="font-bold">👍 현재 진행중이거나 생성된 모임이 없어요!</p>
                    <button type="button" className="button w-full mt-[24px] px-[24px] py-[8px] text-[14px]" onClick={() => navigate("/group/create")}>새 모임 만들기</button>
                  </>
                )}
              </div>
            </section>
            <section className="min-h-[180px] p-[24px] border border-gray-200 rounded-[8px]">
              <h2 className="text-[14px] mb-[12px]">참여 중인 모임</h2>
              <div>
                {topJoinedGroup ? (
                  [topJoinedGroup].map((group) => {
                    const { status, labelColor, disabled } = getGroupStatus(String(group.startDate), String(group.endDate));
                    const participantCount = group.participantCount ?? 0;
                    const paidCount = group.paidParticipants?.length ?? 0;
                    const paidPercent = participantCount > 0 ? Math.floor((paidCount / participantCount) * 100) : 0;
                    const totalBudget = group.totalBudget ?? 0;
                    const balance = group.balance ?? 0;
                    const balancePercent = totalBudget > 0 ? Math.floor((balance / totalBudget) * 100) : 0;
                    const eachFee = participantCount > 0 ? Math.floor(totalBudget / participantCount) : 0;
                    const paidTotal = eachFee * paidCount;
                    const hasPaid = user?.uid ? group.paidParticipants?.includes(user.uid) : false;

                    return (
                      <div key={group.id} className="flex flex-col">
                        <div className="flex justify-between items-center mb-[8px]">
                          <h3 className="text-[16px] font-bold">{group.groupName}</h3>
                          <span className={`text-[12px] px-[12px] py-[7px] rounded-[4px] font-semibold ${labelColor}`}>{status}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 pb-[8px] border-b-[2px]">{group.startDate} ~ {group.endDate}</p>
                        <p className="text-[14px] py-[8px]">참여자: {participantCount}명 중 {paidCount}명 입금 완료</p>
                        <div className="h-[12px] bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${status === "모집중" ? paidPercent : balancePercent}%` }} />
                        </div>
                        <p className="pt-[8px] pb-[16px] text-[12px] text-gray-600">
                          {status === "모집중" || balancePercent === 100 ? `예산: ${totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원` : `예산: ${totalBudget.toLocaleString()}원 / 잔액: ${balance.toLocaleString()}원`}
                        </p>
                        <div className="flex gap-[8px]">
                          <button
                            type="button"
                            disabled={disabled || hasPaid}
                            onClick={() => {
                              setDepositOpen(true);
                              if (group.id) setSelectedGroupId(group.id);
                            }}
                            className={`w-full py-[8px] rounded-lg text-sm transition-all duration-300 ${
                              disabled || hasPaid
                                ? "bg-gray-300 text-white cursor-not-allowed"
                                : "bg-gray-100 hover:bg-primary hover:text-white"
                            }`}
                          >
                            {hasPaid ? "입금완료" : "입금하기"}
                          </button>
                          <button type="button" className="w-full py-[8px] button text-[14px] transition-all duration-300" onClick={() => navigate(`/group/${group.id}`)}>모임 상세보기</button>
                        </div>
                      </div>
                    );
                  })
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
      </div>
    </div>
  );
}
