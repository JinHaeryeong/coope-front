import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { FloatingComposer } from "@liveblocks/react-blocknote";
import { useThreads } from "@liveblocks/react";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";
import { useTheme } from "@/components/provider/themeProvider";
import { codeBlockOptions } from "@blocknote/code-block";
import {
    BlockNoteSchema,
    createCodeBlockSpec,
    defaultBlockSpecs,
} from "@blocknote/core";

import { ko } from "@blocknote/core/locales";
import { useEffect, useRef, useMemo } from "react";
import { apiFileUpload } from "@/api/fileApi";
import { toast } from "sonner";
import { apiUpdateDocumentRedisSnapshot } from "@/api/documentApi";
import { Thread } from "@liveblocks/react-ui";
import { cn } from "@/lib/utils";

interface EditorProps {
    initialContent?: string;
    editable?: boolean;
    documentId: number;
}

const { video, audio, file, ...restBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...restBlockSpecs,
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
});

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const Editor = ({ initialContent, editable = true, documentId }: EditorProps) => {
    const { theme } = useTheme();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<number>(Date.now());

    // [변경포인트 1] initialContent를 useMemo로 감싸서 훅 옵션에 고정 전달
    // 라이브러리가 "useLiveblocksExtension hook option"에 넣으라고 한 것이 바로 이 방식입니다.
    const initialBlocks = useMemo(() => {
        if (!initialContent || initialContent === "[]" || initialContent === "") return undefined;
        try {
            return JSON.parse(initialContent);
        } catch (e) {
            console.error("[Editor] JSON 파싱 실패:", e);
            return undefined;
        }
    }, [initialContent]);

    const handleUpload = async (file: File) => {
        if (!allowedTypes.includes(file.type)) {
            toast.error("허용되지 않은 파일 형식입니다.");
            throw new Error("Invalid file type");
        }
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error("에디터 파일은 최대 10MB까지만 업로드 가능합니다.");
            throw new Error("File too large");
        }
        try {
            const data = await apiFileUpload(file, "DOCUMENT");
            return data.fileUrl;
        } catch (error) {
            console.error("에디터 파일 업로드 실패:", error);
            throw error;
        }
    };

    // [변경포인트 2] initialContent 옵션 자리에 메모이제이션된 값을 전달
    const editor = useCreateBlockNoteWithLiveblocks(
        {
            schema,
            dictionary: ko,
            uploadFile: handleUpload,
        },
        {
            mentions: true,
            initialContent: initialBlocks,
        }
    );

    // 권한 동기화
    useEffect(() => {
        if (editor) {
            editor.isEditable = editable;
            console.log(`[권한 동기화] 에디터 편집 가능 여부: ${editable}`);
        }
    }, [editor, editable]);

    // 자동 저장 핸들러
    const handler = () => {
        // [방어] 뷰어 권한일 때는 저장 로직이 아예 실행되지 않도록 막음 (튕김 방지)
        if (!editable) return;

        const now = Date.now();
        const timeSinceLastSave = now - lastSavedRef.current;

        if (timerRef.current) clearTimeout(timerRef.current);

        const saveSnapshot = async () => {
            if (!editor) return;

            const blocks = editor.topLevelBlocks;
            const isActuallyEmpty = blocks.length === 0 || (
                blocks.length === 1 &&
                blocks[0].type === "paragraph" &&
                (blocks[0].content as any[]).length === 0
            );

            if (isActuallyEmpty) return;

            try {
                await apiUpdateDocumentRedisSnapshot(documentId, JSON.stringify(blocks));
                lastSavedRef.current = Date.now();
                console.log("[AutoSave] Redis 스냅샷 저장 완료");
            } catch (err) {
                console.error("Redis 저장 실패", err);
            }
        };

        if (timeSinceLastSave >= 30000) {
            saveSnapshot();
        } else {
            timerRef.current = setTimeout(saveSnapshot, 30000 - timeSinceLastSave);
        }
    };

    useEffect(() => {
        const handleBlur = async () => {
            if (!editable) return; // 뷰어 방어
            if (timerRef.current) clearTimeout(timerRef.current);

            const blocks = editor.topLevelBlocks;
            const isActuallyEmpty = blocks.length === 0 || (
                blocks.length === 1 &&
                blocks[0].type === "paragraph" &&
                (blocks[0].content as any[]).length === 0
            );

            if (isActuallyEmpty) return;

            try {
                await apiUpdateDocumentRedisSnapshot(documentId, JSON.stringify(blocks));
            } catch (err) {
                console.error("Redis 저장 실패 (blur)", err);
            }
        };
        window.addEventListener("blur", handleBlur);
        return () => window.removeEventListener("blur", handleBlur);
    }, [editor, documentId, editable]);

    const threads = useThreads()?.threads ?? [];

    return (
        <div className="flex w-full gap-4">
            <div className="flex-1 relative ml-0 md:-ml-14">
                <BlockNoteView
                    editor={editor}
                    editable={editable}
                    theme={theme === "dark" ? "dark" : "light"}
                    onChange={handler}
                />
                <FloatingComposer editor={editor} />
            </div>

            <div className="hidden lg:block w-80 border-l pl-4 overflow-y-auto max-h-[80vh]">
                <h3 className="text-sm font-bold mb-4 opacity-50">Comments</h3>
                <div className="flex flex-col gap-6">
                    {threads.map((thread) => (
                        <div
                            key={thread.id}
                            className={cn(
                                "p-2 rounded-lg transition lb-root",
                                theme === "dark" ? "dark lb-theme-dark hover:bg-neutral-800" : "hover:bg-gray-50"
                            )}
                            data-theme={theme === "dark" ? "dark" : "light"}
                        >
                            <Thread thread={thread} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Editor;