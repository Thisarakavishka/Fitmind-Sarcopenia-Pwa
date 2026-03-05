import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the shape of your User State
interface UserState {
  name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;

  // Specific Literal Types (Union Types)
  goal: "muscle" | "weight_loss" | "sarcopenia_prevention";
  level: "beginner" | "intermediate" | "advanced";

  // Actions
  setUserData: (
    data: Partial<Omit<UserState, "setUserData" | "reset">>
  ) => void;
  reset: () => void;
}

// Initial State Constant (Clean Code)
const initialState = {
  name: "",
  email: "",
  age: null,
  weight: null,
  height: null,
  goal: "muscle" as const, // "as const" fixes the string inference error
  level: "beginner" as const,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      // The Setter: Merges new data with existing state
      setUserData: (data) => set((state) => ({ ...state, ...data })),

      // The Reset: Restores initial state
      reset: () => set({ ...initialState }),
    }),
    {
      name: "fitmind-storage", // Key for localStorage
    }
  )
);
