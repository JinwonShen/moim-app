import { create } from "zustand";

export interface Wallet {
	uid: string;
	balance: number;
	updatedAt?: Date;
}

interface WalletState {
	wallet: Wallet | null;
	setWallet: (wallet: Wallet) => void;
	clearWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
	wallet: null,
	setWallet: (wallet) => set({ wallet }),
	clearWallet: () => set({ wallet: null }),
}));
