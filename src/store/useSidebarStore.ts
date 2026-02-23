import { create } from 'zustand';

interface SidebarStore {
    isCollapsed: boolean;
    isResetting: boolean;
    toggle: () => void;
    setCollapsed: (value: boolean) => void;
    setResetting: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isCollapsed: false,
    isResetting: false,
    toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (value) => set({ isCollapsed: value }),
    setResetting: (value) => set({ isResetting: value }),
}));