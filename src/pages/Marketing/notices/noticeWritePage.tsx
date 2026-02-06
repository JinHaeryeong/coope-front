
import React, { useRef, useState, useMemo } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { apiCreateNotice } from "@/api/noticeApi";
import { toast } from "sonner";
import { Smile, Paperclip, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface EmojiData {
    native: string;
    [key: string]: any;
}

const NoticeWritePage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInput = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const mdeOptions = useMemo(() => ({
        spellChecker: false,
        placeholder: "공지 내용을 마크다운으로 작성하세요...",
        status: false,
        minHeight: "200px",
        autosave: {
            enabled: true,
            uniqueId: "notice-write-cache",
            delay: 1000,
        },
    }), []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (content.length > 1000) {
            toast.error("내용은 1000자를 초과할 수 없습니다.");
            return;
        }

        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("author", user.nickname || "관리자");

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            await apiCreateNotice(formData);
            toast.success("공지사항이 성공적으로 게시되었습니다.");
            navigate('/notice');
        } catch (error) {
            console.error('작성 오류:', error);
            toast.error("공지사항 작성에 실패했습니다.");
        }
    };

    const handleEmojiSelect = (emoji: EmojiData) => {
        const maxLength = 1000;
        if (content.length + emoji.native.length <= maxLength) {
            setContent((prev) => prev + emoji.native);
        }
        setShowEmojiPicker(false);
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 미리보기 상태 추가

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            toast.error("파일 크기는 1MB를 초과할 수 없습니다.");
            if (fileInput.current) fileInput.current.value = "";
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // 새 파일로 자동 교체
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl); // 메모리 해제
        setPreviewUrl(null);
        if (fileInput.current) fileInput.current.value = "";
    };

    return (
        <div className="w-11/12 max-w-4xl justify-center mx-auto my-10">
            <div className="heading text-center font-bold text-3xl md:text-5xl m-5 text-slate-800 dark:text-slate-100">
                공지사항 작성
            </div>

            <form onSubmit={handleSubmit} className="editor mx-auto w-full flex flex-col text-gray-800 border border-gray-300 p-4 shadow-lg rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700">
                <input
                    className="title bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 mb-4 outline-none rounded-md focus:ring-2 focus:ring-primary/50 transition dark:text-white"
                    placeholder="제목을 입력하세요"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <div className="custom-mde prose dark:prose-invert max-w-none mb-4">
                    <SimpleMDE
                        value={content}
                        onChange={(value) => setContent(value)}
                        options={mdeOptions}
                    />
                </div>

                <div className="icons flex flex-col md:flex-row md:items-center m-2 gap-3 relative mt-4">
                    <div className="flex items-center gap-4 border-b md:border-none pb-2 md:pb-0">
                        <div className="relative">
                            <Smile
                                className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-primary' : 'hover:text-primary'}`}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            />
                            {showEmojiPicker && (
                                <div className="absolute bottom-10 left-0 z-50 shadow-xl scale-90 origin-bottom-left md:scale-100">
                                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" locale="ko" />
                                </div>
                            )}
                        </div>

                        <input type="file" ref={fileInput} onChange={handleFileChange} className="hidden" id="fileInput" accept="image/*" />
                        <label htmlFor="fileInput" className="cursor-pointer group flex items-center gap-2">
                            <Paperclip className="group-hover:text-primary transition-colors" size={20} />
                            <span className="text-[10px] md:text-xs text-muted-foreground">이미지 첨부</span>
                        </label>
                    </div>

                    {/* 파일이 있을 때만 작게 보여주기 */}
                    {previewUrl && (
                        <div className="flex gap-2 items-center py-1">
                            <div className="relative w-14 h-14 md:w-20 md:h-20 border-2 border-primary rounded-md overflow-hidden animate-in zoom-in-95 duration-200">
                                <img src={previewUrl} className="w-full h-full object-cover" />
                                <button type="button" onClick={removeFile} className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-bl-md">
                                    <X size={10} />
                                </button>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate max-w-25 md:hidden">
                                {selectedFile?.name}
                            </span>
                        </div>
                    )}

                    <div className="md:ml-auto text-gray-400 text-[11px] md:text-xs text-right">
                        <span className={content.length >= 1000 ? "text-red-500" : ""}>{content.length}</span> / 1000자
                    </div>
                </div>

                <div className="buttons flex gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <Button
                        type="button"
                        variant="ghost"
                        className="ml-auto text-slate-500 cursor-pointer"
                        onClick={() => navigate('/notice')}
                    >
                        취소
                    </Button>
                    <Button type="submit" className="md:px-6 font-bold cursor-pointer">게시</Button>
                </div>
            </form>
        </div>
    );
};

export default NoticeWritePage;