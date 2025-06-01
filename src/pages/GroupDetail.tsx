import {
	type Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	updateDoc,
	writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import type { Group } from "../types/group";

export default function GroupDetail() {
	const { id: groupId } = useParams() as { id: string };
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const [groupData, setGroupData] = useState<Group | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState("");

	const [noticeTitle, setNoticeTitle] = useState("");
	const [noticeContent, setNoticeContent] = useState("");
	const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
	const [editNoticeMode, setEditNoticeMode] = useState(false);
	const [selectedNotices, setSelectedNotices] = useState<string[]>([]);
	const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
	const [recentNotices, setRecentNotices] = useState<
		{
			id: string;
			title: string;
			content: string;
			createdAt: Timestamp;
			author: string;
		}[]
	>([]);
	const [categories, setCategories] = useState<string[]>([
		"식비",
		"커피",
		"교통비",
		"숙박비",
		"엑티비티",
		"기타",
	]);
	// const [newCategory, setNewCategory] = useState<string>("");
	// const [expenseCategory, setExpenseCategory] = useState("");
	// const [expenseAmount, setExpenseAmount] = useState("");
	// const [expenseMemo, setExpenseMemo] = useState("");
	// const [expenseDate, setExpenseDate] = useState("");
	const [editMode, setEditMode] = useState(false);
	const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
	const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
	const [editedExpense, setEditedExpense] = useState<{
		date?: string;
		category: string;
		memo: string;
		amount: string; // string으로 관리
	}>({ category: "", memo: "", amount: "" });
	const [recentExpenses, setRecentExpenses] = useState<
		{
			id: string;
			author: string;
			description: string;
			category: string;
			amount: number;
			createdAt: Timestamp;
			date: string;
		}[]
	>([]);

	const fetchExpenses = useCallback(async () => {
		if (!groupId) return;
		try {
			const expensesRef = collection(db, "groups", groupId, "expenses");
			const q = query(expensesRef, orderBy("createdAt", "desc"), limit(5));
			const snapshot = await getDocs(q);
			const items = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					author: data.author,
					description: data.memo ?? "",
					category: data.category ?? "",
					amount: Number(data.amount ?? 0),
					createdAt: data.createdAt,
					date: data.date,
				};
			});
			setRecentExpenses(items);
		} catch (err) {
			console.error("지출 내역 불러오기 실패:", err);
		}
	}, [groupId]);

	useEffect(() => {
		if (!groupId) return;
		fetchExpenses();
	}, [groupId, fetchExpenses]);

	// const handleAddExpense = async () => {
	// 	if (
	// 		!groupId ||
	// 		!uid ||
	// 		!expenseDate ||
	// 		!expenseAmount ||
	// 		!expenseCategory ||
	// 		!newCategory
	// 	) {
	// 		alert("모든 항목을 입력해주세요!");
	// 		return;
	// 	}

	// 	try {
	// 		const expensesRef = collection(db, "groups", groupId, "expenses");
	// 		await addDoc(expensesRef, {
	// 			date: expenseDate,
	// 			amount: Number(expenseAmount),
	// 			category: expenseCategory,
	// 			memo: expenseMemo,
	// 			author: uid,
	// 			createdAt: new Date(),
	// 		});

	// 		alert("지출이 등록되었습니다.");
	// 		setExpenseDate("");
	// 		setExpenseAmount("");
	// 		setExpenseCategory("");
	// 		setExpenseMemo("");

	// 		await fetchExpenses();
	// 	} catch (error) {
	// 		console.error("지출 등록 실패: ", error);
	// 	}
	// };

	const toggleExpenseSelection = (id: string) => {
		setSelectedExpenseIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleBulkDelete = async () => {
		if (!groupId || selectedExpenseIds.length === 0) return;

		const confirmed = window.confirm("선택한 지출 항목을 삭제하시겠습니까?");
		if (!confirmed) return;

		try {
			const batch = writeBatch(db);

			for (const id of selectedExpenseIds) {
				const ref = doc(db, "groups", groupId, "expenses", id);
				batch.delete(ref);
			}

			await batch.commit();
			setSelectedExpenseIds([]);
			await fetchExpenses();
		} catch (error) {
			console.error("일괄 삭제 중 오류 발생:", error);
		}
	};

	const handleSaveEditExpense = async (id: string) => {
		if (!groupId || !id) return;
		try {
			await updateDoc(doc(db, "groups", groupId, "expenses", id), {
				date: editedExpense.date,
				amount: Number(editedExpense.amount),
				category: editedExpense.category,
				memo: editedExpense.memo,
			});
			setEditingExpenseId(null);
			await fetchExpenses();
		} catch (err) {
			console.error("지출 수정 실패:", err);
		}
	};

	// 공지 사항
	const fetchAuthorNames = useCallback(async (uids: string[]) => {
		const names: Record<string, string> = {};
		for (const uid of uids) {
			try {
				const userSnap = await getDoc(doc(db, "users", uid));
				if (userSnap.exists()) {
					names[uid] = userSnap.data().nickname || "알 수 없음";
				} else {
					names[uid] = "탈퇴한 사용자";
				}
			} catch {
				names[uid] = "오류";
			}
		}
		setAuthorNames(names);
	}, []);

	const fetchNotices = useCallback(async () => {
		if (!groupId) return;
		try {
			const noticesRef = collection(db, "groups", groupId, "notices");
			const q = query(noticesRef, orderBy("createdAt", "desc"), limit(5));
			const snapshot = await getDocs(q);
			const items = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					title: data.title,
					content: data.content,
					createdAt: data.createdAt,
					author: data.author,
				};
			});

			setRecentNotices(items);
			const authors = [...new Set(items.map((item) => item.author))];
			await fetchAuthorNames(authors);
		} catch (error) {
			console.error("공지 불러오기 실패: ", error);
		}
	}, [groupId, fetchAuthorNames]);

	useEffect(() => {
		if (!groupId) return;
		fetchNotices();
	}, [groupId, fetchNotices]);

	const handleAddNotice = async () => {
		if (!groupId || !uid || !noticeTitle.trim() || !noticeContent.trim())
			return;

		try {
			const noticesRef = collection(db, "groups", groupId, "notices");
			await addDoc(noticesRef, {
				title: noticeTitle,
				content: noticeContent,
				createdAt: new Date(),
				author: uid,
			});

			setNoticeTitle("");
			setNoticeContent("");
			alert("공지 등록 완료!");
			await fetchNotices();
		} catch (error) {
			console.error("공지 등록 실패: ", error);
		}
	};

	const handleDeleteSelectedNotices = async () => {
		if (!groupId) return;
		if (!confirm("선택한 공지를 삭제할까요?")) return;

		try {
			const promises = selectedNotices.map((id) =>
				deleteDoc(doc(db, "groups", groupId, "notices", id)),
			);
			await Promise.all(promises);
			alert("삭제 완료!");
			setSelectedNotices([]);
			setEditingNoticeId(null);
			await fetchNotices();
		} catch (error) {
			console.error("공지 삭제 실패:", error);
		}
	};

	const handleSaveEditNotice = async (id: string) => {
		if (!groupId) return;
		try {
			await updateDoc(doc(db, "groups", groupId, "notices", id), {
				title: editedTitle,
				content: editedContent,
			});
			alert("수정 완료!");
			setEditingNoticeId(null);
			await fetchNotices();
		} catch (error) {
			console.error("공지 수정 실패:", error);
		}
	};

	// 모임 상세 보기
	useEffect(() => {
		const fetchGroup = async () => {
			if (!groupId) return;
			try {
				const docRef = doc(db, "groups", groupId);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					const data = docSnap.data() as Omit<Group, "id">;
					setGroupData({ id: docSnap.id, ...data });
				} else {
					console.error("해당 모임이 존재하지 않습니다.");
				}
			} catch (error) {
				console.error("모임 불러오기 실패:", error);
			}
		};

		fetchGroup();
	}, [groupId]);

	const handleEditToggle = () => setIsEditing(true);
	const handleCancelEdit = () => setIsEditing(false);

	const handleSave = async () => {
		if (!groupId || !groupData) return;

		try {
			const { ...updateData } = groupData;
			await updateDoc(doc(db, "groups", groupId), updateData);
			alert("수정 완료!");
			setIsEditing(false);
		} catch (error) {
			console.error("수정 실패:", error);
		}
	};

	const handleDelete = async () => {
		if (!groupId) return;
		if (!confirm("정말 이 모임을 삭제하시겠습니까?")) return;

		try {
			await deleteDoc(doc(db, "groups", groupId));
			alert("삭제 완료!");
			navigate("/dashboard");
		} catch (error) {
			console.error("삭제 실패:", error);
		}
	};

	if (!groupData) return <p>로딩중 ..</p>;

	const now = new Date();
	const start = new Date(groupData.startDate);
	const isUpcoming = start > now;

	const participantCount = groupData.participants?.length ?? 0;
	const paidCount = groupData.paidParticipants?.length ?? 0;
	const paidPercent = participantCount
		? Math.floor((paidCount / participantCount) * 100)
		: 0;

	const budgetUsed = groupData.totalBudget - groupData.balance;
	const usedPercent = Math.floor(
		(budgetUsed / groupData.totalBudget) * 100 || 0,
	);
	const eachFee =
		participantCount > 0
			? Math.floor(groupData.totalBudget / participantCount)
			: 0;
	const paidTotal = eachFee * paidCount;

	return (
		<div className="flex">
			<Sidebar />
			<div className="w-[100vw] pl-[237px] pb-[24px]">
				<Header />
				<section className="flex flex-col mt-[148px] mr-[12px] p-[24px] border rounded-[8px] text-[14px]">
					<div className="flex justify-between items-center mb-[12px]">
						<h2 className="font-bold text-[20px]">모임 상세보기</h2>
						{/* 모임 상세보기 타이틀, 수정/삭제 btn */}
						<div className="flex gap-[12px]">
							{!isEditing ? (
								<div className="flex gap-[12px]">
									<button
										type="button"
										className="flex-[1] button px-[24px] py-[4px]"
										onClick={handleEditToggle}
									>
										수정
									</button>
									<button
										type="button"
										className="flex-[1] button px-[24px] py-[4px]"
										onClick={handleDelete}
									>
										삭제
									</button>
								</div>
							) : (
								<div className="flex gap-[12px]">
									<button
										type="button"
										className="button flex-[1] px-[24px] py-[4px]"
										onClick={handleSave}
									>
										저장
									</button>
									<button
										type="button"
										className="button flex-[1] px-[24px] py-[4px]"
										onClick={handleCancelEdit}
									>
										취소
									</button>
								</div>
							)}
						</div>
					</div>
					{/* 모임 상세보기 */}
					<div className="flex flex-wrap gap-[24px] mb-[48px]">
						{/* 좌측(모임 이름, 설명, 모임 장, 예산) */}
						<div className="flex-[2] flex flex-col gap-[24px]">
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">모임 이름</span>
								{isEditing ? (
									<input
										type="text"
										value={groupData.groupName}
										onChange={(e) =>
											setGroupData((prev) =>
												prev ? { ...prev, groupName: e.target.value } : prev,
											)
										}
										className="flex-[4] border px-2 py-1 rounded"
									/>
								) : (
									<span className="flex-[4]">{groupData.groupName}</span>
								)}
							</div>
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">모임 설명</span>
								{isEditing ? (
									<input
										type="text"
										value={groupData.description}
										onChange={(e) =>
											setGroupData((prev) =>
												prev ? { ...prev, description: e.target.value } : prev,
											)
										}
										className="flex-[4] border px-2 py-1 rounded"
									/>
								) : (
									<span className="flex-[4]">{groupData.description}</span>
								)}
							</div>
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">모임 장</span>
								<span className="flex-[4]">
									{groupData.creatorId === uid ? "나" : groupData.creatorId}
								</span>
							</div>
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">총 예산</span>
								{isEditing ? (
									<input
										type="number"
										value={groupData.totalBudget}
										onChange={(e) =>
											setGroupData((prev) =>
												prev
													? { ...prev, totalBudget: Number(e.target.value) }
													: prev,
											)
										}
										className="flex-[4] border px-2 py-1 rounded"
									/>
								) : (
									<span className="flex-[4]">
										{groupData.totalBudget.toLocaleString()} 원
									</span>
								)}
							</div>
						</div>

						{/* 우측(모임 기간, 입금 마감일, 참여자, 예산 그래프) */}
						<div className="flex flex-col flex-[3] gap-[24px]">
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">모임 기간</span>
								{isEditing ? (
									<div className="flex-[4]">
										<span className="flex gap-[8px]">
											<input
												type="date"
												value={groupData.startDate}
												onChange={(e) =>
													setGroupData((prev) =>
														prev
															? { ...prev, startDate: e.target.value }
															: prev,
													)
												}
												className="border px-2 py-1 rounded"
											/>
											<input
												type="date"
												value={groupData.endDate}
												onChange={(e) =>
													setGroupData((prev) =>
														prev ? { ...prev, endDate: e.target.value } : prev,
													)
												}
												className="border px-2 py-1 rounded"
											/>
										</span>
									</div>
								) : (
									<span className="flex-[4]">
										{groupData.startDate} ~ {groupData.endDate}
									</span>
								)}
							</div>
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">입금 마감일</span>
								{isEditing ? (
									<input
										type="date"
										value={groupData.dueDate}
										onChange={(e) =>
											setGroupData((prev) =>
												prev ? { ...prev, dueDate: e.target.value } : prev,
											)
										}
										className="flex-[4] border px-2 py-1 rounded"
									/>
								) : (
									<span className="flex-[4]">{groupData.dueDate}</span>
								)}
							</div>
							<div className="flex gap-[12px]">
								<span className="flex-[1] font-semibold">모임 참여자</span>
								<span className="flex-[4]">
									{participantCount}명 중 {paidCount}명 입금 완료
								</span>
							</div>
							<div className="flex flex-col">
								<span className="font-semibold">입금/예산</span>
								<div className="h-[12px] bg-gray-200 rounded-full mt-[4px] mb-[4px]">
									<div
										className="h-full bg-primary rounded-full"
										style={{
											width: `${isUpcoming ? paidPercent : usedPercent}%`,
										}}
									/>
								</div>
								<p className="text-[12px] text-gray-600">
									{isUpcoming
										? `예산: ${groupData.totalBudget.toLocaleString()}원 / 입금액: ${paidTotal.toLocaleString()}원`
										: `예산: ${groupData.totalBudget.toLocaleString()}원 / 잔액: ${groupData.balance.toLocaleString()}원`}
								</p>
							</div>
						</div>
					</div>

					{/* 최근 지출 내역 */}
					<div className="flex flex-wrap gap-[24px]">
						<div className="flex-[2]">
							<div className="flex justify-between items-center mb-[12px]">
								<h2 className="font-bold text-[20px]">최근 지출 내역</h2>
								{groupData?.creatorId === uid && (
									<div className="flex items-center gap-[8px]">
										{/* 선택 삭제 버튼 */}
										{editMode && selectedExpenseIds.length > 0 && (
											<button
												type="button"
												onClick={handleBulkDelete}
												className="text-[12px] text-primary"
											>
												선택 삭제
											</button>
										)}
										<button
											type="button"
											onClick={() => {
												setEditMode(!editMode);
												setEditingExpenseId(null);
												setSelectedExpenseIds([]);
											}}
											className="button px-[24px] py-[4px]"
										>
											{editMode ? "완료" : "편집"}
										</button>
									</div>
								)}
							</div>
							{recentExpenses.length === 0 ? (
								<p className="text-gray-500 text-sm">
									최근 지출 내역이 없습니다.
								</p>
							) : (
								<ul className="flex flex-col gap-[4px] text-[14px]">
									{recentExpenses.map((item) => {
										const isEditing = editingExpenseId === item.id;
										const isSelected = selectedExpenseIds.includes(item.id);

										return (
											<li
												key={item.id}
												className="flex justify-between items-start gap-[8px] pb-[12px] border-b"
											>
												{/* 체크박스: 편집모드일 때만 표시 */}
												{editMode && (
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => toggleExpenseSelection(item.id)}
														className="mt-[2.5px]"
													/>
												)}

												{/* 날짜 */}
												<span className="flex-[2] text-gray-500">
													{item.createdAt
														?.toDate?.()
														.toLocaleDateString("ko-KR") ?? "-"}
												</span>

												{/* 카테고리 + 메모 */}
												<div className="flex-[3] flex flex-col">
													{isEditing ? (
														<>
															<select
																value={editedExpense.category}
																onChange={(e) =>
																	setEditedExpense((prev) => ({
																		...prev,
																		category: e.target.value,
																	}))
																}
																className="border px-2 py-1 rounded"
															>
																<option value="">분류 선택</option>
																{categories.map((cat) => (
																	<option key={cat} value={cat}>
																		{cat}
																	</option>
																))}
															</select>
															<textarea
																value={editedExpense.memo}
																onChange={(e) =>
																	setEditedExpense((prev) => ({
																		...prev,
																		memo: e.target.value,
																	}))
																}
																rows={2}
																className="border px-2 py-1 mt-[4px] rounded resize-none"
															/>
															<div className="flex gap-[6px] text-[12px] mt-[4px]">
																<button
																	type="button"
																	className="text-primary"
																	onClick={() => handleSaveEditExpense(item.id)}
																>
																	저장
																</button>
																<button
																	type="button"
																	className="text-secondary-300"
																	onClick={() => setEditingExpenseId(null)}
																>
																	취소
																</button>
															</div>
														</>
													) : (
														<>
															<span className="font-semibold">
																{item.category || "분류 없음"}
															</span>
															<span className="text-[12px] text-gray-600">
																{item.description || "메모 없음"}
															</span>
														</>
													)}
												</div>

												{/* 금액 + 버튼 */}
												<div className="flex-[2] text-right flex flex-col items-end gap-[4px]">
													{isEditing ? (
														<input
															type="number"
															value={editedExpense.amount}
															onChange={(e) =>
																setEditedExpense((prev) => ({
																	...prev,
																	amount: e.target.value,
																}))
															}
															className="border px-2 py-1 rounded w-full text-right"
														/>
													) : (
														<span>
															{typeof item.amount === "number"
																? item.amount.toLocaleString()
																: "0"}
															원
														</span>
													)}

													{/* 수정 버튼 (편집 모드 + 수정 중 아님) */}
													{editMode && !isEditing && (
														<div className="flex gap-[6px] text-[12px]">
															<button
																type="button"
																className="text-primary"
																onClick={() => {
																	setEditingExpenseId(item.id);
																	setEditedExpense({
																		category: item.category,
																		memo: item.description,
																		amount: String(item.amount),
																		date:
																			item.createdAt
																				?.toDate?.()
																				?.toISOString()
																				?.split("T")[0] ?? "",
																	});
																}}
															>
																수정
															</button>
														</div>
													)}
												</div>
											</li>
										);
									})}
								</ul>
							)}

							{/* 지출 등록 폼 */}
							{groupData.creatorId === uid && (
								<div className="mt-[24px] mb-[24px]">
									<div className="flex justify-between items-center mb-[12px]">
										<h3 className="font-semibold text-[16px]">지출 등록</h3>
										<button type="button" className="button px-[24px] py-[4px]">
											지출 등록하기
										</button>
									</div>
									<ExpenseForm
										onSubmit={async ({ date, amount, category, memo }) => {
											const expensesRef = collection(
												db,
												"groups",
												// biome-ignore lint/style/noNonNullAssertion: <explanation>
												groupId!,
												"expenses",
											);
											await addDoc(expensesRef, {
												date,
												amount,
												category,
												memo,
												author: uid,
												createdAt: new Date(),
											});
											await fetchExpenses();
										}}
										categories={categories}
										setCategories={setCategories}
									/>
								</div>
							)}
						</div>

						{/* 공지사항 */}
						<div className="flex-[3]">
							<div className="flex justify-between items-center mb-[12px]">
								<h2 className="font-bold text-[20px]">공지사항</h2>
								{groupData.creatorId === uid && (
									<div className="flex items-center gap-[8px]">
										{editNoticeMode && selectedNotices.length > 0 && (
											<button
												type="button"
												className="text-[12px] text-primary"
												onClick={handleDeleteSelectedNotices}
											>
												선택 삭제
											</button>
										)}
										<button
											type="button"
											className="button px-[24px] py-[4px]"
											onClick={() => {
												setEditNoticeMode(!editNoticeMode);
												setSelectedNotices([]);
												setEditingNoticeId(null);
											}}
										>
											{editNoticeMode ? "완료" : "편집"}
										</button>
									</div>
								)}
							</div>

							{recentNotices.length === 0 ? (
								<p className="text-gray-500 text-sm">등록된 공지가 없습니다.</p>
							) : (
								<ul className="flex flex-col gap-[12px] text-[14px]">
									{recentNotices.map((notice) => {
										const isEditing = editingNoticeId === notice.id;
										const isSelected = selectedNotices.includes(notice.id);

										return (
											<li
												key={notice.id}
												className="flex justify-between items-start gap-[8px] pb-[12px] border-b"
											>
												{/* 체크박스 (편집 모드일 때만) */}
												{editNoticeMode && (
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => {
															setSelectedNotices((prev) =>
																isSelected
																	? prev.filter((id) => id !== notice.id)
																	: [...prev, notice.id],
															);
														}}
														className="mt-1"
													/>
												)}

												{/* 날짜 */}
												<span className="flex-[1] text-gray-500">
													{notice.createdAt
														.toDate()
														.toLocaleDateString("ko-KR")}
												</span>

												{/* 제목 및 내용 */}
												<div className="flex-[3] flex flex-col">
													{isEditing ? (
														<>
															<input
																value={editedTitle}
																onChange={(e) => setEditedTitle(e.target.value)}
																className="border px-2 py-1 mb-1 rounded"
															/>
															<textarea
																value={editedContent}
																onChange={(e) =>
																	setEditedContent(e.target.value)
																}
																rows={2}
																className="border px-2 py-1 resize-none rounded"
															/>
															<div className="flex gap-[8px] mt-[4px] text-[12px]">
																<button
																	type="button"
																	className="text-primary"
																	onClick={() =>
																		handleSaveEditNotice(notice.id)
																	}
																>
																	저장
																</button>
																<button
																	type="button"
																	className="text-secondary-300"
																	onClick={() => setEditingNoticeId(null)}
																>
																	취소
																</button>
															</div>
														</>
													) : (
														<>
															<span className="font-semibold">
																{notice.title}
															</span>
															<span className="text-[12px] text-gray-600">
																{notice.content}
															</span>
														</>
													)}
												</div>

												{/* 작성자 + 수정 버튼 */}
												<div className="flex flex-col flex-[1] text-right text-gray-400 items-end">
													<span>
														{authorNames[notice.author] ?? notice.author}
													</span>
													{editNoticeMode && !isEditing && (
														<button
															type="button"
															className="text-primary text-[12px] mt-[4px]"
															onClick={() => {
																if (selectedNotices.length <= 1) {
																	setEditingNoticeId(notice.id);
																	setEditedTitle(notice.title);
																	setEditedContent(notice.content);
																}
															}}
															disabled={selectedNotices.length > 1}
														>
															수정
														</button>
													)}
												</div>
											</li>
										);
									})}
								</ul>
							)}

							{/* 공지사항 등록 폼 */}
							{groupData.creatorId === uid && (
								<div className="mt-[24px] mb-[24px]">
									<div className="flex justify-between items-center mb-[12px]">
										<h3 className="font-semibold text-[16px]">공지사항 등록</h3>
										<button
											type="button"
											className="button px-[24px] py-[4px]"
											onClick={handleAddNotice}
										>
											등록하기
										</button>
									</div>
									<div className="flex flex-col gap-[8px] mb-[12px]">
										<input
											type="text"
											placeholder="공지 제목"
											value={noticeTitle}
											onChange={(e) => setNoticeTitle(e.target.value)}
											className="border px-2 py-1 rounded"
										/>
										<textarea
											placeholder="공지 내용"
											value={noticeContent}
											onChange={(e) => setNoticeContent(e.target.value)}
											className="border px-2 py-1 rounded resize-none"
											rows={3}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
