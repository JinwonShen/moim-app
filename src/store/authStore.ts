import type { User } from "firebase/auth";
import { create } from "zustand";

interface AuthState {
	user: User | null;
	verified: boolean;
	setUser: (user: User | null) => void;
	setVerified: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	verified: false,
	setUser: (user) => set({ user }),
	setVerified: (value) => set({ verified: value }),
}));
