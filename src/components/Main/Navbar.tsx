import { useParams } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { apiGetDocumentById, type DocumentResponse } from "@/api/documentApi";

// TODO: 나중에 만들 컴포넌트들이 완성되면 주석을 해제
// import { Title } from "./workspace/title";
// import { Banner } from "./banner";
// import { Menu } from "./workspace/menu";

interface NavbarProps {
    isCollapsed: boolean;
    onResetWidth: () => void;
}

export function Navbar({ isCollapsed, onResetWidth }: NavbarProps) {
    const { workspaceId, documentId } = useParams<{
        workspaceId: string;
        documentId: string
    }>();

    const [document, setDocument] = useState<DocumentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // documentId가 바뀔 때마다 백엔드에서 문서 정보를 가져옴
    useEffect(() => {
        const fetchDocument = async () => {
            if (!documentId || !workspaceId) return;

            try {
                setIsLoading(true);
                const data = await apiGetDocumentById(Number(documentId), workspaceId);
                setDocument(data);
            } catch (error) {
                console.error("문서 로딩 실패:", error);
                setDocument(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [documentId]);

    // 로딩 중일 때의 UI
    if (isLoading) {
        return (
            <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
                <div className="flex items-center gap-x-4 w-full">
                    {isCollapsed && (
                        <MenuIcon
                            className="w-6 h-6 text-muted-foreground"
                            role="button"
                            onClick={onResetWidth}
                        />
                    )}
                    <p className="text-sm text-muted-foreground animate-pulse">정보를 불러오는 중...</p>
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
            <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full
                flex gap-x-4 items-center pointer-events-auto">
                {isCollapsed && (
                    <MenuIcon
                        className="w-6 h-6 text-muted-foreground"
                        role="button"
                        onClick={onResetWidth}
                    />
                )}
                <div className="flex justify-between items-center w-full">
                    {/* Title 컴포넌트가 완성되면 아래 주석을 풀고 <span> 제거하기 */}
                    {/* <Title initialData={document} /> */}
                    <div className="flex items-center gap-x-2">
                        {document.icon && <span>{document.icon}</span>}
                        <span className="font-medium text-sm">{document.title}</span>
                    </div>

                    <div className="flex gap-x-2 items-center">
                        {/* Menu 컴포넌트(삭제, 이동 등)가 완성되면 주석 해제 */}
                        {/* <Menu documentId={document.id} /> */}
                    </div>
                </div>
            </nav>

            {/* 삭제된 문서일 경우 배너 표시 */}
            {document.isArchived && (
                // <Banner documentId={document.id} />
                <div className="bg-rose-500 text-center text-sm p-2 text-white flex items-center justify-center gap-x-2">
                    <span className="font-semibold">주의:</span> 이 문서는 현재 휴지통에 보관되어 있습니다.
                </div>
            )}
        </>
    );
}