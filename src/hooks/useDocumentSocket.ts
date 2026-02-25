import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useTrashStore } from "@/store/useTrashStore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export const useDocumentSocket = (workspaceCode: string | undefined) => {
    const navigate = useNavigate();
    const { documentId } = useParams<{ documentId: string }>();
    const { stompClient, isConnected } = useSocket();
    const { upsertDocument, removeDocument } = useDocumentStore();
    const { notifyTrashUpdate } = useTrashStore();

    useEffect(() => {
        if (!isConnected || !stompClient || !workspaceCode) return;

        const subscription = stompClient.subscribe(
            `/topic/workspace/${workspaceCode}`,
            (message) => {
                const event = JSON.parse(message.body);
                switch (event.type) {
                    case "UPSERT":
                        upsertDocument(event.data);
                        notifyTrashUpdate();
                        break;
                    case "ARCHIVE":
                    case "DELETE":
                        const deletedId = Number(event.data);
                        removeDocument(deletedId);
                        notifyTrashUpdate();
                        if (Number(documentId) === deletedId) {
                            toast.info("해당 문서가 삭제 또는 보관되어 워크스페이스 메인으로 이동합니다.");
                            navigate(`/workspace/${workspaceCode}`);
                        }
                        break;
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, isConnected, workspaceCode, upsertDocument, removeDocument, documentId, navigate, notifyTrashUpdate]);
};