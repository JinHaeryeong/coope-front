import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "@/components/provider/themeProvider"
import { codeBlockOptions } from "@blocknote/code-block";
import {
    BlockNoteSchema,
    createCodeBlockSpec,
    defaultBlockSpecs
} from "@blocknote/core";

import { ko } from "@blocknote/core/locales";
import { useEffect } from "react";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
}

const { video, audio, ...restBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...restBlockSpecs,
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
});

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
    const { theme } = useTheme();

    const editor = useCreateBlockNote({
        schema,
        dictionary: ko,
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
        onChange(JSON.stringify(editor.document));
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