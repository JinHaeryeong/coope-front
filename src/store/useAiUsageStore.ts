import { create } from "zustand";

interface AiUsageState {
    chatRemaining: number;
    sttRemaining: number;
    // 나중에 editorRemaining: number; 추가


    setUsage: (type: "CHAT" | "STT", remaining: number) => void;

    resetUsage: () => void;
}

export const useAiUsageStore = create<AiUsageState>((set) => ({
    chatRemaining: 5,
    sttRemaining: 2,

    setUsage: (type, remaining) => set((state) => ({
        ...state,
        [type === "CHAT" ? "chatRemaining" : "sttRemaining"]: remaining
    })),

    resetUsage: () => set({ chatRemaining: 5, sttRemaining: 3 }),
}));