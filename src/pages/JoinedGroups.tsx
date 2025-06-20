/**
 * 참여 중인 모임(JoinedGroups) 페이지 컴포넌트.
 * - 현재 로그인된 사용자가 참여한 모임 목록을 카드 형태로 출력
 * - 각 모임 카드에서 상세보기, 입금, 입금 모달 호출 기능 제공
 * - 입금 여부는 paidParticipants 배열을 통해 판단
 * - Radix Dialog를 이용해 DepositModal 모달 출력
 * - Zustand를 활용한 그룹 상태 관리 및 데이터 불러오기 처리
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupCard from "../components/group/GroupCard";
import DepositModal from "../components/modal/DepositModal";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import type { Group } from "../types/group";

export default function JoinedGroups() {
  const navigate = useNavigate();
  const uid = useAuthStore((state) => state.user?.uid);
  const { joinedGroups, fetchGroups } = useGroupStore();
  const [selectedGroupForDeposit, setSelectedGroupForDeposit] = useState<Group | null>(null);

  // ✅ 로그인된 사용자의 참여 중인 모임 목록 불러오기
  useEffect(() => {
    if (uid) fetchGroups(uid);
  }, [uid, fetchGroups]);
	
	if (!uid) return <div>로딩 중...</div>;

  return (
    <div>
      <h1 className="text-[16px] md:text-[20px] font-bold mb-[12px] pb-[12px] border-b-[1px]">
        참여 중인 모임
      </h1>
      <p className="mb-[12px] md:mb-[24px] text-gray-500 text-[14px] md:text-[16px]">
        총 모임 {joinedGroups.length}건
      </p>

      <div className="space-y-4">
        {joinedGroups.map((group) => (
          <GroupCard
						uid={uid}
            key={group.id}
            group={group}
            isOwner={false}
            onClickDetail={() => navigate(`/group/${group.id}`)}
            onClickDeposit={() => setSelectedGroupForDeposit(group)}
            onClickAction={() => setSelectedGroupForDeposit(group)}
						hasPaid={group.paidParticipants?.includes(uid)} // ✅ 이 부분!
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
					/>
        </Dialog.Root>
      )}
    </div>
  );
}