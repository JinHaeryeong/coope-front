import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, type LucideIcon, MoreHorizontal, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// API 함수 불러오기
import { apiCreateDocument, apiArchiveDocument } from "@/api/documentApi";
import { useTrashStore } from "@/store/useTrashStore";

interface ItemProps {
    id?: number;
    documentIcon?: string;
    active?: boolean;
    expanded?: boolean;
    isSearch?: boolean;
    level?: number;
    onExpand?: () => void;
    label: string;
    onClick?: () => void;
    icon: LucideIcon;
};

export function Item({
    id,
    label,
    onClick,
    icon: Icon,
    active,
    documentIcon,
    isSearch,
    level = 0,
    onExpand,
    expanded
}: ItemProps) {
    const { user } = useAuthStore();
    const { notifyTrashUpdate } = useTrashStore();
    const navigate = useNavigate();
    const { workspaceId } = useParams<{ workspaceId: string }>();

    // 문서 삭제(아카이브) 로직 완성
    const onArchive = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if (!id || !workspaceId) return;

        const promise = apiArchiveDocument(id).then(() => {
            notifyTrashUpdate();
            navigate(`/workspace/${workspaceId}`);
        });

        toast.promise(promise, {
            loading: "문서를 휴지통으로 이동 중...",
            success: "문서가 삭제되었습니다.",
            error: "문서 삭제에 실패했습니다."
        });
    };

    // 문서 생성 로직 완성
    const onCreate = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if (!id || !workspaceId) return;

        const promise = apiCreateDocument({
            title: "제목 없음",
            parentId: id,
            workspaceCode: workspaceId
        })
            .then((doc) => {
                notifyTrashUpdate();
                if (!expanded) onExpand?.();
                navigate(`/workspace/${workspaceId}/documents/${doc.id}`);
            });

        toast.promise(promise, {
            loading: "새 문서를 만드는 중...",
            success: "새 문서가 생성되었습니다!",
            error: "문서 생성에 실패했습니다."
        });
    };

    const handleExpand = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        onExpand?.();
    };

    const ChevronIcon = expanded ? ChevronDown : ChevronRight;

    return (
        <div
            onClick={onClick}
            role="button"
            style={{ paddingLeft: level ? `${(level * 12) + 12}px` : "12px" }}
            className={cn(
                "group min-h-6.75 text-sm py-1 pr-3 w-full flex items-center rounded-md transition hover:bg-neutral-800",
                active
                    ? "bg-neutral-800 font-semibold"
                    : "text-muted-foreground"
            )}
        >
            {!!id && (
                <div
                    onClick={handleExpand}
                    role="button"
                    className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-800 mr-1"
                >
                    <ChevronIcon className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                </div>
            )}
            {documentIcon ? (
                <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
            ) : (
                <Icon className="mr-2 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{label}</span>

            {isSearch && (
                <kbd className="ml-auto pointer-events-none inline-flex gap-1 items-center h-5 select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">Ctrl</span>K
                </kbd>
            )}

            {!!id && (
                <div className="ml-auto flex items-center gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div role="button" className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60" align="start" side="right" forceMount>
                            <DropdownMenuItem onClick={onArchive}>
                                <Trash className="w-4 h-4 mr-2" />
                                삭제
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="text-xs text-muted-foreground p-2">
                                마지막 수정자: {user?.nickname}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div
                        role="button"
                        onClick={onCreate}
                        className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>
            )}
        </div>
    );
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
    return (
        <div className="flex gap-x-2 py-0.75" style={{ paddingLeft: level ? `${(level * 12) + 25}px` : '12px' }}>
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-4 h-4" />
        </div>
    )
}