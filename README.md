# 💰 Moim (모임통장)

모임의 예산 관리, 지출 기록, 입금 현황을 통합 관리할 수 있는 핀테크 웹 애플리케이션

React + TypeScript + Firebase + Zustand + Vite + TailwindCSS 기반

⸻

## 🔗 배포 링크

👉 https://moim-app.vercel.app

⸻

## 📌 주요 기능

✅ 사용자 인증

- Google / Email 로그인 지원
- 회원가입 시 PIN 등록
- 로그인 후 마이페이지 진입 시 PIN 재확인

✅ 대시보드

- 내가 만든 모임 / 참여 중인 모임 요약 카드
- 입금 상태 및 예산 잔액 실시간 표시
- 입금 요청 예약 카드 (마감일 기준 자동 표시)
- 이번 달 지출 요약 (카테고리별 도넛 차트)
- 최근 지출 내역, 공지사항 미리보기

✅ 모임 기능

- 모임 생성 (참여자, 기간, 예산 등 설정)
- 초대 링크를 통한 참여자 등록
- 입금 처리 및 참여자별 상태 표시
- 지출 등록: 날짜, 금액, 분류, 메모 입력
- 모임별 공지사항 기능

✅ 통계 기능

- 월별 지출 일지 (달력 + 지출 리스트)
- 카테고리별 도넛 차트, 일별 꺾은선 그래프
- 필터: 모임 선택, 카테고리 필터 예정

✅ 마이페이지

- 닉네임 변경, PIN 변경
- 계좌 등록 / 잔액 수정
- 회원 탈퇴 처리

⸻

## 🗂️ 폴더 구조 (일부)

```
moim-app/
├── src/
│   ├── components/       # UI 구성 요소 (모달, 카드, 요약 박스 등)
│   ├── pages/            # 라우트 단위 페이지
│   ├── store/            # Zustand 상태 관리
│   ├── lib/              # Firebase 설정 및 유틸 함수
│   └── hooks/            # 커스텀 훅
├── public/
├── .env                  # Firebase 환경 변수
├── package.json
└── vercel.json           # Vercel 배포 설정
```

⸻

### ⚙️ 기술 스택

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- State Management: Zustand
- Backend: Firebase Authentication / Firestore / Storage
- Deployment: Vercel
- UI 라이브러리: Radix UI, react-icons
- Chart: Recharts

⸻

## 📦 설치 및 실행

**의존성 설치**

```
npm install
```

**개발 서버 실행**

```
npm run dev
```

**환경 변수 (.env)**

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
...
```

⸻

### 🛠️ 향후 개선 예정

- 지출 항목 태그/카테고리 필터 기능 추가
- 알림 읽음 처리 및 리스트 뷰
- 모바일 UI 최적화