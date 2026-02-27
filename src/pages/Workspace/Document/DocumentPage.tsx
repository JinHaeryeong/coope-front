import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { DocumentHeader } from "@/components/Main/Document/DocumentHeader";
import { apiGetDocumentById, apiUpdateDocumentContent } from "@/api/documentApi";
import { Spinner } from "@/components/ui/spinner";
import Editor from "@/components/Main/Document/Editor";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useDocumentStore } from "@/store/useDocumentStore";

const DocumentsPage = () => {
    const { workspaceCode, documentId } = useParams();
    const { workspaces } = useWorkspaceStore();
    const { documents, upsertDocument, updateDocumentContentOnly } = useDocumentStore();
    const currentWorkspace = workspaces.find(w => w.inviteCode === workspaceCode);

    const documentData = documents.find(d => d.id === Number(documentId));
    const [isLoading, setIsLoading] = useState(true);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [documentId, workspaceCode]);

    const onEditorChange = (content: string) => {
        if (!isEditable) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            try {
                if (!documentId || !workspaceCode) return;

                await apiUpdateDocumentContent(Number(documentId), content);
                updateDocumentContentOnly(Number(documentId), content);
                console.log("자동 저장 완료!");
            } catch (error) {
                console.error("자동 저장 중 오류:", error);
            }
        }, 1500);
    };

    if (isLoading && !documentData) {
        return <Spinner />;
    }
    if (!documentData) {
        return <div className="p-20 text-center">문서를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="flex flex-col min-h-full pb-40">
            <DocumentHeader
                key={`header-${documentData.id}`}
                initialData={documentData}
                workspaceCode={workspaceCode!}
                isViewer={!isEditable}
            />

            <div className="max-w-4xl mx-auto w-full px-0 md:px-14 pb-72">
                <Editor
                    key={documentId}
                    onChange={onEditorChange}
                    initialContent={documentData.content}
                    editable={isEditable}
                />
            </div>
        </div>
    );
};

export default DocumentsPage;