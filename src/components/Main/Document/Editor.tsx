import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { FloatingComposer } from "@liveblocks/react-blocknote";
import { useThreads } from "@liveblocks/react";
import "@liveblocks/react-ui/styles.css";
import { useTheme } from "@/components/provider/themeProvider";
import { codeBlockOptions } from "@blocknote/code-block";
import {
    BlockNoteSchema,
    createCodeBlockSpec,
    defaultBlockSpecs,
} from "@blocknote/core";

import { ko } from "@blocknote/core/locales";
import { useEffect, useRef } from "react";
import { apiFileUpload } from "@/api/fileApi";
import { toast } from "sonner";
import { apiUpdateDocumentRedisSnapshot } from "@/api/documentApi";
import { Thread } from "@liveblocks/react-ui";

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

    console.log("에디터로 넘어온 데이터 타입:", typeof initialContent);
    console.log("데이터 내용:", initialContent);

    const editor = useCreateBlockNoteWithLiveblocks(
        {
            schema,
            dictionary: ko,
            uploadFile: handleUpload,

        },
        {
            mentions: true,
            initialContent: initialContent ? JSON.parse(initialContent) : undefined,
        }
    );

    const handler = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            const blocks = editor.topLevelBlocks;

            const isActuallyEmpty = blocks.length === 0 || (
                blocks.length === 1 &&
                blocks[0].type === "paragraph" &&
                (blocks[0].content as any[]).length === 0
            );

            if (isActuallyEmpty) {
                console.log("빈 문서라 Redis 스냅샷 저장을 건너뜁니다.");
                return;
            }

            try {
                await apiUpdateDocumentRedisSnapshot(documentId, JSON.stringify(blocks));
                console.log("Redis 스냅샷 저장 (30초)");
            } catch (err) {
                console.error("Redis 저장 실패", err);
            }
        }, 30000);
    };

    useEffect(() => {
        if (editor && initialContent) {
            const currentBlocks = editor.topLevelBlocks;
            const isEmpty = currentBlocks.length === 1 &&
                currentBlocks[0].type === "paragraph" &&
                (currentBlocks[0].content as any[]).length === 0;

            if (isEmpty) {
                try {
                    const blocks = JSON.parse(initialContent);
                    editor.replaceBlocks(currentBlocks, blocks);
                    console.log("[성공] 에디터에 데이터를 강제로 주입했습니다.");
                } catch (e) {
                    console.error("데이터 주입 중 오류:", e);
                }
            }
        }
    }, [editor, initialContent]);

    useEffect(() => {
        const handleBlur = async () => {
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
    }, [editor, documentId]);

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
                {/* 플로팅은 보험으로 남겨두기 */}
                <FloatingComposer editor={editor} />
            </div>

            <div className="hidden lg:block w-80 border-l pl-4 overflow-y-auto max-h-[80vh]">
                <h3 className="text-sm font-bold mb-4 opacity-50">Comments</h3>
                <div className="flex flex-col gap-6">
                    {threads.map((thread) => (
                        <div key={thread.id} className="p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition">
                            <Thread thread={thread} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Editor;