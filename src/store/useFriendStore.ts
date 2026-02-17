import { create } from 'zustand';
import { apiGetFriends, apiGetReceivedRequests, type FriendResponse } from '@/api/friendApi';
import { toast } from 'sonner';

interface FriendState {
    friends: FriendResponse[];
    requests: FriendResponse[];
    isLoading: boolean;
    fetchFriends: (silent?: boolean) => Promise<void>;
    fetchRequests: () => Promise<void>;
    isChatActive: boolean;
    setIsChatActive: (active: boolean) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
    friends: [],
    requests: [],
    isLoading: false,
    isChatActive: false,
    setIsChatActive: (active: boolean) => set({ isChatActive: active }),
    fetchFriends: async (silent = false) => {
        if (!silent) set({ isLoading: true });
        try {
            const data = await apiGetFriends("ACCEPTED");
            set({ friends: data });
        } catch (error) {
            console.error("친구 목록 갱신 실패:", error);
            toast.error("친구 목록을 불러오지 못했습니다. 새로고침을 시도해주세요.");
        } finally {
            if (!silent) set({ isLoading: false });
        }
    },
    fetchRequests: async () => {
        try {
            const data = await apiGetReceivedRequests();
            set({ requests: data });
        } catch (error) {
            console.error("요청 목록 로딩 실패:", error);
            toast.error("요청 목록을 불러오지 못했습니다. 새로고침을 시도해주세요.");
        }
    },
}));