/**
 * 이 파일은 사용자 인증 및 사용자 정보를 관리하는 zustand 스토어를 정의합니다.
 * 로그인 상태, 인증 완료 여부, 사용자 계좌 정보 등을 포함한 전역 상태를 저장하며,
 * 상태는 localStorage를 통해 영속적으로 유지됩니다.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 사용자 계좌 정보 타입 정의
interface Account {
	bank: string;
	number: string;
	balance: number;
	updatedAt?: Date;
}

// 사용자 정보 타입 정의
interface User {
	uid: string;
	email: string;
	nickname: string;
	profileImage: string;
	providerId: string;
	account?: Account;
}

// 인증 상태를 저장하는 zustand 스토어의 타입 정의
interface AuthState {
	user: User | null;
	verified: boolean;
	setUser: (user: User | null) => void;
	setVerified: (value: boolean) => void;
	clearUser: () => void;
}

// zustand 스토어 생성 및 localStorage를 통한 상태 영속화 설정
export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			// 초기 user는 null
			user: null,
			// 초기 인증 상태는 false
			verified: false,
			// 사용자 정보 설정
			setUser: (user) => set({ user }),
			// 인증 상태 설정
			setVerified: (verified) => set({ verified }),
			// 로그아웃 시 상태 초기화
			clearUser: () => set({ user:null, verified:false }),
		}),
		{
			// localStorage에 저장될 키 이름
			name: "auth-storage",
			// localStorage를 사용한 JSON 기반 저장소
			storage: createJSONStorage(() => localStorage),
		},
	),
);
