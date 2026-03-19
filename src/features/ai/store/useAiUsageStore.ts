import { create } from "zustand";

const CHAT_MAX_USAGE = 5;
const STT_MAX_USAGE = 2;

interface AiUsageState {
    chatRemaining: number;
    sttRemaining: number;
    // 나중에 editorRemaining: number; 추가


    setUsage: (type: "CHAT" | "STT", remaining: number) => void;

    resetUsage: () => void;
}

export const useAiUsageStore = create<AiUsageState>((set) => ({
    chatRemaining: CHAT_MAX_USAGE,
    sttRemaining: STT_MAX_USAGE,

    setUsage: (type, remaining) => set((state) => ({
        ...state,
        [type === "CHAT" ? "chatRemaining" : "sttRemaining"]: remaining
    })),

    resetUsage: () => set({ chatRemaining: 5, sttRemaining: 3 }),
}));