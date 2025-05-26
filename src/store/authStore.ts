import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
	uid: string;
	name: string;
	email: string;
	nickname: string;
	profileImage: string;
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
			storage: createJSONStorage(() => localStorage), // ✅ 명시적으로 localStorage 설정
		},
	),
);
