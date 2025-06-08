import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupCard from "../components/GroupCard";
import AddExpenseModal from "../components/modal/AddExpenseModal";
import InviteModal from "../components/modal/InviteModal";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import type { Group } from "../types/group";

export default function MyGroups() {
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const { myGroups, fetchGroups } = useGroupStore();

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

	useEffect(() => {
		if (uid) fetchGroups(uid);
	}, [uid, fetchGroups]);

	const fetchExpenses = async () => {
		// 필요 시 구현 예정
	};

	return (
		<div>
			<h1 className="text-xl font-bold mb-[12px] pb-[12px] border-b-[1px]">
				내가 만든 모임
			</h1>
			<p className="mb-[24px] text-gray-500">총 모임 {myGroups.length}건</p>

			<div className="space-y-4">
				{myGroups.map((group) => (
					<GroupCard
						key={group.id}
						group={group}
						isOwner={true}
						onClickDetail={() => navigate(`/group/${group.id}`)}
						onClickAction={() => setSelectedGroupForExpense(group)}
						onClickManage={() => setSelectedGroupForInvite(group)}
					/>
				))}
			</div>

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
