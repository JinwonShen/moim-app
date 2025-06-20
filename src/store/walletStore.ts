/**
 * 사용자 인증 정보를 관리하는 Zustand 스토어입니다.
 * 현재 로그인한 사용자 정보(user) 및 해당 정보를 설정(setUser)하거나 초기화(clearUser)하는 메서드를 제공합니다.
 */

import { create } from "zustand";

// Represents a user's wallet with balance and optional update timestamp
export interface Wallet {
	uid: string;
	balance: number;
	updatedAt?: Date;
}

// 인증 상태(AuthState)의 타입 정의
// Defines the wallet store state shape and actions
interface WalletState {
	wallet: Wallet | null;
	setWallet: (wallet: Wallet) => void;
	clearWallet: () => void;
}

// Zustand를 사용하여 인증 상태를 전역에서 사용할 수 있도록 store를 생성
// Zustand store for accessing and mutating wallet state across the app
export const useWalletStore = create<WalletState>((set) => ({
	// 초기 상태에서 user는 null로 설정
	wallet: null,
	// user 상태를 업데이트하는 함수
	setWallet: (wallet) => set({ wallet }),
	// user 상태를 초기화하는 함수
	clearWallet: () => set({ wallet: null }),
}));
