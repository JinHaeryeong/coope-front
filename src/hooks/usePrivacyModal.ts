// src/hooks/useTermsModal.ts
import { create } from "zustand";

interface usePrivacyModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const usePrivacyModal = create<usePrivacyModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));