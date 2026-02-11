import { create } from 'zustand';

interface TrashState {
    trashUpdateTicket: number;
    notifyTrashUpdate: () => void;
}

export const useTrashStore = create<TrashState>((set) => ({
    trashUpdateTicket: 0,
    notifyTrashUpdate: () => set((state) => ({
        trashUpdateTicket: state.trashUpdateTicket + 1
    })),
}));