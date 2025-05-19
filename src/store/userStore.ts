import { create } from "zustand";

type UserInfo = {
	uid: string;
	name: string;
	email: string;
	photoURL?: string | null;
};

type UserState = {
	user: UserInfo | null;
	setUser: (user: UserInfo) => void;
	clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	clearUser: () => set({ user: null }),
}));
