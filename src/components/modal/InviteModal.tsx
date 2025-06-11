import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";

interface Props {
	open: boolean;
	onClose: () => void;
	groupId: string;
}

export default function InviteModal({ open, onClose, groupId }: Props) {
	const inviteUrl = `${window.location.origin}/joingroup?groupId=${groupId}`;

	const handleCopy = () => {
		navigator.clipboard.writeText(inviteUrl);
		alert("초대 링크가 복사되었습니다.");
	};

	const handleRequestPayment = () => {
		alert("입금 요청 알림 기능은 추후 구현 예정입니다.");
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md w-[90vw] p-[24px] bg-white rounded-[8px] border shadow-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
				<div className="flex justify-between items-center mb-[12px]">
					<div className="flex items-end">
						<DialogTitle className="text-[20px] font-bold">
							참여자 초대
						</DialogTitle>
						<DialogDescription className="ml-[12px] pb-[4px]">
							참여자에게 초대 링크를 전달해요.
						</DialogDescription>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-[4px] border rounded-[4px] bg-gray-100 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
					>
						<FiX />
					</button>
				</div>
				<h2 className="mb-[8px] text-sm">모임 초대 링크</h2>
				<div className="flex items-center gap-2 mb-4">
					<input
						type="text"
						value={inviteUrl}
						readOnly
						className="border px-2 py-1 flex-1 text-sm"
					/>
					<button
						type="button"
						onClick={handleCopy}
						className="px-[24px] py-[4px] rounded-[4px] bg-primary border border-primary text-white transition-all duration-300 hover:bg-white hover:text-primary"
					>
						복사
					</button>
				</div>

				<button
					type="button"
					onClick={handleRequestPayment}
					className="bg-gray-300 text-white w-full py-2 rounded text-sm"
				>
					입금 요청 알림 보내기
				</button>
			</DialogContent>
		</Dialog>
	);
}
