/**
 * - 화면 우측 하단에 고정된 플로팅 버튼을 렌더링
 * - 버튼 클릭 시 Radix Dialog를 통해 AddExpenseModal(지출 등록 모달) 오픈
 * - 모임 ID, 사용자 ID, 카테고리 상태, 지출 목록 갱신 함수 등 외부에서 전달받음
 * - showGroupSelector가 true일 경우 모달 내에서 그룹 선택 기능 표시
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddExpenseModal from "../modal/AddExpenseModal";

type FloatingButtonProps = {
	groupId: string;
	uid: string;
	categories: string[];
	setCategories: React.Dispatch<React.SetStateAction<string[]>>;
	fetchExpenses: () => Promise<void>;
	showGroupSelector?: boolean;
};

export default function FloatingButton({
	groupId,
	uid,
	categories,
	setCategories,
	fetchExpenses,
	showGroupSelector,
}: FloatingButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className="fixed bottom-[24px] right-[24px] w-[56px] h-[56px] rounded-full bg-primary text-white border border-primary shadow-md flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-primary"
				>
					<FiPlus size={24} />
				</button>
			</Dialog.Trigger>

			<AddExpenseModal
				groupId={groupId}
				uid={uid}
				categories={categories}
				setCategories={setCategories}
				fetchExpenses={fetchExpenses}
				onClose={() => setIsOpen(false)}
				onSuccess={() => setIsOpen(false)}
				showGroupSelector={showGroupSelector}
			/>
		</Dialog.Root>
	);
}
