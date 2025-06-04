import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { depositToGroup } from "../../lib/api/walletApi";
import { useWalletStore } from "../../store/walletStore";

interface DepositModalProps {
	open: boolean;
	onClose: () => void;
	groupId: string;
	uid: string;
	onSuccess?: () => void;
}

export default function DepositModal({
	open,
	onClose,
	groupId,
	uid,
	onSuccess,
}: DepositModalProps) {
	const [amount, setAmount] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	const wallet = useWalletStore((state) => state.wallet);

	const handleDeposit = async () => {
		if (!amount || amount <= 0) {
			alert("입금 금액을 입력해주세요.");
			return;
		}

		if (wallet && amount > wallet.balance) {
			alert("잔액이 부족합니다.");
			return;
		}

		try {
			setLoading(true);
			await depositToGroup(groupId, uid, amount);
			onClose();
			onSuccess?.();
		} catch (error) {
			console.error("입금 실패: ", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md w-[90vw] p-[24px] bg-white rounded-[8px] border shadow-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
				<div className="flex items-end">
					<DialogTitle className="text-[20px] font-bold">입금하기</DialogTitle>
					<DialogDescription className="ml-[12px] pb-[4px] text-[14px]">
						모임 계좌에 입금하기
					</DialogDescription>
				</div>
				<div className="flex flex-col mt-[12px]">
					<h2 className="text-sm font-medium mb-[12px]">입금 금액</h2>
					<input
						type="number"
						inputMode="numeric"
						placeholder="입금할 금액을 입력하세요"
						className="w-full border rounded px-[12px] py-[8px] text-sm"
						value={amount || ""}
						onChange={(e) => setAmount(Number(e.target.value))}
					/>
					<div className="flex justify-end gap-2 mt-6">
						<button
							type="button"
							className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
							onClick={onClose}
							disabled={loading}
						>
							취소
						</button>
						<button
							type="button"
							className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90"
							onClick={handleDeposit}
							disabled={loading}
						>
							{loading ? "입금 중..." : "입금하기"}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
