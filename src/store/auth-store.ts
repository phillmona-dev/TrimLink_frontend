import { create } from "zustand";
import { ACCESS_KEY, REFRESH_KEY, USER_KEY } from "@/utils/constants";
import { getStoredItem, removeStoredItem, setStoredItem } from "@/utils/storage";
import type { UserSession } from "@/types";

type AuthState = {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  logout: () => void;
};

const storedSession = getStoredItem<UserSession>(USER_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  session: storedSession,
  setSession: (session) => {
    if (!session) {
      removeStoredItem(USER_KEY);
      removeStoredItem(ACCESS_KEY);
      removeStoredItem(REFRESH_KEY);
    } else {
      setStoredItem(USER_KEY, session);
      setStoredItem(ACCESS_KEY, session.accessToken);
      setStoredItem(REFRESH_KEY, session.refreshToken);
    }

    set({ session });
  },
  logout: () => {
    removeStoredItem(USER_KEY);
    removeStoredItem(ACCESS_KEY);
    removeStoredItem(REFRESH_KEY);
    set({ session: null });
  }
}));
