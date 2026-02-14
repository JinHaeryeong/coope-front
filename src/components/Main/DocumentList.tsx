import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileIcon } from "lucide-react";

import { type DocumentResponse, apiGetSidebarDocuments } from "@/api/documentApi";
import { cn } from "@/lib/utils";
import { Item } from "./Item";
import { useTrashStore } from "@/store/useTrashStore";

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

    // 확장 상태 관리
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    // 문서 데이터 상태 관리
    const [documents, setDocuments] = useState<DocumentResponse[] | null>(null);

    const workspaceCode = params.workspaceCode;

    // 데이터 페칭 로직
    useEffect(() => {
        const fetchDocuments = async () => {
            if (!workspaceCode) return;

            try {
                const data = await apiGetSidebarDocuments(workspaceCode, parentDocumentId);
                setDocuments(data);
            } catch (error) {
                console.error("문서 목록을 불러오지 못했습니다:", error);
            }
        };

        fetchDocuments();
    }, [workspaceCode, parentDocumentId, trashUpdateTicket]); // 워크스페이스나 부모가 바뀌면 다시 로드

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
    if (documents === null) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        );
    }

    return (
        <div className="py-2">
            <p
                style={{
                    paddingLeft: level ? `${level * 12 + 25}px` : undefined,
                }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    // documents가 비어있을 때 "하위 페이지 없음" 표시
                    documents.length === 0 && level !== 0 && "block",
                    level === 0 && "hidden"
                )}
            >
                하위 페이지 없음
            </p>
            {documents.length === 0 && level === 0 && (
                <div className="items-center justify-center px-4 opacity-50">
                    <div className="text-sm font-medium text-muted-foreground">
                        아직 생성된 문서가 없습니다.
                    </div>
                </div>
            )}
            {documents.map((document) => (
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
                    {/* 재귀 호출: 확장된 상태라면 자기 자신을 다시 렌더링 */}
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