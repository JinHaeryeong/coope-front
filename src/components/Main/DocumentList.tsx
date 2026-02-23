import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileIcon } from "lucide-react";

import { apiGetSidebarDocuments } from "@/api/documentApi";
import { cn } from "@/lib/utils";
import { Item } from "./Item";
import { useTrashStore } from "@/store/useTrashStore";
import { useDocumentStore } from "@/store/useDocumentStore";

interface DocumentListProps {
    onItemClick?: () => void;
    parentDocumentId?: number;
    level?: number;
}

export const DocumentList = ({
    onItemClick,
    parentDocumentId,
    level = 0,
}: DocumentListProps) => {
    const { trashUpdateTicket } = useTrashStore();
    const params = useParams<{ workspaceCode: string; documentId: string }>();
    const navigate = useNavigate();

    const { documents, upsertDocument } = useDocumentStore();
    // 확장 상태 관리
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    // 문서 데이터 상태 관리
    const [loading, setLoading] = useState(false);

    const workspaceCode = params.workspaceCode;

    const filteredDocuments = documents.filter((doc) => {
        if (!parentDocumentId) return !doc.parentId;
        return doc.parentId === parentDocumentId;
    });



    useEffect(() => {
        const fetchDocuments = async () => {
            if (!workspaceCode) return;

            try {
                setLoading(true);
                const data = await apiGetSidebarDocuments(workspaceCode, parentDocumentId);

                data.forEach(newDoc => {
                    upsertDocument(newDoc);
                });

            } catch (error) {
                console.error("문서 목록 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [workspaceCode, parentDocumentId, trashUpdateTicket, upsertDocument]);

    const onExpand = (documentId: number) => {
        setExpanded((prevExpanded) => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId],
        }));
    };

    const onRedirect = (documentId: number) => {
        navigate(`/workspace/${workspaceCode}/documents/${documentId}`);
        if (onItemClick) onItemClick();
    };

    // 로딩 중 스켈레톤 UI
    if (loading && documents.length === 0) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && <Item.Skeleton level={level} />}
            </>
        );
    }

    return (
        <div className="py-2">
            <p
                style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    filteredDocuments.length === 0 && level !== 0 && "block",
                    level === 0 && "hidden"
                )}
            >
                하위 페이지 없음
            </p>

            {filteredDocuments.length === 0 && level === 0 && (
                <div className="px-4 opacity-50 text-sm font-medium text-muted-foreground">
                    아직 생성된 문서가 없습니다.
                </div>
            )}

            {filteredDocuments.map((document) => (
                <div key={document.id}>
                    <Item
                        id={document.id}
                        onClick={() => onRedirect(document.id)}
                        label={document.title}
                        icon={FileIcon}
                        documentIcon={document.icon}
                        active={Number(params.documentId) === document.id}
                        level={level}
                        onExpand={() => onExpand(document.id)}
                        expanded={expanded[document.id]}
                    />
                    {expanded[document.id] && (
                        <DocumentList
                            parentDocumentId={document.id}
                            level={level + 1}
                            onItemClick={onItemClick}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};