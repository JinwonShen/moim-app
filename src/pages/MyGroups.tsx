/**
 * 내가 만든 모임(MyGroups) 페이지 컴포넌트.
 * - 현재 로그인한 사용자가 만든 모임 목록을 불러와 카드 형태로 렌더링
 * - 각 모임 카드에는 입금, 지출 등록, 참여자 관리, 상세보기 기능 포함
 * - 모임별로 Radix Dialog를 활용한 모달(AddExpenseModal, DepositModal, InviteModal) 연결
 * - Zustand를 활용한 그룹 상태 관리 및 모임 새로고침 기능 포함
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupCard from "../components/group/GroupCard";
import AddExpenseModal from "../components/modal/AddExpenseModal";
import DepositModal from "../components/modal/DepositModal";
import InviteModal from "../components/modal/InviteModal";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import type { Group } from "../types/group";

export default function MyGroups() {
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const { myGroups, fetchGroups } = useGroupStore();
	const [selectedGroupForDeposit, setSelectedGroupForDeposit] = useState<Group | null>(null);
	const [selectedGroupForExpense, setSelectedGroupForExpense] =
		useState<Group | null>(null);
	const [selectedGroupForInvite, setSelectedGroupForInvite] =
		useState<Group | null>(null);

	const [categories, setCategories] = useState<string[]>([
		"식비",
		"교통비",
		"숙박비",
		"기타",
	]);

	// ✅ 로그인된 사용자의 그룹 목록 불러오기
	useEffect(() => {
		if (uid) fetchGroups(uid);
	}, [uid, fetchGroups]);

	// 🔄 추후 필요 시 그룹별 지출 내역 조회 로직 추가 예정
	const fetchExpenses = async () => {
		// 필요 시 구현 예정
	};

	return (
    <div>
      <h1 className="text-[16px] md:text-[20px] font-bold mb-[12px] pb-[12px] border-b-[1px]">
        내가 만든 모임
      </h1>
      <p className="mb-[12px] md:mb-[24px] text-gray-500 text-[14px] md:text-[16px]">
        총 모임 {myGroups.length}건
      </p>

      <div className="space-y-4">
        {myGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            uid={uid}
            isOwner={true}
            hasPaid={group.paidParticipants?.includes(uid ?? "")}
            onClickDetail={() => navigate(`/group/${group.id}`)}
            onClickDeposit={() => setSelectedGroupForDeposit(group)}
            onClickAction={() => setSelectedGroupForExpense(group)}
            onClickManage={() => setSelectedGroupForInvite(group)}
          />
        ))}
      </div>

      {/* 입금 모달 */}
      {selectedGroupForDeposit && (
        <Dialog.Root
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedGroupForDeposit(null);
          }}
        >
          <DepositModal
            groupId={selectedGroupForDeposit.id}
            onClose={() => setSelectedGroupForDeposit(null)}
            open={true}
            creatorId={selectedGroupForDeposit.creatorId}
            groupName={selectedGroupForDeposit.groupName}
            uid={uid ?? ""}
						onSuccess={() => {
							fetchGroups(uid ?? "");
						}} 
          />
        </Dialog.Root>
      )}

      {/* 지출 등록 모달 (Radix 방식) */}
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
            onSuccess={() => {
							fetchGroups(uid ?? "");
						}} 
          />
        </Dialog.Root>
      )}

      {/* 참여자 초대/관리 모달 */}
      {selectedGroupForInvite && (
        <InviteModal
          open={true}
          onClose={() => setSelectedGroupForInvite(null)}
          groupId={selectedGroupForInvite.id}
        />
      )}
    </div>
  );
}
