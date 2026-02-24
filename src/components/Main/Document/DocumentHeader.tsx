import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { apiUpdateDocument, type DocumentResponse } from "@/api/documentApi";
import { useDocumentStore } from "@/store/useDocumentStore";
import { toast } from "sonner";
import { apiFileUpload } from "@/api/fileApi";

interface DocumentHeaderProps {
    initialData: DocumentResponse;
    workspaceCode: string;
    isViewer?: boolean;
}

export const DocumentHeader = ({ initialData, workspaceCode, isViewer }: DocumentHeaderProps) => {
    const [isDirty, setIsDirty] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const upsertDocument = useDocumentStore((state) => state.upsertDocument);


    useEffect(() => {
        if (isViewer || !isDirty) return;

        const timer = setTimeout(() => {
            if (!initialData.title.trim()) return;

            apiUpdateDocument(initialData.id, {
                title: initialData.title,
                workspaceCode
            }).then(() => {
                console.log("제목 서버 저장 완료");
                setIsDirty(false);
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, [initialData.title, initialData.id, workspaceCode, isViewer, isDirty]);

    const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const data = await apiFileUpload(file, "COVER");
            const newImageUrl = data.fileUrl;

            await apiUpdateDocument(initialData.id, {
                coverImage: newImageUrl,
                workspaceCode
            });

            upsertDocument({ ...initialData, coverImage: newImageUrl });
            toast.success("커버 이미지가 변경되었습니다.");
        } catch (error) {
            toast.error("이미지 업로드 실패!");
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newTitle = e.target.value;
        setIsDirty(true);
        upsertDocument({ ...initialData, title: newTitle });
    };

    return (
        <div className="group relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onCoverChange}
                className="hidden"
                accept="image/*"
            />
            <div className={cn(
                "relative w-full h-[20vh] md:h-[25vh] bg-muted group/cover transition-all",
                !initialData.coverImage && "h-[12vh]"
            )}>
                {initialData.coverImage && (
                    <img src={initialData.coverImage} alt="Cover" className="object-cover w-full h-full" />
                )}
                {!isViewer && (
                    <div className="opacity-0 group-hover/cover:opacity-100 absolute bottom-5 right-10 flex items-center gap-x-2 transition">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground text-xs bg-background/50 backdrop-blur-sm"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <ImageIcon className="h-4 w-4 mr-2" />
                            )}
                            커버 변경
                        </Button>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-14">
                <div className="flex items-center gap-x-2 py-4 -mt-12 relative z-10 w-fit">
                    <p className="text-5xl md:text-7xl select-none">
                        {initialData.icon || "📄"}
                    </p>
                </div>

                <div className="py-4">
                    <TextareaAutosize
                        disabled={isViewer}
                        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                        value={initialData.title}
                        onChange={onTitleChange}
                        placeholder="제목 없음"
                        onBlur={(e) => {
                            if (!e.target.value.trim()) {
                                setIsDirty(true);
                                upsertDocument({ ...initialData, title: "제목 없음" });
                            }
                        }}
                        className="w-full text-3xl md:text-5xl bg-transparent font-bold break-all outline-none resize-none text-[#3F3F3F] dark:text-[#CFCFCF] placeholder:text-muted-foreground/20"
                    />
                </div>
            </div>
        </div>
    );
};