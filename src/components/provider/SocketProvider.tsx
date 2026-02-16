import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthStore } from "@/store/useAuthStore";
import { useFriendStore } from "@/store/useFriendStore";
import { SocketContext } from "@/lib/socketContext";
import { toast } from "sonner";


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, accessToken } = useAuthStore();

    const [isConnected, setIsConnected] = useState(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        if (!user || !user.id || !accessToken) return;

        const wsUrl = import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws");

        const client = new Client({
            brokerURL: `${wsUrl}/ws-stomp`,
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },

            onConnect: () => {
                console.log("Native WebSocket 연결 성공!");
                setIsConnected(true);

                client.subscribe(`/user/queue/friend-update`, (message) => {
                    if (message.body === "REFRESH") {
                        const { fetchFriends, fetchRequests } = useFriendStore.getState();
                        fetchFriends(true);
                        fetchRequests();
                    }
                });
            },

            onDisconnect: () => {
                setIsConnected(false);
            },

            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onStompError: (frame) => {
                console.error("STOMP 에러:", frame.headers["message"]);
                toast.error("서버 연결에 문제가 발생했습니다. 실시간 알림이 지연될 수 있습니다.");
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
            setIsConnected(false);
            setStompClient(null);
        };
    }, [user?.id, accessToken]);

    return (
        <SocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
