import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DocumentHeader } from "@/components/Main/Document/DocumentHeader";
import { apiGetDocumentById } from "@/api/documentApi";
import { Spinner } from "@/components/ui/spinner";
import Editor from "@/components/Main/Document/Editor";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import axiosAuthInstance from "@/api/axiosAuthInstance";

const DocumentsPage = () => {
    const { workspaceCode, documentId } = useParams();
    const { workspaces } = useWorkspaceStore();
    const { documents, upsertDocument } = useDocumentStore();
    const currentWorkspace = workspaces.find(w => w.inviteCode === workspaceCode);

    const documentData = documents.find(d => d.id === Number(documentId));
    const [isLoading, setIsLoading] = useState(true);

    const isEditable = currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'EDITOR';

    useEffect(() => {
        const fetchDoc = async () => {
            if (!documentId || !workspaceCode) return;

            if (!documentData || documentData.content === undefined) {
                setIsLoading(true);
            }

            try {
                const data = await apiGetDocumentById(Number(documentId), workspaceCode);
                upsertDocument(data);
            } catch (error) {
                console.error("문서 로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoc();

    }, [documentId, workspaceCode]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!documentData || documentData.content === undefined) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
                <p className="text-lg font-medium text-muted-foreground">
                    문서를 찾을 수 없거나 불러오는 데 실패했습니다.
                </p>
            </div>
        );
    }

    const roomId = `doc-${workspaceCode}-${documentId}-v4`;

    const authCallback = async (room?: string) => {
        try {
            const response = await axiosAuthInstance.post('/liveblocks-auth', {
                roomId: room
            });
            return response.data;
        } catch (error) {
            console.error("Liveblocks 인증 실패:", error);
            throw error;
        }
    };

    return (
        <LiveblocksProvider authEndpoint={authCallback}>
            <RoomProvider id={roomId}>
                <ClientSideSuspense fallback={<Spinner className="h-96" />}>
                    <div className="flex flex-col min-h-full pb-40">
                        <DocumentHeader
                            key={`header-${documentData.id}`}
                            initialData={documentData}
                            workspaceCode={workspaceCode!}
                            isViewer={!isEditable}
                        />

                        <div className="max-w-7xl mx-auto w-full px-0 md:px-14 pb-72">
                            <Editor
                                key={documentId}
                                initialContent={documentData.content}
                                editable={isEditable}
                                documentId={Number(documentId)}
                            />
                        </div>
                    </div>
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
};

export default DocumentsPage;