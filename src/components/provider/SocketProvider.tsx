import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthStore } from "@/store/useAuthStore";
import { useFriendStore } from "@/store/useFriendStore";
import { SocketContext } from "@/lib/socketContext";


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, accessToken } = useAuthStore();
    // const { fetchFriends, fetchRequests } = useFriendStore();

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
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
            setIsConnected(false);
            setStompClient(null);
        };
    }, [user, accessToken]);

    return (
        <SocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
