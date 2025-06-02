import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddExpenseModal from "./modal/AddExpenseModal";

type FloatingButtonProps = {
	groupId: string;
	uid: string;
	categories: string[];
	setCategories: React.Dispatch<React.SetStateAction<string[]>>;
	fetchExpenses: () => Promise<void>;
};

export default function FloatingButton({
	groupId,
	uid,
	categories,
	setCategories,
	fetchExpenses,
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
			/>
		</Dialog.Root>
	);
}
