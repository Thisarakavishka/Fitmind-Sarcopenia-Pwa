import { create } from "zustand";
import { persist } from "zustand/middleware"; // <--- Import this

interface UserState {
  name: string;
  email: string; // Added email
  age: number | null; // Changed to null so we know if it's empty
  weight: number | null;
  height: number | null;
  goal: "muscle" | "weight_loss" | "sarcopenia_prevention";
  level: "beginner" | "intermediate" | "advanced";

  setUserData: (data: Partial<UserState>) => void;
  reset: () => void; // Added reset for logout
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: "",
      email: "",
      age: null,
      weight: null,
      height: null,
      goal: "muscle",
      level: "beginner",

      setUserData: (data) => set((state) => ({ ...state, ...data })),
      reset: () =>
        set({
          name: "",
          email: "",
          age: null,
          weight: null,
          height: null,
          goal: "muscle",
          level: "beginner",
        }),
    }),
    {
      name: "fitmind-storage", // unique name for localStorage
    }
  )
);
