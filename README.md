# 💰 Moim (모임통장)

모임의 예산, 지출, 입금 현황을 통합 관리할 수 있는 **핀테크 웹 애플리케이션**

**React + TypeScript + Firebase + Zustand + Vite + TailwindCSS** 기반으로 개발되었습니다.

---

## 🔗 배포 링크

👉 [https://moim-app.vercel.app](https://moim-app.vercel.app)

---

## 📌 주요 기능

### ✅ 사용자 인증

- Google / Email 로그인
- 회원가입 시 PIN 등록 및 로그인 후 PIN 확인
- 이메일 + 비밀번호 조건 유효성 검사 및 중복 확인
- 인증 상태 전역 관리 (Zustand 기반)

### ✅ 대시보드

- 내가 만든 모임 / 참여 중인 모임 요약 카드
- 입금 상태, 예산 잔액, 퍼센트 그래프 표시
- 입금 요청 카드 (마감일 기준 자동 노출)
- 최근 지출 내역 및 공지사항 미리보기
- 월간 지출 통계 (도넛 차트 + 꺾은선 그래프)

### ✅ 모임 관리

- 모임 생성 (참여자, 기간, 예산, 입금 마감일 등 설정)
- 초대 링크 기반 참여자 등록 (이름 선택 → UID 연결)
- 입금 처리 후 실시간 예산 반영
- 지출 등록: 날짜, 금액, 분류, 메모 입력
- 공지사항 등록, 수정/삭제 기능
- 입금/지출/공지 등록 시 실시간 알림 전송

### ✅ 통계 기능

- 월별 지출 일지 (달력 + 지출 리스트)
- 카테고리별 도넛 차트, 일별 꺾은선 그래프
- 진행 중인 모임 우선 선택, 모임 필터링 가능

### ✅ 마이페이지

- 닉네임, 비밀번호, PIN 변경
- 계좌 등록 및 잔액 수정
- 회원 탈퇴 기능 (PIN 재확인 후 처리)

---

## 🗂️ 주요 폴더 구조

```bash
moim-app/
├── src/
│   ├── apis/            # Firebase 연동 함수 (groups, expenses 등)
│   ├── components/
│   │   ├── common/      # Header, Sidebar, FloatingButton 등 공통 UI
│   │   ├── dashboard/   # 대시보드용 카드, 요약 컴포넌트
│   │   ├── group/       # 지출 등록, 지출 리스트 등 그룹 관련 UI
│   │   └── modal/       # AddExpenseModal, InviteModal 등 Radix 기반 모달
│   ├── hooks/           # 커스텀 훅 (e.g., useNotifications, usePinGuard)
│   ├── lib/             # Firebase 설정, 유틸 함수, 그룹 상태 계산 등
│   ├── pages/           # 페이지 단위 라우팅
│   ├── store/           # Zustand 상태 관리
│   └── types/           # 전역 타입 선언
```

⸻

### ⚙️ 기술 스택
-	Frontend: React 18, TypeScript, Vite, Tailwind CSS
-	State Management: Zustand
-	Backend: Firebase Authentication / Firestore / Storage
-	Deployment: Vercel
-	UI 라이브러리: Radix UI, react-icons
-	차트: Recharts

⸻

### 📦 설치 및 실행

**의존성 설치**

```
npm install
```

**개발 서버 실행**

```
npm run dev
```
**환경 변수 설정 (.env)**

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

⸻

### 🛠️ 향후 개선 예정

-	지출 항목 태그/카테고리 필터 기능
-	알림 읽음 처리 및 리스트 뷰 구현
-	참여자 초대 기능 개선 (권한별 알림 분기)
-	모바일 UI 최적화 및 접근성 향상