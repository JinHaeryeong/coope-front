import { create } from "zustand";

interface useTermsModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useTermsModal = create<useTermsModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));