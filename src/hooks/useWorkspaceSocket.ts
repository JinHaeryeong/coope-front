import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";

export const useWorkspaceSocket = () => {
    const { stompClient, isConnected } = useSocket();
    const { fetchWorkspaces } = useWorkspaceStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!isConnected || !stompClient || !user?.id) return;

        const subscription = stompClient.subscribe(
            `/topic/user/${user.id}/workspace`,
            (message) => {
                if (message.body === "REFRESH" || message.body === "WORKSPACE_UPDATED") {
                    fetchWorkspaces();
                    console.log("워크스페이스 목록 실시간 동기화 완료!");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, isConnected, user?.id, fetchWorkspaces]);
};