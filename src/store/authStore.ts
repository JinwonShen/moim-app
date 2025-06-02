import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Account {
	bank: string;
	number: string;
	balance: number;
}

interface User {
	uid: string;
	email: string;
	nickname: string;
	profileImage: string;
	providerId: string;
	account?: Account;
}

interface AuthState {
	user: User | null;
	verified: boolean;
	setUser: (user: User | null) => void;
	setVerified: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			verified: false,
			setUser: (user) => set({ user }),
			setVerified: (verified) => set({ verified }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
