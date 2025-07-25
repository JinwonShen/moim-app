/**
 * 사용자 마이페이지 컴포넌트.
 * - 닉네임, 비밀번호, 계좌 정보, 알림 설정, 보안 설정(PIN, 회원탈퇴) 등 수정 가능
 * - 각 항목은 수정 모드로 전환 후 저장 또는 취소 가능
 * - 상태는 useState로 관리되며, 사용자 정보는 Firebase Firestore와 연동됨
 * - PIN 인증 보호(usePinGuard)를 통해 로그인 후 인증된 사용자만 접근 가능
 */

import {
	EmailAuthProvider,
	reauthenticateWithCredential,
	updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePinGuard from "../hooks/usePinGuard";
import { auth, db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export default function MyPage() {
	const user = useAuthStore((state) => state.user);

	// 닉네임
	const [editingNickname, setEditingNickname] = useState(false);
	const [newNickname, setNewNickname] = useState(user?.nickname ?? "");
	// 패스워드
	const [editingPassword, setEditingPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	// 계좌 정보
	const [editingAccount, setEditingAccount] = useState(false);
	const [bank, setBank] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [balance, setBalance] = useState("");

	const navigate = useNavigate();

	// PIN 인증이 필요한 영역에만 !
	usePinGuard("/mypage");

	// ✅ 닉네임 저장 핸들러
	// - Firestore에 닉네임 업데이트 후 전역 상태도 동기화
	const handleNicknameSave = async () => {
		if (!user) return;
		if (!newNickname) return;

		try {
			const userRef = doc(db, "users", user.uid);
			await updateDoc(userRef, { nickname: newNickname });

			useAuthStore.getState().setUser({
				...user,
				nickname: newNickname,
			});

			setEditingNickname(false);
			alert("닉네임이 성공적으로 변경되었습니다.");
		} catch (error) {
			console.error("닉네임 변경 실패: ", error);
			alert("닉네임 변경에 실패했습니다.");
		}
	};

	// 닉네임 변경 취소
	const handleNicknameCancel = () => {
		setNewNickname(user?.nickname || "");
		setEditingNickname(false);
	};

	const handlePasswordEditClick = () => {
		if (user?.providerId !== "password") {
			alert("비밀번호 변경은 이메일 로그인 사용자만 가능합니다.");
			return;
		}
		setEditingPassword(true);
	};

	// ✅ 비밀번호 유효성 검사 정규식
	// - 영문 대소문자, 숫자, 특수문자 포함 8자 이상 여부 확인
	const isValidPassword = (password: string): boolean => {
		const regex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=~`[\]{}|\\:;"'<>,.?/])[A-Za-z\d!@#$%^&*()_\-+=~`[\]{}|\\:;"'<>,.?/]{8,}$/;
		return regex.test(password);
	};

	// ✅ 비밀번호 변경 핸들러
	// - 현재 비밀번호 재인증 후 새 비밀번호 유효성 검사 및 저장
	// - 비밀번호는 영문 대소문자, 숫자, 특수문자 포함 8자 이상
	const handlePasswordSave = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			alert("모든 입력란을 작성해주세요.");
			return;
		}

		if (newPassword !== confirmPassword) {
			alert("새 비밀번호와 확인이 일치하지 않습니다.");
			return;
		}

		if (!isValidPassword(newPassword)) {
			alert(
				"비밀번호는 8자 이상이며, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
			);
			return;
		}

		try {
			if (!user || !user.email || !auth.currentUser) {
				alert("이메일 정보가 없습니다. 다시 로그인 해주세요.");
				return;
			}
			const credential = EmailAuthProvider.credential(
				user.email,
				currentPassword,
			);

			await reauthenticateWithCredential(auth.currentUser, credential);
			await updatePassword(auth.currentUser, newPassword);

			alert("비밀번호가 성공적으로 변경되었습니다.");
			setEditingPassword(false);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			console.error("비밀번호 설정 오류: ", error);
			alert("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
		}
	};

	// ✅ 계좌 정보 저장 핸들러
	// - 은행명, 계좌번호, 초기잔액을 Firestore에 저장 후 전역 상태에 반영
	const handleAccountSave = async () => {
		if (!user) return;

		const parsedBalance = Number.parseInt(balance.replace(/,/g, ""), 10);
		if (!bank || !accountNumber || Number.isNaN(parsedBalance)) {
			alert("모든 입력란을 작성해주세요.");
			return;
		}

		try {
			const userRef = doc(db, "users", user.uid);
			await updateDoc(userRef, {
				account: {
					bank,
					number: accountNumber,
					balance: parsedBalance,
				},
			});

			useAuthStore.getState().setUser({
				...user,
				account: {
					bank,
					number: accountNumber,
					balance: parsedBalance,
				},
			});

			setEditingAccount(false);
			alert("계좌 정보가 저장되었습니다.");
		} catch (error) {
			console.error("계좌 저장 실패: ", error);
			alert("계좌 정보를 저장하는 데 실패했습니다.");
		}
	};

	// ✅ PIN 변경 페이지로 이동
	const handlePinChange = () => {
		navigate("/pinconfirm", {
			state: { from: "/pinregister", mode: "changePin" },
		});
	};

	// ✅ 회원 탈퇴 페이지로 이동
	const handleWithdrawClick = () => {
		navigate("/pinconfirm", {
			state: {
				from: "/withdraw",
				mode: "deleteUser",
			},
		});
	};

	return (
		<div className="text-[14px] md:[text-[16px]">
			<section className="h-auto flex flex-col">
				<h1 className="font-bold text-[16px] md:text-[20px]">마이페이지</h1>
				<main className="mt-[8px] w-full border">
					<div className="p-[24px] md:p-[48px] pb-0">
						<h2 className="font-bold">사용자 정보</h2>
						<ul className="mt-[36px]">
							{/* 닉네임 변경 */}
							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[1]">닉네임</span> 
								<span className="flex-[1] md:flex-[2]">
									{editingNickname ? (
										<input
											type="text"
											value={newNickname}
											onChange={(e) => setNewNickname(e.target.value)}
											className="border px-[8px] py-[4px] mr-[8px] md:mr-0 focus:outline-primary"
										/>
									) : (
										user?.nickname || "사용자"
									)}
								</span>
								<span className="flex-[2] md:flex-[1.5]">
									{editingNickname ? (
										<>
											<button
												type="button"
												className="button px-[24px] py-[8px]"
												onClick={handleNicknameSave}
											>
												저장
											</button>
											<button
												type="button"
												className="button px-[24px] py-[8px] md:ml-[12px]"
												onClick={handleNicknameCancel}
											>
												취소
											</button>
										</>
									) : (
										<button
											type="button"
											className="button px-[24px] py-[8px]"
											onClick={() => setEditingNickname(true)}
										>
											닉네임 변경
										</button>
									)}
								</span>
							</li>

							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[1]">이메일</span>
								<span className="flex-[3] md:flex-[2]">{user?.email || "-"}</span>
								<span className="md:flex-[1.5]">{/* 그리드용 여백 */}</span>
							</li>

							{/* 패스워드 변경 */}
							<li
								className={`${editingPassword ? "h-[96px] mb-[12px] flex justify-between items-center" : "h-[48px] mb-[12px] flex justify-between items-center"}`}
							>
								<span className="flex-[1]">비밀번호</span>
								<span className="flex-[1] md:flex-[2]">
									{editingPassword ? (
										<span className="max-w-[300px] flex flex-col gap-[12px] pr-[12px]">
											<input
												type="password"
												placeholder="현재 비밀번호"
												className="border px-[8px] py-[4px] focus:outline-primary"
												onChange={(e) => setCurrentPassword(e.target.value)}
											/>
											<input
												type="password"
												placeholder="새 비밀번호"
												className="border px-[8px] py-[4px] focus:outline-primary"
												onChange={(e) => setNewPassword(e.target.value)}
											/>
											<input
												type="password"
												placeholder="비밀번호 확인"
												className="border px-[8px] py-[4px] focus:outline-primary"
												onChange={(e) => setConfirmPassword(e.target.value)}
											/>
										</span>
									) : null}
								</span>
								<span className="flex-[2] md:flex-[1.5]">
									{editingPassword ? (
										<>
											<button
												type="button"
												className="button px-[24px] py-[8px]"
												onClick={handlePasswordSave}
											>
												저장
											</button>
											<button
												type="button"
												className="button px-[24px] py-[8px] ml-[12px]"
												onClick={() => setEditingPassword(false)}
											>
												취소
											</button>
										</>
									) : (
										<button
											type="button"
											className="button px-[24px] py-[8px]"
											onClick={handlePasswordEditClick}
										>
											비밀번호 변경
										</button>
									)}
								</span>
							</li>
						</ul>
					</div>

					<div className="p-[24px] md:p-[48px] pb-0">
						<h2 className="font-bold">내 계좌 정보</h2>
						<ul className="mt-[36px]">
							{/* 계좌 정보 등록 및 수정 */}
							{editingAccount ? (
								<>
									<li className="h-[48px] mb-[12px] flex justify-between items-center">
										<span className="flex-[1]">은행명</span>
										<input
											type="text"
											className="border px-[8px] py-[4px] focus:outline-primary mr-[12px] flex-[1] md:flex-[2] "
											placeholder="예: 우리은행"
											value={bank}
											onChange={(e) => setBank(e.target.value)}
										/>
										<span className="md:flex-[1.5]">{/*  */}</span>
									</li>
									<li className="h-[48px] mb-[12px] flex items-center">
										<span className="flex-[1]">계좌번호</span>
										<input
											type="text"
											className="border px-[8px] py-[4px] focus:outline-primary mr-[12px] flex-[1] md:flex-[2]"
											placeholder="123-456-789"
											value={accountNumber}
											onChange={(e) => setAccountNumber(e.target.value)}
										/>
										<span className="md:flex-[1.5]">{/*  */}</span>
									</li>
									<li className="h-[48px] mb-[12px] flex items-center">
										<span className="flex-[1]">초기잔액</span>
										<input
											type="number"
											className="border px-[8px] py-[4px] focus:outline-primary mr-[12px] flex-[1] md:flex-[2]"
											placeholder="예: 500000"
											value={balance}
											onChange={(e) => setBalance(e.target.value)}
										/>
										<span className="md:flex-[1.5]">{/*  */}</span>
									</li>
									<li className="h-[48px] mb-[12px] flex items-center">
										<span className="md:flex-[1]">{/*  */}</span>
										<span className="md:flex-[2]">{/*  */}</span>
										<span className="flex-[1] md:flex-[1.5]">
											<button
												type="button"
												className="button px-[24px] py-[8px]"
												onClick={handleAccountSave}
											>
												저장
											</button>
											<button
												type="button"
												className="button px-[24px] py-[8px] ml-[12px]"
												onClick={() => setEditingAccount(false)}
											>
												취소
											</button>
										</span>
									</li>
								</>
							) : user?.account ? (
								<>
									<li className="h-[48px] mb-[12px] flex justify-between items-center">
										<span className="flex-[1]">은행</span>
										<span className="flex-[1] md:flex-[2]">{user.account.bank}</span>
										<span className="flex-[2] md:flex-[1.5]">
											<button
												type="button"
												className="button px-[24px] py-[8px]"
												onClick={() => {
													setEditingAccount(true);
													setBank(user?.account?.bank || "");
													setAccountNumber(user?.account?.number || "");
													setBalance(user?.account?.balance.toString() || "");
												}}
											>
												계좌 수정
											</button>
										</span>
									</li>
									<li className="h-[48px] mb-[12px] flex justify-between items-center">
										<span className="flex-[1]">잔액</span>
										<span className="flex-[3] md:flex-[2]">
											{user.account.balance.toLocaleString()} 원
										</span>
										<span className="md:flex-[1.5]">{/*  */}</span>
									</li>
								</>
							) : (
								<>
									<li className="h-[48px] mb-[12px] flex justify-between items-center">
										<span className="flex-[1]">은행</span>
										<span className="flex-[2]">
											등록된 계좌 정보가 없습니다.
										</span>
										<span className="flex-[1.5]">
											<button
												type="button"
												className="button px-[24px] py-[8px]"
												onClick={() => setEditingAccount(true)}
											>
												계좌 등록하기
											</button>
										</span>
									</li>
									<li className="h-[48px] mb-[12px] flex justify-between items-center">
										<span className="flex-[1]">잔액</span>
										<span className="flex-[2]">-</span>
										<span className="flex-[1.5]">{/*  */}</span>
									</li>
								</>
							)}
						</ul>
					</div>

					<div className="p-[24px] md:p-[48px] pb-0">
						<h2 className="font-bold">알림 설정</h2>
						<ul className="mt-[36px]">
							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[2] md:flex-[1]">입금 요청 알림</span>
								<span className="md:flex-[2]">{/*  */}</span>
								<span className="flex-[1] md:flex-[1.5]">
									<input type="checkbox" className="switch" id="firstSwitch" />
									<label htmlFor="firstSwitch" className="switchLabel">
										<span className="switchButton">{/*  */}</span>
									</label>
								</span>
							</li>
							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[2] md:flex-[1]">공지사항 푸시 수신 여부 설정</span>
								<span className="md:flex-[2]">{/*  */}</span>
								<span className="flex-[1] md:flex-[1.5]">
									<input type="checkbox" className="switch" id="secondSwitch" />
									<label htmlFor="secondSwitch" className="switchLabel">
										<span className="switchButton">{/*  */}</span>
									</label>
								</span>
							</li>
						</ul>
					</div>

					<div className="p-[24px] md:p-[48px]">
						<h2 className="font-bold">보안 설정</h2>
						<ul className="mt-[36px]">
							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[1]">6자리 PIN번호</span>
								<span className="flex-[1] md:flex-[2]">{/*  */}</span>
								<span className="flex-[2] md:flex-[1.5]">
									<button
										type="button"
										className="button px-[24px] py-[8px]"
										onClick={handlePinChange}
									>
										PIN번호 변경
									</button>
								</span>
							</li>
							<li className="h-[48px] mb-[12px] flex justify-between items-center">
								<span className="flex-[1]">회원 탈퇴</span>
								<span className="flex-[1] md:flex-[2]">{/*  */}</span>
								<span className="flex-[2] md:flex-[1.5]">
									<button
										type="button"
										className="button px-[24px] py-[8px]"
										onClick={handleWithdrawClick}
									>
										회원 탈퇴
									</button>
								</span>
							</li>
						</ul>
					</div>
				</main>
			</section>
		</div>
	);
}
