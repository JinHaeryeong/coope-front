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
import { useStatus } from "@liveblocks/react";

import { ko } from "@blocknote/core/locales";
import { useEffect, useRef } from "react";
import { apiFileUpload } from "@/api/fileApi";
import { toast } from "sonner";
import { apiUpdateDocumentRedisSnapshot } from "@/api/documentApi";
import { Thread } from "@liveblocks/react-ui";
import { Spinner } from "@/components/ui/spinner";

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
    const status = useStatus();
    const isLiveblocksLoading = status === "initial" || status === "connecting";
    const isConnectionIssue = status === "disconnected" || status === "reconnecting";


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

    const editor = useCreateBlockNoteWithLiveblocks(
        {
            schema,
            dictionary: ko,
            uploadFile: handleUpload,
        },
        {
            mentions: true,
            initialContent: (initialContent && initialContent !== "[]")
                ? JSON.parse(initialContent)
                : undefined,
        }
    );

    const handler = () => {
        if (!editable) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            const blocks = editor.topLevelBlocks;

            const isActuallyEmpty = blocks.length === 0 || (
                blocks.length === 1 &&
                blocks[0].type === "paragraph" &&
                (blocks[0].content as any[]).length === 0
            );

            if (isActuallyEmpty) return;

            try {
                await apiUpdateDocumentRedisSnapshot(documentId, JSON.stringify(blocks));
                console.log("[AutoSave] Redis 스냅샷 저장 완료");
            } catch (err) {
                console.error("Redis 저장 실패", err);
            }
        }, 30000);
    };

    useEffect(() => {
        const handleBlur = async () => {
            if (!editable) return;
            if (timerRef.current) clearTimeout(timerRef.current);

            const blocks = editor.topLevelBlocks;
            if (blocks.length === 0) return;

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

    if (isConnectionIssue) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                    서버와의 연결이 불안정합니다.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs text-red-500 underline"
                >
                    새로고침 시도
                </button>
            </div>
        );
    }

    if (isLiveblocksLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 gap-2">
                <Spinner />
                <p className="text-sm text-muted-foreground animate-pulse">
                    문서를 동기화하고 있습니다...
                </p>
            </div>
        );
    }


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