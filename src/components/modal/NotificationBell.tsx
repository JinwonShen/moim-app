/**
 * 사용자의 알림 목록을 표시하는 알림 아이콘 컴포넌트입니다.
 * - 알림 아이콘 클릭 시 팝오버 형태로 알림 리스트가 열립니다.
 * - 새로운 알림이 있을 경우, 빨간 점으로 시각적 표시를 합니다.
 * - 각 알림을 클릭하면 해당 모임 상세 페이지로 이동합니다.
 */

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications"; // ✅ custom hook 사용
import { useAuthStore } from "../../store/authStore";

export default function NotificationBell() {
	const [open, setOpen] = useState(false);
	const user = useAuthStore((state) => state.user);
	// 사용자 UID를 기반으로 실시간 알림 데이터를 가져오는 custom hook
	const notifications = useNotifications(user?.uid); // ✅ custom hook 사용
	const navigate = useNavigate();

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					className="relative rounded-[8px] p-[4px] hover:bg-gray-100 transition"
					aria-label="알림 열기"
				>
					<FiBell className="w-[24px] h-[24px] font-bold text-gray-800" />
					{/* 알림이 존재하면 빨간 점을 표시하여 사용자에게 새로운 알림이 있음을 알림 */}
					{notifications.length > 0 && (
						<span className="absolute top-1 right-1 inline-block w-2 h-2 bg-primary rounded-full" />
					)}
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					side="bottom"
					align="end"
					sideOffset={8}
					className="z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
				>
					<h3 className="text-sm font-semibold mb-2">알림</h3>
					{notifications.length === 0 ? (
						<p className="text-sm text-gray-500">새로운 알림이 없습니다.</p>
					) : (
						<ul className="max-h-[300px] overflow-y-auto space-y-2">
							{notifications.map((n) => (
								<li key={n.id}>
									<button
										type="button"
										// 알림 클릭 시 해당 모임 상세 페이지로 이동
										onClick={() => navigate(`/group/${n.groupId}`)}
										className="text-sm text-gray-800 hover:underline cursor-pointer text-left"
									>
										<p>{n.message}</p>
										<span className="text-[12px] text-gray-400">
											{n.createdAt?.toDate
												? n.createdAt.toDate().toLocaleString("ko-KR", {
														year: "2-digit",
														month: "2-digit",
														day: "2-digit",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "시간 정보 없음"}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
					<Popover.Arrow className="fill-white" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
