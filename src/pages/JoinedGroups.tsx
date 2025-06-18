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
            key={group.id}
            group={group}
            isOwner={false}
            uid={uid}
            onClickDetail={() => navigate(`/group/${group.id}`)}
            onClickAction={() => setSelectedGroupForDeposit(group)}
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
          />
        </Dialog.Root>
      )}
    </div>
  );
}
