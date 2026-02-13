import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { useAuthStore } from "@/store/useAuthStore";
import { type DocumentResponse, apiGetSidebarDocuments } from "@/api/documentApi";
import { toast } from "sonner";

export function SearchCommand() {
    const navigate = useNavigate();
    const params = useParams<{ workspaceCode: string }>();
    const workspaceCode = params.workspaceCode;

    const user = useAuthStore((state) => state.user);

    const [isMounted, setIsMounted] = useState(false);
    const [documents, setDocuments] = useState<DocumentResponse[]>([]);

    const toggle = useSearch((store) => store.toggle);
    const isOpen = useSearch((store) => store.isOpen);
    const onClose = useSearch((store) => store.onClose);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchSearchDocs = async () => {
            if (!workspaceCode || !isOpen) return; // 모달이 열릴 때만 데이터를 가져오도록 최적화 가능

            try {
                const data = await apiGetSidebarDocuments(workspaceCode);
                setDocuments(data);
            } catch (error) {
                toast.error("문서 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
            }
        };

        fetchSearchDocs();
    }, [workspaceCode, isOpen]);

    // 단축키 설정 (Ctrl+K / Cmd+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    const onSelect = (documentId: number) => {
        navigate(`/workspace/${workspaceCode}/documents/${documentId}`);
        onClose();
    };

    if (!isMounted) return null;

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput
                placeholder={`${user?.nickname || "사용자"}님의 Coope에서 검색하기`}
            />
            <CommandList>
                <CommandEmpty>결과를 찾을 수 없습니다.</CommandEmpty>
                <CommandGroup heading="문서">
                    {documents?.map((document) => (
                        <CommandItem
                            key={document.id}
                            value={`${document.id}-${document.title}`}
                            onSelect={() => onSelect(document.id)}
                        >
                            {document.icon ? (
                                <p className="mr-2 text-[18px]">
                                    {document.icon}
                                </p>
                            ) : (
                                <File className="w-4 h-4 mr-2" />
                            )}
                            <span>{document.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}