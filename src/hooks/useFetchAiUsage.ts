import axiosAuthInstance from "@/api/axiosAuthInstance";
import { useAiUsageStore } from "@/store/useAiUsageStore";
import { useCallback } from 'react';

export const useFetchAiUsage = () => {
    const { setUsage } = useAiUsageStore();

    const fetchUsage = useCallback(async () => {
        try {
            const response = await axiosAuthInstance.get("/ai/usage");
            setUsage("CHAT", response.data.CHAT);
            setUsage("STT", response.data.STT);
        } catch (error) {
            console.error("사용량 조회 실패:", error);
        }
    }, [setUsage]);

    return { fetchUsage };
};