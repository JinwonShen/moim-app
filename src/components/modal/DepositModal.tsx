/**
 * 사용자가 특정 모임에 입금할 수 있도록 도와주는 모달 컴포넌트입니다.
 * - 입금 금액을 입력하고 `입금하기` 버튼을 눌러 입금을 처리합니다.
 * - 입금 성공 시 알림을 모임장에게 전송하고, 모달을 닫은 후 콜백을 실행합니다.
 */

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { sendGroupNotification } from "../../lib/apis/notificationApi"; // 🔹 알림 함수 import
import { depositToGroup } from "../../lib/apis/walletApi";
import { useWalletStore } from "../../store/walletStore";

interface DepositModalProps {
	open: boolean;
	onClose: () => void;
	groupId: string;
	creatorId: string; // 🔹 모임장 UID 추가
	groupName: string; // 🔹 알림 메시지용 그룹명 추가
	uid: string;
	onSuccess?: () => void;
}

export default function DepositModal({
	open,
	onClose,
	groupId,
	groupName,
	uid,
	onSuccess,
}: DepositModalProps) {
	const [amount, setAmount] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	const wallet = useWalletStore((state) => state.wallet);

	const handleDeposit = async () => {
		// 유효하지 않은 금액 처리
		if (!amount || amount <= 0) {
			alert("입금 금액을 입력해주세요.");
			return;
		}

		// 사용자의 현재 지갑 잔액보다 많은 금액을 입력한 경우
		if (wallet && amount > wallet.balance) {
			alert("잔액이 부족합니다.");
			return;
		}

		try {
			setLoading(true); // 로딩 시작

			// 지정된 모임에 입금 처리
			await depositToGroup(groupId, uid, amount);

			// 입금 후 알림 전송 (모임장에게)
			await sendGroupNotification(
				groupId,
				"deposit",
				groupName,
				"참가자가 입금했습니다.",
			);

			// 모달 닫기 및 성공 콜백 실행
			onClose();
			onSuccess?.();
		} catch (error) {
			// 입금 처리 중 오류 발생 시 콘솔에 출력
			console.error("입금 실패: ", error);
		} finally {
			setLoading(false); // 로딩 종료
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
