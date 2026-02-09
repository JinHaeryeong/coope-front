import { create } from "zustand";

interface useQnaModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useQnaModal = create<useQnaModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));