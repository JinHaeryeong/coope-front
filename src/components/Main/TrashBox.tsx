import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Next -> React Router
import { Search, Trash, Undo } from "lucide-react";
import { toast } from "sonner";

import {
    type DocumentResponse,
    apiGetTrashDocuments,
    apiRestoreDocument,
    apiHardDeleteDocument
} from "@/api/documentApi";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/Main/Modal/ConfirmModal";
import { useTrashStore } from "@/store/useTrashStore";

export function TrashBox() {
    const navigate = useNavigate();
    const { trashUpdateTicket } = useTrashStore();
    const params = useParams<{ workspaceId: string, documentId: string }>();
    const [search, setSearch] = useState("");
    const [documents, setDocuments] = useState<DocumentResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const workspaceId = params.workspaceId;



    // 워크스페이스가 바뀔 때마다 데이터 다시 읽어오기
    useEffect(() => {
        loadTrashData();
    }, [workspaceId, trashUpdateTicket]);

    const loadTrashData = async () => {
        if (!workspaceId) return;
        try {
            setIsLoading(true);
            const data = await apiGetTrashDocuments(workspaceId);
            setDocuments(data);
        } catch (error) {
            console.error("휴지통 조회 실패:", error);
            toast.error("삭제된 문서 목록을 가져오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어 필터링
    const filteredDocuments = useMemo(() => {
        return documents?.filter((document) =>
            document.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [documents, search]);

    const onClick = (documentId: number) => {
        navigate(`/workspace/${workspaceId}/documents/${documentId}`);
    };

    // 문서 복구 로직
    const onRestore = async (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        documentId: number
    ) => {
        event.stopPropagation();

        const promise = apiRestoreDocument(documentId).then(() => loadTrashData());

        toast.promise(promise, {
            loading: "노트를 복구하는 중...",
            success: "노트가 복구되었습니다!",
            error: "노트 복구에 실패했습니다.",
        });
    };

    // 영구 삭제 로직
    const onRemove = async (documentId: number) => {
        const promise = apiHardDeleteDocument(documentId).then(() => {
            loadTrashData();
            // 현재 보고 있는 문서가 삭제된 경우 이동
            if (Number(params.documentId) === documentId) {
                navigate(`/workspace/${workspaceId}`);
            }
        });

        toast.promise(promise, {
            loading: "노트를 영구 삭제 중...",
            success: "노트가 완전히 삭제되었습니다!",
            error: "노트 삭제에 실패했습니다.",
        });
    };

    // 로딩 상태 처리
    if (documents === null || isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="text-sm">
            <div className="flex items-center gap-x-1 p-2">
                <Search className="w-4 h-4" />
                <Input
                    className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="페이지 제목으로 검색..."
                />
            </div>
            <div className="mt-2 px-1 pb-1">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                    삭제된 문서가 없습니다.
                </p>
                {filteredDocuments?.map((document) => (
                    <div
                        className="text-sm rounded-sm w-full hover:bg-primary/5 flex justify-between items-center text-primary"
                        key={document.id}
                        role="button"
                        onClick={() => onClick(document.id)}
                    >
                        <span className="truncate pl-2">{document.title}</span>
                        <div className="flex items-center">
                            <div
                                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                onClick={(e) => onRestore(e, document.id)}
                                title="복구하기"
                            >
                                <Undo className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <ConfirmModal
                                onConfirm={() => onRemove(document.id)}
                            >
                                <div
                                    className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    role="button"
                                    title="영구 삭제"
                                >
                                    <Trash className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </ConfirmModal>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}