import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useDocumentStore } from "@/store/useDocumentStore";

export const useDocumentSocket = (workspaceCode: string | undefined) => {
    const { stompClient, isConnected } = useSocket();
    const { upsertDocument, removeDocument } = useDocumentStore();

    useEffect(() => {
        if (!isConnected || !stompClient || !workspaceCode) return;

        const subscription = stompClient.subscribe(
            `/topic/workspace/${workspaceCode}`,
            (message) => {
                const event = JSON.parse(message.body);
                switch (event.type) {
                    case "UPSERT":
                        upsertDocument(event.data);
                        break;
                    case "ARCHIVE":
                    case "DELETE":
                        removeDocument(Number(event.data));
                        break;
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, isConnected, workspaceCode, upsertDocument, removeDocument]);
};