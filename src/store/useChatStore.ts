import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

export interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface ChatState {
    messages: Message[];
    addMessage: (message: Omit<Message, "timestamp">) => void;
    clearMessages: () => void;
}

const MAX_MESSAGES = 100;
const MESSAGE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export const useChatStore = create<ChatState>()(
    devtools(
        persist(
            (set) => ({
                messages: [],

                addMessage: (message) =>
                    set((state) => {
                        const now = Date.now();
                        const newMessages = [...state.messages, { ...message, timestamp: now }];

                        const filteredMessages = newMessages
                            .filter((msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS)
                            .slice(-MAX_MESSAGES);

                        return { messages: filteredMessages };
                    }),

                clearMessages: () => set({ messages: [] }),
            }),
            {
                name: "chat-storage", // 로컬 스토리지 키
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
);