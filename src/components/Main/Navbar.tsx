import { useParams } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { apiGetDocumentById, type DocumentResponse } from "@/api/documentApi";
import { Title } from "./Title";
import { Banner } from "./Banner";
import { useTrashStore } from "@/store/useTrashStore";


interface NavbarProps {
    isCollapsed: boolean;
    onResetWidth: () => void;
}

export function Navbar({ isCollapsed, onResetWidth }: NavbarProps) {
    const { workspaceCode, documentId } = useParams<{
        workspaceCode: string;
        documentId: string
    }>();

    const { trashUpdateTicket } = useTrashStore();
    const [document, setDocument] = useState<DocumentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocument = async () => {
            if (!documentId || !workspaceCode) return;

            try {
                setIsLoading(true);
                const data = await apiGetDocumentById(Number(documentId), workspaceCode);

                setDocument(data);
            } catch (error) {
                console.error("문서 로딩 실패:", error);
                setDocument(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [documentId, workspaceCode, trashUpdateTicket]);

    // 로딩 중일 때의 UI
    if (isLoading) {
        return (
            <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-3 w-full flex items-center justify-between">
                <div className="flex items-center gap-x-4 w-full">
                    {isCollapsed && (
                        <MenuIcon
                            className="w-6 h-6 text-muted-foreground"
                            role="button"
                            onClick={onResetWidth}
                        />
                    )}
                    <Title.Skeleton />
                </div>
            </nav>
        );
    }

    // 해당 문서를 찾을 수 없을 때 (잘못된 ID 등)
    if (document === null) {
        return null;
    }

    return (
        <>
            <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-3 w-full
                flex gap-x-4 items-center pointer-events-auto">
                {isCollapsed && (
                    <MenuIcon
                        className="w-6 h-6 text-muted-foreground cursor-pointer"
                        role="button"
                        onClick={onResetWidth}
                    />
                )}
                <div className="flex justify-between items-center w-full">
                    <Title initialData={document} />
                </div>
            </nav>

            {/* 삭제된 문서일 경우 배너 표시 */}
            {document.archived && (
                <Banner documentId={document.id} />
            )}
        </>
    );
}