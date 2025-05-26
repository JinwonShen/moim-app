import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import usePinGuard from "../hooks/usePinGuard";

export default function MyPage() {
	// PIN 인증이 필요한 영역에만 !
	usePinGuard("/mypage");

	return (
		<div className="flex w-full">
			<Sidebar />
			<div className="w-full">
				<Header />
				<section className="h-full flex flex-col mt-[148px] pl-[237px] pr-[12px]">
					<h1 className="font-bold">마이페이지</h1>
					<main className="mt-[8px] w-full border">
						<div className="p-[48px] pb-0">
							<h2 className="font-bold">사용자 정보</h2>
							<ul className="mt-[36px]">
								<li className="h-[48px] mb-[12px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">닉네임</span>
									<span className="flex-[2]">신진원</span>
									<span className="flex-[1.5]">
										<button type="button" className="button">
											닉네임 변경
										</button>
									</span>
								</li>
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">이메일</span>
									<span className="flex-[2]">email@email.com</span>
									<span className="flex-[1.5]">{/* 그리드용 여백 */}</span>
								</li>
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">비밀번호</span>
									<span className="flex-[2]">{/* 그리드용 여백 */}</span>
									<span className="flex-[1.5]">
										<button type="button" className="button">
											비밀번호 변경
										</button>
									</span>
								</li>
							</ul>
						</div>

						<div className="p-[48px] pb-0">
							<h2 className="font-bold">내 계좌 정보</h2>
							<ul className="mt-[36px]">
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">은행</span>
									<span className="flex-[2]">우리은행</span>
									<span className="flex-[1.5]">
										<button type="button" className="button">
											계좌 수정
										</button>
									</span>
								</li>
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">잔액</span>
									<span className="flex-[2]">5,000,000</span>
									<span className="flex-[1.5]">{/* 그리드용 여백 */}</span>
								</li>
							</ul>
						</div>

						<div className="p-[48px] pb-0">
							<h2 className="font-bold">알림 설정</h2>
							<ul className="mt-[36px]">
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">입금 요청</span>
									<span className="flex-[2]">{/*  */}</span>
									<span className="flex-[1.5]">
										<input
											type="checkbox"
											className="switch"
											id="firstSwitch"
										/>
										<label htmlFor="firstSwitch" className="switchLabel">
											<span className="switchButton">{/*  */}</span>
										</label>
									</span>
								</li>
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">공지사항 푸시 수신 여부 설정</span>
									<span className="flex-[2]">{/*  */}</span>
									<span className="flex-[1.5]">
										<input
											type="checkbox"
											className="switch"
											id="secondSwitch"
										/>
										<label htmlFor="secondSwitch" className="switchLabel">
											<span className="switchButton">{/*  */}</span>
										</label>
									</span>
								</li>
							</ul>
						</div>

						<div className="p-[48px]">
							<h2 className="font-bold">보안 설정</h2>
							<ul className="mt-[36px]">
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">비밀번호 설정/변경</span>
									<span className="flex-[2]">{/*  */}</span>
									<span className="flex-[1.5]">
										<button type="button" className="button">
											6자리 비밀번호 설정
										</button>
									</span>
								</li>
								<li className="h-[48px] mb-[12px] flex justify-between items-center">
									<span className="flex-[1]">회원 탈퇴</span>
									<span className="flex-[2]">{/*  */}</span>
									<span className="flex-[1.5]">
										<button type="button" className="button">
											회원 탈퇴
										</button>
									</span>
								</li>
							</ul>
						</div>
					</main>
				</section>
			</div>
		</div>
	);
}
