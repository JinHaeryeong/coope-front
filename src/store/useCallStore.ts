import { create } from "zustand";

interface CallState {
    isOpen: boolean;      // 모달 오픈 여부
    roomId: string | null; // 통화 중인 방 ID
    workspaceCode: string | null;
    isMinimized: boolean; // 최소화 여부
    isFullScreen: boolean;
    openCall: (roomId: string, workspaceCode: string) => void;
    closeCall: () => void;
    setMinimized: (minimized: boolean) => void;
    setIsFullScreen: (full: boolean) => void;
}

export const useCallStore = create<CallState>((set) => ({
    isOpen: false,
    roomId: null,
    workspaceCode: null,
    isMinimized: false,
    isFullScreen: false,
    openCall: (roomId, workspaceCode) => set({
        isOpen: true,
        roomId,
        workspaceCode,
        isMinimized: false,
        isFullScreen: false
    }),
    closeCall: () => set({
        isOpen: false,
        roomId: null,
        workspaceCode: null,
        isMinimized: false,
        isFullScreen: false
    }),
    setMinimized: (minimized) => set({
        isMinimized: minimized,
        isOpen: !minimized
    }),
    setIsFullScreen: (full) => set({ isFullScreen: full }),
}));