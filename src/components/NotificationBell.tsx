import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications"; // ✅ custom hook 사용
import { useAuthStore } from "../store/authStore";

export default function NotificationBell() {
	const [open, setOpen] = useState(false);
	const user = useAuthStore((state) => state.user);
	const notifications = useNotifications(user?.uid); // ✅ custom hook 사용
	const navigate = useNavigate();

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					className="relative rounded-[8px] p-2 hover:bg-secondary-100 transition"
					aria-label="알림 열기"
				>
					<FiBell className="w-[24px] h-[24px] font-bold text-gray-800" />
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
