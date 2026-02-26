import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "@/components/provider/themeProvider"
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

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
}

const { video, audio, file, ...restBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...restBlockSpecs,
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
});

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];


const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
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

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const editor = useCreateBlockNote({
        schema,
        dictionary: ko,
        uploadFile: handleUpload,
        initialContent: initialContent
            ? JSON.parse(initialContent)
            : undefined,
    });

    useEffect(() => {
        if (!editable && initialContent) {
            const blocks = JSON.parse(initialContent);
            editor.replaceBlocks(editor.document, blocks);
        }
    }, [initialContent, editor, editable]);


    const handleEditorChange = () => {

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            onChange(JSON.stringify(editor.document));
        }, 500);
    };


    return (
        <div className="ml-0 md:-ml-14">
            <BlockNoteView
                editor={editor}
                editable={editable}
                theme={theme === "dark" ? "dark" : "light"}
                onChange={handleEditorChange}

            />
        </div>
    );
};

export default Editor;