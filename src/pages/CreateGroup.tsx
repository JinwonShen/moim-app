/**
 * 새 모임 생성 페이지 컴포넌트.
 * - 모임 이름, 설명, 기간, 참여자, 예산 등의 정보를 입력받아 모임 생성
 * - 입력값 유효성 검사 후 Firestore에 그룹 문서, 지갑, 참가자 서브컬렉션 생성
 * - 모임장 정보(uid, nickname)는 상태에서 불러오며 자동 포함됨
 * - 생성 완료 후 공유/시작에 따라 적절한 경로로 이동
 */

import {
	addDoc,
	collection,
	doc,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";

export default function CreateGroup() {
	const navigate = useNavigate();
	const uid = useAuthStore((state) => state.user?.uid);
	const fetchGroups = useGroupStore((state) => state.fetchGroups);
	const nickname = useAuthStore((state) => state.user?.nickname || "");

	const [groupName, setGroupName] = useState("");
	const [description, setDescription] = useState("");
	const [totalBudget, setTotalBudget] = useState<number>(0);
	const [participants, setParticipants] = useState<string[]>([""]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);

	// ✅ 모임 생성 처리
	// - 입력값 유효성 검사 (날짜, 예산, 참여자 등)
	// - Firestore에 그룹 문서 및 서브컬렉션(wallets, participants) 생성
	// - 그룹 목록 갱신 후 navigate 처리 (공유 or 시작에 따라 경로 분기)
	const handleSubmit = async (type: "start" | "share") => {
		if (!uid || !groupName.trim()) return;

		const now = new Date();
		const start = new Date(startDate);
		const end = new Date(endDate);
		const deadline = new Date(dueDate)
		const fullParticipants = [nickname, ...participants];

		if (start < now) {
    alert("모임 시작일은 오늘 이후로 설정해야 합니다.");
    return;
		}

		if (end <= start) {
			alert("모임 종료일은 시작일보다 이후여야 합니다.");
			return;
		}

		if (deadline >= start) {
			alert("입금 마감일은 모임 시작일보다 빨라야 합니다.");
			return;
		}

		if (deadline > end) {
			alert("입금 마감일은 모임 종료일보다 빨라야 합니다.");
			return;
		}

		if (!description.trim()) {
			alert("모임 설명을 입력해주세요.");
			return;
		}

		if (!startDate || !endDate || !dueDate) {
			alert("모임 기간과 마감일을 모두 선택해주세요.");
			return;
		}

		if (totalBudget <= 0) {
			alert("총 예산은 0보다 커야 합니다.");
			return;
		}

		// 유효성 검사: 모임 이름
		if (!uid || !groupName.trim()) {
		  alert("모임 이름을 입력해주세요.");
		  return;
		}

		// 유효성 검사: 모임 설명
		if (!description.trim()) {
		  alert("모임 설명을 입력해주세요.");
		  return;
		}

		// 유효성 검사: 날짜 필드
		if (!startDate || !endDate || !dueDate) {
		  alert("모임 시작일, 종료일, 마감일을 모두 선택해주세요.");
		  return;
		}

		// 유효성 검사: 총 예산
		if (totalBudget <= 0) {
		  alert("총 예산은 0보다 커야 합니다.");
		  return;
		}

		// 유효성 검사: 참여자 닉네임 빈 값
		const hasEmptyParticipant = fullParticipants.some((p) => !p.trim());
		if (hasEmptyParticipant) {
		  alert("참여자 닉네임 중 빈 값이 있습니다.");
		  return;
		}

		const newGroup = {
			groupName,
			description,
			creatorId: uid,
			createdAt: serverTimestamp(),
			startDate,
			endDate,
			dueDate,
			totalBudget,
			balance: 0,
			participantCount: fullParticipants.length,
			paidParticipants: [],
		};

		try {
			// 1️⃣ 그룹 문서 생성
			const groupRef = await addDoc(collection(db, "groups"), newGroup);
			const groupId = groupRef.id;
			const walletsRef = collection(db, "groups", groupId, "wallets");

			await Promise.all(
				fullParticipants.map((_name, index) => {
					if (index === 0 && uid) {
						// 모임장
						const walletDoc = doc(walletsRef, uid);
						return setDoc(walletDoc, {
							uid,
							balance: 0, // 임의로 초기 잔액 부여 (마이페이지 등과 연동 가능)
							updatedAt: serverTimestamp(),
						});
					}
					return Promise.resolve(); // uid 없는 참여자는 생성하지 않음
				}),
			);

			// 2️⃣ 참가자 서브컬렉션 저장
			const participantsRef = collection(db, "groups", groupId, "participants");

			await Promise.all(
				fullParticipants.map((name, index) => {
					const participantDoc = doc(participantsRef);
					return setDoc(participantDoc, {
						nickname: name,
						uid: index === 0 ? uid : null,
						isOwner: index === 0,
					});
				}),
			);

			// 3️⃣ 그룹 목록 갱신 후 이동
			await fetchGroups(uid);

			if (type === "start") {
				navigate("/dashboard");
			} else {
				// ✅ 공유하기 → 참가자 초대/관리 페이지 (모임 상세)
				navigate(`/group/${groupId}`, { state: { openInviteModal: true } });
			}
		} catch (error) {
			console.error("모임 생성 실패:", error);
		}
	};

	// ✅ 참여자 추가
	const handleAddParticipant = () => {
		setParticipants([...participants, ""]);
	};

	// ✅ 참여자 제거
	const handleRemoveParticipant = (index: number) => {
		const updated = [...participants];
		updated.splice(index, 1);
		setParticipants(updated);
	};

	// ✅ 참여자 정보 변경
	const handleChangeParticipant = (index: number, value: string) => {
		const updated = [...participants];
		updated[index] = value;
		setParticipants(updated);
	};

	// ✅ 폼 초기화
	const handleReset = () => {
		setGroupName("");
		setDescription("");
		setTotalBudget(0);
		setParticipants([""]);
		setStartDate("");
		setEndDate("");
		setDueDate("");
		setAgreeTerms(false);
	};

	const totalMembers = [nickname, ...participants].length;
	const eachFee =
		totalMembers > 0 && totalBudget > 0
			? `${Math.floor(totalBudget / totalMembers).toLocaleString()} 원`
			: "";

	return (
		<div>
			<section className="md:mt-[148px] pb-[24px]">
				<h2 className="font-bold mb-[12px] text-[16px] md:text-[20px]">새 모임 만들기</h2>
				<form className="flex gap-[24px] flex-wrap h-auto p-[24px] md:p-[48px] border">
					<div className="flex flex-col flex-1 gap-[24px]">
						<label className="flex flex-col">
							<span className="text-[14px]">모임 이름</span>
							<input
								type="text"
								placeholder="모임의 이름을 입력해주세요."
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
							/>
						</label>
						<label className="flex flex-col">
							<span className="text-[14px]">모임 설명</span>
							<input
								type="text"
								placeholder="모임의 설명을입력해주세요."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
							/>
						</label>
						<label className="flex flex-col">
							<span className="text-[14px]">모임 장</span>
							<input
								type="text"
								value={nickname}
								readOnly
								disabled
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] text-gray-500 rounded-[4px]"
							/>
						</label>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="flex flex-col">
							<span className="text-[14px]">모임 참여자</span>
							{participants.map((p, idx) => (
								<div
									key={`participant-${idx - 0}`}
									className="flex items-center gap-[12px] mb-[4px]"
								>
									<input
										type="text"
										value={p}
										onChange={(e) =>
											handleChangeParticipant(idx, e.target.value)
										}
										placeholder={`참여자 ${idx + 1}`}
										className="flex-1 border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
									/>
									{participants.length > 1 && (
										<button
											type="button"
											onClick={() => handleRemoveParticipant(idx)}
											className="text-red-500 text-[12px]"
										>
											<FiMinus />
										</button>
									)}
								</div>
							))}
							<button
								type="button"
								onClick={handleAddParticipant}
								className="mt-[8px]"
							>
								<FiPlus className="text-gray-300 text-[20px] border-gray-300 border-[1px] rounded-full hover:text-blue-500 hover:border-blue-500 transition-all duration-300 m-auto" />
							</button>
						</label>
					</div>
					<div className="flex flex-col flex-1 gap-[24px]">
						<label className="flex flex-col">
							<span className="text-[14px]">총 예산</span>
							<input
								type="number"
								placeholder="예산 금액 설정 ex) 4000000"
								value={totalBudget || ""}
								onChange={(e) => setTotalBudget(Number(e.target.value))}
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px] appearance-none"
								inputMode="numeric"
								pattern="[0-9]*"
							/>
						</label>
						<label className="flex flex-col">
							<span className="text-[14px]">인당 금액</span>
							<input
								type="text"
								value={eachFee}
								readOnly
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] bg-gray-100 text-gray-500 rounded-[4px]"
							/>
						</label>
						<label className="flex flex-col">
							<span className="text-[14px]">모임 기간</span>
							<span className="flex gap-[12px]">
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="flex-1 border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
								/>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="flex-1 border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
								/>
							</span>
						</label>
						<label className="flex flex-col">
							<span className="text-[14px]">임금 마감일</span>
							<input
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
								className="border px-[8px] py-[4px] mt-[4px] text-[14px] rounded-[4px]"
							/>
						</label>
						<label className="flex flex-col mt-[36px]">
							<span className="text-[14px]">약관 동의</span>
							<textarea
								className="h-[124px] p-[12px] mt-[4px] border text-[14px] rounded-[4px]"
								defaultValue="약관 내용"
								readOnly
							/>
							<span className="flex mt-[4px]">
								<input
									type="checkbox"
									checked={agreeTerms}
									onChange={(e) => setAgreeTerms(e.target.checked)}
								/>
								<span className="ml-[4px] text-[14px]">
									개인정보 수집 및 이용에 동의합니다.
								</span>
							</span>
						</label>
					</div>
					<div className="w-full flex justify-between gap-[12px] md:gap-[24px] text-[14px]">
						<button
							type="button"
							className="button w-[calc(25%-6px)] md:w-[calc(25%-18px)] py-[12px]"
							onClick={handleReset}
						>
							초기화
						</button>
						<button
							type="button"
							className="button w-[calc(25%-6px)] md:w-[calc(25%-18px)]"
							onClick={() => handleSubmit("share")}
						>
							공유하기
						</button>
						<button
							type="button"
							className="button w-[calc(50%-12px)] md:w-[calc(50%-12px)]"
							onClick={() => handleSubmit("start")}
						>
							모임 시작하기
						</button>
					</div>
				</form>
			</section>
		</div>
	);
}
